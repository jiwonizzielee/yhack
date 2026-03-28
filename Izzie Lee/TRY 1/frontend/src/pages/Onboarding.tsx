import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const STEPS = ["photo", "info", "socials"] as const;
type Step = (typeof STEPS)[number];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, updateProfile, setAvatar, connectSocial } = useAuthStore();
  const [step, setStep] = useState<Step>("photo");
  const [location, setLocation] = useState(user?.location ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [university, setUniversity] = useState(user?.university ?? "");
  const [year, setYear] = useState(user?.year ?? "");
  const [gender, setGender] = useState(user?.gender ?? "");
  const [igUsername, setIgUsername] = useState("");
  const [snapUsername, setSnapUsername] = useState("");
  const [connecting, setConnecting] = useState<"instagram" | "snapchat" | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatar(url);
  }

  async function handleConnectIG() {
    if (!igUsername.trim()) return;
    setConnecting("instagram");
    await new Promise((r) => setTimeout(r, 1200));
    connectSocial({
      platform: "instagram",
      username: igUsername.trim(),
      connectedAt: new Date().toISOString(),
      mutualCount: Math.floor(Math.random() * 24) + 3,
    });
    setConnecting(null);
  }

  async function handleConnectSnap() {
    if (!snapUsername.trim()) return;
    setConnecting("snapchat");
    await new Promise((r) => setTimeout(r, 1200));
    connectSocial({
      platform: "snapchat",
      username: snapUsername.trim(),
      connectedAt: new Date().toISOString(),
      mutualCount: Math.floor(Math.random() * 15) + 2,
    });
    setConnecting(null);
  }

  function handleNext() {
    if (step === "photo") setStep("info");
    else if (step === "info") {
      updateProfile({ location, bio, university, year, gender });
      setStep("socials");
    } else {
      navigate("/");
    }
  }

  const stepIndex = STEPS.indexOf(step);

  return (
    <div className="min-h-screen bg-black flex flex-col px-6 pt-12 pb-8">
      {/* Progress bar */}
      <div className="flex gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-full transition-colors ${
              i <= stepIndex ? "bg-violet-500" : "bg-zinc-800"
            }`}
          />
        ))}
      </div>

      {step === "photo" && (
        <div className="flex flex-col flex-1 items-center">
          <h2 className="text-white text-2xl font-black mb-1">Add your photo</h2>
          <p className="text-zinc-400 text-sm mb-10 text-center">
            Hosts trust people they can see. Add a real face.
          </p>

          <button
            onClick={() => fileRef.current?.click()}
            className="relative w-36 h-36 rounded-full bg-zinc-900 border-2 border-dashed border-zinc-700 hover:border-violet-500 transition-colors flex items-center justify-center overflow-hidden"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Your face"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-zinc-500">
                <span className="text-4xl">📷</span>
                <span className="text-xs">Tap to upload</span>
              </div>
            )}
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={handlePhotoChange}
          />

          {user?.avatarUrl && (
            <p className="text-violet-400 text-sm mt-4">Looks great!</p>
          )}
        </div>
      )}

      {step === "info" && (
        <div className="flex flex-col flex-1">
          <h2 className="text-white text-2xl font-black mb-1">About you</h2>
          <p className="text-zinc-400 text-sm mb-6">Helps hosts know who you are</p>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-zinc-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">
                University
              </label>
              <input
                type="text"
                placeholder="e.g. UCLA, NYU, Michigan..."
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">
                  Year
                </label>
                <select
                  aria-label="Year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors appearance-none"
                >
                  <option value="" disabled>Select...</option>
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Grad">Grad Student</option>
                </select>
              </div>
              <div>
                <label className="text-zinc-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">
                  Gender
                </label>
                <select
                  aria-label="Gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors appearance-none"
                >
                  <option value="" disabled>Select...</option>
                  <option value="Man">Man</option>
                  <option value="Woman">Woman</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-zinc-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">
                Your city
              </label>
              <input
                type="text"
                placeholder="e.g. New York, NY"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">
                Short bio
              </label>
              <textarea
                placeholder="e.g. CS student @ UCLA, into music + travel"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-violet-500 transition-colors resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {step === "socials" && (
        <div className="flex flex-col flex-1">
          <h2 className="text-white text-2xl font-black mb-1">Connect your socials</h2>
          <p className="text-zinc-400 text-sm mb-8">
            We use your network to find trusted stays through mutual friends
          </p>

          {/* Instagram */}
          <div className="bg-zinc-900 rounded-2xl p-4 mb-3 border border-zinc-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 flex items-center justify-center">
                <span className="text-lg">📸</span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Instagram</p>
                <p className="text-zinc-500 text-xs">Find mutuals at your destination</p>
              </div>
              {user?.socials.find((s) => s.platform === "instagram") && (
                <span className="ml-auto text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-medium">
                  Connected
                </span>
              )}
            </div>
            {user?.socials.find((s) => s.platform === "instagram") ? (
              <p className="text-zinc-400 text-xs">
                @{user.socials.find((s) => s.platform === "instagram")!.username} ·{" "}
                {user.socials.find((s) => s.platform === "instagram")!.mutualCount} mutuals found
              </p>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="@username"
                  value={igUsername}
                  onChange={(e) => setIgUsername(e.target.value)}
                  className="flex-1 bg-zinc-800 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <button
                  onClick={handleConnectIG}
                  disabled={connecting === "instagram"}
                  className="bg-gradient-to-r from-pink-500 to-orange-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50 transition-opacity"
                >
                  {connecting === "instagram" ? "..." : "Link"}
                </button>
              </div>
            )}
          </div>

          {/* Snapchat */}
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center">
                <span className="text-lg">👻</span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Snapchat</p>
                <p className="text-zinc-500 text-xs">See where your Snap friends are</p>
              </div>
              {user?.socials.find((s) => s.platform === "snapchat") && (
                <span className="ml-auto text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-medium">
                  Connected
                </span>
              )}
            </div>
            {user?.socials.find((s) => s.platform === "snapchat") ? (
              <p className="text-zinc-400 text-xs">
                @{user.socials.find((s) => s.platform === "snapchat")!.username} ·{" "}
                {user.socials.find((s) => s.platform === "snapchat")!.mutualCount} mutuals found
              </p>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="@username"
                  value={snapUsername}
                  onChange={(e) => setSnapUsername(e.target.value)}
                  className="flex-1 bg-zinc-800 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <button
                  onClick={handleConnectSnap}
                  disabled={connecting === "snapchat"}
                  className="bg-yellow-400 text-black text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50 transition-opacity"
                >
                  {connecting === "snapchat" ? "..." : "Link"}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate("/")}
            className="text-zinc-500 text-sm text-center mt-4"
          >
            Skip for now
          </button>
        </div>
      )}

      <button
        onClick={handleNext}
        className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold py-4 rounded-2xl mt-6 text-sm tracking-wide"
      >
        {step === "socials" ? "Let's go" : "Continue"}
      </button>
    </div>
  );
}