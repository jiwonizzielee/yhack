import { searchPersonalNetwork } from "./tools/searchPersonalNetwork.js";
import { searchExtendedNetwork } from "./tools/searchExtendedNetwork.js";
import { matchTravelers } from "./tools/matchTravelers.js";
import { searchOpenWeb } from "./tools/searchOpenWeb.js";
import { rankResults } from "./rankResults.js";
import type { TripRequest, Listing, FallbackStep } from "../types.js";

export type SearchProgress = {
  step: FallbackStep;
  results: Listing[];
};

export async function* runFallbackChain(
  req: TripRequest
): AsyncGenerator<SearchProgress> {
  // Step 1 + 2 + open web all run in parallel
  const [personal, extended, openWeb] = await Promise.all([
    searchPersonalNetwork(req),
    searchExtendedNetwork(req),
    searchOpenWeb(req),
  ]);

  if (personal.length > 0) {
    yield { step: "direct-friends", results: rankResults(personal) };
  }

  if (extended.length > 0) {
    yield { step: "extended-network", results: rankResults(extended) };
  }

  // Step 3: co-traveler matching only if no personal network results
  if (personal.length === 0 && extended.length === 0) {
    const travelers = await matchTravelers(req);
    if (travelers.length > 0) {
      yield { step: "co-travelers", results: travelers };
    }
  }

  // Step 4: always show open web as fallback / additional options
  if (openWeb.length > 0) {
    yield { step: "open-web", results: rankResults(openWeb) };
  }
}