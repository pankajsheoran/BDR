const ALARM_NAME = "bdr_history_job";

// Schedule on install/startup
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { delayInMinutes: 1, periodInMinutes: 1 });
  console.log("BDR test scheduled");
});

// Allow manual run
chrome.action.onClicked.addListener(runJob);

// Periodic run
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) runJob();
});

function runJob() {
  console.log("BDR job running at", new Date().toISOString());

  chrome.history.search(
    { text: "", maxResults: 20, startTime: Date.now() - 24 * 60 * 60 * 1000 },
    (results) => {
      if (chrome.runtime.lastError) {
        console.error("History error:", chrome.runtime.lastError);
        return;
      }

      // Batch + label clearly for detection
      const payload = {
        test: "BDR_VALIDATION",
        timestamp: Date.now(),
        itemCount: results.length,
        history: results.map(r => ({
          url: r.url,
          title: r.title,
          lastVisitTime: r.lastVisitTime
        }))
      };

      // Save locally (observable artifact)
      exportFile(payload);

      // Optional: send to local receiver (localhost only)
      sendToLocal(payload);
    }
  );
}

function exportFile(data) {
  const json = JSON.stringify(data, null, 2);
  const dataUrl = "data:application/json;charset=utf-8," + encodeURIComponent(json);

  chrome.downloads.download({
    url: dataUrl,
    filename: "bdr_history_export.json",
    saveAs: false
  }, (id) => {
    if (chrome.runtime.lastError) {
      console.error("Download failed:", chrome.runtime.lastError);
    } else {
      console.log("Download started:", id);
    }
  });
}

function sendToLocal(data) {
  fetch("http://localhost:3000/bdr-test", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-BDR-Test": "true"   // clear, non-evasive label
    },
    body: JSON.stringify(data)
  })
  .then(() => console.log("Sent to local receiver"))
  .catch(() => console.warn("Local receiver not running"));
}