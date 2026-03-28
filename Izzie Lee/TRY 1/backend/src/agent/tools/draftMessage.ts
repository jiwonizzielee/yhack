import { anthropic } from "../../lib/anthropic.js";
import type { Listing, TripRequest } from "../../types.js";

export async function draftMessage(listing: Listing, req: TripRequest): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `Draft a friendly, short message asking ${listing.name} if they can host me
(or if we can split accommodation) in ${req.destination} from ${req.startDate} to ${req.endDate}.
Keep it warm, casual, and under 3 sentences. Do not use placeholders.`,
      },
    ],
  });

  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}