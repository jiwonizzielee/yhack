import { Router } from "express";
import { runFallbackChain } from "../agent/fallbackChain.js";
import { draftMessage } from "../agent/tools/draftMessage.js";
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

export default router;