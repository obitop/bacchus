import { useParams } from "react-router-dom";
import { useState, useEffect, useMemo, act } from "react";
import { getMovieShowTimes, getMovie, omdbGetMovieDetails } from "../api";
import Spinner from "../components/Spinner";
import ErrorMsg from "../components/ErrorMsg";
import { CodeXml, X } from "lucide-react";

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

function groupSeats(seats) {
  return seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});
}

function groupByDate(showtimes) {
  return showtimes.reduce((acc, st) => {
    const d = st.display_date ? new Date(st.display_date) : null;
    const key = d
      ? d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          weekday: "short",
        })
      : "Unknown";

    // const key = d || null;
    if (!acc[key]) acc[key] = [];
    acc[key].push(st);
    return acc;
  }, {});
}

function isSeatReserved(seat, reservations) {
  if (!reservations) return false;
  return reservations.some((res) => res.seat.id == seat.id);
}

export default function MovieShowTimesPage() {
  const { id } = useParams();
  const [showtimes, setShowtimes] = useState([]);
  const [movie, setMovie] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedShowTime, setSelectedShowTime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMovieShowTimes(id)
      .then((data) => {
        setShowtimes(
          Array.isArray(data.data.showtimes) ? data.data.showtimes : [],
        );

        const dates = data.data.showtimes.map((st) => st.display_date);
        setAvailableDates(dates);
        setSelectedDate(dates.length > 0 ? new Date(dates[0]) : new Date(0));
        setSelectedShowTime(data.data.showtimes[0] || null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    getMovie(id)
      .then(async (res) => {
        console.log("Movie API response:", res);
        console.log("movie imdb_id:", res.data.movie.imdb_id);
        setMovie(res.data.movie);

        const details = await omdbGetMovieDetails(res.data.movie.imdb_id);
        setMovieDetails(details);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  const groupedDates = useMemo(() => groupByDate(showtimes), [showtimes]);

  console.log("Grouped showtimes by date:", groupedDates);

  /// IMPORTANT
  /// selectedSeeats : [ {seat , selectedShowTime} , ...]

  const toggleSeatSelection = ({ seat, selectedShowTime }) => {
    setSelectedSeats((prev) =>
      prev.some(
        (s) =>
          s.seat.id === seat.id &&
          s.selectedShowTime.id === selectedShowTime.id,
      )
        ? prev.filter(
            (s) =>
              s.seat.id !== seat.id ||
              s.selectedShowTime.id !== selectedShowTime.id,
          )
        : [...prev, { seat, selectedShowTime }],
    );
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg message={error} />;
  if (!movie) return null;

  if (showtimes.length === 0)
    return (
      <div className="text-center py-20">
        No showtimes available for this movie.
      </div>
    );

  let groupedSeats = groupSeats(selectedShowTime?.cinema?.seats || []);

  return (
    <div className="">
      {/* Movie details section (can be a separate component) */}
      <div className="relative overflow-hidden px-7">
        <div
          className="bg-cover bg-center inset-0 absolute opacity-40 blur-lg  scale-100"
          style={{ backgroundImage: `url(${movieDetails?.Poster})` }}
        />

        <div className="relative z-10 px-30 py-16">
          <div className="flex flex-col md:flex-row items-center gap-20">
            {movieDetails?.Poster && movieDetails.Poster !== "N/A" && (
              <div className="flex-shrink-0">
                <img
                  src={movieDetails.Poster}
                  alt={`${movieDetails.Title} Poster`}
                  className="w-56 rounded-lg shadow-lg"
                />
              </div>
            )}
            <div>
              <h1 className="text-6xl font-bold text-white mb-4">
                {movieDetails?.Title || movie.title}
              </h1>

              <span>
                {movieDetails?.imdbRating || "N/A"}(
                {movieDetails?.imdbVotes || "N/A"})
              </span>
              <p className="text-sm text-zinc-400 mb-2">
                {movieDetails?.Year || "N/A"} | {movieDetails?.Genre || "N/A"}
              </p>
              <p className="text-zinc-300 max-w-lg">
                {movieDetails?.Plot || "No description available."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/*Date selection */}

      <div className="border-b border-zinc-600 flex flex-col sm:flex-col md:flex-col  justify-between from-(--main-dark) to-zinc-900 px-0 sm:px-40">
        <div className="flex flex-start justify-center flex-none overflow-x-auto ">
          {Object.keys(groupedDates).map((dk) => {
            // dk = e.g. "Mon, Mar 22"  or  "Sun, Mar 22"
            const firstShowTimeDate = groupedDates[dk][0]?.display_date
              ? new Date(groupedDates[dk][0].display_date)
              : null;

            // const firstShowTimeDate = new Date();
            const dayName = firstShowTimeDate
              ? firstShowTimeDate.toLocaleDateString("en-US", {
                  weekday: "short",
                })
              : dk.split(" ")[0].replace(",", "");
            const dayNum = firstShowTimeDate
              ? firstShowTimeDate.toLocaleDateString("en-US", {
                  day: "numeric",
                })
              : dk.split(" ")[2];
            const monName = firstShowTimeDate
              ? firstShowTimeDate.toLocaleDateString("en-US", {
                  month: "short",
                })
              : dk.split(" ")[1];

            const active =
              firstShowTimeDate &&
              firstShowTimeDate.getTime() === selectedDate.getTime();

            console.log(
              "firstShowTimeDate:",
              firstShowTimeDate,
              "selectedDate:",
              selectedDate,
            );
            console.log("active:", active);
            return (
              <button
                className={`flex flex-col items-center font-bold text-lg px-4 py-4  text-(--main-color)  hover:text-(--secondary-color) transition-colors 
                  ${active ? "border-b-2 border-(--main-color)" : "bg-transparent"} hover:bg-zinc-900`}
                onClick={() => {
                  if (active) {
                    setSelectedDate(new Date(0));
                    return;
                  }
                  setSelectedDate(firstShowTimeDate);
                }}
              >
                <span className="text-lg">{monName}</span>
                <div className="flex justify-between gap-2 text-zinc-300">
                  <span className="">{dayNum}</span>
                  <span className="">{dayName}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-row">
          {selectedDate ? (
            <div className="flex flex-row ">
              {(
                groupedDates[
                  selectedDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    weekday: "short",
                  })
                ] || []
              ).map((st) => (
                <button
                  key={st.id}
                  className={`px-5 mx-3 py-2 flex flex-col items-center justify-center text-lg transition-colors opacity-80 ${selectedShowTime == st ? "opacity-100" : " "} hover:opacity-100 rounded  ${selectedShowTime == st ? "border-b-2 border-(--main-color)" : ""} `}
                  onClick={() => setSelectedShowTime(st)}
                >
                  <span className="text-(--main-color) font-bold text-lg mb-2">
                    {st.cinema.name}
                  </span>
                  <span className="opacity-100">
                    {new Date(st.display_date).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center text-center py-2 text-zinc-400">
              Select a date to see showtimes.
            </div>
          )}
        </div>
      </div>

      {selectedShowTime && (
        <div className=" bg-(--main-dark) grid sm:grid-cols-1 md:grid-cols-6">
          <div className="sm:col-span:1 md:col-span-4">
            <div className="bg-(--main-dark) p-6">
              {selectedShowTime.cinema.seats.length === 0 ? (
                <p className="text-zinc-400 text-center">Loading seats...</p>
              ) : (
                <div className="space-y-4">
                  <div className="text-center mb-15">
                    <div className="w-full h-5 relative overflow-hidden flex justify-center">
                      <div className="absolute  w-100 h-60 md:w-400 md:h-300 rounded-full border-3 border-(--main-color) shadow-lg"></div>
                    </div>
                    <p className="text-sm text-zinc-400 mt-4">SCREEN</p>
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
                                  onClick={() =>
                                    toggleSeatSelection({
                                      seat,
                                      selectedShowTime,
                                    })
                                  }
                                  disabled={isSeatReserved(
                                    seat,
                                    selectedShowTime.seatReservations,
                                  )}
                                  className={`w-8 h-8 rounded text-xs font-medium transition-all ${
                                    isSeatReserved(
                                      seat,
                                      selectedShowTime.seatReservations,
                                    )
                                      ? "bg-zinc-600 text-zinc-500 cursor-not-allowed"
                                      : selectedSeats.some(
                                            (s) =>
                                              s.seat.id === seat.id &&
                                              s.selectedShowTime.id ===
                                                selectedShowTime.id,
                                          )
                                        ? "bg-(--main-color) text-zinc-900"
                                        : "bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
                                  }`}
                                >
                                  {/* {seat.col} */}
                                </button>
                                <span
                                  className={`max-w-xs h-1 rounded text-xs font-small transition-all flex items-center 
                                    justify-center ${
                                      !isSeatReserved(
                                        seat,
                                        selectedShowTime.seatReservations,
                                      )
                                        ? selectedSeats.some(
                                            (s) =>
                                              s.seat.id === seat.id &&
                                              s.selectedShowTime.id ===
                                                selectedShowTime.id,
                                          )
                                          ? "bg-(--main-color)"
                                          : "bg-zinc-600"
                                        : "bg-zinc-700"
                                    }
                                }`}
                                ></span>
                              </div>
                            ))}

                          <span className="text-xs text-zinc-500 w-4 text-right flex items-center">
                            {RowtoLetter[row] || row}
                          </span>
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
                </div>
              )}
            </div>
          </div>

          {/* selected seats */}
          <div className="col-span-2 h-min-2xl h-fit relative mx-10 mt-5 bg-(--secondary-color) bg-zinc-800 px-4 py-6 rounded rounded-lg flex flex-col justify-between">
            <div className="">
              {selectedSeats
                .filter((s) => s.selectedShowTime.id === selectedShowTime.id)
                .map(({ seat, selectedShowTime }) => {
                  console.log(seat);
                  return (
                    <div className="flex flex-row bg-zinc-900 justify-between rounded border-1 border-(--main-color) px-5 py-1 mb-2">
                      <div className="flex">
                        <div className="text-zinc-700">
                          <span>{RowtoLetter[seat.row]}</span>
                          <span>{seat.col}</span>
                        </div>

                        <div className="ml-4 text-zinc-500">
                          <span>{seat.type}</span>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          toggleSeatSelection({ seat, selectedShowTime })
                        }
                        className="text-(--main-color) hover:text-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
            </div>

            {
              <button
                className={`w-full bottom-2 bg-(--main-color) text-zinc-900 font-semibold py-2 rounded-lg hover:opacity-90 transition-colors mt-4 ${selectedSeats.length === 0 ? "opacity-50 cursor-not-allowed hover:opacity-50" : ""}`}
              >
                Proceed to Payment
              </button>
            }
          </div>
        </div>
      )}
    </div>
  );
}
