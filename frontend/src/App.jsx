import './App.css'
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import WatchlistPage from './pages/Watchlist';
import Sidebar from './Components/Sidebar';
import {BrowserRouter, Routes, Route, useLocation} from "react-router-dom";
import ReviewModal  from './Components/ReviewModal';
import Watched from './pages/Watched';
import Auth from './pages/Auth';

function RouteChangeHandler({ onRouteChange }) {
    const location = useLocation();

    useEffect(() => {
        onRouteChange();
    }, [location.pathname]);

    return null;
}

function App() {
  
  const [watchlist, setWatchlist] = useState([]);
  const [watched, setWatched] = useState([]);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [rating, setRating] = useState("");
  const [review, setReview] = useState("");

  const [auth, setAuth] = useState(()=>{
    const saved = localStorage.getItem("auth");
    return saved ? JSON.parse(saved) : null; 
  });

  function handleLogin(data){
    localStorage.setItem("auth", JSON.stringify(data));
    setAuth(data);
  }

  function handleLogout(){
    localStorage.removeItem("auth");
    setAuth(null);
  }

  async function deleteFromWatchlist(imdbID){
    try{
      const response = await fetch(
        `http://127.0.0.1:8000/watchlist/${imdbID}`,
        {
          method: "DELETE",
          headers: {
            "Authorization" : `Bearer ${auth.access_token}`
          }
        }
      );

      const data = await response.json();

      if(!response.ok){
          console.log("Delete Error:  ", data);
          return;
      }
      
      setWatchlist((previous) =>
        previous.filter(
          (movie) => (movie.imdb_id || movie.imdbID) !== imdbID
        )  
      );

    }catch(error){
      console.error("failed to delete:", error)
    }
    
  }

  function openReviewModal(movie) {
    setSelectedMovie(movie);
  }

  async function saveReview() {
    const reviewData = {
        rating: Number(rating),
        review: review
    };

    console.log("Sending:", reviewData);

    try {
        const response = await fetch(
            `http://127.0.0.1:8000/watchlist/${selectedMovie.imdbID}/watched`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization" : `Bearer ${auth.access_token}`
                },
                body: JSON.stringify(reviewData)
            }
        );

        const data = await response.json();

        console.log("Backend response:", data);

        if (!response.ok) {
            console.log(
                "Error saving movie:",
                JSON.stringify(data, null, 2)
            );
            return;
        }

        setWatchlist((previous) =>
            previous.filter(
                (movie) =>
                    (movie.imdb_id || movie.imdbID) !==
                    selectedMovie.imdbID
            )
        );

        setWatched((previous) => [
            ...previous,
            {
                ...selectedMovie,
                rating: Number(rating),
                review: review,
                watched: true
            }
        ]);

        setSelectedMovie(null);
        setRating("");
        setReview("");

    } catch (error) {
        console.error("Failed to save review:", error);
    }
}

  function closeModal(){
    setSelectedMovie(null);
    setReview("");
    setRating("");
  }


  
  return (
    <BrowserRouter>

      <RouteChangeHandler onRouteChange={closeModal} />

        {!auth ? (
            <Routes>
                <Route
                    path="*"
                    element={<Auth onLogin={handleLogin} />}
                />
            </Routes>
        ) : (
            <div className="app-layout">
                <Sidebar handleLogout={handleLogout}/>

                <main className="main-content">
                    {/* <button onClick={handleLogout}>
                        Logout
                    </button> */}

                    <Routes>
                        <Route
                            path="/"
                            element={
                                <Home
                                    watched={watched}
                                    setWatched={setWatched}
                                    watchlist={watchlist}
                                    setWatchlist={setWatchlist}
                                    auth={auth}
                                />
                            }
                        />

                        <Route
                            path="/watchlist"
                            element={
                                <WatchlistPage
                                    watchlist={watchlist}
                                    setWatchlist={setWatchlist}
                                    deleteFromWatchlist={deleteFromWatchlist}
                                    openReviewModal={openReviewModal}
                                    auth={auth}
                                />
                            }
                        />

                        <Route
                            path="/watched"
                            element={<Watched auth={auth} />}
                        />
                    </Routes>
                </main>

                {selectedMovie && (
                    <ReviewModal
                        movie={selectedMovie}
                        setRating={setRating}
                        setReview={setReview}
                        saveReview={saveReview}
                        closeModal={closeModal}
                        review={review}
                        rating={rating}
                    />
                )}
            </div>
        )}
    </BrowserRouter>
);
}

export default App;
