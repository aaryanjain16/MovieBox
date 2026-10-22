from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
import jwt
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from database import init_db, get_db
from models import WatchlistMovie, User
from sqlalchemy.ext.asyncio import AsyncSession
from schemas import MovieWatchlistCreate, ReviewCreate, UserCreate, UserLogin
from sqlalchemy import select, text
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt.exceptions import InvalidTokenError

load_dotenv()


SECRET_KEY = os.getenv("JWT_SECRET_KEY", "temporary-local-development-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


API_KEY = os.getenv("OMDB_API_KEY")
BASE_URL = "https://www.omdbapi.com/"


def create_access_token(user_id : int):
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )
    
    payload = {
        "sub" : str(user_id),
        "exp" : expire
    }
    
    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    
    return token


bearer_scheme = HTTPBearer()

async def get_current_user(
    credentials : HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db : AsyncSession = Depends(get_db)
):
    token = credentials.credentials
    
    try:
        payload = jwt.decode(
            token, 
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        
        user_id = payload.get("sub")
        
        if user_id is None :
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )
            
        user_id = int(user_id)
        
    except(InvalidTokenError, ValueError, TypeError):
        raise HTTPException(
            status_code=401,
            detail="Invalid  or expired token"
        )
        
    result = await db.execute(
        select(User).where(
            User.id == user_id
        )
    )
        
    user = result.scalar_one_or_none()
        
    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )
            
    return user


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    

app = FastAPI(
    title="Movie/Show Watchlist",
    lifespan=lifespan
    )

#Allow React to connect to fastApi
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://127.0.0.1:5173","https://moviebox-frontend.onrender.com"],
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"]
)


@app.get("/search/{title}")
async def get_search(title: str):

    params = {
        "s": title,
        "apikey": API_KEY
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(BASE_URL, params=params)

    if response.status_code != 200:
        return{"error" : f"{title} not found"}
    
    return response.json()
    
     
@app.post("/watchlist")
async def add_to_watchlist(
    movie: MovieWatchlistCreate,
    db: AsyncSession = Depends(get_db),
    current_user : User = Depends(get_current_user)
):
    
    result = await db.execute(
        select(WatchlistMovie).where(
            WatchlistMovie.imdb_id == movie.imdb_id,
            WatchlistMovie.user_id == current_user.id
        )
    )
    
    existing_movie = result.scalar_one_or_none()
    
    if existing_movie is not None:
        raise HTTPException(
            status_code=409,
            detail="Movie already exists  in your watchlist"
        )
    
    new_movie = WatchlistMovie(
        imdb_id =movie.imdb_id,
        title = movie.title,
        year = movie.year,
        movie_type = movie.movie_type,
        poster = movie.poster,
        user_id = current_user.id,
        watched = False
    )
    
    db.add(new_movie)
    await db.commit()
    
    return {
        "message" : "Movie addded to watchlist"
    }
    
@app.get("/watchlist")
async def get_watchlist(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result  = await db.execute(select(WatchlistMovie).where(
        WatchlistMovie.watched== False,
        WatchlistMovie.user_id == current_user.id
    ))
    
    movies = result.scalars().all()
    
    return movies

@app.delete("/watchlist/{imdb_id}")
async def delete_movie(
    imdb_id: str,
    db : AsyncSession = Depends(get_db),
    current_user : User = Depends(get_current_user)
):
    result = await db.execute(
        select(WatchlistMovie).where(
            WatchlistMovie.imdb_id == imdb_id,
            WatchlistMovie.user_id == current_user.id,
            WatchlistMovie.watched == False
        )
    )
    movie = result.scalar_one_or_none()
    
    if movie is None:
        raise HTTPException(
            status_code=404,
            detail="No movie found in watchlist"
        )
        
    await db.delete(movie)
    await db.commit()
    
    return {
        "message": "Movie deleted successfully"
    }
    
@app.put("/watchlist/{imdb_id}/watched")
async def mark_as_watched(
    imdb_id: str,
    review_data: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user : User = Depends(get_current_user)
):
    if not 1<= review_data.rating <= 5:
        raise HTTPException(
            status_code=409,
            detail="Rating must be between 1 and 5"
        )
    
    result = await db.execute(
        select(WatchlistMovie).where(
            WatchlistMovie.imdb_id == imdb_id,
            WatchlistMovie.user_id == current_user.id,
            WatchlistMovie.watched == False
        )
    )
    
    movie = result.scalar_one_or_none()
    
    if movie is None:
        raise HTTPException(
            status_code=404,
            detail="Movie not found in watchlist"
        )
    
    movie.rating = review_data.rating
    movie.review = review_data.review
    movie.watched = True
    
    await db.commit()
    await db.refresh(movie)
    
    return movie

@app.get("/watched")
async def get_watched(
    db: AsyncSession = Depends(get_db),
    current_user : User= Depends(get_current_user)
):
    result = await db.execute(
        select(WatchlistMovie).where(
            WatchlistMovie.watched == True,
            WatchlistMovie.user_id == current_user.id 
        )
    )
    
    movies = result.scalars().all()
    
    return movies


@app.post("/register")
async def register(
    user: UserCreate,
    db : AsyncSession = Depends(get_db)
    
):
    result = await db.execute(
       select(User).where(
           (User.email == user.email) |
           (User.username == user.username)
       ) 
    )
    
    existing_user =  result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=400 ,
            detail="Email or username is already registered"
        )
        
    new_user = User(
        username = user.username,
        email = user.email,
        password = user.password
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return {
        "message" : "Registration Successfull",
        "user_id" : new_user.id
    }
    
@app.post("/login")
async def login(
    user : UserLogin,
    db : AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User).where(
            User.email == user.email
        )
    )
    
    existing_user = result.scalar_one_or_none()
    
    if(
        existing_user is None 
        or existing_user.password != user.password
    ):
        raise HTTPException(
            status_code=404,
            detail="Invalid email or password"
        )
        
    access_token = create_access_token(
        existing_user.id
    )
    
    return {
        "access_token" : access_token,
        "username" : existing_user.username
    }
    
    
    
@app.get("/me")
async def get_me(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email
    }