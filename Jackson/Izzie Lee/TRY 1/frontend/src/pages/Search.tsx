import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTripStore } from "../store/tripStore";
import { searchHousing } from "../lib/api";
import type { TripRequest, Listing, FallbackStep } from "../types";
import MapPicker from "../components/MapPicker";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "Washington DC", "West Virginia", "Wisconsin", "Wyoming",
];

const MAJOR_CITIES = [
  "Atlanta", "Austin", "Baltimore", "Boston", "Charlotte", "Chicago",
  "Cincinnati", "Cleveland", "Columbus", "Dallas", "Denver", "Detroit",
  "Houston", "Indianapolis", "Jacksonville", "Kansas City", "Las Vegas",
  "Los Angeles", "Louisville", "Memphis", "Miami", "Milwaukee",
  "Minneapolis", "Nashville", "New Orleans", "New York", "Oakland",
  "Oklahoma City", "Orlando", "Philadelphia", "Phoenix", "Pittsburgh",
  "Portland", "Raleigh", "Richmond", "Sacramento", "Salt Lake City",
  "San Antonio", "San Diego", "San Francisco", "San Jose", "Seattle",
  "St. Louis", "Tampa", "Tucson", "Washington DC",
];

const UNIVERSITIES = [
  "Arizona State University", "Auburn University", "Barnard College",
  "Bates College", "Boston College", "Boston University", "Bowdoin College",
  "Brown University", "Bucknell University", "Carnegie Mellon University",
  "Case Western Reserve University", "Clemson University", "Colby College",
  "Colgate University", "College of William & Mary", "Colorado State University",
  "Columbia University", "Connecticut College", "Cornell University",
  "Dartmouth College", "Davidson College", "Denison University",
  "DePauw University", "Dickinson College", "Drake University",
  "Drexel University", "Duke University", "Emory University",
  "Florida State University", "Fordham University", "Franklin & Marshall College",
  "Furman University", "George Washington University", "Georgetown University",
  "Georgia Tech", "Gonzaga University", "Hamilton College",
  "Hampton University", "Harvard University", "Harvey Mudd College",
  "Howard University", "Indiana University", "James Madison University",
  "Johns Hopkins University", "Lafayette College", "Lehigh University",
  "Loyola Marymount University", "Loyola University Chicago",
  "Macalester College", "Marquette University", "Massachusetts Institute of Technology",
  "Miami University", "Michigan State University", "Middlebury College",
  "Morehouse College", "Mount Holyoke College", "Muhlenberg College",
  "New York University", "Northeastern University", "Northwestern University",
  "Notre Dame", "Oberlin College", "Ohio State University",
  "Penn State", "Pepperdine University", "Princeton University",
  "Providence College", "Purdue University", "Reed College",
  "Rice University", "Rutgers University", "Santa Clara University",
  "Sarah Lawrence College", "Scripps College", "Skidmore College",
  "Smith College", "Spelman College", "Stanford University",
  "Syracuse University", "Temple University", "Trinity College",
  "Tufts University", "Tulane University", "UC Berkeley",
  "UC Davis", "UC Irvine", "UC San Diego",
  "UC Santa Barbara", "UCLA", "Union College",
  "University of Alabama", "University of Arizona",
  "University of Colorado Boulder", "University of Connecticut",
  "University of Delaware", "University of Florida",
  "University of Georgia", "University of Illinois",
  "University of Maryland", "University of Massachusetts Amherst",
  "University of Miami", "University of Michigan",
  "University of Minnesota", "University of New Hampshire",
  "University of North Carolina", "University of Notre Dame",
  "University of Pennsylvania", "University of Pittsburgh",
  "University of Rochester", "University of Southern California",
  "University of Texas at Austin", "University of Vermont",
  "University of Virginia", "University of Washington",
  "University of Wisconsin", "Vanderbilt University",
  "Vassar College", "Villanova University", "Virginia Tech",
  "Wake Forest University", "Washington University in St. Louis",
  "Wellesley College", "Wesleyan University", "Williams College",
  "Yale University",
];

const EVENT_OPTIONS = [
  "Homecoming",
  "Football game / tailgate",
  "Spring weekend / formal",
  "Greek life event",
  "Graduation",
  "Music festival",
  "Hackathon / conference",
  "Spring break",
  "Visiting friends",
  "Wedding",
  "Other",
];

function getMockResults(destination: string): Array<{ step: FallbackStep; results: Listing[] }> {
  return [
    {
      step: "direct-friends",
      results: [
        {
          id: "mock-1",
          name: "Alex Chen",
          location: destination,
          type: "friend",
          trustScore: 0.92,
          cost: 0,
          degree: 1,
          description: `Has a spare room — loves having guests visit ${destination}!`,
          available: true,
        },
        {
          id: "mock-2",
          name: "Maya Rodriguez",
          location: destination,
          type: "friend",
          trustScore: 0.85,
          cost: 0,
          degree: 1,
          description: `Lives near downtown ${destination}, couch is comfy!`,
          available: true,
        },
      ],
    },
    {
      step: "extended-network",
      results: [
        {
          id: "mock-3",
          name: "Jordan Kim",
          location: destination,
          type: "friend",
          trustScore: 0.6,
          cost: null,
          degree: 2,
          description: `Mutual friend through Instagram, open to splitting a place in ${destination}.`,
          available: true,
        },
      ],
    },
    {
      step: "open-web",
      results: [
        {
          id: "mock-4",
          name: "Cozy Studio Near Campus",
          location: destination,
          type: "airbnb",
          trustScore: 0.45,
          cost: 79,
          degree: null,
          description: "Clean, quiet studio. 5 min from downtown. Superhost.",
          available: true,
        },
        {
          id: "mock-5",
          name: "The Graduate Hotel",
          location: destination,
          type: "hotel",
          trustScore: 0.3,
          cost: 149,
          degree: null,
          description: "Boutique hotel popular with students and alumni.",
          available: true,
        },
      ],
    },
  ];
}

export default function Search() {
  const navigate = useNavigate();
  const { setRequest, addStepResult, setDone, saveTrip } = useTripStore();
  const [showMap, setShowMap] = useState(false);

  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [numPeople, setNumPeople] = useState("1");
  const [budget, setBudget] = useState("");
  const [goingToUni, setGoingToUni] = useState(false);
  const [university, setUniversity] = useState("");
  const [event, setEvent] = useState("");
  const [customEvent, setCustomEvent] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // City autocomplete
  const [cityOpen, setCityOpen] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);
  const filteredCities = city.length >= 1
    ? MAJOR_CITIES.filter((c) => c.toLowerCase().startsWith(city.toLowerCase())).slice(0, 5)
    : [];

  // University autocomplete
  const [uniOpen, setUniOpen] = useState(false);
  const uniRef = useRef<HTMLDivElement>(null);
  const filteredUnis = university.length >= 1
    ? UNIVERSITIES.filter((u) => u.toLowerCase().includes(university.toLowerCase())).slice(0, 5)
    : [];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setCityOpen(false);
      if (uniRef.current && !uniRef.current.contains(e.target as Node)) setUniOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const destinationParts = [city, state].filter(Boolean);
    const destination = destinationParts.join(", ");
    const notesParts = [
      goingToUni && university ? `University: ${university}` : null,
      event ? `Event: ${event === "Other" ? customEvent : event}` : null,
      notes || null,
    ].filter(Boolean);

    const req: TripRequest = {
      userId: "demo-user",
      destination,
      startDate,
      endDate,
      numPeople: Number(numPeople) || 1,
      budget: budget ? Number(budget) : undefined,
      notes: notesParts.length ? notesParts.join(" · ") : undefined,
    };

    setRequest(req);
    saveTrip({
      id: Date.now().toString(),
      destination,
      startDate,
      endDate,
      budget: budget ? Number(budget) : undefined,
      notes: notesParts.length ? notesParts.join(" · ") : undefined,
      status: "Searching",
    });
    navigate("/results");

    try {
      let gotResults = false;
      for await (const progress of searchHousing(req)) {
        if (progress.step === "done" || progress.error) {
          setDone();
        } else if (progress.results) {
          addStepResult({ step: progress.step, results: progress.results });
          gotResults = true;
        }
      }
      if (!gotResults) {
        for (const group of getMockResults(destination)) {
          addStepResult(group);
          await new Promise((r) => setTimeout(r, 600));
        }
        setDone();
      }
    } catch {
      for (const group of getMockResults(destination)) {
        addStepResult(group);
        await new Promise((r) => setTimeout(r, 700));
      }
      setDone();
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-28">
      {/* Header */}
      <div className="bg-white px-5 pt-14 pb-5 border-b border-[#E5E5EA]">
        <h1 className="text-black text-2xl font-bold">Find a Stay</h1>
        <p className="text-[#8E8E93] text-sm mt-0.5">AI searches friends, mutuals, and Airbnb</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-4 pt-4">

        {/* Destination */}
        <div className="flex items-center justify-between px-1">
          <p className="text-[#8E8E93] text-xs font-semibold uppercase tracking-wider">Destination</p>
          <button type="button" onClick={() => setShowMap(true)} className="text-xs text-black font-semibold flex items-center gap-1">
            🗺️ Pick on map
          </button>
        </div>
        {showMap && (
          <MapPicker
            initialCity={city}
            initialState={state}
            onSelect={(locationName) => {
              const parts = locationName.split(", ");
              setCity(parts[0] ?? locationName);
              setState(parts[1] ?? "");
            }}
            onClose={() => setShowMap(false)}
          />
        )}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-[#F2F2F7]">

          {/* City autocomplete */}
          <div ref={cityRef} className="relative px-4 py-3.5">
            <label className="text-[#8E8E93] text-xs font-medium block mb-1">City</label>
            <input
              required
              type="text"
              placeholder="Boston, Chicago, Austin..."
              className="w-full bg-transparent text-black placeholder-[#C7C7CC] text-sm focus:outline-none"
              value={city}
              onChange={(e) => { setCity(e.target.value); setCityOpen(true); }}
              onFocus={() => setCityOpen(true)}
            />
            {cityOpen && filteredCities.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-20 bg-white border border-[#E5E5EA] rounded-2xl shadow-lg overflow-hidden mt-1">
                {filteredCities.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); setCity(c); setCityOpen(false); }}
                    className="w-full text-left px-4 py-3 text-black text-sm hover:bg-[#F2F2F7] border-b border-[#F2F2F7] last:border-b-0"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* State dropdown */}
          <div className="px-4 py-3.5">
            <label className="text-[#8E8E93] text-xs font-medium block mb-1">State</label>
            <select
              required
              aria-label="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-transparent text-black text-sm focus:outline-none appearance-none"
            >
              <option value="" disabled>Select a state...</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dates */}
        <p className="text-[#8E8E93] text-xs font-semibold uppercase tracking-wider px-1">Dates</p>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-2 divide-x divide-[#F2F2F7]">
            <div className="px-4 py-3.5">
              <label className="text-[#8E8E93] text-xs font-medium block mb-1">Check in</label>
              <input
                required
                type="date"
                aria-label="Check in date"
                className="w-full bg-transparent text-black text-sm focus:outline-none"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="px-4 py-3.5">
              <label className="text-[#8E8E93] text-xs font-medium block mb-1">Check out</label>
              <input
                required
                type="date"
                aria-label="Check out date"
                className="w-full bg-transparent text-black text-sm focus:outline-none"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Trip details */}
        <p className="text-[#8E8E93] text-xs font-semibold uppercase tracking-wider px-1">Trip Details</p>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-[#F2F2F7]">

          {/* Going to a university? */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div>
              <p className="text-black text-sm font-medium">Going to a university?</p>
              <p className="text-[#8E8E93] text-xs mt-0.5">Find stays near campus</p>
            </div>
            <button
              type="button"
              onClick={() => { setGoingToUni(!goingToUni); if (goingToUni) setUniversity(""); }}
              className={`relative w-12 h-7 rounded-full transition-colors ${goingToUni ? "bg-black" : "bg-[#E5E5EA]"}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${goingToUni ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          {/* University autocomplete — shown when toggle is on */}
          {goingToUni && (
            <div ref={uniRef} className="relative px-4 py-3.5">
              <label className="text-[#8E8E93] text-xs font-medium block mb-1">Which university?</label>
              <input
                type="text"
                placeholder="Search university..."
                value={university}
                onChange={(e) => { setUniversity(e.target.value); setUniOpen(true); }}
                onFocus={() => setUniOpen(true)}
                className="w-full bg-transparent text-black placeholder-[#C7C7CC] text-sm focus:outline-none"
              />
              {uniOpen && filteredUnis.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-20 bg-white border border-[#E5E5EA] rounded-2xl shadow-lg overflow-hidden mt-1">
                  {filteredUnis.map((u) => (
                    <button
                      key={u}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); setUniversity(u); setUniOpen(false); }}
                      className="w-full text-left px-4 py-3 text-black text-sm hover:bg-[#F2F2F7] border-b border-[#F2F2F7] last:border-b-0"
                    >
                      {u}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Event dropdown */}
          <div className="px-4 py-3.5">
            <label className="text-[#8E8E93] text-xs font-medium block mb-1">What's the occasion?</label>
            <select
              aria-label="Event"
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              className="w-full bg-transparent text-black text-sm focus:outline-none appearance-none"
            >
              <option value="">Just visiting / no event</option>
              {EVENT_OPTIONS.map((ev) => (
                <option key={ev} value={ev}>{ev}</option>
              ))}
            </select>
          </div>

          {/* Custom event input if "Other" */}
          {event === "Other" && (
            <div className="px-4 py-3.5">
              <label className="text-[#8E8E93] text-xs font-medium block mb-1">Describe the event</label>
              <input
                type="text"
                placeholder="e.g. Alumni reunion, art show..."
                value={customEvent}
                onChange={(e) => setCustomEvent(e.target.value)}
                className="w-full bg-transparent text-black placeholder-[#C7C7CC] text-sm focus:outline-none"
              />
            </div>
          )}

          {/* Number of people */}
          <div className="px-4 py-3.5">
            <label className="text-[#8E8E93] text-xs font-medium block mb-1">Number of people</label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setNumPeople((n) => String(Math.max(1, Number(n) - 1)))}
                className="w-8 h-8 rounded-full bg-[#F2F2F7] text-black font-bold text-lg flex items-center justify-center">−</button>
              <span className="text-black text-sm font-semibold w-4 text-center">{numPeople}</span>
              <button type="button" onClick={() => setNumPeople((n) => String(Math.min(20, Number(n) + 1)))}
                className="w-8 h-8 rounded-full bg-[#F2F2F7] text-black font-bold text-lg flex items-center justify-center">+</button>
            </div>
          </div>

          {/* Budget */}
          <div className="px-4 py-3.5">
            <label className="text-[#8E8E93] text-xs font-medium block mb-1">Max budget / night</label>
            <input
              type="number"
              placeholder="Any (leave blank)"
              className="w-full bg-transparent text-black placeholder-[#C7C7CC] text-sm focus:outline-none"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="px-4 py-3.5">
            <label className="text-[#8E8E93] text-xs font-medium block mb-1">Any other notes</label>
            <textarea
              placeholder="Pet-friendly, near campus, private room..."
              rows={2}
              className="w-full bg-transparent text-black placeholder-[#C7C7CC] text-sm resize-none focus:outline-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white font-semibold py-4 rounded-2xl disabled:opacity-30 text-sm mt-1"
        >
          {loading ? "Searching..." : "Find My Stay"}
        </button>
      </form>
    </div>
  );
}
