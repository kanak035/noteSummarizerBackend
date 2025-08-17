import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import summaryRoutes from "./routes/summaryRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";

dotenv.config();

const app = express();

// CORS
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: allowedOrigin,
  })
);

app.use(express.json({ limit: "10mb" }));

// server running check
app.get("/", (req, res) => {
  res.json({ ok: true, service: "meeting-summarizer-backend" });
});

// Routes
app.use("/api/summarize", summaryRoutes);
app.use("/api/send", emailRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`CORS allowed origin: ${allowedOrigin}`);
});
