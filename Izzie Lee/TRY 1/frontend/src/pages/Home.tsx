import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const UPCOMING_TRIPS = [
  { destination: "Boston, MA", dates: "Apr 5 – Apr 8", status: "Searching" },
];

const NOTIFICATIONS = [
  { text: "Alex K. accepted your stay request for NYC", time: "2h ago" },
  { text: "3 new co-travelers found for your Boston trip", time: "5h ago" },
  { text: "Maya from Instagram can host in Chicago", time: "1d ago" },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const totalMutuals = user?.socials.reduce((a, s) => a + s.mutualCount, 0) ?? 0;

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

        {/* Upcoming Trips */}
        <div>
          <p className="text-[#8E8E93] text-xs font-semibold uppercase tracking-wider mb-2 px-1">
            Upcoming Trips
          </p>
          {UPCOMING_TRIPS.map((trip) => (
            <div key={trip.destination} className="bg-white rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-black font-semibold text-sm">{trip.destination}</p>
                <p className="text-[#8E8E93] text-xs mt-0.5">{trip.dates}</p>
              </div>
              <span className="text-xs bg-[#F2F2F7] text-black px-3 py-1.5 rounded-full font-medium">
                {trip.status}
              </span>
            </div>
          ))}
        </div>

        {/* Activity */}
        <div>
          <p className="text-[#8E8E93] text-xs font-semibold uppercase tracking-wider mb-2 px-1">
            Activity
          </p>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-[#F2F2F7]">
            {NOTIFICATIONS.map((n, i) => (
              <div key={i} className="px-4 py-3.5">
                <p className="text-black text-sm">{n.text}</p>
                <p className="text-[#8E8E93] text-xs mt-0.5">{n.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
