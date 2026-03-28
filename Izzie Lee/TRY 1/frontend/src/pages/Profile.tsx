import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, setAvatar, updateProfile, connectSocial, disconnectSocial } = useAuthStore();
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
    connectSocial({ platform: "instagram", username: igUsername.trim(), connectedAt: new Date().toISOString(), mutualCount: Math.floor(Math.random() * 24) + 3 });
    setIgUsername("");
    setConnecting(null);
  }

  async function connectSnap() {
    if (!snapUsername.trim()) return;
    setConnecting("snapchat");
    await new Promise((r) => setTimeout(r, 1200));
    connectSocial({ platform: "snapchat", username: snapUsername.trim(), connectedAt: new Date().toISOString(), mutualCount: Math.floor(Math.random() * 15) + 2 });
    setSnapUsername("");
    setConnecting(null);
  }

  const igAccount = user?.socials.find((s) => s.platform === "instagram");
  const snapAccount = user?.socials.find((s) => s.platform === "snapchat");
  const totalMutuals = user?.socials.reduce((a, s) => a + s.mutualCount, 0) ?? 0;

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col pb-24">
      {/* Header */}
      <div className="bg-white px-5 pt-14 pb-5 border-b border-[#E5E5EA] flex items-center justify-between">
        <h1 className="text-black text-2xl font-bold">Profile</h1>
        <button
          type="button"
          onClick={() => { logout(); navigate("/login"); }}
          className="text-[#8E8E93] text-sm"
        >
          Log out
        </button>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* Avatar + name card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <button type="button" onClick={() => fileRef.current?.click()} className="w-16 h-16 rounded-full bg-[#F2F2F7] overflow-hidden flex-shrink-0 flex items-center justify-center">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="You" className="w-full h-full object-cover" />
            ) : (
              <span className="text-black font-semibold text-xl">{user?.name?.[0]?.toUpperCase() ?? "?"}</span>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handlePhotoChange} />
          <div className="flex-1 min-w-0">
            <p className="text-black text-lg font-bold">{user?.name}</p>
            <p className="text-[#8E8E93] text-sm truncate">{user?.email}</p>
            {user?.location && <p className="text-[#8E8E93] text-xs mt-0.5">{user.location}</p>}
          </div>
          <button
            type="button"
            onClick={() => setEditing(!editing)}
            className="text-black text-sm font-semibold bg-[#F2F2F7] px-3 py-1.5 rounded-lg"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Mutuals", value: totalMutuals },
            { label: "Socials", value: user?.socials.length ?? 0 },
            { label: "Trips", value: 1 },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-3 text-center shadow-sm">
              <p className="text-black text-xl font-bold">{stat.value}</p>
              <p className="text-[#8E8E93] text-xs">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Edit form */}
        {editing && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-[#F2F2F7]">
            <div className="px-4 py-3.5">
              <label className="text-[#8E8E93] text-xs font-medium block mb-1">Your city</label>
              <input
                type="text"
                placeholder="New York, NY"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-black text-sm placeholder-[#C7C7CC] focus:outline-none"
              />
            </div>
            <div className="px-4 py-3.5">
              <label className="text-[#8E8E93] text-xs font-medium block mb-1">Short bio</label>
              <textarea
                placeholder="CS student @ UCLA, into music + travel"
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-transparent text-black text-sm placeholder-[#C7C7CC] focus:outline-none resize-none"
              />
            </div>
            <div className="px-4 py-3.5">
              <button type="button" onClick={saveProfile} className="w-full bg-black text-white font-semibold py-3 rounded-xl text-sm">
                Save
              </button>
            </div>
          </div>
        )}

        {!editing && user?.bio && (
          <p className="text-[#8E8E93] text-sm px-1">{user.bio}</p>
        )}

        {/* Connected accounts */}
        <div>
          <p className="text-[#8E8E93] text-xs font-semibold uppercase tracking-wider mb-2 px-1">Connected Accounts</p>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-[#F2F2F7]">
            {/* Instagram */}
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">IG</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-black font-semibold text-sm">Instagram</p>
                  {igAccount ? (
                    <p className="text-[#8E8E93] text-xs">@{igAccount.username} · {igAccount.mutualCount} mutuals</p>
                  ) : (
                    <p className="text-[#8E8E93] text-xs">Not connected</p>
                  )}
                </div>
                {igAccount && (
                  <button type="button" onClick={() => disconnectSocial("instagram")} className="text-red-500 text-xs font-medium">
                    Remove
                  </button>
                )}
              </div>
              {!igAccount && (
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    placeholder="@username"
                    value={igUsername}
                    onChange={(e) => setIgUsername(e.target.value)}
                    className="flex-1 bg-[#F2F2F7] rounded-xl px-3 py-2 text-black text-sm placeholder-[#C7C7CC] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={connectIG}
                    disabled={connecting === "instagram"}
                    className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-30"
                  >
                    {connecting === "instagram" ? "..." : "Link"}
                  </button>
                </div>
              )}
            </div>

            {/* Snapchat */}
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">SC</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-black font-semibold text-sm">Snapchat</p>
                  {snapAccount ? (
                    <p className="text-[#8E8E93] text-xs">@{snapAccount.username} · {snapAccount.mutualCount} mutuals</p>
                  ) : (
                    <p className="text-[#8E8E93] text-xs">Not connected</p>
                  )}
                </div>
                {snapAccount && (
                  <button type="button" onClick={() => disconnectSocial("snapchat")} className="text-red-500 text-xs font-medium">
                    Remove
                  </button>
                )}
              </div>
              {!snapAccount && (
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    placeholder="@username"
                    value={snapUsername}
                    onChange={(e) => setSnapUsername(e.target.value)}
                    className="flex-1 bg-[#F2F2F7] rounded-xl px-3 py-2 text-black text-sm placeholder-[#C7C7CC] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={connectSnap}
                    disabled={connecting === "snapchat"}
                    className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-30"
                  >
                    {connecting === "snapchat" ? "..." : "Link"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
