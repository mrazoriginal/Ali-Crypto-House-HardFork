// ------------------------ CANVAS PARTICLES ------------------------
const canvas = document.getElementById("main-canvas");
const ctx = canvas.getContext("2d");
let w = (canvas.width = window.innerWidth);
let h = (canvas.height = window.innerHeight);

window.addEventListener("resize", () => {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
});

const particles = [];
for (let i = 0; i < 150; i++) {
  particles.push({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    size: Math.random() * 3 + 1,
    alpha: Math.random() * 0.5 + 0.3
  });
}

function drawParticles() {
  ctx.clearRect(0, 0, w, h);
  particles.forEach((p) => {
    ctx.fillStyle = `rgba(138,43,226,${p.alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = w;
    if (p.x > w) p.x = 0;
    if (p.y < 0) p.y = h;
    if (p.y > h) p.y = 0;
  });
  requestAnimationFrame(drawParticles);
}
drawParticles();

// ------------------------ CONFIG ------------------------
const API_BASE = "https://ali-crypto-house-hardfork.onrender.com/api";
const coins = ["bitcoin", "ethereum", "tether"];
let lastPrices = {};

// ------------------------ Bug Fix ------------------------
function formatPrice(n) {
  if (!n) return "N/A";
  return n >= 1000
    ? n.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : n.toFixed(2);
}

// ------------------------ FETCH PRICES From Back End ------------------------
async function fetchPrices() {
  try {
    const res = await fetch(`${API_BASE}/prices`);
    const data = await res.json();

    coins.forEach((id) => {
      const el = document.querySelector(`.coin[data-id="${id}"]`);
      const priceEl = el.querySelector(".price");
      const newPrice = data[id].usd;

      priceEl.classList.remove("up", "down");

      if (lastPrices[id] != null) {
        if (newPrice > lastPrices[id]) {
          priceEl.classList.add("up");
          priceEl.textContent = `$${formatPrice(newPrice)} ↑`;
        } else if (newPrice < lastPrices[id]) {
          priceEl.classList.add("down");
          priceEl.textContent = `$${formatPrice(newPrice)} ↓`;
        } else {
          priceEl.textContent = `$${formatPrice(newPrice)}`;
        }
      } else {
        priceEl.textContent = `$${formatPrice(newPrice)}`;
      }

      lastPrices[id] = newPrice;
    });

    document.getElementById("last-updated").textContent =
      "💸 Last Time Since Burning money: " +
      new Date().toLocaleTimeString() +
      " 💸";

    updatePortfolio();
  } catch (err) {
    console.error("Error fetching prices:", err);
  }
}
fetchPrices();
setInterval(fetchPrices, 2000);

// ------------------------ QUOTES ------------------------
const quoteBox = document.getElementById("quote-box");
async function showRandomQuote() {
  try {
    const res = await fetch(`${API_BASE}/quotes`);
    const quotes = await res.json();
    quoteBox.style.opacity = 0;
    setTimeout(() => {
      quoteBox.textContent = quotes[Math.floor(Math.random() * quotes.length)];
      quoteBox.style.opacity = 1;
    }, 500);
  } catch (err) {
    console.error("Error fetching quotes:", err);
  }
}
showRandomQuote();
setInterval(showRandomQuote, 15000);

// ------------------------ EMOJI EXPLOSION ------------------------
const emojis = ["🤬", "💰", "🔥", "😖", "❌", "💎", "😈", "😂", "🎉", "🍌"];
function explodeEmojis(x, y, count = 250, duration = 2000) {
  for (let i = 0; i < count; i++) {
    const em = document.createElement("div");
    em.className = "emoji";
    em.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    em.style.left = x + "px";
    em.style.top = y + "px";
    document.body.appendChild(em);
    const angle = Math.random() * 2 * Math.PI;
    const speed = Math.random() * 3 + 1;
    const vx = Math.cos(angle) * 50 * speed;
    const vy = Math.sin(angle) * 50 * speed;
    requestAnimationFrame(() => {
      em.style.transform = `translate(${vx}px,${vy}px)`;
      em.style.opacity = 0;
    });
    setTimeout(() => em.remove(), duration);
  }
}

// ------------------------ REFRESH ------------------------
const refreshBtn = document.getElementById("refresh-btn");
refreshBtn.addEventListener("click", () => {
  const rect = refreshBtn.getBoundingClientRect();
  explodeEmojis(rect.left + rect.width / 2, rect.top + rect.height / 2, 250, 20000);
  fetchPrices();
  showRandomQuote();
  alert("Stop Burning money😒");
});

// ------------------------ SEARCH DUMMY ------------------------
const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-input");
searchBtn.addEventListener("click", async () => {
  const originalPlaceholder = searchInput.placeholder;
  searchInput.placeholder = "Wait let me think🤔";
  searchInput.disabled = true;
  searchInput.style.opacity = "0.6";
  await new Promise((r) => setTimeout(r, 1200));
  alert("Oops! You are not one of the Chosen😜");
  searchInput.value = "";
  searchInput.disabled = True;
  searchInput.placeholder = originalPlaceholder;
  searchInput.style.opacity = "1";
  searchInput.focus();
  searchInput.style.boxShadow = "0 0 12px rgba(138,43,226,0.8)";
  searchInput.style.transition = "box-shadow 0.3s ease";
  setTimeout(() => (searchInput.style.boxShadow = "none"), 400);
});
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

// ------------------------ PORTFOLIO ------------------------
const portfolioOverlay = document.getElementById("portfolio-overlay");
const openPortfolioBtn = document.getElementById("open-portfolio");
const closePortfolioBtn = document.getElementById("close-portfolio");
const coinsList = ["bitcoin", "ethereum", "tether"];
const holdInputs = {
  bitcoin: document.getElementById("hold-btc"),
  ethereum: document.getElementById("hold-eth"),
  tether: document.getElementById("hold-usdt")
};
const valSpans = {
  bitcoin: document.getElementById("val-btc"),
  ethereum: document.getElementById("val-eth"),
  tether: document.getElementById("val-usdt")
};
const emojiSpans = {
  bitcoin: document.getElementById("emoji-btc"),
  ethereum: document.getElementById("emoji-eth"),
  tether: document.getElementById("emoji-usdt")
};
const totalVal = document.getElementById("val-total");
const saveBtn = document.getElementById("save-portfolio");
const resetBtn = document.getElementById("reset-portfolio");

// Open/close overlay
openPortfolioBtn.addEventListener("click", () => {
  portfolioOverlay.style.display = "flex";
  loadHoldings();
  updatePortfolio();
});
closePortfolioBtn.addEventListener("click", () => {
  portfolioOverlay.style.display = "none";
});
portfolioOverlay.addEventListener("click", (e) => {
  if (e.target === portfolioOverlay) portfolioOverlay.style.display = "none";
});

// Load holdings from backend
async function loadHoldings() {
  try {
    const res = await fetch(`${API_BASE}/portfolio`);
    const data = await res.json();
    coinsList.forEach((c) => {
      if (data[c] != null) holdInputs[c].value = data[c];
    });
  } catch (err) {
    console.error("Failed to load portfolio:", err);
  }
}

// Save holdings to backend
saveBtn.addEventListener("click", async () => {
  const obj = {};
  coinsList.forEach((c) => (obj[c] = parseFloat(holdInputs[c].value) || 0));
  try {
    await fetch(`${API_BASE}/portfolio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(obj)
    });
    updatePortfolio();
  } catch (err) {
    console.error("Failed to save portfolio:", err);
  }
});

// Reset portfolio
resetBtn.addEventListener("click", async () => {
  try {
    await fetch(`${API_BASE}/portfolio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    coinsList.forEach((c) => {
      holdInputs[c].value = "";
      valSpans[c].textContent = "--";
      emojiSpans[c].textContent = "🤔";
    });
    totalVal.textContent = "--";
  } catch (err) {
    console.error("Failed to reset portfolio:", err);
  }
});

// Update portfolio values
function updatePortfolio() {
  let total = 0;
  coinsList.forEach((c) => {
    const price = lastPrices[c];
    const amount = parseFloat(holdInputs[c].value) || 0;
    const emoji = emojiSpans[c];
    emoji.textContent = "🤔";
    if (price && amount > 0) {
      const value = amount * price;
      valSpans[c].textContent = `$${value.toFixed(2)}`;
      total += value;
      setTimeout(() => (emoji.textContent = "🤑"), 300);
      emoji.style.transform = "scale(1.3)";
      setTimeout(() => (emoji.style.transform = "scale(1)"), 400);
    } else valSpans[c].textContent = "--";
  });
  totalVal.textContent = `$${total.toFixed(2)}`;
}
