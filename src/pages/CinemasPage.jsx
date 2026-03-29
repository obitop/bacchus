import { useState, useEffect } from "react";
import { getCinemas, createCinema } from "../api";
import { useAuth } from "../AuthContext";
import Spinner from "../components/Spinner";
import ErrorMsg from "../components/ErrorMsg";
import Modal from "../components/Modal";

export default function CinemasPage() {
  const { user } = useAuth();
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    numOfRows: "",
    seatsPerRow: "",
    close_time: "",
    owner: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    getCinemas()
      .then((data) => setCinemas(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setFormError("");
    if (!form.name || !form.numOfRows || !form.seatsPerRow) {
      setFormError("Name, rows, and seats per row are required.");
      return;
    }
    setSubmitting(true);
    try {
      const cinema = await createCinema({
        name: form.name,
        numOfRows: form.numOfRows,
        seatsPerRow: form.seatsPerRow,
        close_time: form.close_time || undefined,
        owner: form.owner || undefined,
      });
      setCinemas((prev) => [...prev, cinema]);
      setShowModal(false);
      setForm({
        name: "",
        numOfRows: "",
        seatsPerRow: "",
        close_time: "",
        owner: "",
      });
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function totalSeats(c) {
    const r = parseInt(c.numOfRows);
    const s = parseInt(c.seatsPerRow);
    if (!isNaN(r) && !isNaN(s)) return r * s;
    return null;
  }

  return (
    <div className="px-10 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Cinemas</h1>
          <p className="text-sm text-zinc-500 mt-1">Available venues</p>
        </div>
        {user && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-(--main-color) text-zinc-900 font-semibold px-4 py-2 rounded-lg hover:opacity-80 transition-colors text-sm"
          >
            + Add Cinema
          </button>
        )}
      </div>

      {loading && <Spinner />}
      {error && <ErrorMsg message={error} />}

      {!loading && !error && cinemas.length === 0 && (
        <p className="text-zinc-500 text-center py-16">
          No cinemas registered yet.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {cinemas.map((cinema) => (
          <div
            key={cinema.id}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
          >
            <div className="flex items-start justify-between">
              <h2 className="font-semibold text-zinc-100 text-lg">
                {cinema.name}
              </h2>
              {totalSeats(cinema) && (
                <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full">
                  {totalSeats(cinema)} seats
                </span>
              )}
            </div>
            <div className="mt-4 space-y-2 text-sm text-zinc-400">
              {cinema.numOfRows && (
                <div className="flex justify-between">
                  <span className="text-zinc-600">Rows</span>
                  <span>{cinema.numOfRows}</span>
                </div>
              )}
              {cinema.seatsPerRow && (
                <div className="flex justify-between">
                  <span className="text-zinc-600">Seats per row</span>
                  <span>{cinema.seatsPerRow}</span>
                </div>
              )}
              {cinema.close_time && (
                <div className="flex justify-between">
                  <span className="text-zinc-600">Closes</span>
                  <span>{cinema.close_time}</span>
                </div>
              )}
              {cinema.owner && (
                <div className="flex justify-between">
                  <span className="text-zinc-600">Owner</span>
                  <span>{cinema.owner}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title="Add Cinema" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            {formError && <ErrorMsg message={formError} />}
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Name *</label>
              <input
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-(--main-color)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">
                  Rows *
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-(--main-color)"
                  value={form.numOfRows}
                  onChange={(e) =>
                    setForm({ ...form, numOfRows: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">
                  Seats/Row *
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-(--main-color)"
                  value={form.seatsPerRow}
                  onChange={(e) =>
                    setForm({ ...form, seatsPerRow: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                Closing Time
              </label>
              <input
                type="time"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-(--main-color)"
                value={form.close_time}
                onChange={(e) =>
                  setForm({ ...form, close_time: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Owner</label>
              <input
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-(--main-color)"
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-(--main-color) text-zinc-900 font-semibold py-2 rounded-lg hover:opacity-80 transition-colors text-sm disabled:opacity-50"
            >
              {submitting ? "Creating…" : "Create Cinema"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
