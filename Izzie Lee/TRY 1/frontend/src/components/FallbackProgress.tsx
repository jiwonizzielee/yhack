import type { FallbackStep } from "../types";

const STEPS: { key: FallbackStep; label: string; emoji: string }[] = [
  { key: "direct-friends", label: "Direct friends", emoji: "👥" },
  { key: "extended-network", label: "Friends of friends", emoji: "🔗" },
  { key: "co-travelers", label: "Co-travelers", emoji: "✈️" },
  { key: "open-web", label: "Airbnb / Hotels", emoji: "🏠" },
];

interface Props {
  completedSteps: FallbackStep[];
  activeStep: FallbackStep | null;
}

export function FallbackProgress({ completedSteps, activeStep }: Props) {
  return (
    <div className="flex flex-col gap-2 p-4">
      {STEPS.map((s, i) => {
        const done = completedSteps.includes(s.key);
        const active = activeStep === s.key;
        return (
          <div key={s.key} className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                ${done ? "bg-green-500 text-white" : active ? "bg-blue-500 text-white animate-pulse" : "bg-gray-200 text-gray-500"}`}
            >
              {done ? "✓" : i + 1}
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium">
                {s.emoji} {s.label}
              </span>
            </div>
            {active && (
              <span className="text-xs text-blue-500 animate-pulse">Searching...</span>
            )}
            {done && (
              <span className="text-xs text-green-600">Found</span>
            )}
          </div>
        );
      })}
    </div>
  );
}