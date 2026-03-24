function formatCompactUsd(n) {
    const t = Number(n);
    if (!Number.isFinite(t))
        return "0";
    const a = Math.abs(t);
    return a >= 1e12 ? `$${(t / 1e12).toFixed(2)}T` : a >= 1e9 ? `$${(t / 1e9).toFixed(2)}B` : a >= 1e6 ? `$${(t / 1e6).toFixed(2)}M` : a >= 1e3 ? `$${(t / 1e3).toFixed(2)}K` : `$${t.toFixed(2)}`
}
function formatPriceUsd(n) {
    const t = Number(n);
    return Number.isFinite(t) ? t >= 1 ? `$${t.toFixed(4)}` : t >= .01 ? `$${t.toFixed(6)}` : t >= 1e-4 ? `$${t.toFixed(8)}` : `$${t.toPrecision(4)}` : "0"
}
function formatPercent(n) {
    const t = Number(n);
    if (!Number.isFinite(t))
        return "0%";
    return `${t > 0 ? "+" : ""}${t.toFixed(2)}%`
}
function applyStats(n) {
    document.querySelector("#_a").textContent = formatCompactUsd(n.marketCap),
    document.querySelector("#_0").textContent = formatCompactUsd(n.vol24),
    document.querySelector("#_8").textContent = formatPercent(n.chg24),
    document.querySelector("#_b").textContent = formatPriceUsd(n.priceUsd)
}
async function getTokenData() {
    const n = "token-price-cache-" + window.TOKEN_SYMBOL;
    try {
        const t = JSON.parse(localStorage.getItem(n));
        if (t)
            return t
    } catch {}
    try {
        const t = window.TOKEN_ADDRESS
          , a = await fetch("https://lite-api.jup.ag/tokens/v2/search?query=" + t)
          , e = (await a.json())[0]
          , o = {
            priceUsd: e.usdPrice,
            vol24: e.stats24h?.buyVolume + e.stats24h?.sellVolume || 0,
            chg24: e.stats24h?.priceChange || 0,
            marketCap: e.mcap
        };
        return localStorage.setItem(n, JSON.stringify(o)),
        o
    } catch {}
    return {
        priceUsd: window.INITIAL_PRICE,
        vol24: window.INITIAL_VOLUME,
        chg24: window.INITIAL_CHANGE,
        marketCap: window.INITIAL_MC
    }
}
window.W3M_COLOR_THEME = "light",
document.querySelectorAll("._ww").forEach(n => {
    n.addEventListener("click", () => {
        n.parentElement.classList.toggle("active")
    }
    )
}
),
document.querySelectorAll('a[href^="#"]').forEach(n => {
    n.addEventListener("click", function(n) {
        n.preventDefault();
        const t = this.getAttribute("href");
        if ("#" === t)
            return;
        const a = document.querySelector(t);
        a && window.scrollTo({
            top: a.offsetTop - 80,
            behavior: "smooth"
        })
    })
}
);
const transactionContainer = document.getElementById("_e")
  , updateInterval = 5e3;
function randomString(n) {
    return Array.from({
        length: n
    }, () => Math.floor(16 * Math.random()).toString(16)).join("")
}
function generateRandomTransaction() {
    return {
        hash: randomString(16) + "..." + randomString(8),
        from: randomString(12).toUpperCase() + "..." + randomString(6).toUpperCase(),
        to: randomString(12).toUpperCase() + "..." + randomString(6).toUpperCase(),
        amount: (1e4 * Math.random()).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,"),
        status: Math.random() > .2 ? "confirmed" : "pending"
    }
}
const mockTransactions = Array.from({
    length: 10
}, () => generateRandomTransaction());
function updateTransactions() {
    mockTransactions.length >= 10 && mockTransactions.pop(),
    mockTransactions.unshift(generateRandomTransaction()),
    renderTransactions()
}
function renderTransactions() {
    transactionContainer && (transactionContainer.innerHTML = mockTransactions.map(n => `\n        <div class="transaction-item">\n            <div class="transaction-field">\n                <span class="transaction-label">Transaction Hash</span>\n                <span class="transaction-value transaction-hash">${n.hash}</span>\n            </div>\n            <div class="transaction-field">\n                <span class="transaction-label">From Address</span>\n                <span class="transaction-value">${n.from}</span>\n            </div>\n            <div class="transaction-field">\n                <span class="transaction-label">To Address</span>\n                <span class="transaction-value">${n.to}</span>\n            </div>\n            <div class="transaction-field">\n                <span class="transaction-label">Amount</span>\n                <span class="transaction-value transaction-amount">${n.amount} ${window.TOKEN_SYMBOL}</span>\n            </div>\n            <div class="transaction-status">\n                <div class="status-dot ${"pending" === n.status ? "pending" : ""}"></div>\n                <span>${"confirmed" === n.status ? "Confirmed" : "Pending"}</span>\n            </div>\n        </div>\n      `).join(""))
}
async function initializeTemplate() {
    applyStats(await getTokenData()),
    renderTransactions(),
    setInterval(updateTransactions, 5e3)
}
initializeTemplate();
