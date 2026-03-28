import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, setAvatar, updateProfile, connectSocial, disconnectSocial } =
    useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [location, setLocation] = useState(user?.location ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [igUsername, setIgUsername] = useState("");
  const [snapUsername, setSnapUsername] = useState("");
  const [connecting, setConnecting] = useState<"instagram" | "snapchat" | null>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar(URL.createObjectURL(file));
  }

  function saveProfile() {
    updateProfile({ location, bio });
    setEditing(false);
  }

  async function connectIG() {
    if (!igUsername.trim()) return;
    setConnecting("instagram");
    await new Promise((r) => setTimeout(r, 1200));
    connectSocial({
      platform: "instagram",
      username: igUsername.trim(),
      connectedAt: new Date().toISOString(),
      mutualCount: Math.floor(Math.random() * 24) + 3,
    });
    setIgUsername("");
    setConnecting(null);
  }

  async function connectSnap() {
    if (!snapUsername.trim()) return;
    setConnecting("snapchat");
    await new Promise((r) => setTimeout(r, 1200));
    connectSocial({
      platform: "snapchat",
      username: snapUsername.trim(),
      connectedAt: new Date().toISOString(),
      mutualCount: Math.floor(Math.random() * 15) + 2,
    });
    setSnapUsername("");
    setConnecting(null);
  }

  const igAccount = user?.socials.find((s) => s.platform === "instagram");
  const snapAccount = user?.socials.find((s) => s.platform === "snapchat");
  const totalMutuals = user?.socials.reduce((a, s) => a + s.mutualCount, 0) ?? 0;

  return (
    <div className="min-h-screen bg-black flex flex-col pb-24">
      {/* Header gradient */}
      <div className="bg-gradient-to-b from-violet-950 to-black px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white text-xl font-black">Profile</h1>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="text-zinc-400 text-sm"
          >
            Log out
          </button>
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => fileRef.current?.click()}
            className="relative w-20 h-20 rounded-full overflow-hidden bg-zinc-800 border-2 border-violet-500 flex-shrink-0"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="You" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500 text-2xl">
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            {/* Camera overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-sm">📷</span>
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handlePhotoChange} />

          <div className="flex-1">
            <p className="text-white text-xl font-bold">{user?.name}</p>
            <p className="text-zinc-400 text-sm">{user?.email}</p>
            {user?.location && (
              <p className="text-zinc-500 text-xs mt-0.5">📍 {user.location}</p>
            )}
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="text-violet-400 text-sm font-medium border border-violet-800 rounded-xl px-3 py-1.5"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        {/* Stats row */}
        <div className="flex gap-4 mt-5">
          {[
            { label: "Mutuals", value: totalMutuals },
            { label: "Socials", value: user?.socials.length ?? 0 },
            { label: "Trips", value: 1 },
          ].map((stat) => (
            <div key={stat.label} className="flex-1 bg-white/5 rounded-2xl p-3 text-center">
              <p className="text-white text-xl font-black">{stat.value}</p>
              <p className="text-zinc-500 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4 flex flex-col gap-4">
        {/* Edit form */}
        {editing && (
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 flex flex-col gap-3">
            <h3 className="text-white font-semibold text-sm">Edit Profile</h3>
            <input
              type="text"
              placeholder="Your city"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-zinc-800 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <textarea
              placeholder="Short bio..."
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="bg-zinc-800 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 resize-none focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <button
              onClick={saveProfile}
              className="bg-violet-600 text-white font-semibold py-2.5 rounded-xl text-sm"
            >
              Save
            </button>
          </div>
        )}

        {/* Bio display */}
        {!editing && user?.bio && (
          <p className="text-zinc-400 text-sm px-1">{user.bio}</p>
        )}

        {/* Connected socials */}
        <div>
          <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3 px-1">
            Connected Accounts
          </h3>

          {/* Instagram */}
          <div className="bg-zinc-900 rounded-2xl p-4 mb-2 border border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 flex items-center justify-center flex-shrink-0">
                <span>📸</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">Instagram</p>
                {igAccount ? (
                  <p className="text-zinc-400 text-xs">
                    @{igAccount.username} · {igAccount.mutualCount} mutuals
                  </p>
                ) : (
                  <p className="text-zinc-600 text-xs">Not connected</p>
                )}
              </div>
              {igAccount ? (
                <button
                  onClick={() => disconnectSocial("instagram")}
                  className="text-zinc-500 text-xs border border-zinc-700 rounded-lg px-2 py-1"
                >
                  Remove
                </button>
              ) : null}
            </div>
            {!igAccount && (
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  placeholder="@username"
                  value={igUsername}
                  onChange={(e) => setIgUsername(e.target.value)}
                  className="flex-1 bg-zinc-800 rounded-xl px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
                <button
                  onClick={connectIG}
                  disabled={connecting === "instagram"}
                  className="bg-gradient-to-r from-pink-500 to-orange-400 text-white text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-50"
                >
                  {connecting === "instagram" ? "..." : "Link"}
                </button>
              </div>
            )}
          </div>

          {/* Snapchat */}
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center flex-shrink-0">
                <span>👻</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">Snapchat</p>
                {snapAccount ? (
                  <p className="text-zinc-400 text-xs">
                    @{snapAccount.username} · {snapAccount.mutualCount} mutuals
                  </p>
                ) : (
                  <p className="text-zinc-600 text-xs">Not connected</p>
                )}
              </div>
              {snapAccount ? (
                <button
                  onClick={() => disconnectSocial("snapchat")}
                  className="text-zinc-500 text-xs border border-zinc-700 rounded-lg px-2 py-1"
                >
                  Remove
                </button>
              ) : null}
            </div>
            {!snapAccount && (
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  placeholder="@username"
                  value={snapUsername}
                  onChange={(e) => setSnapUsername(e.target.value)}
                  className="flex-1 bg-zinc-800 rounded-xl px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                />
                <button
                  onClick={connectSnap}
                  disabled={connecting === "snapchat"}
                  className="bg-yellow-400 text-black text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-50"
                >
                  {connecting === "snapchat" ? "..." : "Link"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}