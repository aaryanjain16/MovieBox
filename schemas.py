from pydantic import BaseModel

class MovieWatchlistCreate(BaseModel):
    imdb_id: str
    title: str
    year: str
    movie_type: str
    poster: str| None = None
    
class ReviewCreate(BaseModel):
    rating: int
    review: str
    
    
class UserCreate(BaseModel):
    username: str
    email: str
    password : str
    
class UserLogin(BaseModel):
    email: str
    password : str
    