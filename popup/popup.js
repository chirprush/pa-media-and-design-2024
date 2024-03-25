console.log("Note: popup.js running");

// As per https://developer.chrome.com/docs/extensions/develop/ui/options-page
document.querySelector("#options-link").addEventListener("click", () => {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        // Perhaps handle this better later on
        alert("Error in opening options page: potentially an old version of chrome?");
    }
});
