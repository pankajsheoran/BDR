// popup.js
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

// Refresh button
refreshBtn.addEventListener("click", fetchAndDisplayCookies);

// Auto fetch on popup open
fetchAndDisplayCookies();