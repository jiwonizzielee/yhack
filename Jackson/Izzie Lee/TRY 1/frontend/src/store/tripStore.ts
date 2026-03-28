import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Listing, TripRequest, FallbackStep } from "../types";

export type TripStatus = "Searching" | "Found" | "Confirmed" | "Cancelled";

export interface SavedTrip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget?: number;
  notes?: string;
  status: TripStatus;
}

interface StepResult {
  step: FallbackStep;
  results: Listing[];
}

interface TripStore {
  // Active search
  currentRequest: TripRequest | null;
  stepResults: StepResult[];
  activeStep: FallbackStep | null;
  isDone: boolean;
  setRequest: (req: TripRequest) => void;
  addStepResult: (progress: StepResult) => void;
  setDone: () => void;
  reset: () => void;

  // Saved trips
  savedTrips: SavedTrip[];
  saveTrip: (trip: SavedTrip) => void;
  updateTrip: (id: string, patch: Partial<SavedTrip>) => void;
  deleteTrip: (id: string) => void;
}

export const useTripStore = create<TripStore>()(
  persist(
    (set) => ({
      currentRequest: null,
      stepResults: [],
      activeStep: null,
      isDone: false,
      setRequest: (req) => set({ currentRequest: req, stepResults: [], isDone: false, activeStep: null }),
      addStepResult: (progress) =>
        set((s) => ({
          stepResults: [...s.stepResults, progress],
          activeStep: progress.step,
        })),
      setDone: () => set({ isDone: true, activeStep: "done" }),
      reset: () =>
        set({ currentRequest: null, stepResults: [], activeStep: null, isDone: false }),

      savedTrips: [],
      saveTrip: (trip) => set((s) => ({ savedTrips: [...s.savedTrips, trip] })),
      updateTrip: (id, patch) =>
        set((s) => ({
          savedTrips: s.savedTrips.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      deleteTrip: (id) =>
        set((s) => ({ savedTrips: s.savedTrips.filter((t) => t.id !== id) })),
    }),
    { name: "crashly-trips" }
  )
);
