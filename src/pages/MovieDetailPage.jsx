import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, NavLink } from "react-router-dom";
import {
  getMovie,
  deleteMovie,
  getMovieShowTimes,
  omdbGetMovieDetails,
} from "../api";
import { useAuth } from "../AuthContext";
import Spinner from "../components/Spinner";
import ErrorMsg from "../components/ErrorMsg";

import { Ticket } from "lucide-react";

function formatDate(str) {
  if (!str) return "—";
  const d = new Date(str);
  return isNaN(d) ? str : d.toLocaleString();
}

export default function MovieDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);
  const [showTimes, setShowTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMovie(id)
      .then(async ({ data }) => {
        setMovie(data.movie);
        if (data.movie && data.movie.imdb_id) {
          const details = await omdbGetMovieDetails(data.movie.imdb_id);
          setMovieDetails(details);
          console.log("Fetched movie details from OMDB:", details);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    // Optionally, fetch showtimes for this movie
    getMovieShowTimes(id)
      .then(({ data }) => setShowTimes(data.showtimes || []))
      .catch((e) =>
        console.error("Failed to fetch showtimes for movie", { id, error: e }),
      );
  }, [id]);

  async function handleDelete() {
    if (!confirm("Delete this movie?")) return;
    try {
      await deleteMovie(id);
      navigate("/movies");
    } catch (e) {
      alert(e.message);
    }
  }

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg message={error} />;
  if (!movie) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden px-0 sm:px-7">
        {movieDetails?.Poster && movieDetails.Poster !== "N/A" && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl scale-300"
            style={{ backgroundImage: `url(${movieDetails.Poster})` }}
          />
        )}

        <div className="relative z-10 px-10 sm:px-20 py-16">
          <div className="absolute bottom-5 left-1/4 md:top-30/100 md:left-80/100 ">
            <NavLink
              to={`/movies/${movie.id}/showtimes`}
              className="bg-(--main-color) text-zinc-900 font-semibold px-6 py-3 rounded-xl hover:opacity-80 transition-colors text-sm "
            >
              Book a ticket <Ticket className="w-5 h-5 inline-block" />
            </NavLink>
          </div>

          <div className="flex flex-col md:flex-row items-end gap-8">
            {movieDetails?.Poster && movieDetails.Poster !== "N/A" && (
              <div className="flex-shrink-0 left-20 md:-ml-0 ">
                <img
                  src={movieDetails.Poster}
                  alt={`${movieDetails.Title} poster`}
                  className="w-64 h-96 object-cover rounded-1xl shadow-2xl border border-zinc-700"
                />
              </div>
            )}
            <div className="text-center md:text-left  ">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                {movieDetails?.Title || movie.title}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                {movieDetails?.Year && (
                  <span className="px-4 py-2 bg-(--main-color)/20 text-(--main-color) rounded-full text-sm font-medium border border-(--main-color)/30">
                    {movieDetails.Year}
                  </span>
                )}
                {movieDetails?.Genre && (
                  <span className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30">
                    {movieDetails.Genre}
                  </span>
                )}
                {movieDetails?.Runtime && (
                  <span className="px-4 py-2 bg-green-500/20 text-green-300 rounded-full text-sm font-medium border border-green-500/30">
                    {movieDetails.Runtime}
                  </span>
                )}
                {movieDetails?.imdbRating &&
                  movieDetails.imdbRating !== "N/A" && (
                    <span className="px-4 py-2 bg-red-500/20 text-red-300 rounded-full text-sm font-medium border border-red-500/30">
                      IMDb: {movieDetails.imdbRating}/10
                    </span>
                  )}
              </div>
              {movieDetails?.Plot && movieDetails.Plot !== "N/A" && (
                <p className="text-zinc-300 text-s md:text-lg leading-relaxed max-w-2xl">
                  {movieDetails.Plot}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Details Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Synopsis */}
            {movie.description && (
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-(--main-color) mb-4">
                  Summary
                </h2>
                <p className="text-white leading-relaxed">
                  {movie.description}
                </p>
              </div>
            )}

            {/* Additional Details */}
            {movieDetails && (
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-1xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {movieDetails.Director && movieDetails.Director !== "N/A" && (
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                        Director
                      </h3>
                      <p className="text-white">{movieDetails.Director}</p>
                    </div>
                  )}
                  {movieDetails.Actors && movieDetails.Actors !== "N/A" && (
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                        Cast
                      </h3>
                      <p className="text-white">{movieDetails.Actors}</p>
                    </div>
                  )}
                  {movieDetails.Writer && movieDetails.Writer !== "N/A" && (
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                        Writer
                      </h3>
                      <p className="text-white">{movieDetails.Writer}</p>
                    </div>
                  )}
                  {movieDetails.Awards && movieDetails.Awards !== "N/A" && (
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                        Awards
                      </h3>
                      <p className="text-white">{movieDetails.Awards}</p>
                    </div>
                  )}
                  {movieDetails.Language && movieDetails.Language !== "N/A" && (
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                        Language
                      </h3>
                      <p className="text-white">{movieDetails.Language}</p>
                    </div>
                  )}
                  {movieDetails.Country && movieDetails.Country !== "N/A" && (
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                        Country
                      </h3>
                      <p className="text-white">{movieDetails.Country}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ratings */}
            {movieDetails?.Ratings && movieDetails.Ratings.length > 0 && (
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-1xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Ratings</h2>
                <div className="space-y-4">
                  {movieDetails.Ratings.map((rating, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg"
                    >
                      <span className="text-zinc-300 font-medium">
                        {rating.Source}
                      </span>
                      <span className="text-(--main-color) font-bold">
                        {rating.Value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          {/* <div className="space-y-8"> */}
          {/* Admin Actions */}
          {/* {user && (
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-1xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Admin Actions
                </h3>
                <button
                  onClick={handleDelete}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Delete Movie
                </button>
              </div>
            )} */}

          {/* Metadata */}
          {/* {(movie.createdAt || movie.updatedAt) && (
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-1xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Metadata</h3>
                <div className="space-y-2 text-sm text-zinc-400">
                  {movie.createdAt && (
                    <p>
                      Created: {new Date(movie.createdAt).toLocaleDateString()}
                    </p>
                  )}
                  {movie.updatedAt && (
                    <p>
                      Updated: {new Date(movie.updatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )} */}
          {/* </div> */}
        </div>

        {/* Showtimes Section */}
        {showTimes.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-white mb-8">Showtimes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {showTimes.map((st) => (
                <Link
                  key={st.id}
                  to={`/showtimes/${st.id}`}
                  className="group bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-1xl p-6 hover:border-(--main-color)/50 transition-all duration-300 hover:shadow-lg hover:shadow-(--main-color)/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-(--main-color) transition-colors">
                        {st.cinema?.name || `Cinema #${st.cinema?.id || "—"}`}
                      </h3>
                      <p className="text-zinc-400 text-sm mt-1">
                        {formatDate(st.display_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-(--main-color)">
                        {st.price != null
                          ? `$${Number(st.price).toFixed(2)}`
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Showtime ID</span>
                    <span className="text-zinc-400">#{st.id}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* View All Showtimes */}
        <div className="mt-8 text-center">
          <Link
            to="/showtimes"
            className="inline-flex items-center gap-2 text-(--main-color) hover:opacity-80 font-medium transition-colors duration-200"
          >
            View all showtimes
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
