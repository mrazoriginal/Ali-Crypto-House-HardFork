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
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// -------------------- Global Files --------------------
const PORTFOLIO_FILE = path.join(__dirname, "portfolio.json");

// -------------------- Coin Prices (Also saves to file) --------------------
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
    fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("Portfolio save error:", err);
    res.status(500).json({ error: "Failed to save portfolio" });
  }
});

// -------------------- PDF REPORT (FINAL FIXED VERSION) --------------------
app.get("/api/report", async (req, res) => {
  try {
    // Load stored portfolio
    let portfolio = {};
    if (fs.existsSync(PORTFOLIO_FILE)) {
      portfolio = JSON.parse(fs.readFileSync(PORTFOLIO_FILE, "utf-8"));
    }

    // Fetch fresh prices from backend (professor requirement)
    const coins = ["bitcoin", "ethereum", "tether"];
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(
      ","
    )}&vs_currencies=usd`;

    const response = await fetch(url);
    const prices = await response.json();

    // Create PDF
    const doc = new PDFDocument({ margin: 30, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=portfolio_report.pdf"
    );

    doc.pipe(res);

    // ----- TITLE -----
    doc.fontSize(22).font("Helvetica-Bold")
      .text("Ali Crypto House - Portfolio Report", { align: "center" });
    doc.moveDown(1);

    // ----- TIMESTAMP -----
    doc.fontSize(12).font("Helvetica")
      .text(`Generated: ${new Date().toLocaleString()}`, { align: "right" });
    doc.moveDown(1);

    // ----- TABLE HEADER -----
    doc.fontSize(14).font("Helvetica-Bold");
    doc.text("Coin", 50, doc.y, { continued: true });
    doc.text("Holdings", 150, doc.y, { continued: true });
    doc.text("Price (USD)", 250, doc.y, { continued: true });
    doc.text("Value (USD)", 370, doc.y);
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(500, doc.y).stroke();
    doc.moveDown(0.5);

    // ----- TABLE ROWS -----
    let totalValue = 0;

    doc.fontSize(12).font("Helvetica");

    coins.forEach((coin) => {
      const holdings = portfolio[coin] || 0;
      const price = prices[coin]?.usd || 0;
      const value = holdings * price;
      totalValue += value;

      doc.text(coin.toUpperCase(), 50, doc.y, { continued: true });
      doc.text(holdings.toString(), 150, doc.y, { continued: true });
      doc.text(`$${price.toFixed(2)}`, 250, doc.y, { continued: true });
      doc.text(`$${value.toFixed(2)}`, 370, doc.y);
    });

    doc.moveDown(1);

    // ----- TOTAL -----
    doc.fontSize(14).font("Helvetica-Bold")
      .text(`Total Portfolio Value: $${totalValue.toFixed(2)}`, { align: "right" });

    doc.end();
  } catch (err) {
    console.error("Report generation error:", err);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

// -------------------- Start Server --------------------
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
