import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const UPCOMING_TRIPS = [
  { destination: "Boston, MA", dates: "Apr 5 – Apr 8", status: "Searching" },
];

const NOTIFICATIONS = [
  { text: "Alex K. accepted your stay request for NYC", time: "2h ago", emoji: "✅" },
  { text: "3 new co-travelers found for your Boston trip", time: "5h ago", emoji: "✈️" },
  { text: "Maya from Instagram can host in Chicago", time: "1d ago", emoji: "📸" },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const totalMutuals = user?.socials.reduce((a, s) => a + s.mutualCount, 0) ?? 0;

  return (
    <div className="min-h-screen bg-black flex flex-col pb-24">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <span className="text-white text-xs font-black">C</span>
            </div>
            <span className="text-white text-lg font-black tracking-tight">Crashly</span>
          </div>
          <p className="text-zinc-500 text-xs mt-0.5">
            {user?.name ? `Hey, ${user.name.split(" ")[0]} 👋` : "Find your next crash spot"}
          </p>
        </div>

        {/* Avatar */}
        <button type="button" onClick={() => navigate("/profile")} className="relative">
          <div className="w-11 h-11 rounded-full overflow-hidden bg-zinc-800 border-2 border-violet-500">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="You" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold text-lg">
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </div>
          {/* Online dot */}
          <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-black" />
        </button>
      </div>

      {/* Socials summary strip */}
      {user?.socials && user.socials.length > 0 && (
        <div className="mx-4 mb-4 bg-zinc-900 rounded-2xl p-3 flex items-center gap-3 border border-zinc-800">
          <div className="flex -space-x-1">
            {user.socials.map((s) => (
              <div
                key={s.platform}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 border-zinc-900 ${
                  s.platform === "instagram"
                    ? "bg-gradient-to-br from-pink-500 to-orange-400"
                    : "bg-yellow-400"
                }`}
              >
                {s.platform === "instagram" ? "📸" : "👻"}
              </div>
            ))}
          </div>
          <div className="flex-1">
            <p className="text-white text-xs font-semibold">
              {totalMutuals} mutual{totalMutuals !== 1 ? "s" : ""} in your network
            </p>
            <p className="text-zinc-500 text-xs">
              {user.socials.map((s) => `@${s.username}`).join(" · ")}
            </p>
          </div>
          <button
            type="button"
          onClick={() => navigate("/profile")}
            className="text-violet-400 text-xs font-medium"
          >
            Manage
          </button>
        </div>
      )}

      {/* AI Search CTA */}
      <button
        type="button"
        onClick={() => navigate("/search")}
        className="mx-4 mb-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-3xl p-5 text-left shadow-lg shadow-violet-900/40"
      >
        <p className="text-violet-200 text-xs font-medium mb-1 uppercase tracking-wider">
          AI Agent
        </p>
        <p className="text-white text-xl font-black leading-tight">
          Where's your next stop?
        </p>
        <p className="text-violet-300 text-sm mt-1">
          Searches your friends · mutuals · Airbnb
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
          <span className="text-white text-sm font-semibold">Find my stay</span>
          <span className="text-white">→</span>
        </div>
      </button>

      {/* Upcoming Trips */}
      <div className="px-4 mb-5">
        <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
          Upcoming Trips
        </h2>
        {UPCOMING_TRIPS.map((trip) => (
          <div
            key={trip.destination}
            className="bg-zinc-900 rounded-2xl p-4 flex items-center justify-between border border-zinc-800"
          >
            <div>
              <p className="text-white font-bold">{trip.destination}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{trip.dates}</p>
            </div>
            <span className="text-xs bg-violet-500/20 text-violet-400 px-3 py-1.5 rounded-full font-medium animate-pulse">
              {trip.status}...
            </span>
          </div>
        ))}
      </div>

      {/* Notifications */}
      <div className="px-4">
        <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
          Activity
        </h2>
        <div className="flex flex-col gap-2">
          {NOTIFICATIONS.map((n, i) => (
            <div
              key={i}
              className="bg-zinc-900 rounded-2xl p-4 flex items-start gap-3 border border-zinc-800"
            >
              <span className="text-lg mt-0.5">{n.emoji}</span>
              <div className="flex-1">
                <p className="text-zinc-200 text-sm">{n.text}</p>
                <p className="text-zinc-600 text-xs mt-0.5">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}