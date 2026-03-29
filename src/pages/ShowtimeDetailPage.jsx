import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getShowtime, getShowtimeSeats, omdbGetMovieDetails } from "../api";
import Spinner from "../components/Spinner";
import ErrorMsg from "../components/ErrorMsg";

function formatDate(str) {
  if (!str) return "—";
  const d = new Date(str);
  return isNaN(d) ? str : d.toLocaleString();
}

const RowToLetter = (row) => String.fromCharCode(65 + row - 1);

const RowtoLetter = {
  0: "A",
  1: "B",
  2: "C",
  3: "D",
  4: "E",
  5: "F",
  6: "G",
  7: "H",
  8: "I",
  9: "J",
};

const LetterToRow = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
  G: 6,
  H: 7,
  I: 8,
  J: 9,
};

export default function ShowtimeDetailPage() {
  const { id } = useParams();
  const [showtime, setShowtime] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("Fetching showtime details for ID:", id);
    Promise.all([getShowtime(id)])
      .then(async ([showtimeRes]) => {
        console.log("fetched showtime response:", showtimeRes);
        const showtimeData =
          showtimeRes.data?.showTime || showtimeRes.data || showtimeRes;
        setShowtime(showtimeData);
        const seatsData = showtimeData.seats || [];
        setSeats(Array.isArray(seatsData) ? seatsData : []);

        console.log("Showtime data:", showtimeData);
        const movieDetails = await omdbGetMovieDetails(
          showtimeData.movie?.imdb_id,
        );
        setMovieDetails(movieDetails);
      })
      .catch((e) => {
        console.error("Error fetching data:", e);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleSeatSelection = (seat) => {
    if (seat.state !== "free") return;
    setSelectedSeats((prev) =>
      prev.some((s) => s.id === seat.id)
        ? prev.filter((s) => s.id !== seat.id)
        : [...prev, seat],
    );
  };

  let groupedSeats = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  console.log("Grouped seats by row:", groupedSeats);
  // groupedSeats = Object.values(groupedSeats).map((row) => row.sort((a, b) => a.col - b.col));

  const cinema = showtime?.cinema || {};

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg message={error} />;
  if (!showtime) return <ErrorMsg message="Showtime not found." />;

  return (
    <div className="">
      <div className="max-w-4xl mx-auto my-5 flex flex-row">
        <div className="w-1/3 mr-10 rounded-lg overflow-hidden">
          <img
            className=""
            src={movieDetails?.Poster || "/assets/cinema-bg.jpg"}
            alt={showtime.movie?.title}
          />
        </div>
      </div>
    </div>
  );
}

/*
      <div className="bg-linear-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700 rounded-xl p-8 mt-4 space-y-8">
        <div className="text-center">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
            Showtime Details
          </p>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">
            {showtime.movie?.title || "Untitled Movie"}
          </h1>
          <p className="text-lg text-(--main-color) font-medium">
            {formatDate(showtime.display_date)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-800/60 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-(--main-color) mb-2">
              {showtime.price != null
                ? `$${Number(showtime.price).toFixed(2)}`
                : "—"}
            </div>
            <p className="text-sm text-zinc-500">Ticket Price</p>
          </div>
          <div className="bg-zinc-800/60 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-zinc-200 mb-2">
              #{showtime.id}
            </div>
            <p className="text-sm text-zinc-500">Showtime ID</p>
          </div>
          <div className="bg-zinc-800/60 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-zinc-200 mb-2">
              {cinema.numOfRows
                ? `${cinema.numOfRows * cinema.seatsPerRow}`
                : "—"}
            </div>
            <p className="text-sm text-zinc-500">Total Seats</p>
          </div>
        </div>

        {cinema.id && (
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">
              Cinema Information
            </p>
            <div className="bg-zinc-800/60 rounded-lg p-6 space-y-3">
              <h3 className="text-xl font-semibold text-zinc-100">
                {cinema.name || `Cinema #${cinema.id}`}
              </h3>
              {cinema.numOfRows && (
                <p className="text-sm text-zinc-400 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                    />
                  </svg>
                  {cinema.numOfRows} rows × {cinema.seatsPerRow} seats per row
                </p>
              )}
              {cinema.close_time && (
                <p className="text-sm text-zinc-400 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Closes at: {cinema.close_time}
                </p>
              )}
              {cinema.owner && (
                <p className="text-sm text-zinc-500">Owner: {cinema.owner}</p>
              )}
            </div>
          </div>
        )}

        // Seat selection UI (can be a separate component)

        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">
            Select Your Seats
          </p>
          <div className="bg-zinc-800/60 rounded-lg p-6">
            {seats.length === 0 ? (
              <p className="text-zinc-400 text-center">Loading seats...</p>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-zinc-400 mb-2">SCREEN</p>
                  <div className="w-full h-2 bg-gradient-to-r from-zinc-600 via-zinc-500 to-zinc-600 rounded"></div>
                </div>
                {Object.keys(groupedSeats)
                  .sort()
                  .map((row) => (
                    <div
                      key={row}
                      className="flex items-center justify-center space-x-2"
                    >
                      <span className="text-xs text-zinc-500 w-4 text-right">
                        {RowtoLetter[row] || row}
                      </span>
                      <div className="flex space-x-1">
                        {groupedSeats[row]
                          .sort((a, b) => a.col - b.col)
                          .map((seat) => (
                            <div key={seat.id}>
                              <button
                                key={seat.id}
                                onClick={() => toggleSeatSelection(seat)}
                                disabled={seat.state !== "free"}
                                className={`w-8 h-8 rounded text-xs font-medium transition-all ${
                                  seat.state !== "free"
                                    ? "bg-zinc-600 text-zinc-500 cursor-not-allowed"
                                    : selectedSeats.some(
                                          (s) => s.id === seat.id,
                                        )
                                      ? "bg-(--main-color) text-zinc-900"
                                      : "bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
                                }`}
                              >
                                {seat.col}
                              </button>
                              <span className="bg-zinc-700 mt-1 max-w-xs h-1 rounded text-xs font-small transition-all flex items-center justify-center"></span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                <div className="flex justify-center space-x-6 mt-6 text-xs text-zinc-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-zinc-700 rounded"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-(--main-color) rounded"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-zinc-600 rounded"></div>
                    <span>Unavailable</span>
                  </div>
                </div>
                {selectedSeats.length > 0 && (
                  <div className="mt-4 p-4 bg-(--main-color)/10 border border-(--main-color)/20 rounded-lg">
                    <p className="text-sm text-zinc-300 mb-2">
                      Selected Seats:{" "}
                      {selectedSeats
                        .map((s) => `${RowtoLetter[s.row] || s.row}${s.col}`)
                        .join(", ")}
                    </p>
                    <p className="text-sm text-(--main-color) font-medium">
                      Total: $
                      {(selectedSeats.length * (showtime.price || 0)).toFixed(
                        2,
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {(showtime.createdAt || showtime.updatedAt) && (
          <div className="border-t border-zinc-700 pt-4 flex gap-6 text-xs text-zinc-600">
            {showtime.createdAt && (
              <span>Created: {formatDate(showtime.createdAt)}</span>
            )}
            {showtime.updatedAt && (
              <span>Updated: {formatDate(showtime.updatedAt)}</span>
            )}
          </div>
        )}
      </div>

      <div className="mt-4">
        <Link
          to="/reservations"
          className="text-(--main-color) hover:opacity-80 text-sm font-medium"
        >
          Make a reservation →
        </Link>
      </div> 
      */
