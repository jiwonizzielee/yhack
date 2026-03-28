import { supabase } from "../../lib/supabase.js";
import type { TripRequest, Listing } from "../../types.js";

export async function searchPersonalNetwork(req: TripRequest): Promise<Listing[]> {
  // Find 1st-degree connections who are at / near the destination and available
  const { data, error } = await supabase
    .from("connections")
    .select("*, users!connections_friend_id_fkey(*)")
    .eq("user_id", req.userId)
    .eq("degree", 1);

  if (error || !data) return [];

  // Filter by destination proximity and hosting availability (mocked for MVP)
  return data
    .filter((c) => c.users?.location?.toLowerCase().includes(req.destination.toLowerCase()))
    .map((c) => ({
      id: c.friend_id,
      type: "friend" as const,
      degree: 1,
      name: c.users?.full_name ?? "Friend",
      location: c.users?.location ?? req.destination,
      trustScore: 1.0 + 0.1 * (c.mutual_count ?? 0),
      cost: 0,
      description: "1st-degree connection",
      available: true,
    }));
}