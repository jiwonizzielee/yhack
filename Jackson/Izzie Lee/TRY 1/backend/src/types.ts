export type FallbackStep =
  | "direct-friends"
  | "extended-network"
  | "co-travelers"
  | "open-web";

export type ListingType = "friend" | "co-traveler" | "airbnb" | "hotel";

export interface Listing {
  id: string;
  type: ListingType;
  degree: 1 | 2 | 3 | null;
  name: string;
  location: string;
  trustScore: number;
  cost: number | null;  // USD/night; null = TBD (split)
  description: string;
  url?: string;
  available: boolean;
}

export interface TripRequest {
  userId: string;
  destination: string;
  startDate: string;  // ISO date
  endDate: string;
  budget?: number;    // max USD/night
  notes: string;
}