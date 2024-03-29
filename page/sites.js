var needToUpdate = true;

function updateTimes() {
    let presentDate = new Date(Date.now()).toDateString();

    chrome.storage.local.get({ list: [] }, function (trackedSites) {
        // console.log(trackedSites.list);
        let sites = "";
        if (needToUpdate) {
            for (let i = 0; i < trackedSites.list.length; i++) {
                let siteBlock = document.createElement("div");
                siteBlock.classList.add("website");

                siteBlock.textContent = trackedSites.list[i];
                const list = document.getElementById("blocklist");
                list.appendChild(siteBlock);
                console.log("site added")
                //old
                // sites += trackedSites.list[i] + "<br>";
                needToUpdate = false;
            }
        }
        
        // document.getElementById("blocklist").innerHTML = sites;

        chrome.storage.local.get(presentDate, function (storedObject) { 
            if(storedObject[presentDate]){
                let output = "";
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
            }
        });
    });

    var websiteCollection = document.getElementsByClassName("website");

    for (let i=0; i < websiteCollection.length; i++) {
        websiteCollection[i].onclick = function(){
            console.log("hi")
            chrome.storage.local.get({list:[]}, function (trackedSites) {

                // FIX THIS FUNCTION

                const index = trackedSites.list.indexOf(websiteCollection[i].innerHTML);
                delete trackedSites.list[i]
                console.log("found");
                // if (index > -1) { // only splice array when item is found
                //     console.log("found");
                //     delete trackedSites.list[i]
                //     // trackedSites.list[i].splice(index, 1); // 2nd parameter means remove one item only
                // }
                needToUpdate = true;
            });
        }
    };
}

var intervalID = setInterval(updateTimes, 1000);
setInterval(checkFocus, 1000);

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
        let ok = false;
        for(let i = 0; i < trackedSites.list.length; i++){
            if(blockedWebsite.includes(trackedSites.list[i]) || trackedSites.list[i].includes(blockedWebsite)){
                ok = true;
            }
        }
        if(isValidURL(blockedWebsite) && !ok){
            trackedSites.list.push(blockedWebsite);
            chrome.storage.local.set({ list: trackedSites.list }, function () { console.log("site added"); });
            needToUpdate = true;

        }
    });
}

document.getElementById("submit-time").onclick = function() {
    var time = parseInt(document.getElementById("blocked-site-time").value);
    var timeLabel = document.getElementById("time-label");
    timeLabel.innerHTML = "The current time limit for each site is " + time + " seconds";
    chrome.storage.local.set({globalTimeLimit: time}).then(() => {});
}

document.getElementById("overlay").onclick = function() {
    document.getElementById("overlay").style.display = "none";
}

document.getElementById("overlayButton").onclick = function() {
    // const div = document.createElement("div");
    // div.textContent = "STOP SCROLLING";
    // document.body.insertBefore(div, document.body.firstChild);
    // div.setAttribute("id","overlay");
    document.getElementById("overlay").style.display = "block";
}

window.onload = () => {
    chrome.storage.local.get("globalTimeLimit", (result) => {
        let timeLabel = document.getElementById("time-label");
        timeLabel.innerHTML = "The current time limit for each site is " + result.globalTimeLimit + " seconds";
    });
}

function savedData() {
    let timeLabel = document.getElementById("time-label");
    timeLabel.innerHTML = "The current time limit for each site is " + time;
}



