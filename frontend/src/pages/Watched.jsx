const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

import { useEffect, useState } from "react";
import WatchedCard from "../Components/WatchedCard";

function Watched({auth}){

    const [watched, setWatched] = useState([]);

    useEffect(()=>{
        async function loadWatched(){
            
            try{
                const response = await fetch(
                    `${API}/watched`, {
                        
                        headers: {
                            "Authorization" : `Bearer ${auth.access_token}`
                        }
                    }
                );

                const data = await response.json();

                if(!response.ok){
                    console.log("Error: ", data);
                    return;
                }

                setWatched(data);

            }catch(error){
                console.error(
                    "Failed to do it",
                    error
                );
            }
        }

        loadWatched();
    }, [auth.access_token]);


    return(
        <div>

            <h1>Watched Movies/TV Shows</h1>

            <div className="movie-grid">
                {watched.map((movie)=>(
                    <WatchedCard 
                        key={movie.imdb_id}
                        movie={{
                            imdbID: movie.imdb_id,
                            Title: movie.title,
                            Year: movie.year,
                            Type: movie.movie_type,
                            Poster: movie.poster,
                            rating: movie.rating,
                            review: movie.review
                        }}
                    />
                ))}
            </div>
            
        </div>
    );
}
export default Watched;