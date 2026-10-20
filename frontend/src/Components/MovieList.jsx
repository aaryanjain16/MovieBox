import MovieCard from "./MovieCard";

function MovieList({movies ,addToWatchlist}){

    return(
        <div className="movie-grid">
            {movies.map((movie) => {
                return (
                    
                    <MovieCard
                        key={movie.imdbID}
                        movie={movie}
                        addToWatchlist={addToWatchlist}
                    />
                );
                
            })}
        </div>
        
    );
}

export default MovieList;