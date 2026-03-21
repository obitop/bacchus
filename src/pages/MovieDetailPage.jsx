import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getMovie, deleteMovie } from '../api'
import { useAuth } from '../AuthContext'
import Spinner from '../components/Spinner'
import ErrorMsg from '../components/ErrorMsg'

export default function MovieDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getMovie(id)
      .then(setMovie)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    if (!confirm('Delete this movie?')) return
    try {
      await deleteMovie(id)
      navigate('/movies')
    } catch (e) {
      alert(e.message)
    }
  }

  if (loading) return <Spinner />
  if (error) return <ErrorMsg message={error} />
  if (!movie) return null

  return (
    <div className="max-w-2xl">
      <Link to="/movies" className="text-zinc-500 hover:text-zinc-300 text-sm mb-6 inline-flex items-center gap-1">
        ← Back to Movies
      </Link>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mt-4">
        <div className="flex items-start justify-between">
          <h1 className="text-3xl font-bold text-zinc-100">{movie.title}</h1>
          {user && (
            <button
              onClick={handleDelete}
              className="text-sm text-red-500 hover:text-red-400 border border-red-900 hover:border-red-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              Delete
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          {movie.genre && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
              {movie.genre}
            </span>
          )}
          {movie.duration && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
              {movie.duration} min
            </span>
          )}
        </div>
        {movie.description && (
          <p className="text-zinc-400 mt-6 leading-relaxed">{movie.description}</p>
        )}
        {(movie.createdAt || movie.updatedAt) && (
          <div className="border-t border-zinc-800 mt-6 pt-4 flex gap-6 text-xs text-zinc-600">
            {movie.createdAt && <span>Created: {new Date(movie.createdAt).toLocaleDateString()}</span>}
            {movie.updatedAt && <span>Updated: {new Date(movie.updatedAt).toLocaleDateString()}</span>}
          </div>
        )}
      </div>
      <div className="mt-4">
        <Link
          to="/showtimes"
          className="text-amber-400 hover:text-amber-300 text-sm font-medium"
        >
          View all showtimes →
        </Link>
      </div>
    </div>
  )
}
