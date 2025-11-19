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

// -------------------- Global Variables --------------------
const PORTFOLIO_FILE = path.join(__dirname, "portfolio.json");
const LAST_PRICES_FILE = path.join(__dirname, "lastPrices.json");

// -------------------- Coin Prices --------------------
app.get("/api/prices", async (req, res) => {
  try {
    const coins = ["bitcoin", "ethereum", "tether"];
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(",")}&vs_currencies=usd`;
    const response = await fetch(url);
    const data = await response.json();

    fs.writeFileSync(LAST_PRICES_FILE, JSON.stringify(data, null, 2));
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
    res.json(JSON.parse(raw));
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

// -------------------- PDF Report --------------------
app.get("/api/report", (req, res) => {
  try {
    // Load portfolio
    if (!fs.existsSync(PORTFOLIO_FILE)) fs.writeFileSync(PORTFOLIO_FILE, "{}");
    const portfolio = JSON.parse(fs.readFileSync(PORTFOLIO_FILE, "utf-8"));

    // Load prices
    if (!fs.existsSync(LAST_PRICES_FILE)) {
      return res.status(500).json({ error: "Price data not available. Run /api/prices first." });
    }
    const lastPrices = JSON.parse(fs.readFileSync(LAST_PRICES_FILE, "utf-8"));

    const doc = new PDFDocument({ margin: 30, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=portfolio_report.pdf");
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
    const startX = 50;
    const colWidths = [100, 100, 100, 100]; 
    doc.fontSize(14).font("Helvetica-Bold");
    let x = startX;
    doc.text("Coin", x, doc.y); x += colWidths[0];
    doc.text("Holdings", x, doc.y); x += colWidths[1];
    doc.text("Price (USD)", x, doc.y); x += colWidths[2];
    doc.text("Value (USD)", x, doc.y);
    doc.moveDown(0.5);
    doc.moveTo(startX, doc.y).lineTo(startX + colWidths.reduce((a,b)=>a+b,0), doc.y).stroke();
    doc.moveDown(0.5);

    // ----- TABLE ROWS -----
    const coins = ["bitcoin", "ethereum", "tether"];
    let totalValue = 0;
    doc.fontSize(12).font("Helvetica");
    coins.forEach((coin) => {
      const amount = portfolio[coin] || 0;
      const price = lastPrices[coin]?.usd;
      if (price === undefined) throw new Error(`Price for ${coin} not available. Run /api/prices first.`);
      const value = amount * price;
      totalValue += value;

      x = startX;
      doc.text(coin.toUpperCase(), x, doc.y); x += colWidths[0];
      doc.text(amount.toString(), x, doc.y); x += colWidths[1];
      doc.text(`$${price.toFixed(2)}`, x, doc.y); x += colWidths[2];
      doc.text(`$${value.toFixed(2)}`, x, doc.y);
      doc.moveDown(1);
    });

    // ----- TOTAL -----
    doc.moveDown(1);
    doc.fontSize(14).font("Helvetica-Bold")
       .text(`Total Portfolio Value: $${totalValue.toFixed(2)}`, { align: "right" });

    doc.end();
  } catch (err) {
    console.error("Report generation error:", err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------- Start Server --------------------
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
