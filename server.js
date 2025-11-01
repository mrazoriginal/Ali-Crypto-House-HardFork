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
app.get("/api/prices", async (req, res) => {
  try {
    const coins = ["bitcoin", "ethereum", "tether"];
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(
      ","
    )}&vs_currencies=usd`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Prices fetch error:", err);
    res.status(500).json({ error: "Failed to fetch prices" });
  }
});

// -------------------- Quotes --------------------
app.get("/api/quotes", quotesLimiter, (req, res) => {
  try {
    const filePath = path.join(__dirname, "quotes.json");
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    const quotes = JSON.parse(raw);
    res.json(quotes);
  } catch (err) {
    console.error("Quotes fetch error:", err);
    res.status(500).json({ error: "Failed to load quotes" });
  }
});

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
