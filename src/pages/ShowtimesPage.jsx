import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getShowtimes, createShowtime, getMovies, getCinemas } from "../api";
import { useAuth } from "../AuthContext";
import Spinner from "../components/Spinner";
import ErrorMsg from "../components/ErrorMsg";
import Modal from "../components/Modal";

function formatDate(str) {
  if (!str) return "—";
  const d = new Date(str);
  return isNaN(d) ? str : d.toLocaleString();
}

export default function ShowtimesPage() {
  const { user } = useAuth();
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    cinema_id: "",
    display_date: "",
    price: "",
    movie_id: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    Promise.all([getShowtimes(), getMovies(), getCinemas()])
      .then(([st, mv, ci]) => {
        setShowtimes(Array.isArray(st) ? st : []);
        setMovies(Array.isArray(mv) ? mv : []);
        setCinemas(Array.isArray(ci) ? ci : []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setFormError("");
    if (!form.display_date || !form.price || !form.cinema_id) {
      setFormError("Cinema, date, and price are required.");
      return;
    }
    setSubmitting(true);
    try {
      const cinema = cinemas.find(
        (c) => String(c.id) === String(form.cinema_id),
      );
      const movie = movies.find((m) => String(m.id) === String(form.movie_id));
      const showtime = await createShowtime({
        cinema: cinema || { id: parseInt(form.cinema_id) },
        display_date: form.display_date,
        price: parseFloat(form.price),
        movie: movie || undefined,
      });
      setShowtimes((prev) => [...prev, showtime]);
      setShowModal(false);
      setForm({ cinema_id: "", display_date: "", price: "", movie_id: "" });
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-10 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Showtimes</h1>
          <p className="text-sm text-zinc-500 mt-1">Upcoming screenings</p>
        </div>
        {user && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-amber-400 text-zinc-900 font-semibold px-4 py-2 rounded-lg hover:bg-amber-300 transition-colors text-sm"
          >
            + Add Showtime
          </button>
        )}
      </div>

      {loading && <Spinner />}
      {error && <ErrorMsg message={error} />}

      {!loading && !error && showtimes.length === 0 && (
        <p className="text-zinc-500 text-center py-16">
          No showtimes scheduled yet.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {showtimes.map((st) => (
          <Link
            key={st.id}
            to={`/showtimes/${st.id}`}
            className="block bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-sm p-6 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-400/10 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors mb-1">
                  {st.movie?.title || "No Movie Assigned"}
                </h3>
                <p className="text-sm text-zinc-400 mb-2">
                  {st.cinema?.name || `Cinema #${st.cinema?.id || "—"}`}
                </p>
                <div className="flex items-center text-sm text-zinc-500">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {formatDate(st.display_date)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-400 mb-1">
                  {st.price != null ? `$${Number(st.price).toFixed(2)}` : "—"}
                </div>
                <div className="text-xs text-zinc-600">ID #{st.id}</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="bg-zinc-700 px-2 py-1 rounded-full">
                {st.cinema?.numOfRows
                  ? `${st.cinema.numOfRows}×${st.cinema.seatsPerRow} seats`
                  : "Seating info unavailable"}
              </span>
              <span className="group-hover:text-amber-400 transition-colors">
                View Details →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {showModal && (
        <Modal title="Schedule Showtime" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            {formError && <ErrorMsg message={formError} />}
            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                Cinema *
              </label>
              {cinemas.length > 0 ? (
                <select
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                  value={form.cinema_id}
                  onChange={(e) =>
                    setForm({ ...form, cinema_id: e.target.value })
                  }
                >
                  <option value="">Select cinema</option>
                  {cinemas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  placeholder="Cinema ID"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                  value={form.cinema_id}
                  onChange={(e) =>
                    setForm({ ...form, cinema_id: e.target.value })
                  }
                />
              )}
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                Movie (optional)
              </label>
              {movies.length > 0 ? (
                <select
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                  value={form.movie_id}
                  onChange={(e) =>
                    setForm({ ...form, movie_id: e.target.value })
                  }
                >
                  <option value="">Select movie</option>
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  placeholder="No movies available"
                  disabled
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-600 cursor-not-allowed"
                />
              )}
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                Display Date *
              </label>
              <input
                type="datetime-local"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                value={form.display_date}
                onChange={(e) =>
                  setForm({ ...form, display_date: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                Price ($) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-400 text-zinc-900 font-semibold py-2 rounded-lg hover:bg-amber-300 transition-colors text-sm disabled:opacity-50"
            >
              {submitting ? "Scheduling…" : "Schedule Showtime"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
