console.log("Background service worker loaded!");

// Function to read all cookies and return a promise with a single variable
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

// Handle messages from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "getCookies") {
    getAllCookies().then(allCookies => sendResponse({ allCookies }));
    return true; // keep message channel open for async
  }
});