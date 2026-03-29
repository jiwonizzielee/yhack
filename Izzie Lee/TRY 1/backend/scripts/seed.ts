import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// ── Demo user ── hardcoded so frontend can reference it
export const DEMO_USER_ID = "a1b2c3d4-0000-0000-0000-000000000001";

const users = [
  // ── The logged-in demo user ──────────────────────────────
  {
    id: DEMO_USER_ID,
    full_name: "Alex Chen",
    email: "alex.chen@nyu.edu",
    university: "New York University",
    location: "New York, NY",
    year: "Junior",
    bio: "CS major at NYU, love traveling and meeting new people.",
  },

  // ── 1st-degree friends (direct connections) ─────────────
  {
    id: "b100-0000-0000-0000-000000000001",
    full_name: "Sarah Kim",
    email: "sarah.kim@columbia.edu",
    university: "Columbia University",
    location: "New York, NY",
    year: "Senior",
    bio: "Pre-med in Morningside Heights. Always happy to host a friend!",
  },
  {
    id: "b100-0000-0000-0000-000000000002",
    full_name: "Jake Martinez",
    email: "jake.m@ucla.edu",
    university: "UCLA",
    location: "Los Angeles, CA",
    year: "Junior",
    bio: "Film student in Westwood. Couch is yours.",
  },
  {
    id: "b100-0000-0000-0000-000000000003",
    full_name: "Maya Johnson",
    email: "maya.j@northwestern.edu",
    university: "Northwestern University",
    location: "Chicago, IL",
    year: "Sophomore",
    bio: "Journalism major. Love having visitors from back home!",
  },
  {
    id: "b100-0000-0000-0000-000000000004",
    full_name: "Priya Patel",
    email: "priya.p@utexas.edu",
    university: "University of Texas at Austin",
    location: "Austin, TX",
    year: "Senior",
    bio: "Business major. Austin is amazing — come visit!",
  },
  {
    id: "b100-0000-0000-0000-000000000005",
    full_name: "Tyler Brooks",
    email: "tyler.b@miami.edu",
    university: "University of Miami",
    location: "Miami, FL",
    year: "Junior",
    bio: "Marine biology. Have a couch in Coral Gables, pets welcome.",
  },

  // ── 2nd-degree (friends of friends, permission granted) ──
  {
    id: "c100-0000-0000-0000-000000000001",
    full_name: "Marcus Williams",
    email: "marcus.w@nyu.edu",
    university: "New York University",
    location: "New York, NY",
    year: "Senior",
    bio: "Finance major in the East Village. Friend of Sarah Kim.",
  },
  {
    id: "c100-0000-0000-0000-000000000002",
    full_name: "Chloe Zhang",
    email: "chloe.z@usc.edu",
    university: "USC",
    location: "Los Angeles, CA",
    year: "Junior",
    bio: "Architecture student near downtown LA. Jake's roommate.",
  },
  {
    id: "c100-0000-0000-0000-000000000003",
    full_name: "Devon Park",
    email: "devon.p@uchicago.edu",
    university: "University of Chicago",
    location: "Chicago, IL",
    year: "Sophomore",
    bio: "Economics major in Hyde Park. Maya's study partner.",
  },
  {
    id: "c100-0000-0000-0000-000000000004",
    full_name: "Aisha Thompson",
    email: "aisha.t@bu.edu",
    university: "Boston University",
    location: "Boston, MA",
    year: "Junior",
    bio: "Comm Ave apartment, big living room. Always has extra space.",
  },

  // ── 3rd-degree (extended, permission granted) ────────────
  {
    id: "d100-0000-0000-0000-000000000001",
    full_name: "Zoe Chen",
    email: "zoe.c@fordham.edu",
    university: "Fordham University",
    location: "New York, NY",
    year: "Junior",
    bio: "Psych major in the Bronx. Loves hosting people from out of town.",
  },
  {
    id: "d100-0000-0000-0000-000000000002",
    full_name: "Sam Rivera",
    email: "sam.r@bu.edu",
    university: "Boston University",
    location: "Boston, MA",
    year: "Senior",
    bio: "Music major. Has a spare room near Fenway.",
  },

  // ── Co-travelers (looking to split costs) ────────────────
  {
    id: "e100-0000-0000-0000-000000000001",
    full_name: "Jordan Lee",
    email: "jordan.l@cornell.edu",
    university: "Cornell University",
    location: "Ithaca, NY",
    year: "Junior",
    bio: "Going to NYC for spring break, looking to split an Airbnb.",
  },
  {
    id: "e100-0000-0000-0000-000000000002",
    full_name: "Riley Chen",
    email: "riley.c@ucsd.edu",
    university: "UC San Diego",
    location: "San Diego, CA",
    year: "Sophomore",
    bio: "Heading to LA for a concert. Need someone to split costs with.",
  },
  {
    id: "e100-0000-0000-0000-000000000003",
    full_name: "Cameron Park",
    email: "cam.p@uchicago.edu",
    university: "University of Chicago",
    location: "Chicago, IL",
    year: "Senior",
    bio: "Road-tripping to Chicago for Lollapalooza. Open to sharing.",
  },
];

const connections = [
  // ── Alex's direct friends (1st degree) ──
  { user_id: DEMO_USER_ID, friend_id: "b100-0000-0000-0000-000000000001", degree: 1, mutual_count: 3, permission_granted: true },
  { user_id: DEMO_USER_ID, friend_id: "b100-0000-0000-0000-000000000002", degree: 1, mutual_count: 2, permission_granted: true },
  { user_id: DEMO_USER_ID, friend_id: "b100-0000-0000-0000-000000000003", degree: 1, mutual_count: 1, permission_granted: true },
  { user_id: DEMO_USER_ID, friend_id: "b100-0000-0000-0000-000000000004", degree: 1, mutual_count: 2, permission_granted: true },
  { user_id: DEMO_USER_ID, friend_id: "b100-0000-0000-0000-000000000005", degree: 1, mutual_count: 1, permission_granted: true },

  // ── Alex's 2nd-degree connections ──
  { user_id: DEMO_USER_ID, friend_id: "c100-0000-0000-0000-000000000001", degree: 2, mutual_count: 1, permission_granted: true },
  { user_id: DEMO_USER_ID, friend_id: "c100-0000-0000-0000-000000000002", degree: 2, mutual_count: 1, permission_granted: true },
  { user_id: DEMO_USER_ID, friend_id: "c100-0000-0000-0000-000000000003", degree: 2, mutual_count: 1, permission_granted: true },
  { user_id: DEMO_USER_ID, friend_id: "c100-0000-0000-0000-000000000004", degree: 2, mutual_count: 1, permission_granted: true },

  // ── Alex's 3rd-degree connections ──
  { user_id: DEMO_USER_ID, friend_id: "d100-0000-0000-0000-000000000001", degree: 3, mutual_count: 0, permission_granted: true },
  { user_id: DEMO_USER_ID, friend_id: "d100-0000-0000-0000-000000000002", degree: 3, mutual_count: 0, permission_granted: true },
];

// Trips for co-traveler matching — destination must include the city name
const trips = [
  {
    user_id: "e100-0000-0000-0000-000000000001",
    destination: "New York, NY",
    start_date: "2026-04-10",
    end_date: "2026-04-14",
    looking_to_split: true,
  },
  {
    user_id: "e100-0000-0000-0000-000000000002",
    destination: "Los Angeles, CA",
    start_date: "2026-04-05",
    end_date: "2026-04-08",
    looking_to_split: true,
  },
  {
    user_id: "e100-0000-0000-0000-000000000003",
    destination: "Chicago, IL",
    start_date: "2026-07-31",
    end_date: "2026-08-04",
    looking_to_split: true,
  },
];

async function seed() {
  console.log("Seeding Supabase...\n");

  const { error: usersError } = await supabase
    .from("users")
    .upsert(users, { onConflict: "id" });
  if (usersError) { console.error("Users failed:", usersError.message); return; }
  console.log(`Inserted ${users.length} users`);

  const { error: connError } = await supabase
    .from("connections")
    .upsert(connections, { onConflict: "user_id,friend_id" });
  if (connError) { console.error("Connections failed:", connError.message); return; }
  console.log(`Inserted ${connections.length} connections`);

  const { error: tripsError } = await supabase
    .from("trips")
    .upsert(trips, { onConflict: "user_id,destination" });
  if (tripsError) { console.error("Trips failed:", tripsError.message); return; }
  console.log(`Inserted ${trips.length} trips`);

  console.log("\nSeed complete!");
  console.log(`\nDemo user ID: ${DEMO_USER_ID}`);
  console.log("Set userId to this in the frontend Search form.");
}

seed().catch(console.error);
