import express from "express";
import fetch from "node-fetch";
import fs from "fs";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Quotes List ---
const quotes = [
  "The trend is your friend until it ends.",
  "Risk comes from not knowing what you’re doing.",
  "Cut your losses short and let your winners run.",
  "Markets are never wrong — opinions often are.",
  "Plan the trade and trade the plan.",
  "Don’t get high on your own supply.",
  "Patience pays more than prediction.",
  "You either win or you learn. Never lose."
];

// --- Endpoint: GET /quotes ---
app.get("/quotes", (req, res) => {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  res.json({ quote: randomQuote });
});

// --- Endpoint: GET /prices ---
app.get("/prices", async (req, res) => {
  try {
    const coins = ["bitcoin","ethereum","tether"];
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(",")}&vs_currencies=usd`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch prices" });
  }
});

// --- Endpoint: GET /portfolio ---
app.get("/portfolio", (req, res) => {
  try {
    const raw = fs.readFileSync("portfolio.json", "utf-8");
    const portfolio = JSON.parse(raw);
    res.json(portfolio);
  } catch {
    res.json({ bitcoin: 0, ethereum: 0, tether: 0 });
  }
});

// --- Endpoint: POST /portfolio ---
app.post("/portfolio", (req, res) => {
  const data = req.body;
  fs.writeFileSync("portfolio.json", JSON.stringify(data, null, 2));
  res.json({ status: "saved" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
