import { supabase } from "../../lib/supabase.js";
import type { TripRequest, Listing } from "../../types.js";

export async function searchExtendedNetwork(req: TripRequest): Promise<Listing[]> {
  // 2nd/3rd degree connections — only surface if permission granted
  const { data, error } = await supabase
    .from("connections")
    .select("*, users!connections_friend_id_fkey(*)")
    .eq("user_id", req.userId)
    .in("degree", [2, 3])
    .eq("permission_granted", true);

  if (error || !data) return [];

  return data
    .filter((c) => c.users?.location?.toLowerCase().includes(req.destination.toLowerCase()))
    .map((c) => ({
      id: c.friend_id,
      type: "friend" as const,
      degree: c.degree as 2 | 3,
      name: c.users?.full_name ?? "Friend of a friend",
      location: c.users?.location ?? req.destination,
      trustScore: c.degree === 2 ? 0.6 : 0.3,
      cost: 0,
      description: `${c.degree}nd/3rd-degree connection`,
      available: true,
    }));
}