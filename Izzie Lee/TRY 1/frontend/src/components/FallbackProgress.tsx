import type { FallbackStep } from "../types";

const STEPS: { key: FallbackStep; label: string }[] = [
  { key: "direct-friends", label: "Direct friends" },
  { key: "extended-network", label: "Friends of friends" },
  { key: "co-travelers", label: "Co-travelers" },
  { key: "open-web", label: "Airbnb & Hotels" },
];

interface Props {
  completedSteps: FallbackStep[];
  activeStep: FallbackStep | null;
}

export function FallbackProgress({ completedSteps, activeStep }: Props) {
  return (
    <div className="flex flex-col divide-y divide-[#F2F2F7]">
      {STEPS.map((s, i) => {
        const done = completedSteps.includes(s.key);
        const active = activeStep === s.key;
        return (
          <div key={s.key} className="flex items-center gap-3 px-4 py-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-colors ${
              done ? "bg-black text-white" : active ? "bg-[#F2F2F7] text-black" : "bg-[#F2F2F7] text-[#C7C7CC]"
            }`}>
              {done ? "✓" : i + 1}
            </div>
            <span className={`text-sm flex-1 ${done || active ? "text-black font-medium" : "text-[#8E8E93]"}`}>
              {s.label}
            </span>
            {active && (
              <span className="text-xs text-[#8E8E93] animate-pulse">Searching...</span>
            )}
            {done && (
              <span className="text-xs text-black font-medium">Done</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
