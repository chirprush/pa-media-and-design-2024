function updateTimes() {
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
}

var intervalID = setInterval(updateTimes, 500);
setInterval(checkFocus, 500);

function checkFocus() {
    chrome.windows.getCurrent(function (window) {
        if (window.focused) {
            if (!intervalID) {
                intervalID = setInterval(updateTimes, 1000);
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

