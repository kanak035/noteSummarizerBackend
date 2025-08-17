
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import summaryRoutes from "./routes/summaryRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";

dotenv.config();

const app = express();


const allowedOrigins = [
  "http://localhost:5173",
  "https://notessummary.netlify.app",   
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS not allowed"), false);
    },
    credentials: true, 
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
  console.log(`CORS allowed origins: ${allowedOrigins.join(", ")}`);
});
