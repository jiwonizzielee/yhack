import { create } from "zustand";

export type UnlockStatus = "pending" | "approved" | "rejected";

interface UnlockStore {
  requests: Record<string, UnlockStatus>;
  requestUnlock: (listingId: string) => void;
  setStatus: (listingId: string, status: UnlockStatus) => void;
  reset: () => void;
}

export const useUnlockStore = create<UnlockStore>((set) => ({
  requests: {},
  requestUnlock: (listingId) =>
    set((s) => ({ requests: { ...s.requests, [listingId]: "pending" } })),
  setStatus: (listingId, status) =>
    set((s) => ({ requests: { ...s.requests, [listingId]: status } })),
  reset: () => set({ requests: {} }),
}));
