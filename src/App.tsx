import { useEffect, useState } from "react";
import StarRating from "./StarRating";
import { useLocalStorageState } from "./useLocalStorage";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = `57af3856`;

export default function App() {
  const [query, setQuery] = useState("inception");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useLocalStorageState([], "watched");
  const [isloading, setIsloading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  function addHandlewatch(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function backButtonMovieDetail() {
    setSelectedId(null);
  }

  function handleSelectMovie(id) {
    setSelectedId((setSelectedId) => (id === setSelectedId ? null : id));
  }

  function deletButtonHandlere(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(
    function () {
      async function FetchMovie() {
        try {
          setIsloading(true);
          setError("");
          const res =
            await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}
      `);
          const data = await res.json();
          if (data.Response === "False") throw Error("movie not found!");
          setMovies(data.Search);
          setIsloading(false);

          if (!res.ok) throw Error("something went wrong!");
        } catch (err) {
          setIsloading(false);
          setError(err.message);
        }
        if (query.length < 3) {
          setMovies([]);
          setError("");
          return;
        }
      }
      FetchMovie();
    },
    [query]
  );

  function Errormessage({ message }) {
    return (
      <p className="error">
        <span>⛔️</span> {message}
      </p>
    );
  }

  return (
    <>
      <Navbar>
        <Search query={query} setQuery={setQuery} />
        <Numresult movies={movies} />
      </Navbar>
      <Main>
        <Box>
          {isloading && <p className="loader">Loading...</p>}
          {!isloading && !error && (
            <LeftboxList
              movies={movies}
              handleSelectMovie={handleSelectMovie}
            />
          )}
          {error && <Errormessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetail
              selectedId={selectedId}
              backButtonMovieDetail={backButtonMovieDetail}
              addHandlewatch={addHandlewatch}
              watched={watched}
            />
          ) : (
            <>
              <Summary watched={watched} />
              <List
                watched={watched}
                deletButtonHandlere={deletButtonHandlere}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Navbar({ children }) {
  return (
    <>
      <nav className="nav-bar">
        <Logo />
        {children}
      </nav>
    </>
  );
}

function Logo() {
  return (
    <>
      <div className="logo">
        <span role="img">🍿</span>
        <h1>usePopcorn</h1>
      </div>
    </>
  );
}

function Search({ query, setQuery }) {
  return (
    <>
      <input
        className="search"
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </>
  );
}

function Numresult({ movies }) {
  return (
    <>
      <p className="num-results">
        Found <strong>{movies.length}</strong> results
      </p>
    </>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen1, setIsOpen1] = useState(true);
  return (
    <>
      <div className="box">
        <button
          className="btn-toggle"
          onClick={() => setIsOpen1((open) => !open)}
        >
          {isOpen1 ? "–" : "+"}
        </button>
        {isOpen1 && children}
      </div>
    </>
  );
}

function LeftboxList({ movies, handleSelectMovie }) {
  return (
    <>
      <ul className="list list-movies">
        {movies?.map((movie) => (
          <LeftboxListItem
            movie={movie}
            key={movie.imdbID}
            handleSelectMovie={handleSelectMovie}
          />
        ))}
      </ul>
    </>
  );
}

function LeftboxListItem({ movie, handleSelectMovie }) {
  return (
    <>
      <li key={movie.imdbID} onClick={() => handleSelectMovie(movie.imdbID)}>
        <img src={movie.Poster} alt={`${movie.Title} poster`} />
        <h3>{movie.Title}</h3>
        <div>
          <p>
            <span>🗓</span>
            <span>{movie.Year}</span>
          </p>
        </div>
      </li>
    </>
  );
}

function Summary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <>
      <div className="summary">
        <h2>Movies you watched</h2>
        <div>
          <p>
            <span>#️⃣</span>
            <span>{watched.length} movies</span>
          </p>
          <p>
            <span>⭐️</span>
            <span>{Math.round(avgImdbRating)}</span>
          </p>
          <p>
            <span>🌟</span>
            <span>{avgUserRating}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{avgRuntime} min</span>
          </p>
        </div>
      </div>
    </>
  );
}

function List({ watched, deletButtonHandlere }) {
  return (
    <>
      <ul className="list">
        {watched.map((movie) => (
          <li key={movie.imdbID}>
            <img src={movie.poster} alt={`${movie.title} poster`} />
            <h3>{movie.title}</h3>
            <button
              className="btn-delete"
              onClick={() => deletButtonHandlere(movie.imdbID)}
            >
              X
            </button>
            <div>
              <p>
                <span>⭐️</span>
                <span>{movie.imdbRating}</span>
              </p>
              <p>
                <span>🌟</span>
                <span>{movie.userRating}</span>
              </p>
              <p>
                <span>⏳</span>
                <span>{movie.runtime} min</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function MovieDetail({
  selectedId,
  backButtonMovieDetail,
  addHandlewatch,
  watched,
}) {
  const [movie, setMovie] = useState({});
  const [isloading, setIsloading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;
  useEffect(
    function () {
      async function getMovieDetails() {
        setIsloading(true);
        const res =
          await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}
      `);
        const data = await res.json();
        setMovie(data);
        setIsloading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );
  function onAddwatched() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      userRating,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
    };
    addHandlewatch(newWatchedMovie);
    backButtonMovieDetail();
  }
  return (
    <>
      {isloading ? (
        <p className="loader">loading...</p>
      ) : (
        <div className="details">
          <header>
            <button className="btn-back" onClick={backButtonMovieDetail}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 ? (
                    <button className="btn-add" onClick={onAddwatched}>
                      + Add to list
                    </button>
                  ) : (
                    ""
                  )}
                </>
              ) : (
                `You already give rate to this movie.`
              )}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </div>
      )}
    </>
  );
}
