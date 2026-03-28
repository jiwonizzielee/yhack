import type { Listing } from "../types";

interface Props {
  listing: Listing;
  onSelect: (listing: Listing) => void;
}

const TRUST_LABELS: Record<string, string> = {
  "1": "Direct friend",
  "2": "Friend of friend",
  "3": "3rd degree",
};

const TYPE_COLORS: Record<string, string> = {
  friend: "bg-purple-100 text-purple-700",
  "co-traveler": "bg-blue-100 text-blue-700",
  airbnb: "bg-orange-100 text-orange-700",
  hotel: "bg-gray-100 text-gray-700",
};

export function ListingCard({ listing, onSelect }: Props) {
  const trustPct = Math.round(listing.trustScore * 100);
  const typeColor = TYPE_COLORS[listing.type] ?? "bg-gray-100 text-gray-700";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{listing.name}</h3>
          <p className="text-xs text-gray-500">{listing.location}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeColor}`}>
          {listing.type === "friend"
            ? TRUST_LABELS[String(listing.degree)] ?? "Connection"
            : listing.type}
        </span>
      </div>

      <p className="text-sm text-gray-600">{listing.description}</p>

      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>Trust:</span>
          <div className="w-20 h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-green-400"
              style={{ width: `${trustPct}%` }}
            />
          </div>
          <span>{trustPct}%</span>
        </div>
        <span className="text-sm font-semibold text-gray-800">
          {listing.cost === null ? "Split TBD" : listing.cost === 0 ? "Free" : `$${listing.cost}/night`}
        </span>
      </div>

      <button
        onClick={() => onSelect(listing)}
        className="mt-2 w-full rounded-xl bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
      >
        Ask Agent to Reach Out
      </button>
    </div>
  );
}