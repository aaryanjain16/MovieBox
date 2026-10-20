function MovieCard({ movie, addToWatchlist }) {

    return (
        <div className="movie-card">

            <img
                src={movie.Poster !== "N/A" ? movie.Poster : "/no-poster.png"}
                alt={movie.Title}
                className="movie-poster"
            />

            <div className="movie-info">
                <h3>{movie.Title}</h3>

                <p>
                    {movie.Year} • {movie.Type}
                </p>

                <button
                    onClick={() => addToWatchlist(movie)}
                    className="watch-button"
                >
                    + Add to Watch
                </button>
            </div>

        </div>
    );
}

export default MovieCard;