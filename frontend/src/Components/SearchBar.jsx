function SearchBar({title, setTitle, searchMovies}) {

    return (

        <div>
            <input 
                type='text'
                placeholder='Enter the Movie/TV Show name'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <button onClick={searchMovies}>
                Search
            </button>
        </div>
    );
}

export default SearchBar;