import { useState } from "react";
import type { Listing } from "../types";
import { useUnlockStore } from "../store/unlockStore";

function StarRating({ score }: { score: number }) {
  const stars = Math.round(score * 5 * 2) / 2; // round to nearest 0.5
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`text-sm ${stars >= s ? "text-yellow-400" : stars >= s - 0.5 ? "text-yellow-300" : "text-[#E5E5EA]"}`}>★</span>
      ))}
      <span className="text-xs text-[#8E8E93] ml-1">{(score * 5).toFixed(1)}</span>
    </div>
  );
}

function TrustBreakdown({ trustScore }: { trustScore: number }) {
  // Placeholder breakdown — will be replaced with real survey data
  const categories = [
    { label: "Comfort", value: Math.min(1, trustScore + 0.05) },
    { label: "Reliability", value: Math.min(1, trustScore - 0.03) },
    { label: "Vibe", value: Math.min(1, trustScore + 0.08) },
  ];
  return (
    <div className="flex flex-col gap-1 mt-1">
      {categories.map((c) => (
        <div key={c.label} className="flex items-center gap-2">
          <span className="text-[#8E8E93] text-xs w-16">{c.label}</span>
          <div className="flex-1 h-1 bg-[#F2F2F7] rounded-full overflow-hidden">
            <div className="h-full bg-black rounded-full" style={{ width: `${Math.round(c.value * 100)}%` }} />
          </div>
          <span className="text-[#8E8E93] text-xs w-6 text-right">{Math.round(c.value * 100)}</span>
        </div>
      ))}
    </div>
  );
}

interface Props {
  listing: Listing;
  onSelect: (listing: Listing) => void;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (listing: Listing) => void;
}

const TRUST_LABELS: Record<string, string> = {
  "1": "Direct friend",
  "2": "Friend of friend",
  "3": "3rd degree",
};

function isLocked(listing: Listing) {
  return listing.type === "friend" && listing.degree !== null && listing.degree >= 2;
}

export function ListingCard({ listing, onSelect, selectable, selected, onToggleSelect }: Props) {
  const [showLockModal, setShowLockModal] = useState(false);
  const { requests, requestUnlock, setStatus } = useUnlockStore();

  const trustPct = Math.round(listing.trustScore * 100);
  const locked = isLocked(listing);
  const unlockStatus = requests[listing.id];
  const isUnlocked = unlockStatus === "approved";

  const typeLabel =
    listing.type === "friend"
      ? TRUST_LABELS[String(listing.degree)] ?? "Connection"
      : listing.type === "co-traveler"
      ? "Co-traveler"
      : listing.type === "airbnb"
      ? "Airbnb"
      : "Hotel";

  const showBlur = locked && !isUnlocked;

  return (
    <>
      <div
        className={`bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-2.5 mb-3 transition-all ${selected ? "ring-2 ring-black" : ""}`}
      >
        {/* Select checkbox when in batch mode */}
        {selectable && !showBlur && (
          <div className="flex items-center gap-2 mb-1">
            <button
              type="button"
              onClick={() => onToggleSelect?.(listing)}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? "bg-black border-black" : "border-[#C7C7CC]"}`}
            >
              {selected && <span className="text-white text-xs">✓</span>}
            </button>
            <span className="text-xs text-[#8E8E93]">{selected ? "Selected" : "Tap to select"}</span>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 mr-3">
            <h3 className={`font-semibold text-black text-sm ${showBlur ? "blur-sm select-none" : ""}`}>
              {listing.name}
            </h3>
            <p className="text-[#8E8E93] text-xs mt-0.5">{listing.location}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {showBlur && <span className="text-xs">🔒</span>}
            {isUnlocked && <span className="text-xs">🔓</span>}
            <span className="text-xs bg-[#F2F2F7] text-black px-2.5 py-1 rounded-full font-medium">
              {typeLabel}
            </span>
          </div>
        </div>

        <p className={`text-[#8E8E93] text-sm leading-relaxed ${showBlur ? "blur-sm select-none" : ""}`}>
          {listing.description}
        </p>

        <div className="flex items-center justify-between">
          <StarRating score={listing.trustScore} />
          <span className="text-sm font-semibold text-black">
            {listing.cost === null ? "Split TBD" : listing.cost === 0 ? "Free" : `$${listing.cost}/night`}
          </span>
        </div>

        <div className="bg-[#F9F9F9] rounded-xl px-3 py-2.5">
          <p className="text-[#8E8E93] text-xs font-medium mb-1.5">Trust score · {trustPct}%</p>
          <TrustBreakdown trustScore={listing.trustScore} />
        </div>

        {showBlur ? (
          unlockStatus === "pending" ? (
            <div className="w-full rounded-2xl bg-[#F2F2F7] py-3 text-center">
              <p className="text-[#8E8E93] text-sm font-medium">Request sent · Waiting for approval</p>
            </div>
          ) : unlockStatus === "rejected" ? (
            <div className="w-full rounded-2xl bg-red-50 py-3 text-center">
              <p className="text-red-500 text-sm font-medium">Request declined</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowLockModal(true)}
              className="w-full rounded-2xl border-2 border-black py-3 text-sm font-semibold text-black mt-1 flex items-center justify-center gap-2"
            >
              🔒 Request to Unlock
            </button>
          )
        ) : selectable ? (
          <button
            type="button"
            onClick={() => onToggleSelect?.(listing)}
            className={`w-full rounded-2xl py-3 text-sm font-semibold mt-1 ${selected ? "bg-black text-white" : "bg-[#F2F2F7] text-black"}`}
          >
            {selected ? "Selected ✓" : "Select"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelect(listing)}
            className="w-full rounded-2xl bg-black py-3 text-sm font-semibold text-white mt-1"
          >
            Ask Agent to Reach Out
          </button>
        )}
      </div>

      {/* Lock modal */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="bg-white rounded-t-3xl w-full max-w-lg px-5 pt-6 pb-10">
            <div className="w-10 h-1 bg-[#E5E5EA] rounded-full mx-auto mb-6" />
            <div className="text-center mb-5">
              <span className="text-4xl">🔒</span>
              <h3 className="text-black font-bold text-lg mt-3">This connection is private</h3>
              <p className="text-[#8E8E93] text-sm mt-2 leading-relaxed">
                This person hasn't enabled mutual finder yet. Send them a request — they'll get a notification to approve or decline.
              </p>
            </div>

            <div className="bg-[#F2F2F7] rounded-2xl px-4 py-3.5 mb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">{listing.name[0]}</span>
              </div>
              <div>
                <p className="text-black font-semibold text-sm blur-sm select-none">{listing.name}</p>
                <p className="text-[#8E8E93] text-xs">{typeLabel} · {listing.location}</p>
              </div>
            </div>

            {/* Simulate friend response for demo */}
            <p className="text-center text-[#8E8E93] text-xs mb-3">Simulate friend's response (demo only)</p>
            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={() => { requestUnlock(listing.id); setStatus(listing.id, "approved"); setShowLockModal(false); }}
                className="flex-1 rounded-2xl bg-green-500 text-white py-3 text-sm font-semibold"
              >
                ✓ Approve
              </button>
              <button
                type="button"
                onClick={() => { requestUnlock(listing.id); setStatus(listing.id, "rejected"); setShowLockModal(false); }}
                className="flex-1 rounded-2xl bg-red-500 text-white py-3 text-sm font-semibold"
              >
                ✗ Decline
              </button>
            </div>

            <button
              type="button"
              onClick={() => { requestUnlock(listing.id); setShowLockModal(false); }}
              className="w-full rounded-2xl bg-black py-4 text-sm font-semibold text-white"
            >
              Send Unlock Request
            </button>
            <button
              type="button"
              onClick={() => setShowLockModal(false)}
              className="w-full rounded-2xl bg-[#F2F2F7] py-4 text-sm font-semibold text-black mt-3"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
