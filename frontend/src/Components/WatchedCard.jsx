function WatchedCard( { movie } ){
    return (
        <div>
            <img 
                src={movie.Poster} 
                alt={movie.Title}
                width="150"
            />

            <h2>{movie.Title}</h2>
            <p>{movie.Year}</p>
            <p>{movie.Type}</p>

            <p>Rating: {movie.rating} ⭐</p>

            <p>Review: {movie.review}</p>
        </div>
    );
}
export default WatchedCard;