import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getMovieShowTimes, getMovie, omdbGetMovieDetails } from "../api";
import Spinner from "../components/Spinner";
import ErrorMsg from "../components/ErrorMsg";

export default function MovieShowTimesPage() {
  const { id } = useParams();
  const [showtimes, setShowtimes] = useState([]);
  const [movie, setMovie] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMovieShowTimes(id)
      .then((data) => {
        setShowtimes(
          Array.isArray(data.data.showtimes) ? data.data.showtimes : [],
        );
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    getMovie(id)
      .then(async (res) => {
        console.log("Movie API response:", res);
        console.log("movie imdb_id:", res.data.movie.imdb_id);
        setMovie(res.data.movie);

        const details = await omdbGetMovieDetails(res.data.movie.imdb_id);
        setMovieDetails(details);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg message={error} />;
  if (!movie) return null;

  if (showtimes.length === 0)
    return (
      <div className="text-center py-20">
        No showtimes available for this movie.
      </div>
    );

  return (
    <div className=" mx-auto ">
      <div className="relative min-w-2xl h-100 mx-auto overflow-hidden">
        <div className="absolute h-full w-full flex flex-col z-0">
          <div className="flex align-end justify-center h-2/3 bg-green-800">
            {/* <div className="flex align-end">
              <h1 className="text-3xl font-bold text-white">{movie.title}</h1>
            </div> */}
          </div>
          <div className="h-1/3 bg-zinc-900 p-10"></div>
        </div>

        <div className="z-1 absolute w-full bottom-0 px-50 p-10 m-auto flex items-end gap-6 flex-row">
          {movieDetails?.Poster && movieDetails.Poster !== "N/A" && (
            <img
              src={movieDetails.Poster}
              alt={movie.title}
              className="w-40 h-48 object-cover rounded-lg shadow-lg"
            />
          )}

          <div className="flex flex-col">
            <div className="flex">
              <h1 className="text-3xl font-bold text-white">{movie.title}</h1>
            </div>
            <div className="flex">
              <p className="text-sm text-gray-300 mt-2">{movieDetails?.Plot}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
