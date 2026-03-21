import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMovies, createMovie, deleteMovie } from '../api'
import { useAuth } from '../AuthContext'
import Spinner from '../components/Spinner'
import ErrorMsg from '../components/ErrorMsg'
import Modal from '../components/Modal'

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller', 'Romance', 'Documentary']

const GENRE_COLORS = {
  Action: 'bg-red-900/50 text-red-300',
  Comedy: 'bg-yellow-900/50 text-yellow-300',
  Drama: 'bg-blue-900/50 text-blue-300',
  Horror: 'bg-purple-900/50 text-purple-300',
  'Sci-Fi': 'bg-cyan-900/50 text-cyan-300',
  Thriller: 'bg-orange-900/50 text-orange-300',
  Romance: 'bg-pink-900/50 text-pink-300',
  Documentary: 'bg-green-900/50 text-green-300',
}

export default function MoviesPage() {
  const { user } = useAuth()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', genre: '', duration: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    getMovies()
      .then(setMovies)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setFormError('')
    if (!form.title || !form.genre || !form.duration) {
      setFormError('Title, genre, and duration are required.')
      return
    }
    setSubmitting(true)
    try {
      const movie = await createMovie({
        title: form.title,
        description: form.description,
        genre: form.genre,
        duration: parseInt(form.duration),
      })
      setMovies((prev) => [...prev, movie])
      setShowModal(false)
      setForm({ title: '', description: '', genre: '', duration: '' })
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id, e) {
    e.preventDefault()
    if (!confirm('Delete this movie?')) return
    try {
      await deleteMovie(id)
      setMovies((prev) => prev.filter((m) => m.id !== id))
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Movies</h1>
          <p className="text-sm text-zinc-500 mt-1">Browse the full catalog</p>
        </div>
        {user && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-amber-400 text-zinc-900 font-semibold px-4 py-2 rounded-lg hover:bg-amber-300 transition-colors text-sm"
          >
            + Add Movie
          </button>
        )}
      </div>

      {loading && <Spinner />}
      {error && <ErrorMsg message={error} />}

      {!loading && !error && movies.length === 0 && (
        <p className="text-zinc-500 text-center py-16">No movies yet.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {movies.map((movie) => (
          <Link
            key={movie.id}
            to={`/movies/${movie.id}`}
            className="group bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between mb-3">
              <h2 className="font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors">
                {movie.title}
              </h2>
              {user && (
                <button
                  onClick={(e) => handleDelete(movie.id, e)}
                  className="text-zinc-600 hover:text-red-400 transition-colors text-xs ml-2 shrink-0"
                >
                  ✕
                </button>
              )}
            </div>
            {movie.genre && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${GENRE_COLORS[movie.genre] || 'bg-zinc-800 text-zinc-400'}`}>
                {movie.genre}
              </span>
            )}
            {movie.description && (
              <p className="text-zinc-500 text-sm mt-3 line-clamp-2">{movie.description}</p>
            )}
            {movie.duration && (
              <p className="text-zinc-600 text-xs mt-3">{movie.duration} min</p>
            )}
          </Link>
        ))}
      </div>

      {showModal && (
        <Modal title="Add New Movie" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            {formError && <ErrorMsg message={formError} />}
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Title *</label>
              <input
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Genre *</label>
              <select
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                value={form.genre}
                onChange={(e) => setForm({ ...form, genre: e.target.value })}
              >
                <option value="">Select genre</option>
                {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Duration (minutes) *</label>
              <input
                type="number"
                min="1"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Description</label>
              <textarea
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400 resize-none"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-400 text-zinc-900 font-semibold py-2 rounded-lg hover:bg-amber-300 transition-colors text-sm disabled:opacity-50"
            >
              {submitting ? 'Creating…' : 'Create Movie'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
