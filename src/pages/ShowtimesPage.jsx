import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getShowtimes, createShowtime, getMovies, getCinemas } from '../api'
import { useAuth } from '../AuthContext'
import Spinner from '../components/Spinner'
import ErrorMsg from '../components/ErrorMsg'
import Modal from '../components/Modal'

function formatDate(str) {
  if (!str) return '—'
  const d = new Date(str)
  return isNaN(d) ? str : d.toLocaleString()
}

export default function ShowtimesPage() {
  const { user } = useAuth()
  const [showtimes, setShowtimes] = useState([])
  const [movies, setMovies] = useState([])
  const [cinemas, setCinemas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ cinema_id: '', display_date: '', price: '', movie_id: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    Promise.all([getShowtimes(), getMovies(), getCinemas()])
      .then(([st, mv, ci]) => {
        setShowtimes(Array.isArray(st) ? st : [])
        setMovies(Array.isArray(mv) ? mv : [])
        setCinemas(Array.isArray(ci) ? ci : [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setFormError('')
    if (!form.display_date || !form.price || !form.cinema_id) {
      setFormError('Cinema, date, and price are required.')
      return
    }
    setSubmitting(true)
    try {
      const cinema = cinemas.find((c) => String(c.id) === String(form.cinema_id))
      const movie = movies.find((m) => String(m.id) === String(form.movie_id))
      const showtime = await createShowtime({
        cinema: cinema || { id: parseInt(form.cinema_id) },
        display_date: form.display_date,
        price: parseFloat(form.price),
        movie: movie || undefined,
      })
      setShowtimes((prev) => [...prev, showtime])
      setShowModal(false)
      setForm({ cinema_id: '', display_date: '', price: '', movie_id: '' })
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
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
        <p className="text-zinc-500 text-center py-16">No showtimes scheduled yet.</p>
      )}

      <div className="space-y-3">
        {showtimes.map((st) => (
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

      {showModal && (
        <Modal title="Schedule Showtime" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            {formError && <ErrorMsg message={formError} />}
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Cinema *</label>
              {cinemas.length > 0 ? (
                <select
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                  value={form.cinema_id}
                  onChange={(e) => setForm({ ...form, cinema_id: e.target.value })}
                >
                  <option value="">Select cinema</option>
                  {cinemas.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              ) : (
                <input
                  type="number"
                  placeholder="Cinema ID"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                  value={form.cinema_id}
                  onChange={(e) => setForm({ ...form, cinema_id: e.target.value })}
                />
              )}
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Movie (optional)</label>
              {movies.length > 0 ? (
                <select
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                  value={form.movie_id}
                  onChange={(e) => setForm({ ...form, movie_id: e.target.value })}
                >
                  <option value="">Select movie</option>
                  {movies.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
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
              <label className="block text-sm text-zinc-400 mb-1">Display Date *</label>
              <input
                type="datetime-local"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                value={form.display_date}
                onChange={(e) => setForm({ ...form, display_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Price ($) *</label>
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
              {submitting ? 'Scheduling…' : 'Schedule Showtime'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
