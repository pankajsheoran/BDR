const logEl = document.getElementById("log");
const refreshBtn = document.getElementById("refreshBtn");

// Function to fetch all cookies from background and display
function fetchAndDisplayCookies() {
  chrome.runtime.sendMessage({ action: "getCookies" }, (response) => {
    const allCookies = response.allCookies;

    if (!allCookies || allCookies.length === 0) {
      logEl.textContent = "No accessible cookies found.";
      return;
    }

    // Display all cookies
    logEl.textContent = JSON.stringify(allCookies, null, 2);
  });
}

// Refresh button
refreshBtn.addEventListener("click", fetchAndDisplayCookies);

// Automatically load cookies when popup opens
fetchAndDisplayCookies();