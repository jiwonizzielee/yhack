import { Router } from "express";
import { runFallbackChain } from "../agent/fallbackChain.js";
import { draftMessage } from "../agent/tools/draftMessage.js";
import { anthropic } from "../lib/anthropic.js";
import type { TripRequest } from "../types.js";

const router = Router();

// POST /agent/search — streams SSE events as each fallback step resolves
router.post("/search", async (req, res) => {
  const tripReq: TripRequest = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    for await (const progress of runFallbackChain(tripReq)) {
      res.write(`data: ${JSON.stringify(progress)}\n\n`);
    }
    res.write(`data: ${JSON.stringify({ step: "done" })}\n\n`);
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: String(err) })}\n\n`);
  } finally {
    res.end();
  }
});

// POST /agent/draft-message — Claude drafts outreach for a chosen listing
router.post("/draft-message", async (req, res) => {
  const { listing, tripRequest } = req.body;
  const message = await draftMessage(listing, tripRequest);
  res.json({ message });
});

// GET /agent/trending — Claude generates trending student travel events
router.get("/trending", async (_req, res) => {
  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      messages: [{
        role: "user",
        content: `List 5 trending college/student travel events happening in the US right now or in the next 2 months. Return ONLY a JSON array with this shape, no markdown:
[{"title":"...","location":"...","dates":"...","category":"...","emoji":"..."}]
Categories: music, sports, greek, academic, social. Keep titles short (under 6 words).`,
      }],
    });
    const text = (msg.content[0] as { type: string; text: string }).text;
    const events = JSON.parse(text);
    res.json({ events });
  } catch {
    res.json({
      events: [
        { title: "Coachella 2025", location: "Indio, CA", dates: "Apr 11–20", category: "music", emoji: "🎵" },
        { title: "Kentucky Derby Week", location: "Louisville, KY", dates: "Apr 28 – May 3", category: "social", emoji: "🏇" },
        { title: "SXSW Edu", location: "Austin, TX", dates: "Mar 3–6", category: "academic", emoji: "🎓" },
        { title: "Spring Greek Formals", location: "Nationwide", dates: "Apr–May", category: "greek", emoji: "🏛️" },
        { title: "NCAA March Madness", location: "Various", dates: "Mar–Apr", category: "sports", emoji: "🏀" },
      ],
    });
  }
});

export default router;