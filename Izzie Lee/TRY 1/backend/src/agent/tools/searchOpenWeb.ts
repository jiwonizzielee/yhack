import type { TripRequest, Listing } from "../../types.js";

// Google Place IDs for major US cities
// Find more at: maps.googleapis.com/maps/api/place/findplacefromtext/json?input=CITY&inputtype=textquery
const CITY_PLACE_IDS: Record<string, string> = {
  "atlanta":       "ChIJjQmTaV0E9YgRC2MLmS_e_mY",
  "austin":        "ChIJLwPMoJm1RIYRetVp1EtGm10",
  "baltimore":     "ChIJt4P01q4DyIkRWOcjQqiWSAQ",
  "boston":        "ChIJ7cv00DwsDogRAMDACa2m4K8",
  "charlotte":     "ChIJ4zGFAZpfVogRO4O5lScIgqQ",
  "chicago":       "ChIJ7cv00DwsDogRAMDACa2m4K8",
  "dallas":        "ChIJS5dFe_cZTIYRj2dH9qSb7Lk",
  "denver":        "ChIJzxcfI6qAa4cR1jaKJ_j0jhE",
  "houston":       "ChIJAYWNSLS4QIYROwVl894CDco",
  "indianapolis":  "ChIJ7cv00DwsDogRAMDACa2m4K8",
  "las vegas":     "ChIJ0X31pIK3voARo3mz1ebVzDo",
  "los angeles":   "ChIJE9on3F3HwoAR9AHpMtVdL_g",
  "la":            "ChIJE9on3F3HwoAR9AHpMtVdL_g",
  "miami":         "ChIJEcHIDqKw2YgRZU-t3XHylv8",
  "minneapolis":   "ChIJW6W8GQonZYgRpfFBN9ILaGc",
  "nashville":     "ChIJPZDrEzLsZIgRoNrpodC5sXo",
  "new orleans":   "ChIJZYIRslSkIIYRtNMiXuhbBts",
  "new york":      "ChIJOwg_06VPwokRYv534QaPC8g",
  "nyc":           "ChIJOwg_06VPwokRYv534QaPC8g",
  "orlando":       "ChIJd7zN_thz54gRnr-lPAaywwo",
  "philadelphia":  "ChIJ60u11Ni3xokRwVg-jNgU9Yk",
  "phoenix":       "ChIJy3mhrdiqK4cRGBBhmBh0UVA",
  "pittsburgh":    "ChIJA4UGSG_xNIgRNBuCk7A5Ors",
  "portland":      "ChIJB3UJ2yuvlVQRTBX4g1wLwc0",
  "raleigh":       "ChIJ9-ByjAW7rIkRKlAnH9xqoSM",
  "sacramento":    "ChIJ-ZeDknFGmoAR9quFIFHo6zY",
  "salt lake city":"ChIJfcS3IECUUB0RoHBtMCIBvMQ",
  "san antonio":   "ChIJrw7QBK9YXIYRvBagEDvhVgg",
  "san diego":     "ChIJSx6SrQ9T2YARed8V_f0hOg0",
  "san francisco": "ChIJIQBpAG2ahYAR_6128GcTUEo",
  "sf":            "ChIJIQBpAG2ahYAR_6128GcTUEo",
  "seattle":       "ChIJVTPokywQkFQRmtVEaUZlJRA",
  "st. louis":     "ChIJ9-ByjAW7rIkRKlAnH9xqoSM",
  "tampa":         "ChIJ4dG5s4K3wogRY7SWr4kTX6c",
  "washington dc": "ChIJW-T2Wt7Gt4kRKl2I1CJFUsI",
  "dc":            "ChIJW-T2Wt7Gt4kRKl2I1CJFUsI",
};

function getPlaceId(destination: string): string | null {
  const key = destination.toLowerCase().split(",")[0].trim();
  return CITY_PLACE_IDS[key] ?? null;
}

interface Airbnb19Item {
  id?: string | number;
  name?: string;
  city?: string;
  url?: string;
  rating?: number;
  reviewsCount?: number;
  type?: string;
  beds?: number;
  price?: { label?: string; price?: number; rate?: { amount?: number } };
  images?: Array<{ url?: string }>;
}

async function fetchAirbnb19(req: TripRequest): Promise<Listing[]> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) return [];

  const placeId = getPlaceId(req.destination);
  if (!placeId) {
    console.warn(`No Place ID found for "${req.destination}", skipping Airbnb19`);
    return [];
  }

  const params = new URLSearchParams({
    placeId,
    adults: "1",
    currency: "USD",
    guestFavorite: "false",
    ib: "false",
    ...(req.startDate && { checkin: req.startDate }),
    ...(req.endDate && { checkout: req.endDate }),
  });

  const res = await fetch(
    `https://airbnb19.p.rapidapi.com/api/v2/searchPropertyByPlaceId?${params}`,
    {
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "airbnb19.p.rapidapi.com",
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    console.warn(`Airbnb19 API returned ${res.status}`);
    return [];
  }

  const json = await res.json();

  // Airbnb19 can return data in a few shapes — handle all of them
  const raw: Airbnb19Item[] =
    json?.data?.list ??
    json?.data?.results ??
    json?.results ??
    json?.data ??
    [];

  return (Array.isArray(raw) ? raw : [])
    .slice(0, 6)
    .filter((item) => {
      const price = item?.price?.price ?? item?.price?.rate?.amount;
      if (req.budget && price && price > req.budget) return false;
      return true;
    })
    .map((item): Listing => {
      const nightly = item?.price?.price ?? item?.price?.rate?.amount ?? null;
      const stars = item.rating ? `${Number(item.rating).toFixed(1)}★` : "";
      const reviews = item.reviewsCount ? ` (${item.reviewsCount})` : "";
      const beds = item.beds ? ` · ${item.beds} bed${item.beds > 1 ? "s" : ""}` : "";
      const typeLine = item.type ?? "Entire place";

      return {
        id: `airbnb-${item.id ?? Math.random()}`,
        type: "airbnb",
        degree: null,
        name: item.name ?? "Airbnb listing",
        location: item.city ?? req.destination,
        trustScore: item.rating ? Math.min(Number(item.rating) / 5, 1) : 0.4,
        cost: nightly ? Math.round(Number(nightly)) : null,
        description: `${typeLine}${beds} · ${stars}${reviews}`.trim(),
        url: item.url ?? "https://airbnb.com",
        available: true,
      };
    });
}

function mockListings(req: TripRequest): Listing[] {
  return [
    {
      id: "airbnb-mock-1",
      type: "airbnb" as const,
      degree: null,
      name: `Cozy Studio near ${req.destination}`,
      location: req.destination,
      trustScore: 0.5,
      cost: 89,
      description: "Entire studio · 1 bed · 4.8★ (120 reviews)",
      url: "https://airbnb.com",
      available: true,
    },
    {
      id: "airbnb-mock-2",
      type: "airbnb" as const,
      degree: null,
      name: "Private room in shared apartment",
      location: req.destination,
      trustScore: 0.45,
      cost: 45,
      description: "Private room · 1 bed · 4.6★ (87 reviews)",
      url: "https://airbnb.com",
      available: true,
    },
    {
      id: "hotel-mock-1",
      type: "hotel" as const,
      degree: null,
      name: "The Graduate Hotel",
      location: req.destination,
      trustScore: 0.35,
      cost: 149,
      description: "Boutique hotel · Popular with students and alumni",
      url: "https://graduatehotels.com",
      available: true,
    },
  ].filter((l) => !req.budget || (l.cost !== null && l.cost <= req.budget));
}

export async function searchOpenWeb(req: TripRequest): Promise<Listing[]> {
  try {
    const results = await fetchAirbnb19(req);
    if (results.length > 0) return results;
  } catch (err) {
    console.warn("Airbnb19 API error, falling back to mock:", err);
  }
  return mockListings(req);
}
