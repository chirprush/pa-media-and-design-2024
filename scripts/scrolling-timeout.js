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

