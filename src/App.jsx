import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import Navbar from './components/Navbar'
import MoviesPage from './pages/MoviesPage'
import MovieDetailPage from './pages/MovieDetailPage'
import ShowtimesPage from './pages/ShowtimesPage'
import ShowtimeDetailPage from './pages/ShowtimeDetailPage'
import CinemasPage from './pages/CinemasPage'
import ReservationsPage from './pages/ReservationsPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import MovieShowTimesPage from './pages/MovieShowTimesPage'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
        <Navbar />
        <main className="max-w mx-auto ">
          <Routes>
            <Route path="/" element={<Navigate to="/movies" replace />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/movies/:id" element={<MovieDetailPage />} />
            <Route path="/movies/:id/showtimes" element={<MovieShowTimesPage />} />
            <Route path="/showtimes" element={<ShowtimesPage />} />
            <Route path="/showtimes/:id" element={<ShowtimeDetailPage />} />
            <Route path="/cinemas" element={<CinemasPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="*" element={<Navigate to="/movies" replace />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}
