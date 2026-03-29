import { useState } from "react";
import type { Listing } from "../types";
import { useUnlockStore } from "../store/unlockStore";

function StarRating({ score, size = "sm" }: { score: number; size?: "sm" | "md" }) {
  const filled = Math.round(score * 5 * 2) / 2;
  const sz = size === "md" ? "text-base" : "text-sm";
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <span key={s} className={`${sz} ${filled >= s ? "text-yellow-400" : filled >= s - 0.5 ? "text-yellow-300" : "text-[#E5E5EA]"}`}>★</span>
      ))}
      <span className="text-xs text-[#8E8E93] ml-1 font-medium">{(score * 5).toFixed(1)}</span>
    </div>
  );
}

function TrustBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[#8E8E93] text-xs w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-[#F2F2F7] rounded-full overflow-hidden">
        <div className="h-full bg-black rounded-full" style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
      <span className="text-black text-xs font-semibold w-7 text-right">{Math.round(value * 100)}</span>
    </div>
  );
}

const MOCK_REVIEWS = [
  { author: "Sarah M.", text: "Super welcoming and the place was spotless. Would definitely stay again!", rating: 5 },
  { author: "James T.", text: "Great communication, easy check-in. Very comfortable stay.", rating: 4 },
  { author: "Priya K.", text: "Lovely host, made us feel at home right away.", rating: 5 },
];

const TYPE_COLORS: Record<string, string> = {
  friend: "bg-blue-50 text-blue-600",
  "co-traveler": "bg-purple-50 text-purple-600",
  airbnb: "bg-orange-50 text-orange-600",
  hotel: "bg-gray-100 text-gray-600",
};

const TYPE_ICONS: Record<string, string> = {
  friend: "👤", "co-traveler": "✈️", airbnb: "🏠", hotel: "🏨",
};

const TRUST_LABELS: Record<string, string> = {
  "1": "Direct friend", "2": "Friend of friend", "3": "3rd degree",
};

function isLocked(listing: Listing) {
  return listing.type === "friend" && listing.degree !== null && listing.degree >= 2;
}

interface Props {
  listing: Listing;
  onSelect: (listing: Listing) => void;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (listing: Listing) => void;
}

export function ListingCard({ listing, onSelect, selectable, selected, onToggleSelect }: Props) {
  const [showProfile, setShowProfile] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [showFriendModal, setShowFriendModal] = useState(false);
  const { requests, requestUnlock, setStatus } = useUnlockStore();

  const trustPct = Math.round(listing.trustScore * 100);
  const locked = isLocked(listing);
  const unlockStatus = requests[listing.id];
  const isUnlocked = unlockStatus === "approved";
  const showBlur = locked && !isUnlocked;

  const typeLabel = listing.type === "friend"
    ? TRUST_LABELS[String(listing.degree)] ?? "Connection"
    : listing.type === "co-traveler" ? "Co-traveler"
    : listing.type === "airbnb" ? "Airbnb" : "Hotel";

  const trustCategories = [
    { label: "Comfort", value: Math.min(1, listing.trustScore + 0.05) },
    { label: "Reliability", value: Math.min(1, listing.trustScore - 0.03) },
    { label: "Vibe", value: Math.min(1, listing.trustScore + 0.08) },
  ];

  return (
    <>
      {/* Compact card */}
      <div
        className={`bg-white rounded-2xl shadow-sm mb-3 overflow-hidden transition-all cursor-pointer active:scale-[0.98] ${selected ? "ring-2 ring-black" : ""}`}
        onClick={() => !selectable && setShowProfile(true)}
      >
        <div className="p-4 flex items-center gap-3">
          {/* Select circle */}
          {selectable && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleSelect?.(listing); }}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? "bg-black border-black" : "border-[#C7C7CC]"}`}
            >
              {selected && <span className="text-white text-xs">✓</span>}
            </button>
          )}

          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-[#F2F2F7] flex items-center justify-center flex-shrink-0 text-xl">
            {listing.type === "friend"
              ? <span className="font-bold text-black text-base">{showBlur ? "?" : listing.name[0]}</span>
              : <span>{TYPE_ICONS[listing.type]}</span>}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className={`font-semibold text-black text-sm leading-tight ${showBlur ? "blur-sm select-none" : ""}`}>
                {listing.name}
              </h3>
              {showBlur && <span className="text-xs">🔒</span>}
              {isUnlocked && <span className="text-xs">🔓</span>}
            </div>
            <p className="text-[#8E8E93] text-xs mt-0.5">📍 {listing.location}</p>
            <div className="flex items-center gap-2 mt-1">
              <StarRating score={listing.trustScore} />
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[listing.type]}`}>{typeLabel}</span>
            </div>
          </div>

          {/* Price + chevron */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-black font-bold text-sm">
              {listing.cost === null ? "Split TBD" : listing.cost === 0 ? "Free 🎉" : `$${listing.cost}`}
            </span>
            {listing.cost !== null && listing.cost > 0 && <span className="text-[#8E8E93] text-xs">/night</span>}
            {!selectable && <span className="text-[#C7C7CC] text-sm">›</span>}
          </div>
        </div>

        {/* Trust bar strip */}
        <div className="h-1.5 bg-[#F2F2F7]">
          <div className="h-full bg-black transition-all" style={{ width: `${trustPct}%` }} />
        </div>
      </div>

      {/* ── Host Profile Sheet ── */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/40" onClick={() => setShowProfile(false)}>
          <div className="mt-auto bg-white rounded-t-3xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            {/* Handle + close */}
            <div className="sticky top-0 bg-white pt-4 px-5 pb-3 flex items-center justify-between border-b border-[#F2F2F7]">
              <div className="w-10 h-1 bg-[#E5E5EA] rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
              <div />
              <button type="button" onClick={() => setShowProfile(false)}
                className="w-8 h-8 bg-[#F2F2F7] rounded-full flex items-center justify-center text-[#8E8E93] text-sm ml-auto">✕</button>
            </div>

            <div className="px-5 pt-4 pb-8 flex flex-col gap-5">
              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#F2F2F7] flex items-center justify-center text-3xl flex-shrink-0">
                  {listing.type === "friend"
                    ? <span className="font-bold text-black text-2xl">{showBlur ? "?" : listing.name[0]}</span>
                    : <span>{TYPE_ICONS[listing.type]}</span>}
                </div>
                <div>
                  <h2 className={`text-black font-bold text-xl ${showBlur ? "blur-sm select-none" : ""}`}>{listing.name}</h2>
                  <p className="text-[#8E8E93] text-sm mt-0.5">📍 {listing.location}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating score={listing.trustScore} size="md" />
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TYPE_COLORS[listing.type]}`}>{typeLabel}</span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="bg-[#F9F9F9] rounded-2xl px-4 py-3 flex items-center justify-between">
                <span className="text-[#8E8E93] text-sm">Price per night</span>
                <span className="text-black font-bold text-lg">
                  {listing.cost === null ? "Split TBD" : listing.cost === 0 ? "Free 🎉" : `$${listing.cost}`}
                </span>
              </div>

              {/* About */}
              <div>
                <p className="text-black font-semibold text-sm mb-2">About</p>
                <p className={`text-[#8E8E93] text-sm leading-relaxed ${showBlur ? "blur-sm select-none" : ""}`}>
                  {listing.description}
                </p>
              </div>

              {/* Trust breakdown */}
              <div>
                <p className="text-black font-semibold text-sm mb-3">Trust Score · {trustPct}%</p>
                <div className="flex flex-col gap-2.5">
                  {trustCategories.map((c) => <TrustBar key={c.label} label={c.label} value={c.value} />)}
                </div>
              </div>

              {/* Reviews */}
              {!showBlur && (
                <div>
                  <p className="text-black font-semibold text-sm mb-3">Reviews ({MOCK_REVIEWS.length})</p>
                  <div className="flex flex-col gap-3">
                    {MOCK_REVIEWS.map((r, i) => (
                      <div key={i} className="bg-[#F9F9F9] rounded-2xl px-4 py-3.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center">
                              <span className="text-white text-xs font-semibold">{r.author[0]}</span>
                            </div>
                            <span className="text-black text-sm font-semibold">{r.author}</span>
                          </div>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map((s) => (
                              <span key={s} className={`text-xs ${s <= r.rating ? "text-yellow-400" : "text-[#E5E5EA]"}`}>★</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-[#8E8E93] text-sm leading-relaxed">{r.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action */}
              {showBlur ? (
                unlockStatus === "pending" ? (
                  <div className="w-full rounded-2xl bg-[#F2F2F7] py-4 text-center">
                    <p className="text-[#8E8E93] text-sm font-medium">Request sent · Waiting for approval</p>
                  </div>
                ) : unlockStatus === "rejected" ? (
                  <div className="w-full rounded-2xl bg-red-50 py-4 text-center">
                    <p className="text-red-500 text-sm font-medium">Request declined</p>
                  </div>
                ) : (
                  <button type="button"
                    onClick={() => { setShowProfile(false); setShowLockModal(true); }}
                    className="w-full rounded-2xl border-2 border-black py-4 text-sm font-semibold text-black flex items-center justify-center gap-2">
                    🔒 Request to Unlock
                  </button>
                )
              ) : (
                <button type="button"
                  onClick={() => { setShowProfile(false); onSelect(listing); }}
                  className="w-full rounded-2xl bg-black py-4 text-sm font-semibold text-white">
                  Ask Agent to Reach Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lock modal — user side */}
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
            <div className="bg-[#F2F2F7] rounded-2xl px-4 py-3.5 mb-5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">?</span>
              </div>
              <div>
                <p className="text-black font-semibold text-sm blur-sm select-none">{listing.name}</p>
                <p className="text-[#8E8E93] text-xs">{typeLabel} · {listing.location}</p>
              </div>
            </div>
            <button type="button"
              onClick={() => { requestUnlock(listing.id); setShowLockModal(false); setShowFriendModal(true); }}
              className="w-full rounded-2xl bg-black py-4 text-sm font-semibold text-white">
              Send Unlock Request
            </button>
            <button type="button" onClick={() => setShowLockModal(false)}
              className="w-full rounded-2xl bg-[#F2F2F7] py-4 text-sm font-semibold text-black mt-3">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Friend's perspective modal */}
      {showFriendModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="bg-white rounded-t-3xl w-full max-w-lg px-5 pt-6 pb-10">
            <div className="w-10 h-1 bg-[#E5E5EA] rounded-full mx-auto mb-6" />
            <div className="text-center mb-5">
              <span className="text-4xl">🔔</span>
              <p className="text-[#8E8E93] text-xs font-medium mt-2 uppercase tracking-wider">Friend's view (demo)</p>
              <h3 className="text-black font-bold text-lg mt-1">Someone wants to unlock your profile</h3>
              <p className="text-[#8E8E93] text-sm mt-2 leading-relaxed">
                A mutual friend is looking for a place to stay and wants to see if you can host them.
              </p>
            </div>
            <div className="bg-[#F2F2F7] rounded-2xl px-4 py-3.5 mb-5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">{listing.name[0]}</span>
              </div>
              <div>
                <p className="text-black font-semibold text-sm">{listing.name}</p>
                <p className="text-[#8E8E93] text-xs">{typeLabel} · {listing.location}</p>
              </div>
            </div>
            <div className="flex gap-3 mb-3">
              <button type="button"
                onClick={() => { setStatus(listing.id, "approved"); setShowFriendModal(false); }}
                className="flex-1 rounded-2xl bg-black text-white py-4 text-sm font-semibold">
                ✓ Approve
              </button>
              <button type="button"
                onClick={() => { setStatus(listing.id, "rejected"); setShowFriendModal(false); }}
                className="flex-1 rounded-2xl bg-red-500 text-white py-4 text-sm font-semibold">
                ✗ Decline
              </button>
            </div>
            <button type="button" onClick={() => setShowFriendModal(false)}
              className="w-full rounded-2xl bg-[#F2F2F7] py-4 text-sm font-semibold text-black">
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
