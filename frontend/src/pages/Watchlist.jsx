const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

import { useEffect } from "react";
import WatchlistCard from "../Components/WatchlistCard";

function Watchlist({watchlist,setWatchlist, deleteFromWatchlist, openReviewModal, auth}){

    console.log("Watchlist data:", watchlist);
    
    useEffect(() => {
        async function loadWatchlist(){
            try{
                const response = await fetch(
                    `${API}/watchlist`, {
                        headers: {
                            "Authorization" : `Bearer ${auth.access_token}`
                        }
                    }
                );

                const data = await response.json();

                if(!response.ok){
                    console.log("error: ", data);
                    return;
                }

                setWatchlist(data);
            }
            catch(error){
                console.error("Failed to load watchlist: ",
                    error
                );
            }
        }
        loadWatchlist();
    }, [auth.access_token, setWatchlist]);

    return(
        <div>
            <h1>Watchlist</h1>

            <div className="movie-grid">
                 {watchlist.map((movie) => (
                    <WatchlistCard
                        key={movie.imdb_id}
                        movie={{
                            imdbID: movie.imdb_id,
                            Title: movie.title,
                            Year: movie.year,
                            Type: movie.movie_type,
                            Poster: movie.poster
                        }}
                        deleteFromWatchlist={deleteFromWatchlist}
                        openReviewModal={openReviewModal} 
                    />
                ))}
            </div>          
        </div>
    );
}
export default Watchlist;   