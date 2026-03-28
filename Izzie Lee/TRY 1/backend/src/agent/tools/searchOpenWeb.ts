import type { TripRequest, Listing } from "../../types.js";

// Stub — swap in RapidAPI Airbnb or real scraper for production
export async function searchOpenWeb(req: TripRequest): Promise<Listing[]> {
  // Mock Airbnb/hotel results for MVP demo
  return [
    {
      id: "airbnb-mock-1",
      type: "airbnb",
      degree: null,
      name: "Cozy Studio near " + req.destination,
      location: req.destination,
      trustScore: 0.0,
      cost: 89,
      description: "Entire studio · 1 bed · 4.8 ★ (120 reviews)",
      url: "https://airbnb.com",
      available: true,
    },
    {
      id: "airbnb-mock-2",
      type: "airbnb",
      degree: null,
      name: "Private room in shared apartment",
      location: req.destination,
      trustScore: 0.0,
      cost: 45,
      description: "Private room · 4.6 ★ (87 reviews)",
      url: "https://airbnb.com",
      available: true,
    },
  ];
}