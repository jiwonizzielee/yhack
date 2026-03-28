import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

function isEduEmail(email: string) {
  return email.trim().toLowerCase().endsWith(".edu");
}

export default function Login() {
  const navigate = useNavigate();
  const { login, signup } = useAuthStore();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (mode === "signup" && !isEduEmail(email)) {
      setError("Crashly is for college students only. Please use your .edu email.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
        navigate("/");
      } else {
        await signup(name, email, password);
        navigate("/onboarding");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-between px-6 py-12">
      {/* Logo */}
      <div className="flex flex-col items-center mt-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-3 shadow-lg shadow-violet-500/30">
          <span className="text-white text-3xl font-black">C</span>
        </div>
        <h1 className="text-white text-3xl font-black tracking-tight">Crashly</h1>
        <p className="text-zinc-400 text-sm mt-1">Find a place. Through your people.</p>
        {mode === "signup" && (
          <span className="mt-2 text-xs bg-violet-500/20 text-violet-400 px-3 py-1 rounded-full font-medium">
            🎓 College students only · .edu required
          </span>
        )}
      </div>

      {/* Card */}
      <div className="w-full max-w-sm flex flex-col gap-4">
        {/* Toggle */}
        <div className="flex bg-zinc-900 rounded-2xl p-1">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === m ? "bg-violet-600 text-white shadow" : "text-zinc-400 hover:text-white"
              }`}
            >
              {m === "login" ? "Log in" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <input
              required
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors"
            />
          )}

          <div className="relative">
            <input
              required
              type="email"
              placeholder={mode === "signup" ? "your@university.edu" : "Email"}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              className={`w-full bg-zinc-900 border rounded-xl px-4 py-3.5 text-white placeholder-zinc-500 text-sm focus:outline-none transition-colors ${
                mode === "signup" && email && !isEduEmail(email)
                  ? "border-red-500"
                  : mode === "signup" && email && isEduEmail(email)
                  ? "border-green-500"
                  : "border-zinc-800 focus:border-violet-500"
              }`}
            />
            {mode === "signup" && email && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                {isEduEmail(email) ? "✅" : "❌"}
              </span>
            )}
          </div>

          {mode === "signup" && email && !isEduEmail(email) && (
            <p className="text-red-400 text-xs -mt-1 px-1">Must be a .edu email address</p>
          )}

          <input
            required
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors"
          />

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || (mode === "signup" && !!email && !isEduEmail(email))}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold py-4 rounded-xl mt-1 disabled:opacity-40 transition-opacity text-sm tracking-wide"
          >
            {loading ? "Loading..." : mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-zinc-600 text-xs">or continue with</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* Social auth */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              await login("demo@college.edu", "demo");
              navigate("/onboarding");
            }}
            className="flex items-center justify-center gap-3 w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3.5 text-white text-sm font-medium hover:border-zinc-600 transition-colors"
          >
            <span className="text-lg">📸</span> Continue with Instagram
          </button>
          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              await login("demo@college.edu", "demo");
              navigate("/onboarding");
            }}
            className="flex items-center justify-center gap-3 w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3.5 text-white text-sm font-medium hover:border-zinc-600 transition-colors"
          >
            <span className="text-lg">👻</span> Continue with Snapchat
          </button>
        </div>
      </div>

      <p className="text-zinc-600 text-xs text-center pb-2">
        By continuing, you agree to our Terms & Privacy Policy
      </p>
    </div>
  );
}