import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useTripStore, type SavedTrip, type TripStatus } from "../store/tripStore";
import { searchHousing } from "../lib/api";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

interface TrendingEvent {
  title: string;
  location: string;
  dates: string;
  category: string;
  emoji: string;
}

const STATUS_COLORS: Record<TripStatus, string> = {
  Searching: "bg-blue-50 text-blue-600",
  Found: "bg-green-50 text-green-600",
  Confirmed: "bg-black text-white",
  Cancelled: "bg-[#F2F2F7] text-[#8E8E93]",
};

const ALL_STATUSES: TripStatus[] = ["Searching", "Found", "Confirmed", "Cancelled"];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { savedTrips, updateTrip, deleteTrip, setRequest, addStepResult, setDone, reset } = useTripStore();
  const totalMutuals = user?.socials.reduce((a, s) => a + s.mutualCount, 0) ?? 0;

  const [trending, setTrending] = useState<TrendingEvent[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SavedTrip>>({});

  async function rerunTrip(trip: SavedTrip) {
    const req = {
      userId: "demo-user",
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      budget: trip.budget,
    };
    reset();
    setRequest(req);
    navigate("/results");
    try {
      for await (const progress of searchHousing(req)) {
        if (progress.step === "done" || progress.error) setDone();
        else if (progress.results) addStepResult({ step: progress.step, results: progress.results });
      }
    } catch {
      setDone();
    }
  }

  useEffect(() => {
    fetch(`${BASE}/agent/trending`)
      .then((r) => r.json())
      .then((d) => setTrending(d.events ?? []))
      .catch(() => setTrending([]))
      .finally(() => setTrendingLoading(false));
  }, []);

  function startEdit(trip: SavedTrip) {
    setEditingId(trip.id);
    setEditForm({ destination: trip.destination, startDate: trip.startDate, endDate: trip.endDate, budget: trip.budget, status: trip.status });
  }

  function saveEdit(id: string) {
    updateTrip(id, editForm);
    setEditingId(null);
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col pb-24">
      {/* Header */}
      <div className="bg-white px-5 pt-14 pb-5 flex items-center justify-between border-b border-[#E5E5EA]">
        <div>
          <p className="text-[#8E8E93] text-xs font-medium">Welcome back</p>
          <h1 className="text-black text-2xl font-bold leading-tight">
            {user?.name?.split(" ")[0] ?? "Hey"}
          </h1>
        </div>
        <button type="button" onClick={() => navigate("/profile")}>
          <div className="w-10 h-10 rounded-full bg-black overflow-hidden flex items-center justify-center">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="You" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-semibold text-sm">
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </span>
            )}
          </div>
        </button>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* AI Search CTA */}
        <button
          type="button"
          onClick={() => navigate("/search")}
          className="w-full bg-black rounded-3xl p-5 text-left"
        >
          <p className="text-white text-xs font-medium mb-1 uppercase tracking-widest opacity-60">
            AI Agent
          </p>
          <p className="text-white text-xl font-bold leading-snug">
            Where's your next stop?
          </p>
          <p className="text-white text-sm mt-1 opacity-60">
            Searches friends · mutuals · Airbnb
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 bg-white/10 rounded-full px-4 py-2">
            <span className="text-white text-sm font-semibold">Find my stay</span>
            <span className="text-white text-xs">→</span>
          </div>
        </button>

        {/* Network strip */}
        {totalMutuals > 0 && (
          <div className="bg-white rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-black text-sm font-semibold">{totalMutuals} mutuals in network</p>
              <p className="text-[#8E8E93] text-xs mt-0.5">
                {user?.socials.map((s) => `@${s.username}`).join(" · ")}
              </p>
            </div>
            <button type="button" onClick={() => navigate("/profile")} className="text-black text-xs font-semibold">
              Manage →
            </button>
          </div>
        )}

        {/* Trending Events */}
        <div>
          <p className="text-[#8E8E93] text-xs font-semibold uppercase tracking-wider mb-2 px-1">
            Trending Events
          </p>
          {trendingLoading ? (
            <div className="bg-white rounded-2xl p-4 text-center text-[#8E8E93] text-sm">
              Loading trends...
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
              {trending.map((ev, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => navigate(`/search?event=${encodeURIComponent(ev.title)}&location=${encodeURIComponent(ev.location)}`)}
                  className="flex-shrink-0 bg-white rounded-2xl p-4 shadow-sm text-left w-44"
                >
                  <span className="text-2xl">{ev.emoji}</span>
                  <p className="text-black font-semibold text-sm mt-2 leading-tight">{ev.title}</p>
                  <p className="text-[#8E8E93] text-xs mt-1">{ev.location}</p>
                  <p className="text-[#8E8E93] text-xs">{ev.dates}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Current Searches / Saved Trips */}
        <div>
          <p className="text-[#8E8E93] text-xs font-semibold uppercase tracking-wider mb-2 px-1">
            Your Trips
          </p>
          {savedTrips.length === 0 ? (
            <div className="bg-white rounded-2xl px-4 py-6 text-center shadow-sm">
              <p className="text-[#8E8E93] text-sm">No trips yet — start a search!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {savedTrips.map((trip) => (
                <div key={trip.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {editingId === trip.id ? (
                    <div className="px-4 py-3.5 flex flex-col gap-3">
                      <input
                        className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm text-black focus:outline-none"
                        value={editForm.destination ?? ""}
                        onChange={(e) => setEditForm((f) => ({ ...f, destination: e.target.value }))}
                        placeholder="Destination"
                      />
                      <div className="flex gap-2">
                        <input
                          type="date"
                          className="flex-1 border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm text-black focus:outline-none"
                          value={editForm.startDate ?? ""}
                          onChange={(e) => setEditForm((f) => ({ ...f, startDate: e.target.value }))}
                        />
                        <input
                          type="date"
                          className="flex-1 border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm text-black focus:outline-none"
                          value={editForm.endDate ?? ""}
                          onChange={(e) => setEditForm((f) => ({ ...f, endDate: e.target.value }))}
                        />
                      </div>
                      <select
                        className="w-full border border-[#E5E5EA] rounded-xl px-3 py-2 text-sm text-black focus:outline-none"
                        value={editForm.status ?? "Searching"}
                        onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as TripStatus }))}
                      >
                        {ALL_STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(trip.id)}
                          className="flex-1 bg-black text-white rounded-xl py-2 text-sm font-semibold"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="flex-1 bg-[#F2F2F7] text-black rounded-xl py-2 text-sm font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-3.5 flex items-center justify-between">
                      <div>
                        <button
                          type="button"
                          onClick={() => rerunTrip(trip)}
                          className="text-black font-semibold text-sm text-left hover:underline"
                        >
                          {trip.destination} →
                        </button>
                        <p className="text-[#8E8E93] text-xs mt-0.5">
                          {trip.startDate} – {trip.endDate}
                          {trip.budget ? ` · $${trip.budget}/night` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${STATUS_COLORS[trip.status]}`}>
                          {trip.status}
                        </span>
                        <button type="button" onClick={() => startEdit(trip)} className="text-[#8E8E93] text-xs px-1">✏️</button>
                        <button type="button" onClick={() => deleteTrip(trip.id)} className="text-[#8E8E93] text-xs px-1">🗑️</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
