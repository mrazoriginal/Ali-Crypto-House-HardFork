import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import rateLimit from "express-rate-limit";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());


// Rate limiter: max 100 requests per 15 minutes on quotes API
const quotesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// -------------------- Coin Prices --------------------
app.get("/api/prices", async (req, res) => {
  try {
    const coins = ["bitcoin", "ethereum", "tether"];
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(",")}&vs_currencies=usd`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch prices" });
  }
});

// -------------------- Quotes --------------------
app.get("/api/quotes", quotesLimiter, (req, res) => {
  try {
    const raw = fs.readFileSync("./quotes.json", "utf-8"); // <-- change here
    const quotes = JSON.parse(raw);
    res.json(quotes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load quotes" });
  }
});


// -------------------- Portfolio --------------------
const PORTFOLIO_FILE = "./portfolio.json";

app.get("/api/portfolio", (req, res) => {
  try {
    if (!fs.existsSync(PORTFOLIO_FILE)) fs.writeFileSync(PORTFOLIO_FILE, "{}");
    const raw = fs.readFileSync(PORTFOLIO_FILE, "utf-8");
    res.json(JSON.parse(raw));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load portfolio" });
  }
});

app.post("/api/portfolio", (req, res) => {
  try {
    const data = req.body;
    fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save portfolio" });
  }
});

// -------------------- Start Server --------------------
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
