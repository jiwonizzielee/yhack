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
      setError("Crashly is for college students only. Use your .edu email.");
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
    <div className="min-h-screen bg-white flex flex-col px-6 pt-16 pb-10">
      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 rounded-[22px] bg-black flex items-center justify-center mb-4">
          <span className="text-white text-2xl font-bold">C</span>
        </div>
        <h1 className="text-black text-3xl font-bold tracking-tight">Crashly</h1>
        <p className="text-[#8E8E93] text-sm mt-1">Find a place. Through your people.</p>
      </div>

      {/* Toggle */}
      <div className="flex bg-[#F2F2F7] rounded-xl p-1 mb-6">
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError(""); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === m ? "bg-white text-black shadow-sm" : "text-[#8E8E93]"
            }`}
          >
            {m === "login" ? "Log In" : "Sign Up"}
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
            className="w-full bg-[#F2F2F7] rounded-xl px-4 py-3.5 text-black placeholder-[#C7C7CC] text-sm focus:outline-none"
          />
        )}
        <input
          required
          type="email"
          placeholder={mode === "signup" ? "your@university.edu" : "Email"}
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          className="w-full bg-[#F2F2F7] rounded-xl px-4 py-3.5 text-black placeholder-[#C7C7CC] text-sm focus:outline-none"
        />
        {mode === "signup" && email && !isEduEmail(email) && (
          <p className="text-red-500 text-xs px-1 -mt-1">Must be a .edu email address</p>
        )}
        <input
          required
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-[#F2F2F7] rounded-xl px-4 py-3.5 text-black placeholder-[#C7C7CC] text-sm focus:outline-none"
        />
        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading || (mode === "signup" && !!email && !isEduEmail(email))}
          className="w-full bg-black text-white font-semibold py-4 rounded-2xl mt-2 disabled:opacity-30 text-sm"
        >
          {loading ? "Loading..." : mode === "login" ? "Log In" : "Create Account"}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-[#E5E5EA]" />
        <span className="text-[#C7C7CC] text-xs">or</span>
        <div className="flex-1 h-px bg-[#E5E5EA]" />
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={async () => {
            setLoading(true);
            await login("demo@college.edu", "demo");
            navigate("/onboarding");
          }}
          className="flex items-center justify-center gap-2 w-full bg-[#F2F2F7] rounded-2xl py-3.5 text-black text-sm font-semibold"
        >
          Continue with Instagram
        </button>
        <button
          type="button"
          onClick={async () => {
            setLoading(true);
            await login("demo@college.edu", "demo");
            navigate("/onboarding");
          }}
          className="flex items-center justify-center gap-2 w-full bg-[#F2F2F7] rounded-2xl py-3.5 text-black text-sm font-semibold"
        >
          Continue with Snapchat
        </button>
      </div>

      <p className="text-[#C7C7CC] text-xs text-center mt-auto pt-8">
        By continuing, you agree to our Terms & Privacy Policy
      </p>
    </div>
  );
}
