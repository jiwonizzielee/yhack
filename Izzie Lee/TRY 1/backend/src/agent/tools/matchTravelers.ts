import { supabase } from "../../lib/supabase.js";
import type { TripRequest, Listing } from "../../types.js";

export async function matchTravelers(req: TripRequest): Promise<Listing[]> {
  // Find other users traveling to the same destination in the same date range
  const city = req.destination.split(",")[0].trim();
  const { data, error } = await supabase
    .from("trips")
    .select("*, users(*)")
    .ilike("destination", `%${city}%`)
    .neq("user_id", req.userId)
    .eq("looking_to_split", true)
    .gte("end_date", req.startDate)
    .lte("start_date", req.endDate);

  if (error || !data) return [];

  return data.map((trip) => ({
    id: `traveler-${trip.user_id}`,
    type: "co-traveler" as const,
    degree: null,
    name: trip.users?.full_name ?? "Traveler",
    location: req.destination,
    trustScore: 0.2,
    cost: null, // TBD — split depends on Airbnb/hotel found
    description: `Traveling ${trip.start_date} – ${trip.end_date}. Open to splitting.`,
    available: true,
  }));
}