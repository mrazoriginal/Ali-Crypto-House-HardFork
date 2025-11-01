// Get main canvas from HTML
const canvas = document.getElementById("main-canvas");
const ctx = canvas.getContext("2d");

// Set canvas size to full screen
let w = (canvas.width = window.innerWidth);
let h = (canvas.height = window.innerHeight);

// fix bad window when changing window size
window.addEventListener("resize", () => {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
});

// Create random floating particles
const particles = [];
for (let i = 0; i < 150; i++) {
  particles.push({
    x: Math.random() * w, // random horizontal position
    y: Math.random() * h, // random vertical position
    vx: (Math.random() - 0.5) * 1.5, // small random horizontal velocity
    vy: (Math.random() - 0.5) * 1.5, // small random vertical velocity
    size: Math.random() * 3 + 1, // random size between 1–4
    alpha: Math.random() * 0.5 + 0.3 // random transparency
  });
}

// Draw the floating purple particles
function drawParticles() {
  ctx.clearRect(0, 0, w, h); // clear particles to avoid shit

  particles.forEach((p) => {
    ctx.fillStyle = `rgba(138,43,226,${p.alpha})`; // particle color
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    // move particles
    p.x += p.vx;
    p.y += p.vy;

    // wrap around screen edges
    if (p.x < 0) p.x = w;
    if (p.x > w) p.x = 0;
    if (p.y < 0) p.y = h;
    if (p.y > h) p.y = 0;
  });

  // loop animation
  requestAnimationFrame(drawParticles);
}
drawParticles();

// Fetch coin price and compare them
let lastPrices = {};

// List of coins to show
const coins = ["bitcoin", "ethereum", "tether"];

// Fix no price problem
function formatPrice(n) {
  if (!n) return "N/A";
  return n >= 1000
    ? n.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : n.toFixed(2);
}

// Fetch live prices from my API
async function fetchPrices() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd"
    );
    const data = await res.json();

    // Loop through each coin and update price
    coins.forEach((id) => {
      const el = document.querySelector(`.coin[data-id="${id}"]`);
      const priceEl = el.querySelector(".price");
      const newPrice = data[id].usd;

      // compare
      priceEl.classList.remove("up", "down");

      // Compare with previous price to mark up or down
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

      lastPrices[id] = newPrice; // save price for next comparison
    });

    // Update the last updated text
    document.getElementById("last-updated").textContent =
      "💸 Last Time Since Burning money: " +
      new Date().toLocaleTimeString() +
      " 💸";
  } catch (err) {
    console.error("Error fetching prices:", err);
  }
}

// Run immediately and repeat every minute
fetchPrices();
setInterval(fetchPrices, 2000);

// 🎉 EMOJI EXPLOSION EFFECT
const emojis = ["🤬", "💰", "🔥", "😖", "❌", "💎", "😈", "😂", "🎉", "🍌"];

// Creates floating emojis that explode and fade
function explodeEmojis(x, y, count = 250, duration = 2000) {
  for (let i = 0; i < count; i++) {
    const em = document.createElement("div");
    em.className = "emoji";
    em.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    em.style.left = x + "px";
    em.style.top = y + "px";
    document.body.appendChild(em);

    // random direction & speed
    const angle = Math.random() * 2 * Math.PI;
    const speed = Math.random() * 3 + 1;
    const vx = Math.cos(angle) * 50 * speed;
    const vy = Math.sin(angle) * 50 * speed;

    // make them fly away + fade out
    requestAnimationFrame(() => {
      em.style.transform = `translate(${vx}px,${vy}px)`;
      em.style.opacity = 0;
    });

    // remove after animation
    setTimeout(() => em.remove(), duration);
  }
}

// REFRESH BUTTON

const refreshBtn = document.getElementById("refresh-btn");

// When refresh clicked → emoji explosion + reload prices + random quote
refreshBtn.addEventListener("click", () => {
  const rect = refreshBtn.getBoundingClientRect();
  explodeEmojis(
    rect.left + rect.width / 2, // center of button X
    rect.top + rect.height / 2, // center of button Y
    250, // number of emojis
    20000 // duration
  );

  fetchPrices(); // update coin prices
  showRandomQuote(); // show new quote
  alert("Stop Burning money😒"); // funny alert message
});

// DUMMY SEARCH BOX
const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-input");

// When search button clicked
searchBtn.addEventListener("click", async () => {
  const originalPlaceholder = searchInput.placeholder;

  // Make it look like it's thinking
  searchInput.placeholder = "Wait let me think🤔";
  searchInput.disabled = true;
  searchInput.style.opacity = "0.6";

  // Simulate loading delay
  await new Promise((r) => setTimeout(r, 1200));

  // Show funny alert
  alert("Oops! Couldn't afford an API 💀 I give up 😜");

  // Reset input state
  searchInput.value = "";
  searchInput.disabled = True; // disable searching again
  searchInput.placeholder = originalPlaceholder;
  searchInput.style.opacity = "1";
  searchInput.focus();

  // Brief glow animation for effect
  searchInput.style.boxShadow = "0 0 12px rgba(138,43,226,0.8)";
  searchInput.style.transition = "box-shadow 0.3s ease";
  setTimeout(() => {
    searchInput.style.boxShadow = "none";
  }, 400);
});

// Also trigger search if user press Enter
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

// RANDOM TRADER QUOTES

const quotes = [
  "“The trend is your friend until it ends.” — Anonymous",
  "“Risk comes from not knowing what you’re doing.” — Warren Buffett",
  "“Cut your losses short and let your winners run.” — Jesse Livermore",
  "“Markets are never wrong — opinions often are.” — Jesse Livermore",
  "“Plan the trade and trade the plan.” — Unknown",
  "“Don’t get high on your own supply.” — Wall Street saying",
  "“Patience pays more than prediction.” — Ali Crypto House™ 💸",
  "“You either win or you learn. Never lose.” — Unknown"
];

// Quote box in HTML
const quoteBox = document.getElementById("quote-box");

// Show a random quote with fade effect
function showRandomQuote() {
  quoteBox.style.opacity = 0; // fade out
  setTimeout(() => {
    quoteBox.textContent = quotes[Math.floor(Math.random() * quotes.length)];
    quoteBox.style.opacity = 1; // fade in new one
  }, 1000);
}

// Show one on load and refresh every 15s
showRandomQuote();
setInterval(showRandomQuote, 15000);

// --- Portfolio Overlay Logic ---
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

// Open overlay on click
openPortfolioBtn.addEventListener("click", () => {
  portfolioOverlay.style.display = "flex";
  updatePortfolio();
});

// Close overlay
closePortfolioBtn.addEventListener("click", () => {
  portfolioOverlay.style.display = "none";
});
portfolioOverlay.addEventListener("click", (e) => {
  if (e.target === portfolioOverlay) portfolioOverlay.style.display = "none";
});

// Load/save/reset portfolio
function loadHoldings() {
  const data = JSON.parse(localStorage.getItem("ach_holdings_v2"));
  if (!data) return;
  coinsList.forEach((c) => {
    if (data[c] != null) holdInputs[c].value = data[c];
  });
}
saveBtn.addEventListener("click", () => {
  const obj = {};
  coinsList.forEach((c) => (obj[c] = parseFloat(holdInputs[c].value) || 0));
  localStorage.setItem("ach_holdings_v2", JSON.stringify(obj));
  updatePortfolio();
});
resetBtn.addEventListener("click", () => {
  localStorage.removeItem("ach_holdings_v2");
  coinsList.forEach((c) => {
    holdInputs[c].value = "";
    valSpans[c].textContent = "--";
    emojiSpans[c].textContent = "🤔";
  });
  totalVal.textContent = "--";
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

// Refresh portfolio when prices update
if (typeof fetchPrices === "function") {
  const oldFetch = fetchPrices;
  window.fetchPrices = async function () {
    await oldFetch();
    updatePortfolio();
  };
}

loadHoldings();
updatePortfolio();
