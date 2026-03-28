import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import agentRouter from "./routes/agent.js";

const app = express();
const PORT = process.env.PORT ?? 4000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());

app.use("/agent", agentRouter);
app.get("/health", (_req, res) => res.json({ ok: true }));

// Serve frontend
const publicDir = path.join(__dirname, "../public");
app.use(express.static(publicDir));
app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`NestFinder running on http://localhost:${PORT}`);
});