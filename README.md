Watch a Demo here:
https://youtu.be/lPng_cyQga8

# Ali Crypto House💻🚀

Welcome to **Ali Crypto House** — a fun and interactive crypto dashboard featuring live coin prices, floating particles, emoji effects, random trader quotes, and now **PDF portfolio reports**. Built for both entertainment and learning purposes! 😎💸

This fork adds a **Node.js backend** for API endpoints, portfolio storage, and PDF report generation while keeping all frontend features ✨ intact.
---

## 🚀 What’s New in v4

* **PDF Portfolio Report:** Click the **download button** next to 💰 Portfolio 💰 to generate a PDF report with coin holdings, last prices, per-coin value, and total portfolio value.
* **PDF Content:** Shows coin holdings, last fetched prices, per-coin value, and total portfolio value.
* **Hover & Alignment Tweaks:** PDF button scales on hover without breaking vertical alignment.
* **UI Polish:** Buttons, spacing, and z-index adjustments for clean, balanced visuals.

---

## 🚀 What’s New in Backend Version

* **Backend Added:** All coin price fetches 💰 and portfolio data 📊 now go through a Node.js server to simulate a real backend.

* **Portfolio Storage on Server:** Portfolio inputs are now sent to the server and can be retrieved on page load, giving the perception of persistent backend data.

* **Frontend Unchanged:** Particles, emoji explosions, quotes, and UI remain the same.

* **Notes / Fixes**

  * Fixed issues with file paths (`quotes.json` & `portfolio.json`).
  * Fixed server crashes & loading problems.
  * Backend is stable and ready to use on any domain.

| Endpoint         | Method | Description                   |
| ---------------- | ------ | ----------------------------- |
| `/api/prices`    | GET    | Get live crypto prices        |
| `/api/quotes`    | GET    | Get all saved quotes          |
| `/api/portfolio` | GET    | Get portfolio                 |
| `/api/portfolio` | POST   | Update portfolio              |
| `/api/report`    | GET    | Download portfolio PDF report |

---

## 🚀 What’s New in v3

* **Particle Blur Behind Boxes:** Floating particles no longer interfere with text or widgets — everything stays readable.
* **Portfolio Polished:** Reacts smoother with emoji animations, live updates, and better interaction feedback.
* **UI Boosts:** Subtle shadows, transitions, and spacing improvements for a modern, polished dashboard.
* **Mobile Layout Tweaks:** Buttons and boxes display correctly on all screen sizes.

---

## 🚀 What’s New in v2

* **Portfolio Widget Added:** Enter BTC, ETH, and USDT holdings and see your total portfolio value update live with emoji reactions (🫠 → 🤑).
* **UI Cleanup:** Reworked layout and all cool stuff needed.
* **Particle Fix:** Solved the bug where floating particles overlapped with boxes.
* **Temporary Storage:** Portfolio inputs are saved on the backend (and local storage as backup) for persistence after page refresh.
* **General Polish:** Smoother animations, better spacing, and smarter updates tied directly to live prices.

---

## Features

* **Live Coin Prices:** Bitcoin (BTC), Ethereum (ETH), and Tether (USDT) updated every 2 seconds via API (server proxy).
* **Floating Background Particles:** Dynamic visuals that stay in their lane.
* **Emoji Explosion:** Click the **Refresh** button to see fun emoji bursts across the screen.
* **Random Trader Quotes:** Motivational or chaotic trading quotes rotate every 15 seconds.
* **Search Bar:** Look up coins and data directly — or just pretend you’re hacking the blockchain 😏
* **Portfolio Widget:** Enter coin holdings and see real-time total value with emoji reactions.
* **PDF Report Download:** Generate and download your portfolio report with prices, per-coin values, and total portfolio value.

---

## Technologies Used

* **HTML5** – Structure of the webpage.
* **CSS3** – Styling, animations, blur effects, responsive design, and PDF button alignment.
* **JavaScript (ES6)** – Dynamic content, API fetching, particle and emoji effects, portfolio calculations, right-aligned $ formatting, and local storage.
* **Node.js + Express** – Backend server for API endpoints, portfolio persistence, and PDF generation using `pdfkit`.
