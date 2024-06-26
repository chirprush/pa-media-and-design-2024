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

// Default initializes the key values that we need
chrome.storage.local.get(["events", "times", "sites", "globalTimeLimit", "autocloseToggle"]).then((result) => {
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
        chrome.storage.local.set({ globalTimeLimit: 20 }).then(() => {});
    }

    if (result.autocloseToggle === undefined) {
        chrome.storage.local.set({ autocloseToggle: false }).then(() => {});
    }
});


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
    let presentHour = new Date(Date.now()).getHours();
    let presentMinute = new Date(Date.now()).getMinutes();
    
    chrome.tabs.query({ "active": true, "lastFocusedWindow": true }, function (activeTab) {
        chrome.storage.local.get({ list: [] }, function (trackedSites) {
            chrome.storage.local.get([presentDate, "autocloseToggle"], function (storedObject) {
                let autocloseToggle = storedObject.autocloseToggle;
                let domain = getDomain(activeTab);
                if (isValidURL(domain)) {
                    let currentTime = 0;
                    // console.log(storedObject);
                    if (storedObject[presentDate]) {
                        if (storedObject[presentDate][domain]) {
                            console.log("Updated time for: " + domain + " " + currentTime);
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

                    let isTracked = false;
                    for (let i = 0; i < trackedSites.list.length; i++) {
                        if (domain.includes(trackedSites.list[i])) {
                            isTracked = true;
                        }
                    }
                    
                    console.log("istracked:" + isTracked);

                    chrome.storage.local.get("globalTimeLimit", function (globalTimeLimit) {
                        if (storedObject[presentDate][domain] >= globalTimeLimit.globalTimeLimit && isTracked) {
                            chrome.tabs.query({ "active": true, "currentWindow": true }, function (tabs) {
                                if (autocloseToggle) {
                                    chrome.tabs.remove(tabs[0].id);
                                    
                                } else {
                                    // popup functions
                                    console.log("Adding overlay");
                                    console.log(tabs[0].id);
                                    addOverlay(tabs[0].id);
                                }
                                
                            });
                        }
                    });

                    if (autocloseToggle){
                        if(isTracked){
                            chrome.storage.local.get(["events"]).then((result) => {
                                let currentTimeIndex = parseInt((presentHour * 60 + presentMinute) / 15);
                                for (let i = 0; i < result.events.length; i++) {
                                    let inEvent = false;
                                    let e = result.events[i];
                                    console.log(e);
                                    // console.log(e.date);
                                    if (e.date == presentDate) {
                                        for (let j = 0; j < e.times.length; j++) {
                                            if (e.times[j] == currentTimeIndex) {
                                                inEvent = true;
                                            }
                                        }
                                    }
                                    if (inEvent && !e.completed) {
                                        chrome.tabs.query({ "active": true, "currentWindow": true }, function (tabs) {
                                            chrome.tabs.remove(tabs[0].id);
                                        });
                                    }
                                }
                            });
                        }
                    }

                    /*
                    chrome.storage.local.get("globalTimeLimit", function (globalTimeLimit) {
                        if (storedObject[presentDate][domain] >= globalTimeLimit.globalTimeLimit && isTracked) {
                            chrome.tabs.query({ "active": true, "currentWindow": true }, function (tabs) {
                                if (!inEvent) {
                                    // add overlay code that says stuff like do you want to keep going or 5 more minutes or smth like that
                                    // should DEFINITELY DEFINITELY DISPLAY THE FUTURE TASKS
                                }
                            });
                        }
                    });
                    */
                };
            });
        });
    });
};

var intervalID = setInterval(updateTime, 1000);
setInterval(checkFocus, 1000);


// Experimental
// setInterval(addPopup, 3000);

/*
function addPopup() {
    const div = document.createElement("div");
    div.textContent = "STOP SCROLLING";
    document.body.insertBefore(div, document.body.firstChild);
    div.setAttribute("id","overlay");
}
*/

function addOverlay(tabId) {
    chrome.tabs.sendMessage(
        tabId,
        "Send overlay"
    );
}

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

// This feature shall be put on hold until we discuss it further, as it seems
// rather redundant.
/*
chrome.tabs.onActivated.addListener((activeInfo) => {
    console.log(activeInfo);
    chrome.tabs.query({}, (tabs) => {
        let targetTab;

        for (let tab of tabs) {
        }
    });
});
*/
