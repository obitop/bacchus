const BASE_URL = 'https://kd441fh1-3000.uks1.devtunnels.ms'

function getToken() {
  return localStorage.getItem('token')
}

async function request(method, path, body = null, auth = false) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  const options = { method, headers }
  if (body) options.body = JSON.stringify(body)
  const res = await fetch(`${BASE_URL}${path}`, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || `HTTP ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

// Movies
export const getMovies = () => request('GET', '/movies')
export const getMovie = (id) => request('GET', `/movies/${id}`)
export const createMovie = (data) => request('POST', '/movies', data, true)
export const deleteMovie = (id) => request('DELETE', `/movies/${id}`, null, true)

// Showtimes
export const getShowtimes = () => request('GET', '/showtimes')
export const getShowtime = (id) => request('GET', `/showtimes/${id}`, null, true)
export const createShowtime = (data) => request('POST', '/showtimes', data, true)

// Cinemas
export const getCinemas = () => request('GET', '/cinemas')
export const createCinema = (data) => request('POST', '/cinemas', data, true)

// Reservations
export const getReservations = () => request('GET', '/reservations/', null, true)
export const createReservation = (data) => request('POST', '/reservations/', data, true)

// Auth
export const signup = (email, password) => request('POST', '/auth/signup', { email, password })
export const login = (email, password) => request('POST', '/auth/login', { email, password })
export const getMe = () => request('POST', '/auth/me', null, true)
