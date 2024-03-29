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
        let pm = t >= 48 && t < 96;
        
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

            // NOTE: Haresh if you want to style these tasks then you can literally just write the html directly into this variable value (using like spans and stuff with classes or whatever you frontend wizards do).
            // NOTE: Technically this probably allows for like code injection and stuff and in a real scenario we would probably handle this but it also kinda doesn't matter because it's a local extension.
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

window.onload = () => {
    reloadTasks();
};
