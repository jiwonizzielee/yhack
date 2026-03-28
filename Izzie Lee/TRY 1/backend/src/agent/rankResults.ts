import type { Listing } from "../types.js";

const WEIGHTS = {
  trust: 0.5,
  cost: 0.3,      // lower cost = higher score
  convenience: 0.2,
};

function costScore(cost: number | null, maxCost: number): number {
  if (cost === null || cost === 0) return 1; // free / split = best
  return Math.max(0, 1 - cost / maxCost);
}

export function rankResults(listings: Listing[]): Listing[] {
  const maxCost = Math.max(...listings.map((l) => l.cost ?? 0), 1);

  return listings
    .map((l) => ({
      ...l,
      score:
        WEIGHTS.trust * l.trustScore +
        WEIGHTS.cost * costScore(l.cost, maxCost) +
        WEIGHTS.convenience * (l.type === "friend" ? 1 : 0.5),
    }))
    .sort((a, b) => (b as any).score - (a as any).score);
}