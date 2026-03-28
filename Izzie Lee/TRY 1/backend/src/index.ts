import "dotenv/config";
import express from "express";
import cors from "cors";
import agentRouter from "./routes/agent.js";

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"] }));
app.use(express.json());

app.use("/agent", agentRouter);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`NestFinder backend running on http://localhost:${PORT}`);
});