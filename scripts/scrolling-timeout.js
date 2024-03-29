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

    div.setAttribute("id", "number-one-debater-overlay");

    let todoTasks = document.createElement("ul");
    let todoTasksHeader = document.createElement("h2");
    let completedTasks = document.createElement("ul");
    let completedTasksHeader = document.createElement("h2");

    todoTasks.style.fontSize = "20px";
    completedTasks.style.fontSize = "20px";

    const button = document.createElement("button");
    button.textContent = "Reset Website Time";
    div.appendChild(button)

    todoTasks.id = "todo-tasks";
    completedTasks.id = "completed-tasks";

    todoTasksHeader.innerText = "Todo";
    completedTasksHeader.innerText = "Completed";

    todoTasksHeader.style.fontSize = "50px";
    completedTasksHeader.style.fontSize = "50px";

    div.appendChild(todoTasksHeader)
    div.appendChild(todoTasks);
    div.appendChild(completedTasksHeader)
    div.appendChild(completedTasks);

    /*
    const input = document.createElement("input");
    input.textContent = "time in seconds";
    div.appendChild(input)

    input.setAttribute('style', `
    color: #232729;
    font-family: "Source Sans 3", sans-serif;
    font-size: larger;
    width: 130px;
    box-sizing: border-box;
    border: 2px solid #d6d9dc ;
    border-radius: 4px;
    font-size: 16px;
    background-color: #fbfbfb;
    background-position: 10px 10px; 
    background-repeat: no-repeat;
    padding: 6px 10px 6px 20px;
    transition: width 0.4s ease-in-out;
    `);
    */

    button.setAttribute("id","overlayButton");

    // document.createStyleSheet().addRule('#overlayButton:hover', 'background:#000000;');
    // button styling

    button.setAttribute('style', `
    align-items: center;
    appearance: none;
    background-clip: padding-box;
    background-color: initial;
    background-image: none;
    border-style: none;
    box-sizing: border-box;
    color: #fff;
    cursor: pointer;
    display: inline-block;
    flex-direction: row;
    flex-shrink: 0;
    font-family: Eina01,sans-serif;
    font-size: 16px;
    font-weight: 800;
    justify-content: center;
    line-height: 24px;
    margin: 0;
    min-height: 50px;
    outline: none;
    overflow: visible;
    padding: 6px 20px;
    pointer-events: auto;
    position: relative;
    text-align: center;
    text-decoration: none;
    text-transform: none;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
    vertical-align: middle;
    width: auto;
    word-break: keep-all;
    z-index: 0;
    margin-left: 10px;
    margin-bottom: 10px;
    border-radius: 80px;
    background-image: linear-gradient(92.83deg, #1191FC 0, #f443fd 100%);
    `);

    // tasks -- NOT WORKING
    let eventStartTime = (e) => {
        let date = new Date(Date.parse(e.date));
        
        let hours = Math.floor(e.times[0] * 4);
        let minutes = 15 * (e.times[0] - 4 * hours);
    
        date.setHours(hours);
        date.setMinutes(minutes);
    
        return date.valueOf();
    };
    
    let eventExpectedTime = (e) => {
        return e.times.length * 15;
    };
    
    // Turns the array of time slice indices into human readable time strings
    let blockTimes = (times) => {
        let blocks = [];
    
        for (let i = 0; i < times.length; i++) {
            if (blocks.length === 0) {
                blocks.push([times[i], times[i]]);
                continue;
            }
    
            let prev = blocks[blocks.length - 1];
    
            if (times[i] - 1 === prev[1]) {
                prev[1] = times[i];
            } else {
                blocks.push([times[i], times[i]]);
            }
        }
    
        let readableTimes = [];
    
        let toReadable = (t) => {
            let hour = Math.floor(t / 4);
            let minute = "" + 15 * (t - 4 * hour);
            let pm = hour >= 12;
            
            hour = hour % 12;
            hour = hour === 0 ? 12 : hour;
    
            return hour + ":" + minute.padStart(2, "0") + " " + (pm ? "PM" : "AM");
        };
    
        for (let i = 0; i < blocks.length; i++) {
            let begin = blocks[i][0];
            let end = blocks[i][1] + 1;
    
            readableTimes.push(toReadable(begin) + "-" + toReadable(end));
        }
    
        return readableTimes;
    };
    
    let reloadTasks = () => {
        let todoTasks = document.getElementById("todo-tasks");
        let completedTasks = document.getElementById("completed-tasks");
    
        todoTasks.replaceChildren();
        completedTasks.replaceChildren();
    
        chrome.storage.local.get(["events"]).then((result) => {
            result.events.sort((left, right) => Date.parse(left.date) - Date.parse(right.date));
    
            for (let i = 0; i < result.events.length; i++) {
                let e = result.events[i];
                let li = document.createElement("li");
                let p = document.createElement("p");
    
                p.innerHTML = e.date + " " + blockTimes(e.times).join(", ") + " " + e.title;
    
                li.appendChild(p);
    
                if (e.completed) {
                    completedTasks.appendChild(li);
    
                    li.onclick = () => {
                        result.events[i].completed = false;
                        chrome.storage.local.set({ events: result.events }).then(() => {})
                        reloadTasks();
                    };
                } else {
                    li.onclick = () => {
                        result.events[i].completed = true;
                        result.events[i].completedTime = Date.now();
    
                        // TODO: Perhaps give this a lower bound (or maybe we want to give the average the lower bound perhaps)
                        result.events[i].ratio = (result.events[i].completedTime - eventStartTime(result.events[i])) / (1000 * 60) / eventExpectedTime(result.events[i]);
    
                        console.log(result.events[i]);
    
                        chrome.storage.local.set({ events: result.events }).then(() => {});
                        reloadTasks();
                    };
    
                    todoTasks.appendChild(li);
                }
            }
        });
    };

    reloadTasks();
    
    button.onclick = () => {
        // Remove overlay
        let el = document.getElementById("number-one-debater-overlay");
        el.remove();

        

        // Reset the time for the website
        let currentDate = new Date().toDateString();
        chrome.storage.local.get(currentDate, (result) => {
            for (let name of Object.keys(result[currentDate])) {
                if (window.location.href.includes(name)) {
                    result[currentDate][name] = 0;
                }
            }

            chrome.storage.local.set(result);
        });
    }

    // This is critical to the functioning of the program (in our hearts).
    return false;
});

// setInterval(checkButton, 1000);
// function checkButton() {
//     button.onclick() = function () {
//         console.log("button clicked: " + input.value);
//     }
// } 
