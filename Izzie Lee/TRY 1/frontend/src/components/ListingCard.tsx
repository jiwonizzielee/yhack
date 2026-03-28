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

export function ListingCard({ listing, onSelect }: Props) {
  const trustPct = Math.round(listing.trustScore * 100);

  const typeLabel =
    listing.type === "friend"
      ? TRUST_LABELS[String(listing.degree)] ?? "Connection"
      : listing.type === "co-traveler"
      ? "Co-traveler"
      : listing.type === "airbnb"
      ? "Airbnb"
      : "Hotel";

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-2.5 mb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="font-semibold text-black text-sm">{listing.name}</h3>
          <p className="text-[#8E8E93] text-xs mt-0.5">{listing.location}</p>
        </div>
        <span className="text-xs bg-[#F2F2F7] text-black px-2.5 py-1 rounded-full font-medium flex-shrink-0">
          {typeLabel}
        </span>
      </div>

      <p className="text-[#8E8E93] text-sm leading-relaxed">{listing.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 rounded-full bg-[#F2F2F7] overflow-hidden">
            {/* eslint-disable-next-line react/forbid-component-props */}
            <div className="h-full rounded-full bg-black" style={{ width: `${trustPct}%` }} />
          </div>
          <span className="text-xs text-[#8E8E93]">{trustPct}% trust</span>
        </div>
        <span className="text-sm font-semibold text-black">
          {listing.cost === null ? "Split TBD" : listing.cost === 0 ? "Free" : `$${listing.cost}/night`}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onSelect(listing)}
        className="w-full rounded-2xl bg-black py-3 text-sm font-semibold text-white mt-1"
      >
        Ask Agent to Reach Out
      </button>
    </div>
  );
}
