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
  // Step 1: direct friends
  const personal = await searchPersonalNetwork(req);
  yield { step: "direct-friends", results: rankResults(personal) };

  // Step 2: friends of friends
  const extended = await searchExtendedNetwork(req);
  yield { step: "extended-network", results: rankResults(extended) };

  // Step 3: co-traveler matching — only if no personal network results
  if (personal.length === 0 && extended.length === 0) {
    const travelers = await matchTravelers(req);
    yield { step: "co-travelers", results: travelers };
  } else {
    yield { step: "co-travelers", results: [] };
  }

  // Step 4: Airbnb & Hotels — always shown
  const openWeb = await searchOpenWeb(req);
  yield { step: "open-web", results: rankResults(openWeb) };
}