import { CONFIG } from "./config.js";

const logEl = document.getElementById("log");
const refreshBtn = document.getElementById("refreshBtn");

// Fetch cookies from background and display
function fetchAndDisplayCookies() {
  chrome.runtime.sendMessage({ action: "readNow" }, (response) => {
    chrome.cookies.getAll({}, (cookies) => {
      const allCookies = (cookies || []).map(cookie => ({
        domain: cookie.domain,
        name: cookie.name,
        value: cookie.value
      }));
      logEl.textContent = JSON.stringify(allCookies, null, 2);
    });
  });
}

// Manual refresh button
refreshBtn.addEventListener("click", fetchAndDisplayCookies);

// Auto-refresh every 5 seconds
setInterval(fetchAndDisplayCookies, 5000);

// Initial fetch when popup opens
fetchAndDisplayCookies();