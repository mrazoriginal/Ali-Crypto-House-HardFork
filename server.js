// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// -------------------- Rate Limiter --------------------
const quotesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});

// -------------------- Coin Prices --------------------
const API_URL = "https://ali-crypto-house-hardfork.onrender.com";

async function getPrices() {
  try {
    const res = await fetch(`${API_URL}/api/prices`);
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    console.log("Prices:", data);
  } catch (err) {
    console.error("Failed to fetch prices:", err);
  }
}

// -------------------- quote --------------------
async function getQuotes() {
  try {
    const res = await fetch(`${API_URL}/api/quotes`);
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    console.log("Quotes:", data);
  } catch (err) {
    console.error("Failed to fetch quotes:", err);
  }
}

getPrices();
getQuotes();

// -------------------- Portfolio --------------------
const PORTFOLIO_FILE = path.join(__dirname, "portfolio.json");

app.get("/api/portfolio", (req, res) => {
  try {
    if (!fs.existsSync(PORTFOLIO_FILE)) fs.writeFileSync(PORTFOLIO_FILE, "{}");
    const raw = fs.readFileSync(PORTFOLIO_FILE, "utf-8");
    res.json(JSON.parse(raw));
  } catch (err) {
    console.error("Portfolio load error:", err);
    res.status(500).json({ error: "Failed to load portfolio" });
  }
});

app.post("/api/portfolio", (req, res) => {
  try {
    const data = req.body;
    fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("Portfolio save error:", err);
    res.status(500).json({ error: "Failed to save portfolio" });
  }
});

// -------------------- Start Server --------------------
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
