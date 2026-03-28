import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const STEPS = ["photo", "info", "socials"] as const;
type Step = (typeof STEPS)[number];

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

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, updateProfile, setAvatar, connectSocial } = useAuthStore();
  const [step, setStep] = useState<Step>("photo");
  const [location, setLocation] = useState(user?.location ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [university, setUniversity] = useState(user?.university ?? "");
  const [year, setYear] = useState(user?.year ?? "");
  const [gender, setGender] = useState(user?.gender ?? "");
  const [igUsername, setIgUsername] = useState("");
  const [snapUsername, setSnapUsername] = useState("");
  const [connecting, setConnecting] = useState<"instagram" | "snapchat" | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uniOpen, setUniOpen] = useState(false);
  const uniRef = useRef<HTMLDivElement>(null);
  const filteredUnis = university.length >= 1
    ? UNIVERSITIES.filter((u) => u.toLowerCase().includes(university.toLowerCase())).slice(0, 6)
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (uniRef.current && !uniRef.current.contains(e.target as Node)) {
        setUniOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar(URL.createObjectURL(file));
  }

  async function handleConnectIG() {
    if (!igUsername.trim()) return;
    setConnecting("instagram");
    await new Promise((r) => setTimeout(r, 1200));
    connectSocial({ platform: "instagram", username: igUsername.trim(), connectedAt: new Date().toISOString(), mutualCount: Math.floor(Math.random() * 24) + 3 });
    setConnecting(null);
  }

  async function handleConnectSnap() {
    if (!snapUsername.trim()) return;
    setConnecting("snapchat");
    await new Promise((r) => setTimeout(r, 1200));
    connectSocial({ platform: "snapchat", username: snapUsername.trim(), connectedAt: new Date().toISOString(), mutualCount: Math.floor(Math.random() * 15) + 2 });
    setConnecting(null);
  }

  function handleNext() {
    if (step === "photo") setStep("info");
    else if (step === "info") { updateProfile({ location, bio, university, year, gender }); setStep("socials"); }
    else navigate("/");
  }

  const stepIndex = STEPS.indexOf(step);

  return (
    <div className="min-h-screen bg-white flex flex-col px-5 pt-12 pb-8">
      {/* Progress dots */}
      <div className="flex gap-1.5 mb-8">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1 rounded-full transition-all ${i <= stepIndex ? "bg-black flex-[2]" : "bg-[#E5E5EA] flex-1"}`}
          />
        ))}
      </div>

      {step === "photo" && (
        <div className="flex flex-col flex-1 items-center">
          <h2 className="text-black text-2xl font-bold mb-1">Add your photo</h2>
          <p className="text-[#8E8E93] text-sm mb-10 text-center">Hosts trust people they can see.</p>
          <button
            onClick={() => fileRef.current?.click()}
            className="relative w-32 h-32 rounded-full bg-[#F2F2F7] border-2 border-dashed border-[#C7C7CC] flex items-center justify-center overflow-hidden"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="You" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#8E8E93] text-xs font-medium">Tap to upload</span>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handlePhotoChange} />
          {user?.avatarUrl && <p className="text-black text-sm mt-4 font-medium">Looks great!</p>}
        </div>
      )}

      {step === "info" && (
        <div className="flex flex-col flex-1">
          <h2 className="text-black text-2xl font-bold mb-1">About you</h2>
          <p className="text-[#8E8E93] text-sm mb-6">Helps hosts know who you are</p>

          <div className="bg-[#F2F2F7] rounded-2xl overflow-hidden divide-y divide-white">
            <div ref={uniRef} className="relative px-4 py-3.5">
              <label className="text-[#8E8E93] text-xs font-medium block mb-1">University</label>
              <input
                type="text"
                placeholder="Search your university..."
                value={university}
                onChange={(e) => { setUniversity(e.target.value); setUniOpen(true); }}
                onFocus={() => setUniOpen(true)}
                className="w-full bg-transparent text-black placeholder-[#C7C7CC] text-sm focus:outline-none"
              />
              {uniOpen && filteredUnis.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-20 bg-white border border-[#E5E5EA] rounded-2xl shadow-lg overflow-hidden mt-1">
                  {filteredUnis.map((uni) => (
                    <button
                      key={uni}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); setUniversity(uni); setUniOpen(false); }}
                      className="w-full text-left px-4 py-3 text-black text-sm hover:bg-[#F2F2F7] transition-colors border-b border-[#F2F2F7] last:border-b-0"
                    >
                      {uni}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 divide-x divide-white">
              <div className="px-4 py-3.5">
                <label className="text-[#8E8E93] text-xs font-medium block mb-1">Year</label>
                <select
                  aria-label="Year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-transparent text-black text-sm focus:outline-none appearance-none"
                >
                  <option value="" disabled>Select</option>
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Grad">Grad Student</option>
                </select>
              </div>
              <div className="px-4 py-3.5">
                <label className="text-[#8E8E93] text-xs font-medium block mb-1">Gender</label>
                <select
                  aria-label="Gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-transparent text-black text-sm focus:outline-none appearance-none"
                >
                  <option value="" disabled>Select</option>
                  <option value="Man">Man</option>
                  <option value="Woman">Woman</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="px-4 py-3.5">
              <label className="text-[#8E8E93] text-xs font-medium block mb-1">Your city</label>
              <input
                type="text"
                placeholder="New York, NY"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-black placeholder-[#C7C7CC] text-sm focus:outline-none"
              />
            </div>

            <div className="px-4 py-3.5">
              <label className="text-[#8E8E93] text-xs font-medium block mb-1">Short bio</label>
              <textarea
                placeholder="CS student @ UCLA, into music + travel"
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-transparent text-black placeholder-[#C7C7CC] text-sm focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {step === "socials" && (
        <div className="flex flex-col flex-1">
          <h2 className="text-black text-2xl font-bold mb-1">Connect socials</h2>
          <p className="text-[#8E8E93] text-sm mb-6">Find trusted stays through mutual friends</p>

          <div className="flex flex-col gap-3">
            {/* Instagram */}
            <div className="bg-[#F2F2F7] rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">IG</span>
                </div>
                <div className="flex-1">
                  <p className="text-black font-semibold text-sm">Instagram</p>
                  <p className="text-[#8E8E93] text-xs">Find mutuals at your destination</p>
                </div>
                {user?.socials.find((s) => s.platform === "instagram") && (
                  <span className="text-xs text-black font-medium">Connected</span>
                )}
              </div>
              {user?.socials.find((s) => s.platform === "instagram") ? (
                <p className="text-[#8E8E93] text-xs">
                  @{user.socials.find((s) => s.platform === "instagram")!.username} · {user.socials.find((s) => s.platform === "instagram")!.mutualCount} mutuals
                </p>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="@username"
                    value={igUsername}
                    onChange={(e) => setIgUsername(e.target.value)}
                    className="flex-1 bg-white rounded-xl px-3 py-2.5 text-black placeholder-[#C7C7CC] text-sm focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleConnectIG}
                    disabled={connecting === "instagram"}
                    className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-30"
                  >
                    {connecting === "instagram" ? "..." : "Link"}
                  </button>
                </div>
              )}
            </div>

            {/* Snapchat */}
            <div className="bg-[#F2F2F7] rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">SC</span>
                </div>
                <div className="flex-1">
                  <p className="text-black font-semibold text-sm">Snapchat</p>
                  <p className="text-[#8E8E93] text-xs">See where your Snap friends are</p>
                </div>
                {user?.socials.find((s) => s.platform === "snapchat") && (
                  <span className="text-xs text-black font-medium">Connected</span>
                )}
              </div>
              {user?.socials.find((s) => s.platform === "snapchat") ? (
                <p className="text-[#8E8E93] text-xs">
                  @{user.socials.find((s) => s.platform === "snapchat")!.username} · {user.socials.find((s) => s.platform === "snapchat")!.mutualCount} mutuals
                </p>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="@username"
                    value={snapUsername}
                    onChange={(e) => setSnapUsername(e.target.value)}
                    className="flex-1 bg-white rounded-xl px-3 py-2.5 text-black placeholder-[#C7C7CC] text-sm focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleConnectSnap}
                    disabled={connecting === "snapchat"}
                    className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-30"
                  >
                    {connecting === "snapchat" ? "..." : "Link"}
                  </button>
                </div>
              )}
            </div>

            <button type="button" onClick={() => navigate("/")} className="text-[#8E8E93] text-sm text-center mt-2">
              Skip for now
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleNext}
        className="w-full bg-black text-white font-semibold py-4 rounded-2xl mt-6 text-sm"
      >
        {step === "socials" ? "Let's go" : "Continue"}
      </button>
    </div>
  );
}
