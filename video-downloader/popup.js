const list = document.getElementById("list");

chrome.runtime.sendMessage({ type: "GET_VIDEOS" }, (videos) => {
  if (!videos || videos.length === 0) {
    list.innerHTML = "No videos found";
    return;
  }

  list.innerHTML = "";

  videos.forEach((url) => {
    const btn = document.createElement("button");
    btn.textContent = "Download Video";
    btn.onclick = () => {
      chrome.runtime.sendMessage({ type: "DOWNLOAD", url });
    };
    list.appendChild(btn);
  });
});