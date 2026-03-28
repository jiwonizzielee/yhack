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
    const msg = await draftMessage(listing, currentRequest);
    setDraftedMsg(msg);
    setDrafting(false);
  }

  const completedSteps = stepResults.map((s) => s.step);
  const allListings = stepResults.flatMap((s) => s.results);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">
          {isDone ? "Results Ready" : "Agent is searching..."}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {currentRequest?.destination} · {currentRequest?.startDate} – {currentRequest?.endDate}
        </p>
      </div>

      <div className="bg-white mx-4 mt-4 rounded-2xl shadow-sm">
        <FallbackProgress completedSteps={completedSteps} activeStep={activeStep} />
      </div>

      <div className="flex flex-col gap-4 p-4 mt-2">
        {stepResults.map((group) => (
          <div key={group.step}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 px-1">
              {STEP_LABELS[group.step]}
            </h2>
            {group.results.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onSelect={handleSelect}
              />
            ))}
          </div>
        ))}

        {!isDone && allListings.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm">Running all searches in parallel...</p>
          </div>
        )}

        {isDone && allListings.length === 0 && (
          <div className="text-center py-16 text-gray-500 text-sm">
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