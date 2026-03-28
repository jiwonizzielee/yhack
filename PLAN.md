# NestFinder — Autonomous Housing & Lodging Agent

## Vision
A mobile-first React web app powered by an AI agent that finds you a place to stay by
leveraging your social graph first, then intelligently falling back to broader networks
and open-web listings. The agent acts on your behalf: drafts messages, requests permissions,
and books — you just approve.

---

## Fallback Chain (Core Logic)

```
Step 1: Direct friends at destination
         ↓ (no one available / all decline)
Step 2: Friends-of-friends (2nd/3rd degree) — request permission to reveal
         ↓ (still nothing)
Step 3: "Anyone going to the same event?"
         → match with other travelers → split Airbnb/hotel together
         ↓ (still nothing)
Step 4: Show cheapest Airbnb / hotels nearby
```

---

## User Flow (from diagram)

1. **Sign Up** — Auth (phone number or Apple/Google SSO)
2. **Onboarding** — Location, availability, hosting preferences (couch, spare room, etc.)
3. **Build Your Network** — Import phone contacts + invite via Instagram DM / iMessage link
4. **Home Screen**
   - AI chat bar at top
   - Upcoming trips
   - Pending requests + notifications
5. **"Where's your next stop?"** — Destination · Dates · Any specs (budget, vibe, amenities)
6. **AI Agent runs in parallel across 3 sources**
   - Personal network (1st-degree at destination)
   - Friends' networks (2nd/3rd-degree, permission-gated)
   - Open web (Airbnb, Facebook Groups, Housing offices, Reddit)
7. **AI compiles + ranks results** — by trust score · cost · convenience
8. **You choose → Agent acts** — sends AI-drafted message / Airbnb link / permission request

---

## Tech Stack

### Frontend (Mobile-First Web)
- **Framework**: React + Vite
- **Routing**: React Router v6
- **State**: Zustand
- **UI**: Tailwind CSS (mobile-first breakpoints) + shadcn/ui
- **Realtime updates**: Supabase Realtime (agent progress streaming)

### Backend / AI Agent
- **Runtime**: Node.js (TypeScript) — Express API server
- **AI Orchestration**: Anthropic Claude API (`claude-sonnet-4-6`)
  - Parallel tool calls for Steps 1–4 fallback chain
  - Claude drafts outreach messages on user's behalf
- **Agent Tools**:
  - `search_personal_network(destination, dates)` — query user's 1st-degree contacts
  - `search_extended_network(destination, dates, user_id)` — 2nd/3rd degree, permission-gated
  - `match_travelers(destination, dates, event?)` — find co-travelers to split costs
  - `search_open_web(destination, dates, budget)` — Airbnb API + Reddit + FB groups
  - `draft_message(host, context)` — Claude writes personalized outreach
  - `send_message(recipient, message, channel)` — in-app / SMS via Twilio

### Database
- **Supabase** (Postgres + Auth + Realtime)
  - `users` — profile, preferences, hosting availability
  - `connections` — social graph edges (degree, trust_score)
  - `trips` — upcoming trips per user
  - `requests` — housing requests + status
  - `listings_cache` — cached open-web results

### External Integrations
- Airbnb (RapidAPI)
- Twilio (SMS)
- Google Contacts / phone import (web API)

---

## Project Structure

```
yhack/
├── frontend/                        # React + Vite (mobile-first)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── SignUp.tsx
│   │   │   ├── Onboarding.tsx
│   │   │   ├── Home.tsx             # AI chat + trips + notifications
│   │   │   ├── Search.tsx           # "Where's your next stop?"
│   │   │   ├── Results.tsx          # Ranked results + fallback progress
│   │   │   ├── Network.tsx          # Your connections
│   │   │   └── RequestDetail.tsx    # Agent action approval
│   │   ├── components/
│   │   │   ├── AIChat.tsx           # Chat bar at top of home
│   │   │   ├── FallbackProgress.tsx # Visual Steps 1→4 running live
│   │   │   ├── ListingCard.tsx      # Unified card: friend / Airbnb / hotel
│   │   │   ├── TripCard.tsx
│   │   │   └── MessagePreview.tsx   # AI-drafted message approval UI
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   ├── tripStore.ts
│   │   │   └── networkStore.ts
│   │   ├── lib/
│   │   │   ├── supabase.ts
│   │   │   └── api.ts               # calls to backend agent
│   │   └── types/index.ts
│   ├── index.html
│   ├── vite.config.ts
│   └── tailwind.config.ts
│
├── backend/                         # Express + AI Agent
│   ├── src/
│   │   ├── index.ts                 # Express server entry
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── trips.ts
│   │   │   └── agent.ts             # POST /agent/search  (SSE stream)
│   │   ├── agent/
│   │   │   ├── index.ts             # Claude agent runner
│   │   │   ├── fallbackChain.ts     # Orchestrates Steps 1–4
│   │   │   ├── rankResults.ts       # Trust · cost · convenience scorer
│   │   │   └── tools/
│   │   │       ├── searchPersonalNetwork.ts
│   │   │       ├── searchExtendedNetwork.ts
│   │   │       ├── matchTravelers.ts
│   │   │       ├── searchOpenWeb.ts
│   │   │       ├── draftMessage.ts
│   │   │       └── sendMessage.ts
│   │   └── lib/
│   │       ├── supabase.ts
│   │       └── anthropic.ts
│   ├── package.json
│   └── tsconfig.json
│
└── PLAN.md
```

---

## AI Agent Architecture

Claude runs all search branches in parallel via tool use, merges results, ranks them,
then drafts the outreach message for user approval.

```typescript
// backend/src/agent/fallbackChain.ts
async function findHousing(request: TripRequest): Promise<RankedResult[]> {
  // Steps 1 + 2 + open web fire in parallel
  const [personal, extended, openWeb] = await Promise.all([
    searchPersonalNetwork(request),
    searchExtendedNetwork(request),   // permission-gated reveal
    searchOpenWeb(request),
  ]);

  const allResults = [...personal, ...extended, ...openWeb];

  // Step 3: traveler matching if no personal results
  if (personal.length === 0 && extended.length === 0) {
    const travelers = await matchTravelers(request);
    allResults.push(...travelers);
  }

  return rankResults(allResults);  // trust · cost · convenience
}
```

### Trust Score Formula
```
trustScore =
  degreeFactor(1st=1.0, 2nd=0.6, 3rd=0.3, stranger=0.0)
  + 0.1 * mutualFriendCount
  + 0.2 * isVerified
  + 0.1 * hostResponseRate
```

---

## MVP Checklist (Hackathon)

- [ ] React app with Home, Search, Results, Network pages (mobile layout)
- [ ] Supabase auth + user/trip tables
- [ ] Mock social graph (seeded data for demo)
- [ ] Express backend with `/agent/search` endpoint (SSE for live progress)
- [ ] Claude agent with all 4 tool types wired up
- [ ] Fallback chain + ranking logic
- [ ] FallbackProgress component (live Steps 1→4 animation)
- [ ] AI-drafted message shown for user approval before sending
- [ ] ListingCard showing trust badge for friend results vs Airbnb

## Post-MVP
- Real phone contact import (Web Contacts API)
- Push notifications (PWA / Web Push)
- Actual Airbnb deep-link / booking API
- Permission request flow for 2nd/3rd degree network reveals
- Event detection via Ticketmaster / Eventbrite for Step 3 co-traveler matching
- SMS outreach via Twilio
