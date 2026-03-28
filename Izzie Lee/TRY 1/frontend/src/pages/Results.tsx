import { useState } from "react";
import { useTripStore } from "../store/tripStore";
import { FallbackProgress } from "../components/FallbackProgress";
import { ListingCard } from "../components/ListingCard";
import { MessagePreview } from "../components/MessagePreview";
import { draftMessage } from "../lib/api";
import type { FallbackStep, Listing } from "../types";

const STEP_LABELS: Record<FallbackStep, string> = {
  "direct-friends": "Direct Friends",
  "extended-network": "Friends of Friends",
  "co-travelers": "Co-Travelers",
  "open-web": "Airbnb & Hotels",
  done: "Done",
};

export default function Results() {
  const { stepResults, activeStep, isDone, currentRequest } = useTripStore();

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

      <div className="flex flex-col gap-1 px-4 mt-4">
        {stepResults.map((group) => (
          <div key={group.step} className="mb-3">
            <p className="text-[#8E8E93] text-xs font-semibold uppercase tracking-wider mb-2 px-1">
              {STEP_LABELS[group.step]}
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
