import type { SearchProgress, TripRequest, Listing } from "../types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export async function* searchHousing(
  req: TripRequest
): AsyncGenerator<SearchProgress> {
  const res = await fetch(`${BASE}/agent/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        yield JSON.parse(line.slice(6)) as SearchProgress;
      }
    }
  }
}

export async function draftMessage(
  listing: Listing,
  tripRequest: TripRequest
): Promise<string> {
  const res = await fetch(`${BASE}/agent/draft-message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listing, tripRequest }),
  });
  const data = await res.json();
  return data.message as string;
}