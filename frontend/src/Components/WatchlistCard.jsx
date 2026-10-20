function WatchlistCard({
    movie,
    deleteFromWatchlist,
    openReviewModal
}) {

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

                <div className="card-buttons">

                    <button
                        className="watched-button"
                        onClick={() => openReviewModal(movie)}
                    >
                        ✓ Watched
                    </button>

                    <button
                        className="delete-button"
                        onClick={() => deleteFromWatchlist(movie.imdbID)}
                    >
                        Delete
                    </button>

                </div>

            </div>

        </div>
    );
}

export default WatchlistCard;