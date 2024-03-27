/*
Data format:
--------------------------------------------------------------------------------
Since all the data is local to the user we don't need to worry about storing
users like we previously had.

We'll likely have a key in the local storage for the events as a list of
dictionaries with each dictionary representing an event. This shall go under
the key "events". We shall have a separate key for "times", which shall be the
time (in seconds) they have spent on the specified websites (given by their
domain, although we're literally just linear searching through the string to
see if its contained so). We shall also store an array of websites that the
user wants us to track (also simply given by the domain/anything that the url
will contain).

Example:
{
    "events" : [
        {
            "title" : "Work on PA Media and Design",
            "date" : "Mon Mar 25 2024",
            "times" : [48, 49, 50, 51],
            "completed" : false
        }
    ],
    "times" : {
        "youtube" : 100
    },
    "sites" : [
        "youtube",
        "instagram",
        "facebook",
        "twitter"
    ]
}

Each event shall have a title and a date string for which the event is valid.
The date shall have a corresponding array of times for which the event shall be
considered running. This array is actually an array of integers, corresponding
to one of the 24 * (60 / 15) = 96 blocks of time created when you divide the
day into 15 minute intervals. In this example, [48, 49, 50, 51] corresponds to
12 pm to 1 pm. We also keep track of whether or not the event is completed or not for obvious reasons.

As a note, all Date objects should be serialized to date strings as seen above
by using `.toDateString()`. These can be deserialized back to Date objects
using `new Date(Date.parse(str))` or something similar.

NOTE: We should probably initialize this schema somewhere when the extension
starts or something.
*/

// chrome.storage.local.set({ test: {"title": "Hello", "dates": [new Date().toDateString()]} }).then(() => {});

// chrome.storage.local.get(["test"]).then((result) => {
//     console.log("help me please");
//     console.log("Result:");
//     console.log(result.test);
//     console.log(new Date(Date.parse(result.test.dates[0])).getDay());
// });

// chrome.storage.local.set({list:[], function() {
//     console.log("created tracked sites list");
// }});

function isValidURL(givenURL) {
    if (givenURL) {
        if (givenURL.includes(".")) {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }
}

function getDomain(link) {
    try {
        if (link) {
            return link[0].url.split("/")[2];
        }
        else {
            return null;
        }
    }
    catch (err) {
        console.log("bad things part 2");
    }
};

function updateTime() {

    

    let presentDate = new Date(Date.now()).toDateString();

    chrome.storage.local.get({ list: [] }, function (trackedSites) {
        // console.log(trackedSites.list);
        let sites = "";
        for (let i = 0; i < trackedSites.list.length; i++) {
            sites += trackedSites.list[i] + "<br>";
        }
        document.getElementById("blocklist").innerHTML = sites;
    });

    chrome.storage.local.get({ list: [] }, function (trackedSites) {
        chrome.storage.local.get(presentDate, function (storedObject) {
            let output = "";
            console.log(storedObject);
            for (let i = 0; i < trackedSites.list.length; i++) {
                let ok = false;
                let site = "";
                for (let key of Object.keys(storedObject[presentDate])) {
                    if (key.includes(trackedSites.list[i])) {
                        site = key;
                        ok = true;
                    }
                }
                if (ok) {
                    output += trackedSites.list[i] + ": " + storedObject[presentDate][site] + " seconds <br>";
                }
            }
            document.getElementById("timelist").innerHTML = output;
        });
    });
    
    chrome.tabs.query({ "active": true, "lastFocusedWindow": true }, function (activeTab) {
        let domain = getDomain(activeTab);
        if (isValidURL(domain)) {
            let currentTime = 0;
            chrome.storage.local.get(presentDate, function (storedObject) {
                // console.log(storedObject);
                if (storedObject[presentDate]) {
                    if (storedObject[presentDate][domain]) {
                        currentTime = storedObject[presentDate][domain] + 1;
                        storedObject[presentDate][domain] = currentTime;
                        chrome.storage.local.set(storedObject, function () {
                            console.log(domain + " at " + storedObject[presentDate][domain]);
                        });
                    }
                    else {
                        currentTime++;
                        storedObject[presentDate][domain] = currentTime;
                        chrome.storage.local.set(storedObject, function () {
                            console.log(domain + " at " + storedObject[presentDate][domain]);
                        });
                    }
                }
                else {
                    currentTime++;
                    storedObject[presentDate] = {};
                    storedObject[presentDate][domain] = currentTime;
                    chrome.storage.local.set(storedObject, function () {
                        console.log(domain + " at " + storedObject[presentDate][domain]);
                    })
                }
            });
        }
    });
};

var intervalID = setInterval(updateTime, 500);
setInterval(checkFocus, 500);

function checkFocus() {
    chrome.windows.getCurrent(function (window) {
        if (window.focused) {
            if (!intervalID) {
                intervalID = setInterval(updateTime, 1000);
            }
        }
        else {
            if (intervalID) {
                clearInterval(intervalID);
                intervalID = null;
            }
        }
    });
}
document.getElementById("submit-block").onclick = function() {
    var blockedWebsite = document.getElementById("blocked-site").value;
    chrome.storage.local.get({list:[]}, function (trackedSites) {
        if(isValidURL(blockedWebsite) && !trackedSites.list.includes(blockedWebsite)){
            trackedSites.list.push(blockedWebsite);
            chrome.storage.local.set({ list: trackedSites.list }, function () { console.log("site added"); });
        }
    });
}


