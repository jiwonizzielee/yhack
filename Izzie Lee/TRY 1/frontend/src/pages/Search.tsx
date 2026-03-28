import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTripStore } from "../store/tripStore";
import { searchHousing } from "../lib/api";
import type { TripRequest } from "../types";

export default function Search() {
  const navigate = useNavigate();
  const { setRequest, addStepResult, setDone } = useTripStore();

  const [form, setForm] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const req: TripRequest = {
      userId: "demo-user",
      destination: form.destination,
      startDate: form.startDate,
      endDate: form.endDate,
      budget: form.budget ? Number(form.budget) : undefined,
      notes: form.notes || undefined,
    };

    setRequest(req);
    navigate("/results");

    for await (const progress of searchHousing(req)) {
      if (progress.step === "done" || progress.error) {
        setDone();
      } else if (progress.results) {
        addStepResult({ step: progress.step, results: progress.results });
      }
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-black pb-28">
      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <h1 className="text-white text-2xl font-black">Where's your next stop?</h1>
        <p className="text-zinc-400 text-sm mt-1">Agent searches friends · mutuals · Airbnb</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            Destination
          </label>
          <input
            required
            type="text"
            placeholder="e.g. Boston, NYC, LA..."
            className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-violet-500 transition-colors"
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              From
            </label>
            <input
              required
              type="date"
              className="bg-zinc-900 border border-zinc-800 rounded-2xl px-3 py-3.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              To
            </label>
            <input
              required
              type="date"
              className="bg-zinc-900 border border-zinc-800 rounded-2xl px-3 py-3.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            Max budget / night
          </label>
          <input
            type="number"
            placeholder="e.g. 80  (leave blank = any)"
            className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-violet-500 transition-colors"
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            Any specs
          </label>
          <textarea
            placeholder="e.g. pet-friendly, near campus, private room..."
            rows={3}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3.5 text-white placeholder-zinc-600 text-sm resize-none focus:outline-none focus:border-violet-500 transition-colors"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        {/* Button is part of form flow, not pushed with mt-auto */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold py-4 rounded-2xl mt-2 disabled:opacity-50 transition-opacity text-sm tracking-wide"
        >
          {loading ? "Searching..." : "Find My Stay ✨"}
        </button>
      </form>
    </div>
  );
}