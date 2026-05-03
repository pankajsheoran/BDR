let videos = [];

// Capture video URLs
chrome.webRequest.onCompleted.addListener(
  (details) => {
    const url = details.url;

    if (
      url.endsWith(".mp4") ||
      url.endsWith(".webm")
    ) {
      if (!videos.includes(url)) {
        videos.push(url);
        console.log("Captured:", url);
      }
    }
  },
  { urls: ["<all_urls>"] }
);

// Provide videos to popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_VIDEOS") {
    sendResponse(videos);
  }

  if (msg.type === "DOWNLOAD") {
    chrome.downloads.download({
      url: msg.url,
      filename: "video.mp4",
      saveAs: true
    });
  }
});