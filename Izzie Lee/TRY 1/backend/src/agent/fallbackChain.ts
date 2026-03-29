import { searchPersonalNetwork } from "./tools/searchPersonalNetwork.js";
import { searchExtendedNetwork } from "./tools/searchExtendedNetwork.js";
import { matchTravelers } from "./tools/matchTravelers.js";
import { searchOpenWeb } from "./tools/searchOpenWeb.js";
import { generateAgentSummary } from "./tools/agentSummary.js";
import { rankResults } from "./rankResults.js";
import type { TripRequest, Listing, FallbackStep, AgentSummary } from "../types.js";

export type SearchProgress = {
  step: FallbackStep;
  results: Listing[];
  summary?: AgentSummary;
};

export async function* runFallbackChain(
  req: TripRequest
): AsyncGenerator<SearchProgress> {
  const collected: { step: string; results: Listing[] }[] = [];

  // Steps 1, 2, and open web run in parallel for speed
  const [personal, extended, openWeb] = await Promise.all([
    searchPersonalNetwork(req),
    searchExtendedNetwork(req),
    searchOpenWeb(req),
  ]);

  if (personal.length > 0) {
    const ranked = rankResults(personal);
    collected.push({ step: "direct-friends", results: ranked });
    yield { step: "direct-friends", results: ranked };
  }

  if (extended.length > 0) {
    const ranked = rankResults(extended);
    collected.push({ step: "extended-network", results: ranked });
    yield { step: "extended-network", results: ranked };
  }

  // Co-traveler matching only when no personal network found
  if (personal.length === 0 && extended.length === 0) {
    const travelers = await matchTravelers(req);
    if (travelers.length > 0) {
      collected.push({ step: "co-travelers", results: travelers });
      yield { step: "co-travelers", results: travelers };
    }
  }

  // Always show open web as additional options
  if (openWeb.length > 0) {
    const ranked = rankResults(openWeb);
    collected.push({ step: "open-web", results: ranked });
    yield { step: "open-web", results: ranked };
  }

  // Final step: Claude analyzes all results and gives smart recommendation
  if (collected.length > 0) {
    const summary = await generateAgentSummary(collected, req);
    yield { step: "agent-summary", results: [], summary };
  }
}
