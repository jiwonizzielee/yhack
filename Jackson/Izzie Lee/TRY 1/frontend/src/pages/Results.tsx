import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTripStore } from "../store/tripStore";
import { FallbackProgress } from "../components/FallbackProgress";
import { ListingCard } from "../components/ListingCard";
import { MessagePreview } from "../components/MessagePreview";
import { draftMessage } from "../lib/api";
import type { FallbackStep, Listing } from "../types";

const STEP_LABELS: Record<FallbackStep, string> = {
  "direct-friends": "Step 1: Direct Friends",
  "extended-network": "Step 2: Friends of Friends",
  "co-travelers": "Step 3: Co-Travelers (split together)",
  "open-web": "Step 4: Airbnb & Hotels",
  done: "Done",
};

const STEP_EMPTY: Record<FallbackStep, string> = {
  "direct-friends": "No direct friends found at this destination → moving on",
  "extended-network": "No friends-of-friends found → moving on",
  "co-travelers": "No co-travelers found → moving on",
  "open-web": "No listings found",
  done: "",
};

const ALL_STEPS: FallbackStep[] = ["direct-friends", "extended-network", "co-travelers", "open-web"];

export default function Results() {
  const navigate = useNavigate();
  const { stepResults, activeStep, isDone, currentRequest } = useTripStore();

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

  const completedSteps = stepResults.map((s) => s.step);
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
          message: `Hey ${listing.name}! I'm planning a trip to ${currentRequest.destination} from ${currentRequest.startDate} to ${currentRequest.endDate}. Would you be open to hosting me? Would love to connect!`,
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
      <div className="bg-white px-5 pt-14 pb-4 border-b border-[#E5E5EA]">
        <h1 className="text-black text-2xl font-bold">
          {isDone ? "Results" : "Searching..."}
        </h1>
        <p className="text-[#8E8E93] text-sm mt-0.5">
          {currentRequest?.destination}
          {currentRequest?.startDate ? ` · ${currentRequest.startDate} – ${currentRequest.endDate}` : ""}
          {currentRequest?.numPeople && currentRequest.numPeople > 1 ? ` · ${currentRequest.numPeople} people` : ""}
        </p>
      </div>

      <div className="bg-white mx-4 mt-4 rounded-2xl shadow-sm overflow-hidden">
        <FallbackProgress completedSteps={completedSteps} activeStep={activeStep} stepResults={stepResults} />
      </div>

      {/* Batch select toggle */}
      {isDone && allListings.length > 0 && (
        <div className="mx-4 mt-3 flex items-center justify-between">
          <p className="text-[#8E8E93] text-xs">
            {selectMode ? `${selectedIds.size} selected` : "Select multiple to send all at once"}
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

      <div className="flex flex-col gap-1 px-4 mt-3">
        {ALL_STEPS.map((step) => {
          const group = stepResults.find((s) => s.step === step);
          const isSearching = !isDone && group === undefined && stepResults.length < ALL_STEPS.indexOf(step) + 1;

          if (group === undefined && !isSearching) return null;

          return (
            <div key={step} className="mb-4">
              <p className="text-[#8E8E93] text-xs font-semibold uppercase tracking-wider mb-2 px-1">
                {STEP_LABELS[step]}
              </p>
              {group === undefined ? (
                <div className="flex items-center gap-2 px-1 py-2">
                  <div className="w-4 h-4 border-2 border-[#E5E5EA] border-t-black rounded-full animate-spin" />
                  <span className="text-[#8E8E93] text-sm">Searching...</span>
                </div>
              ) : group.results.length === 0 ? (
                <p className="text-[#8E8E93] text-sm px-1 py-2 italic">{STEP_EMPTY[step]}</p>
              ) : (
                group.results.map((listing) => (
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
          );
        })}

        {!isDone && stepResults.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="w-10 h-10 border-2 border-[#E5E5EA] border-t-black rounded-full animate-spin" />
            <p className="text-[#8E8E93] text-sm">Starting search...</p>
          </div>
        )}
      </div>

      {/* Sticky batch send button */}
      {selectMode && selectedIds.size > 0 && (
        <div className="fixed bottom-24 left-0 right-0 px-4 z-40">
          <button
            type="button"
            disabled={batchLoading}
            onClick={handleBatchSend}
            className="w-full bg-black text-white font-semibold py-4 rounded-2xl text-sm shadow-lg disabled:opacity-50"
          >
            {batchLoading
              ? "Drafting messages..."
              : `Send ${selectedIds.size} Request${selectedIds.size > 1 ? "s" : ""} with AI`}
          </button>
        </div>
      )}

      {/* Single message preview */}
      {/* Finish button — shown once at least one message sent */}
      {sentCount > 0 && !showBatch && !selectedListing && (
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

      {/* Finish confirmation modal */}
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

      {selectedListing && !showBatch && (
        <MessagePreview
          recipientName={selectedListing.name}
          message={drafting ? "Drafting message..." : draftedMsg}
          onEdit={setDraftedMsg}
          onSend={() => {
            setSentCount((n) => n + 1);
            setSelectedListing(null);
          }}
          onCancel={() => setSelectedListing(null)}
        />
      )}

      {/* Batch message preview — step through each */}
      {showBatch && batchDrafts.length > 0 && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/40">
          <div className="mt-auto bg-white rounded-t-3xl px-5 pt-6 pb-10">
            <div className="w-10 h-1 bg-[#E5E5EA] rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <p className="text-black font-bold text-base">
                Message {batchIndex + 1} of {batchDrafts.length}
              </p>
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
                  if (batchIndex < batchDrafts.length - 1) {
                    setSentCount((n) => n + 1);
                    setBatchIndex(batchIndex + 1);
                  } else {
                    setSentCount((n) => n + batchDrafts.length);
                    setShowBatch(false);
                    setSelectMode(false);
                    setSelectedIds(new Set());
                  }
                }}
                className="flex-1 bg-black text-white rounded-2xl py-4 text-sm font-semibold"
              >
                {batchIndex < batchDrafts.length - 1 ? "Send & Next →" : "Send All ✓"}
              </button>
              <button
                type="button"
                onClick={() => { setShowBatch(false); }}
                className="px-5 bg-[#F2F2F7] text-black rounded-2xl py-4 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
