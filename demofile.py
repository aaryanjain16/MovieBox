from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx

API_KEY = ""
BASE_URL= ""

app = FastAPI(title="Movie/TV Show Watchlist!")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://127.0.0.1:5173"],
    allow_headers=["*"],
    allow_methods=["*"],
)

@app.get("/search/{title}")
async def get_Search(title: str):
    
    params = {
        "s" : title,
        "apikey" : API_KEY
    }
    
    
    async with httpx.AsyncClient as client:
         response = await client.get(BASE_URL, params= params)
         

    if(response.status_code != 200):
        return{"error" : f"{title} not found"}
    
    return response.json()