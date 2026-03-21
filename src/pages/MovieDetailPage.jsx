import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getMovie, deleteMovie ,getMovieShowTimes} from '../api'
import { useAuth } from '../AuthContext'
import Spinner from '../components/Spinner'
import ErrorMsg from '../components/ErrorMsg'

function formatDate(str) {
  if (!str) return '—'
  const d = new Date(str)
  return isNaN(d) ? str : d.toLocaleString()
}

export default function MovieDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [showTimes, setShowTimes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getMovie(id)
      .then(({data})=> setMovie(data.movie))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))

    // Optionally, fetch showtimes for this movie
    getMovieShowTimes(id)
      .then(({data}) => setShowTimes(data.showtimes || []))
      .catch((e) => console.error("Failed to fetch showtimes for movie", { id, error: e }))

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



      <div className="space-y-3 mt-8">
        {showTimes.map((st) => (
          <Link
            key={st.id}
            to={`/showtimes/${st.id}`}
            className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 hover:border-zinc-600 transition-all group"
          >
            <div>
              <p className="font-medium text-zinc-100 group-hover:text-amber-400 transition-colors">
                {st.cinema?.name || `Cinema #${st.cinema?.id || '—'}`}
              </p>
              <p className="text-sm text-zinc-500 mt-0.5">{formatDate(st.display_date)}</p>
            </div>
            <div className="text-right">
              <p className="text-amber-400 font-semibold">
                {st.price != null ? `$${Number(st.price).toFixed(2)}` : '—'}
              </p>
              <p className="text-xs text-zinc-600 mt-0.5">ID #{st.id}</p>
            </div>
          </Link>
        ))}
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
