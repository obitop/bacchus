import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getReservations, createReservation, getShowtimes } from '../api'
import { useAuth } from '../AuthContext'
import Spinner from '../components/Spinner'
import ErrorMsg from '../components/ErrorMsg'
import Modal from '../components/Modal'

const STATE_COLORS = {
  confirmed: 'bg-green-900/50 text-green-300 border-green-800',
  pending: 'bg-yellow-900/50 text-yellow-300 border-yellow-800',
  cancelled: 'bg-red-900/50 text-red-300 border-red-800',
}

function formatDate(str) {
  if (!str) return '—'
  const d = new Date(str)
  return isNaN(d) ? str : d.toLocaleString()
}

export default function ReservationsPage() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState([])
  const [showtimes, setShowtimes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ showtime_id: '', state: 'pending' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!user) { setLoading(false); return }
    Promise.all([getReservations(), getShowtimes()])
      .then(([res, st]) => {
        setReservations(Array.isArray(res) ? res : [])
        setShowtimes(Array.isArray(st) ? st : [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [user])

  async function handleCreate(e) {
    e.preventDefault()
    setFormError('')
    if (!form.showtime_id) {
      setFormError('Please select a showtime.')
      return
    }
    setSubmitting(true)
    try {
      const showtime = showtimes.find((s) => String(s.id) === String(form.showtime_id))
      const res = await createReservation({
        showTime: showtime || { id: parseInt(form.showtime_id) },
        state: form.state,
      })
      setReservations((prev) => [...prev, res])
      setShowModal(false)
      setForm({ showtime_id: '', state: 'pending' })
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="text-center py-24">
        <p className="text-zinc-400 text-lg mb-4">Please log in to view your reservations.</p>
        <Link
          to="/login"
          className="bg-amber-400 text-zinc-900 font-semibold px-5 py-2.5 rounded-lg hover:bg-amber-300 transition-colors text-sm"
        >
          Log in
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Reservations</h1>
          <p className="text-sm text-zinc-500 mt-1">Your booked seats</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-400 text-zinc-900 font-semibold px-4 py-2 rounded-lg hover:bg-amber-300 transition-colors text-sm"
        >
          + New Reservation
        </button>
      </div>

      {loading && <Spinner />}
      {error && <ErrorMsg message={error} />}

      {!loading && !error && reservations.length === 0 && (
        <div className="text-center py-16">
          <p className="text-zinc-500 mb-4">No reservations yet.</p>
          <Link to="/showtimes" className="text-amber-400 hover:text-amber-300 text-sm font-medium">
            Browse showtimes →
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {reservations.map((res) => {
          const stateClass = STATE_COLORS[res.state?.toLowerCase()] || 'bg-zinc-800 text-zinc-400 border-zinc-700'
          const showtime = res.showTime || {}
          const cinema = showtime.cinema || {}
          return (
            <div
              key={res.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-zinc-100">
                    {cinema.name || (showtime.id ? `Showtime #${showtime.id}` : `Reservation #${res.id}`)}
                  </p>
                  {showtime.display_date && (
                    <p className="text-sm text-zinc-500 mt-0.5">{formatDate(showtime.display_date)}</p>
                  )}
                  {showtime.price != null && (
                    <p className="text-sm text-amber-400 mt-0.5">${Number(showtime.price).toFixed(2)}</p>
                  )}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border ${stateClass} capitalize`}>
                  {res.state || 'unknown'}
                </span>
              </div>
              {(res.createdAt || res.updatedAt) && (
                <div className="flex gap-4 mt-3 text-xs text-zinc-600">
                  {res.createdAt && <span>Booked: {formatDate(res.createdAt)}</span>}
                  {res.updatedAt && <span>Updated: {formatDate(res.updatedAt)}</span>}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showModal && (
        <Modal title="New Reservation" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            {formError && <ErrorMsg message={formError} />}
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Showtime *</label>
              {showtimes.length > 0 ? (
                <select
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                  value={form.showtime_id}
                  onChange={(e) => setForm({ ...form, showtime_id: e.target.value })}
                >
                  <option value="">Select showtime</option>
                  {showtimes.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.cinema?.name || `Cinema #${st.cinema?.id}`} — {formatDate(st.display_date)} (${Number(st.price || 0).toFixed(2)})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-zinc-500">No showtimes available. <Link to="/showtimes" className="text-amber-400">Browse showtimes</Link>.</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">State</label>
              <select
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-400 text-zinc-900 font-semibold py-2 rounded-lg hover:bg-amber-300 transition-colors text-sm disabled:opacity-50"
            >
              {submitting ? 'Reserving…' : 'Reserve Seat'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
