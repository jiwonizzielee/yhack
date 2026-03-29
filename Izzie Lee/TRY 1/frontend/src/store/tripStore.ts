import { create } from "zustand";
import type { Listing, TripRequest, FallbackStep, AgentSummary } from "../types";

interface StepResult {
  step: FallbackStep;
  results: Listing[];
}

interface TripStore {
  currentRequest: TripRequest | null;
  stepResults: StepResult[];
  activeStep: FallbackStep | null;
  isDone: boolean;
  agentSummary: AgentSummary | null;
  setRequest: (req: TripRequest) => void;
  addStepResult: (progress: StepResult) => void;
  setAgentSummary: (summary: AgentSummary) => void;
  setDone: () => void;
  reset: () => void;
}

export const useTripStore = create<TripStore>((set) => ({
  currentRequest: null,
  stepResults: [],
  activeStep: null,
  isDone: false,
  agentSummary: null,
  setRequest: (req) => set({ currentRequest: req, stepResults: [], isDone: false, agentSummary: null }),
  addStepResult: (progress) =>
    set((s) => ({
      stepResults: [...s.stepResults, progress],
      activeStep: progress.step,
    })),
  setAgentSummary: (summary) => set({ agentSummary: summary }),
  setDone: () => set({ isDone: true, activeStep: "done" }),
  reset: () =>
    set({ currentRequest: null, stepResults: [], activeStep: null, isDone: false, agentSummary: null }),
}));
