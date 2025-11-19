import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// -------------------- Middleware --------------------
app.use(cors());
app.use(bodyParser.json());

// -------------------- Rate Limiter --------------------
const quotesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});

const PORTFOLIO_FILE = path.join(__dirname, "portfolio.json");
let lastPrices = {}; // <-- store latest prices for report

// -------------------- Coin Prices --------------------
app.get("/api/prices", async (req, res) => {
  try {
    const coins = ["bitcoin", "ethereum", "tether"];
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(",")}&vs_currencies=usd`;
    const response = await fetch(url);
    const data = await response.json();

    lastPrices = data; // <-- Step: store prices in memory

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
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    const raw = fs.readFileSync(filePath, "utf-8");
    const quotes = JSON.parse(raw);
    res.json(quotes);
  } catch (err) {
    console.error("Quotes fetch error:", err);
    res.status(500).json({ error: "Failed to load quotes" });
  }
});

// -------------------- Portfolio --------------------
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

// -------------------- PDF Report --------------------
app.get("/api/report", reportLimiter, (req, res) => {
  try {
    // Load portfolio
    let portfolio = {};
    if (fs.existsSync(PORTFOLIO_FILE)) {
      portfolio = JSON.parse(fs.readFileSync(PORTFOLIO_FILE, "utf-8"));
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 30, size: "A4" });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=portfolio_report.pdf"
    );

    doc.pipe(res);

    // Title
    doc.fontSize(20).text("Ali Crypto House - Portfolio Report", { align: "center" });
    doc.moveDown();

    // Timestamp
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown();

    // Table header
    doc.fontSize(14).text("Coin      Holdings      Price (USD)      Value (USD)");
    doc.moveDown();

    // Coins
    let totalValue = 0;
    const coins = ["bitcoin", "ethereum", "tether"];
    coins.forEach((coin) => {
      const amount = portfolio[coin] || 0;
      const price = lastPrices[coin]?.usd || 0;
      const value = amount * price;
      totalValue += value;
      const line = `${coin.toUpperCase()}      ${amount}      $${price.toFixed(
        2
      )}      $${value.toFixed(2)}`;
      doc.text(line);
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total Portfolio Value: $${totalValue.toFixed(2)}`, {
      align: "right",
    });

    doc.end();
  } catch (err) {
    console.error("Report generation error:", err);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

// -------------------- Start Server --------------------
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
