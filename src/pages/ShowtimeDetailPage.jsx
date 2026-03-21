import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getShowtime } from '../api'
import Spinner from '../components/Spinner'
import ErrorMsg from '../components/ErrorMsg'

function formatDate(str) {
  if (!str) return '—'
  const d = new Date(str)
  return isNaN(d) ? str : d.toLocaleString()
}

export default function ShowtimeDetailPage() {
  const { id } = useParams()
  const [showtime, setShowtime] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getShowtime(id)
      .then(setShowtime)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Spinner />
  if (error) return <ErrorMsg message={error} />
  if (!showtime) return null

  const cinema = showtime.cinema || {}

  return (
    <div className="max-w-2xl">
      <Link to="/showtimes" className="text-zinc-500 hover:text-zinc-300 text-sm mb-6 inline-flex items-center gap-1">
        ← Back to Showtimes
      </Link>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mt-4 space-y-6">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Showtime</p>
          <h1 className="text-2xl font-bold text-zinc-100">{formatDate(showtime.display_date)}</h1>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-800/60 rounded-lg p-4">
            <p className="text-xs text-zinc-500 mb-1">Price</p>
            <p className="text-xl font-semibold text-amber-400">
              {showtime.price != null ? `$${Number(showtime.price).toFixed(2)}` : '—'}
            </p>
          </div>
          <div className="bg-zinc-800/60 rounded-lg p-4">
            <p className="text-xs text-zinc-500 mb-1">Showtime ID</p>
            <p className="text-xl font-semibold text-zinc-200">#{showtime.id}</p>
          </div>
        </div>

        {cinema.id && (
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Cinema</p>
            <div className="bg-zinc-800/60 rounded-lg p-4 space-y-2">
              <p className="font-medium text-zinc-100">{cinema.name || `Cinema #${cinema.id}`}</p>
              {cinema.numOfRows && (
                <p className="text-sm text-zinc-400">
                  {cinema.numOfRows} rows × {cinema.seatsPerRow} seats per row
                </p>
              )}
              {cinema.close_time && (
                <p className="text-sm text-zinc-400">Closes at: {cinema.close_time}</p>
              )}
              {cinema.owner && (
                <p className="text-sm text-zinc-500">Owner: {cinema.owner}</p>
              )}
            </div>
          </div>
        )}

        {(showtime.createdAt || showtime.updatedAt) && (
          <div className="border-t border-zinc-800 pt-4 flex gap-6 text-xs text-zinc-600">
            {showtime.createdAt && <span>Created: {formatDate(showtime.createdAt)}</span>}
            {showtime.updatedAt && <span>Updated: {formatDate(showtime.updatedAt)}</span>}
          </div>
        )}
      </div>

      <div className="mt-4">
        <Link to="/reservations" className="text-amber-400 hover:text-amber-300 text-sm font-medium">
          Make a reservation →
        </Link>
      </div>
    </div>
  )
}
