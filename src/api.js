const BASE_URL = 'https://kd441fh1-4000.uks1.devtunnels.ms'

function getToken() {
  return localStorage.getItem('token')
}

async function request(method, path, body = null, auth = false) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    console.log("Request: Checking token for authenticated request", { token });
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  const options = { method, headers }
  if (body) options.body = JSON.stringify(body);
  console.log('Request:', method, path, body, auth)
  const res = await fetch(`${BASE_URL}${path}`, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || `HTTP ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

// Movies
export const getMovies = async () => {
  const res = await request('GET', '/movies');
  if (res && Array.isArray(res.data.movies)) return res.data.movies;
  throw new Error('Invalid response format for movies');
}
export const getMovie = async (id) => (await request('GET', `/movies/${id}`))
export const createMovie = (data) => request('POST', '/movies', data, true)
export const deleteMovie = (id) => request('DELETE', `/movies/${id}`, null, true)

export const getMovieShowTimes = (movieId) => request('GET', `/movies/${movieId}/showtimes`)

// Showtimes
export const getShowtimes = async () => {
  const res = await request('GET', '/showtimes');
  console.log('showtimes response:', res);
  if (res && Array.isArray(res.data.showtimes)) return res.data.showtimes;
  throw new Error('Invalid response format for showtimes');
}

export const getShowtime = (id) => request('GET', `/showtimes/${id}`, null, false)
export const createShowtime = (data) => request('POST', '/showtimes', data, true)

// Cinemas
export const getCinemas = async () => {
  const res = await request('GET', '/cinemas');
  if (res && Array.isArray(res.data.cinemas)) return res.data.cinemas;
  throw new Error('Invalid response format for cinemas');
}
  
export const createCinema = (data) => request('POST', '/cinemas', data, true)

// Reservations
export const getReservations = () => request('GET', '/reservations/', null, true)
export const createReservation = (data) => request('POST', '/reservations/', data, true)

// Auth
export const signup = (email, password) => request('POST', '/auth/signup', { email, password })
export const login = (email, password) => request('POST', '/auth/login', { email, password })
export const getMe = () => request('GET', '/auth/me', null, true)
