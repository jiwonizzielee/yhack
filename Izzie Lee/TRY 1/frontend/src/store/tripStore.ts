import { create } from "zustand";
import type { Listing, TripRequest, FallbackStep } from "../types";

interface StepResult {
  step: FallbackStep;
  results: Listing[];
}

interface TripStore {
  currentRequest: TripRequest | null;
  stepResults: StepResult[];
  activeStep: FallbackStep | null;
  isDone: boolean;
  setRequest: (req: TripRequest) => void;
  addStepResult: (progress: StepResult) => void;
  setDone: () => void;
  reset: () => void;
}

export const useTripStore = create<TripStore>((set) => ({
  currentRequest: null,
  stepResults: [],
  activeStep: null,
  isDone: false,
  setRequest: (req) => set({ currentRequest: req, stepResults: [], isDone: false }),
  addStepResult: (progress) =>
    set((s) => ({
      stepResults: [...s.stepResults, progress],
      activeStep: progress.step,
    })),
  setDone: () => set({ isDone: true, activeStep: "done" }),
  reset: () =>
    set({ currentRequest: null, stepResults: [], activeStep: null, isDone: false }),
}));