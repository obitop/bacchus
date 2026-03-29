import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const linkClass = ({ isActive }) =>
    `text-sm font-bold transition-colors ${
      isActive ? "text-(--main-color)" : "text-zinc-400 hover:text-zinc-100"
    }`;

  return (
    <nav className="border-b border-zinc-800 bg-(--main-dark) backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          to="/movies"
          className="text-(--main-color) font-bold text-lg tracking-tight"
        >
          🎬 Bacchus
        </Link>
        <div className="flex items-center gap-6">
          <NavLink to="/movies" className={linkClass}>
            Movies
          </NavLink>
          <NavLink to="/showtimes" className={linkClass}>
            Showtimes
          </NavLink>
          <NavLink to="/cinemas" className={linkClass}>
            Cinemas
          </NavLink>
          {user && (
            <NavLink to="/reservations" className={linkClass}>
              Reservations
            </NavLink>
          )}
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-xs text-zinc-500">{user.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-sm bg-(--main-color) text-zinc-900 font-semibold px-3 py-1.5 rounded-md hover:opacity-80 transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
