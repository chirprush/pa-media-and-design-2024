// This script displays an (intentionally) obnoxious timer for how long the
// user has been on a specified website in order to stop them from scrolling
// for long periods of time.
//
// Perhaps the banner should gradually take up more of the screen as time goes
// on?

// NOTE: We should probably also test if the url is in one of the website urls
// because this script will run on every website visited

chrome.storage.local.get(["test"]).then((result) => {
    console.log("Result:");
    console.log(result.test);
    console.log(new Date(Date.parse(result.test.dates[0])).getDay());
});

