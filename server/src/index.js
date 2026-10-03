import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import resumeRouter from "./routes/resume.js";
import careersRouter from "./routes/careers.js";
import roadmapRouter from "./routes/roadmap.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST = path.join(__dirname, "..", "..", "client", "dist");

const app = express();
// Wide open by default so local dev and the single-process mode keep working
// unchanged. Set ALLOWED_ORIGIN (e.g. the GitHub Pages URL) once the frontend
// is hosted separately, so the API only answers that origin.
const allowedOrigin = process.env.ALLOWED_ORIGIN;
app.use(cors(allowedOrigin ? { origin: allowedOrigin } : undefined));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/resume", resumeRouter);
app.use("/api/careers", careersRouter);
app.use("/api/roadmap", roadmapRouter);

// In production, serve the built React app from the same origin/port so the
// browser never needs CORS and the Gemini key never has to leave the server.
app.use(express.static(CLIENT_DIST));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(CLIENT_DIST, "index.html"), (err) => {
    if (err) next();
  });
});

// Centralized error handler so multer/gemini errors return JSON, not HTML.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Unexpected server error." });
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`Career Nexus server listening on http://localhost:${PORT}`);
});
