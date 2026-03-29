import { useState } from "react";
import { useTripStore } from "../store/tripStore";
import { FallbackProgress } from "../components/FallbackProgress";
import { ListingCard } from "../components/ListingCard";
import { MessagePreview } from "../components/MessagePreview";
import { draftMessage } from "../lib/api";
import type { FallbackStep, Listing } from "../types";

const STEP_LABELS: Record<Exclude<FallbackStep, "agent-summary" | "done">, string> = {
  "direct-friends": "Direct Friends",
  "extended-network": "Friends of Friends",
  "co-travelers": "Co-Travelers",
  "open-web": "Airbnb & Hotels",
};

const CONFIDENCE_COLORS = {
  high: "bg-green-50 border-green-200 text-green-800",
  medium: "bg-yellow-50 border-yellow-200 text-yellow-800",
  low: "bg-red-50 border-red-200 text-red-800",
};

export default function Results() {
  const { stepResults, activeStep, isDone, currentRequest, agentSummary } = useTripStore();

  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [draftedMsg, setDraftedMsg] = useState("");
  const [drafting, setDrafting] = useState(false);

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

  const completedSteps = stepResults.map((s) => s.step);
  const allListings = stepResults.flatMap((s) => s.results);

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col pb-24">
      <div className="bg-white px-5 pt-14 pb-4 border-b border-[#E5E5EA]">
        <h1 className="text-black text-2xl font-bold">
          {isDone ? "Results" : "Searching..."}
        </h1>
        <p className="text-[#8E8E93] text-sm mt-0.5">
          {currentRequest?.destination}
          {currentRequest?.startDate ? ` · ${currentRequest.startDate} – ${currentRequest.endDate}` : ""}
        </p>
      </div>

      <div className="bg-white mx-4 mt-4 rounded-2xl shadow-sm overflow-hidden">
        <FallbackProgress completedSteps={completedSteps} activeStep={activeStep} />
      </div>

      {/* AI Agent Summary Card */}
      {agentSummary && (
        <div className="mx-4 mt-4 rounded-2xl bg-black text-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">AI</div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">AI Recommendation</p>
            <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CONFIDENCE_COLORS[agentSummary.confidence]}`}>
              {agentSummary.confidence} confidence
            </span>
          </div>

          {agentSummary.bestOptionName && (
            <p className="text-white font-semibold text-base mb-1">
              Best pick: {agentSummary.bestOptionName}
            </p>
          )}
          <p className="text-white/80 text-sm leading-relaxed mb-3">
            {agentSummary.reasoning}
          </p>

          <div className="border-t border-white/10 pt-3">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Next Steps</p>
            <ol className="flex flex-col gap-1.5">
              {agentSummary.actionSteps.map((step, i) => (
                <li key={i} className="flex gap-2 text-sm text-white/80">
                  <span className="text-white/40 shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Listings by step */}
      <div className="flex flex-col gap-1 px-4 mt-4">
        {stepResults.map((group) => (
          <div key={group.step} className="mb-3">
            <p className="text-[#8E8E93] text-xs font-semibold uppercase tracking-wider mb-2 px-1">
              {STEP_LABELS[group.step as keyof typeof STEP_LABELS] ?? group.step}
            </p>
            {group.results.map((listing) => (
              <ListingCard key={listing.id} listing={listing} onSelect={handleSelect} />
            ))}
          </div>
        ))}

        {!isDone && allListings.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="w-10 h-10 border-2 border-[#E5E5EA] border-t-black rounded-full animate-spin" />
            <p className="text-[#8E8E93] text-sm">Running all searches...</p>
          </div>
        )}

        {isDone && allListings.length === 0 && (
          <div className="text-center py-16 text-[#8E8E93] text-sm">
            No results found. Try different dates or a wider budget.
          </div>
        )}
      </div>

      {selectedListing && (
        <MessagePreview
          recipientName={selectedListing.name}
          message={drafting ? "Drafting message..." : draftedMsg}
          onEdit={setDraftedMsg}
          onSend={() => {
            alert(`Message sent to ${selectedListing.name}!`);
            setSelectedListing(null);
          }}
          onCancel={() => setSelectedListing(null)}
        />
      )}
    </div>
  );
}
