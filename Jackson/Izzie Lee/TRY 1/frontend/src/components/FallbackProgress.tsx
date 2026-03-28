import type { FallbackStep, Listing } from "../types";

const STEPS: { key: FallbackStep; label: string }[] = [
  { key: "direct-friends", label: "Direct friends" },
  { key: "extended-network", label: "Friends of friends" },
  { key: "co-travelers", label: "Co-travelers" },
  { key: "open-web", label: "Airbnb & Hotels" },
];

interface StepResult { step: FallbackStep; results: Listing[] }

interface Props {
  completedSteps: FallbackStep[];
  activeStep: FallbackStep | null;
  stepResults: StepResult[];
}

export function FallbackProgress({ completedSteps, activeStep, stepResults }: Props) {
  return (
    <div className="flex flex-col divide-y divide-[#F2F2F7]">
      {STEPS.map((s, i) => {
        const done = completedSteps.includes(s.key);
        const active = activeStep === s.key;
        const group = stepResults.find((r) => r.step === s.key);
        const count = group?.results.length ?? 0;
        return (
          <div key={s.key} className="flex items-center gap-3 px-4 py-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-colors ${
              done && count > 0 ? "bg-black text-white" : done ? "bg-[#E5E5EA] text-[#8E8E93]" : active ? "bg-[#F2F2F7] text-black" : "bg-[#F2F2F7] text-[#C7C7CC]"
            }`}>
              {done ? "✓" : i + 1}
            </div>
            <span className={`text-sm flex-1 ${done || active ? "text-black font-medium" : "text-[#8E8E93]"}`}>
              {s.label}
            </span>
            {active && (
              <span className="text-xs text-[#8E8E93] animate-pulse">Searching...</span>
            )}
            {done && count > 0 && (
              <span className="text-xs text-green-600 font-medium">{count} found</span>
            )}
            {done && count === 0 && (
              <span className="text-xs text-[#8E8E93]">None found</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
