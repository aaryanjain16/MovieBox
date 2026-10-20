import { useState } from 'react';

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

import SearchBar from '../Components/SearchBar';
import MovieList from '../Components/MovieList';
import Auth from './Auth';



function Home({ watched, setWatched, watchlist, setWatchlist, auth}) {

  const [title, setTitle] = useState("");
  const [movies, setMovies] = useState([]);
  

  async function searchMovies(){
    if(title === "") return;

    try{
      const response = await fetch(`${API}/search/${encodeURIComponent(title)}`);

      const data = await response.json();
    
    setMovies(data.Search || []);

    }catch (error) {
      console.log("Error:" , error);
    }
  
  }

  async function addToWatchlist(movie){
    try{
      const response = await fetch(
        "${API}/watchlist",
        {
          method: "POST",
          headers: {
            "Content-Type" : "application/json",
            "Authorization": `Bearer ${auth.access_token}`
          },
          body: JSON.stringify({
            imdb_id : movie.imdbID,
            title: movie.Title,
            year: movie.Year,
            movie_type : movie.Type,
            poster: movie.Poster !== "N/A" ? movie.Poster: null
          })
        }
      );

      if (!response.ok) {
    const error = await response.json();

    console.log("Backend error:", JSON.stringify(error, null, 2));

    return;
}

      const savedMovie = await response.json();

      setWatchlist((previous) => [
        ...previous,
        movie
      ]);

      console.log("Saved to database", savedMovie)

    }catch(error){
      console.error("Error adding movie", error);

    }
  }


  return (
    <>

      <h1>Movie & TV Show Watchlist</h1>

      <SearchBar 
        title={title}
        setTitle={setTitle}
        searchMovies={searchMovies}
      />

      {movies && movies.length > 0 && (
        <h2>Search Result</h2>
      )}

      <MovieList
        movies={movies}
        addToWatchlist={addToWatchlist} 
      />

      {/* <Watchlist 
        watchlist={watchlist}
        deleteFromWatchlist={deleteFromWatchlist}
        openReviewModal={openReviewModal}
      /> */}

      {/* <Watched
        watched={watched} 
      /> */}

      

    </>
  );
}

export default Home;
