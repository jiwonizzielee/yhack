export type FallbackStep =
  | "direct-friends"
  | "extended-network"
  | "co-travelers"
  | "open-web"
  | "done";

export type ListingType = "friend" | "co-traveler" | "airbnb" | "hotel";

export interface Listing {
  id: string;
  type: ListingType;
  degree: 1 | 2 | 3 | null;
  name: string;
  location: string;
  trustScore: number;
  cost: number | null;
  description: string;
  url?: string;
  available: boolean;
}

export interface TripRequest {
  userId: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget?: number;
  notes?: string;
}

export interface SearchProgress {
  step: FallbackStep;
  results?: Listing[];
  error?: string;
}