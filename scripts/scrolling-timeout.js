// This script displays an (intentionally) obnoxious timer for how long the
// user has been on a specified website in order to stop them from scrolling
// for long periods of time.
//
// Perhaps the banner should gradually take up more of the screen as time goes
// on?

// NOTE: We should probably also test if the url is in one of the website urls
// because this script will run on every website visited

// Default initializes the key values that we need
chrome.storage.local.get(["events", "times", "sites", "globalTimeLimit"]).then((result) => {
    if (result.events === undefined) {
        chrome.storage.local.set({ events: [] }).then(() => {});
    }

    if (result.times === undefined) {
        chrome.storage.local.set({ times: [] }).then(() => {});
    }

    if (result.sites === undefined) {
        chrome.storage.local.set({ sites: [] }).then(() => {});
    }

    if (result.globalTimeLimit === undefined) {
        chrome.storage.local.set({ globalTimeLimit: 300 }).then(() => {});
    }
});

console.log("Content script updated >:3");

chrome.runtime.onMessage.addListener((message) => {
    let preexistingOverlay = document.getElementById("number-one-debater-overlay");

    // Don't add multiple overlays
    if (preexistingOverlay) {
        // preexistingOverlay.style.opacity = Math.min(1.0, preexistingOverlay.style.opacity + 0.05);
        return;
    }

    const div = document.createElement("div");
    div.textContent = "STOP SCROLLING";

    document.body.insertBefore(div, document.body.firstChild);

    div.style.textAlign = "center";
    div.style.fontSize = "128px";
    div.style.position = "fixed";
    div.style.width = "100%";
    div.style.height = "100%";
    div.style.top = "0";
    div.style.left = "0";
    div.style.right = "0";
    div.style.bottom = "0";
    div.style.backgroundColor = "#000";
    // div.style.opacity = 0.0;
    // Empirically verified
    div.style.zIndex = "1000000";
    div.style.cursor = "pointer";
    div.style.color = "#fff";

    div.setAttribute("id","number-one-debater-overlay");

    // This is critical to the functioning of the program (in our hearts).
    return false;
});
