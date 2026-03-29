import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTripStore } from "../store/tripStore";
import { ListingCard } from "../components/ListingCard";
import { MessagePreview } from "../components/MessagePreview";
import { draftMessage } from "../lib/api";
import type { Listing } from "../types";

const SEARCH_STEPS = [
  { label: "Scanning your friend network...", emoji: "👥" },
  { label: "Checking friends of friends...", emoji: "🔗" },
  { label: "Finding co-travelers...", emoji: "✈️" },
  { label: "Searching Airbnb & Hotels...", emoji: "🏠" },
];

function SearchingAnimation({ stepCount }: { stepCount: number }) {
  const current = Math.min(stepCount, SEARCH_STEPS.length - 1);
  const step = SEARCH_STEPS[current];
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6">
      {/* Layered orbital rings */}
      <div className="relative w-28 h-28 mb-8">
        {/* Radar pulse */}
        <div
          className="absolute inset-0 rounded-full border border-black/10 animate-ping"
          style={{ animationDuration: "2.4s" }}
        />
        {/* Outer static ring */}
        <div className="absolute inset-0 rounded-full border border-[#E5E5EA]" />
        {/* Primary spinner */}
        <div
          className="absolute inset-3 rounded-full border-2 border-[#F2F2F7] border-t-black animate-spin"
          style={{ animationDuration: "1.1s", animationTimingFunction: "linear" }}
        />
        {/* Inner counter-spinner */}
        <div
          className="absolute inset-6 rounded-full border-2 border-[#F2F2F7] border-t-[#8E8E93] animate-spin"
          style={{ animationDuration: "1.9s", animationDirection: "reverse", animationTimingFunction: "linear" }}
        />
        {/* Center emoji */}
        <div className="absolute inset-0 flex items-center justify-center text-2xl select-none">
          {step.emoji}
        </div>
      </div>

      <p className="text-black font-bold text-xl tracking-tight">Finding your stay</p>
      <p key={current} className="text-[#8E8E93] text-sm mt-2 text-center">
        {step.label}
      </p>

      {/* Progress pills */}
      <div className="flex gap-2 mt-7">
        {SEARCH_STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i < current
                ? "bg-black/30 w-4"
                : i === current
                ? "bg-black w-8"
                : "bg-[#E5E5EA] w-4"
            }`}
          />
        ))}
      </div>

      <p className="text-[#C7C7CC] text-xs mt-3">
        Step {current + 1} of {SEARCH_STEPS.length}
      </p>
    </div>
  );
}

export default function Results() {
  const navigate = useNavigate();
  const { stepResults, isDone, currentRequest } = useTripStore();

  const [sentCount, setSentCount] = useState(0);
  const [showFinish, setShowFinish] = useState(false);

  // Single message flow
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [draftedMsg, setDraftedMsg] = useState("");
  const [drafting, setDrafting] = useState(false);

  // Batch select flow
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchDrafts, setBatchDrafts] = useState<{ listing: Listing; message: string }[]>([]);
  const [batchIndex, setBatchIndex] = useState(0);
  const [batchLoading, setBatchLoading] = useState(false);
  const [showBatch, setShowBatch] = useState(false);

  const allListings = stepResults.flatMap((s) => s.results);
  const selectedListings = allListings.filter((l) => selectedIds.has(l.id));

  function toggleSelect(listing: Listing) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(listing.id)) next.delete(listing.id);
      else next.add(listing.id);
      return next;
    });
  }

  async function handleSelect(listing: Listing) {
    if (!currentRequest) return;
    setSelectedListing(listing);
    setDrafting(true);
    try {
      const msg = await draftMessage(listing, currentRequest);
      setDraftedMsg(msg);
    } catch {
      setDraftedMsg(
        `Hey ${listing.name}! I'm planning a trip to ${currentRequest.destination} from ${currentRequest.startDate} to ${currentRequest.endDate} and was wondering if you'd be open to hosting me? Would love to catch up!`
      );
    }
    setDrafting(false);
  }

  async function handleBatchSend() {
    if (!currentRequest || selectedListings.length === 0) return;
    setBatchLoading(true);
    const drafts: { listing: Listing; message: string }[] = [];
    for (const listing of selectedListings) {
      try {
        const msg = await draftMessage(listing, currentRequest);
        drafts.push({ listing, message: msg });
      } catch {
        drafts.push({
          listing,
          message: `Hey ${listing.name}! I'm planning a trip to ${currentRequest.destination} from ${currentRequest.startDate} to ${currentRequest.endDate}. Would you be open to hosting me?`,
        });
      }
    }
    setBatchDrafts(drafts);
    setBatchIndex(0);
    setBatchLoading(false);
    setShowBatch(true);
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col pb-32">
      {/* Header */}
      <div className="bg-white px-5 pt-14 pb-4 border-b border-[#E5E5EA]">
        <h1 className="text-black text-2xl font-bold">
          {isDone ? `${allListings.length} Stays Found` : "Searching..."}
        </h1>
        <p className="text-[#8E8E93] text-sm mt-0.5">
          {currentRequest?.destination}
          {currentRequest?.startDate ? ` · ${currentRequest.startDate} – ${currentRequest.endDate}` : ""}
          {currentRequest?.numPeople && currentRequest.numPeople > 1 ? ` · ${currentRequest.numPeople} guests` : ""}
        </p>
      </div>

      {/* Loading state */}
      {!isDone && <SearchingAnimation stepCount={stepResults.length} />}

      {/* Results */}
      {isDone && (
        <>
          {/* Batch select toggle */}
          {allListings.length > 0 && (
            <div className="mx-4 mt-4 flex items-center justify-between">
              <p className="text-[#8E8E93] text-xs">
                {selectMode ? `${selectedIds.size} selected` : "Tap a card to view host profile"}
              </p>
              <button
                type="button"
                onClick={() => { setSelectMode(!selectMode); setSelectedIds(new Set()); }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full ${selectMode ? "bg-black text-white" : "bg-[#F2F2F7] text-black"}`}
              >
                {selectMode ? "Cancel" : "Select"}
              </button>
            </div>
          )}

          <div className="flex flex-col px-4 mt-3">
            {allListings.length === 0 ? (
              <div className="text-center py-16 text-[#8E8E93] text-sm">
                No results found. Try different dates or a wider budget.
              </div>
            ) : (
              allListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onSelect={handleSelect}
                  selectable={selectMode}
                  selected={selectedIds.has(listing.id)}
                  onToggleSelect={toggleSelect}
                />
              ))
            )}
          </div>
        </>
      )}

      {/* Sticky batch send button */}
      {selectMode && selectedIds.size > 0 && (
        <div className="fixed bottom-24 left-0 right-0 px-4 z-40">
          <button
            type="button"
            disabled={batchLoading}
            onClick={handleBatchSend}
            className="w-full bg-black text-white font-semibold py-4 rounded-2xl text-sm shadow-lg disabled:opacity-50"
          >
            {batchLoading ? "Drafting messages..." : `Send ${selectedIds.size} Request${selectedIds.size > 1 ? "s" : ""} with AI`}
          </button>
        </div>
      )}

      {/* Finish button */}
      {sentCount > 0 && !showBatch && !selectedListing && !selectMode && (
        <div className="fixed bottom-24 left-0 right-0 px-4 z-40">
          <button
            type="button"
            onClick={() => setShowFinish(true)}
            className="w-full bg-black text-white font-semibold py-4 rounded-2xl text-sm shadow-lg"
          >
            Finish · {sentCount} message{sentCount > 1 ? "s" : ""} sent
          </button>
        </div>
      )}

      {/* Finish modal */}
      {showFinish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="bg-white rounded-3xl px-6 py-8 w-full max-w-sm text-center flex flex-col gap-4">
            <span className="text-4xl">🎉</span>
            <h2 className="text-black font-bold text-xl">You're all set!</h2>
            <p className="text-[#8E8E93] text-sm leading-relaxed">
              Please give your host{sentCount > 1 ? "s" : ""} <strong>24–48 hours</strong> to respond before reaching out again. We'll notify you when they reply.
            </p>
            <button
              type="button"
              onClick={() => { setShowFinish(false); navigate("/"); }}
              className="w-full bg-black text-white font-semibold py-4 rounded-2xl text-sm"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}

      {/* Single message preview */}
      {selectedListing && !showBatch && (
        <MessagePreview
          recipientName={selectedListing.name}
          message={drafting ? "Drafting message..." : draftedMsg}
          onEdit={setDraftedMsg}
          onSend={() => { setSentCount((n) => n + 1); setSelectedListing(null); }}
          onCancel={() => setSelectedListing(null)}
        />
      )}

      {/* Batch message preview */}
      {showBatch && batchDrafts.length > 0 && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/40">
          <div className="mt-auto bg-white rounded-t-3xl px-5 pt-6 pb-10">
            <div className="w-10 h-1 bg-[#E5E5EA] rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <p className="text-black font-bold text-base">Message {batchIndex + 1} of {batchDrafts.length}</p>
              <p className="text-[#8E8E93] text-xs">{batchDrafts[batchIndex].listing.name}</p>
            </div>
            <textarea
              rows={4}
              className="w-full border border-[#E5E5EA] rounded-2xl px-4 py-3 text-sm text-black resize-none focus:outline-none mb-4"
              value={batchDrafts[batchIndex].message}
              onChange={(e) => {
                const updated = [...batchDrafts];
                updated[batchIndex] = { ...updated[batchIndex], message: e.target.value };
                setBatchDrafts(updated);
              }}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (batchIndex < batchDrafts.length - 1) { setSentCount((n) => n + 1); setBatchIndex(batchIndex + 1); }
                  else { setSentCount((n) => n + batchDrafts.length); setShowBatch(false); setSelectMode(false); setSelectedIds(new Set()); }
                }}
                className="flex-1 bg-black text-white rounded-2xl py-4 text-sm font-semibold"
              >
                {batchIndex < batchDrafts.length - 1 ? "Send & Next →" : "Send All ✓"}
              </button>
              <button type="button" onClick={() => setShowBatch(false)} className="px-5 bg-[#F2F2F7] text-black rounded-2xl py-4 text-sm font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
