let monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

const daysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
};

let selectedDateElement = null;
let selectedDate = null;

let resetCalendar = () => {
    selectedDateElement = null;
    selectedDate = null;

    for (let i = 0; i < 42; i++) {
        let el = document.getElementById("day-slot-" + i);

        el.classList.remove("selected");
    }
};

let onDayClick = (day, date) => {
    if (selectedDateElement !== null) {
        selectedDateElement.classList.remove("selected");
    }

    if (day === selectedDateElement) {
        selectedDateElement = null;
        selectedDate = null;
    } else {
        selectedDateElement = day;
        selectedDate = date;

        selectedDateElement.classList.add("selected");
    }
};

const displayFromDate = (currentTime) => {
    selectedDateElement = null;
    selectedDate = null;

    let year = currentTime.getFullYear();
    let monthIndex = currentTime.getMonth();

    let calendarYear = document.getElementById("calendar-year");
    let calendarMonth = document.getElementById("calendar-month");

    calendarYear.innerText = year;
    calendarMonth.innerText = monthNames[monthIndex];
    
    let it = new Date(currentTime);
    
    // Can't you just change this to it.setDate(1);
    while (it.getDate() != 1) {
        it.setDate(it.getDate() - 1);
    }

    let dayOfWeek = it.getDay();

    for (let i = 0; i < 42; i++) {
        let el = document.getElementById("day-slot-" + i);
        if (i >= dayOfWeek && i < dayOfWeek + daysInMonth(it.getFullYear(), it.getMonth())) {
            // Give each element a date object?
            // NOTE: Also check to see if there are any events this day and highlight them.
            el.innerText = "" + (i - dayOfWeek + 1);

            let thisDate = new Date(it);

            el.onclick = () => onDayClick(el, thisDate);
            it.setDate(it.getDate() + 1);
        } else {
            el.innerText = "";
        }
    }
};


// If true, then dragging will select times; otherwise, it will remove them.
let isSelectingTime = true;
let isMouseDown = false;
let selectStart = null;

const resetTimes = () => {
    isSelectingTime = true;
    isMouseDown = false;
    selectStart = null;

    // NOTE: If we change the time slices to 5, we'll have to change this later
    for (let i = 0; i < 96; i++) {
        let el = document.getElementById("time-slice-" + i);

        // TODO: We should also highlight the slices that are already taken up
        // in other events
        el.className = "time-slice";

        el.onmousedown = () => onSlicePress(el, i);
        el.onmouseover = () => onSliceHover(el, i);
        el.onmouseup = () => onSliceRelease(el, i);
    }
};

// TODO: Make it so that slices that are already taken up by other events are
// not able to be selected -> Or maybe we do want this to be possible maybe.
let onSlicePress = (slice, sliceId) => {
    isMouseDown = true;
    isSelectingTime = !(slice.classList.contains("selected"));
    selectStart = sliceId;

    if (isSelectingTime) {
        slice.classList.add("selected");
    } else {
        slice.classList.remove("selected");
    }
};

let onSliceRelease = (slice, sliceId) => {
    isMouseDown = false;
};

let onSliceHover = (slice, sliceId) => {
    if (!isMouseDown) { return; }

    let diff = selectStart < sliceId ? 1 : -1;

    for (let i = selectStart; i != sliceId + diff; i += diff) {
        let s = document.getElementById("time-slice-" + i);
        if (isSelectingTime) {
            s.classList.add("selected");
        } else {
            s.classList.remove("selected");
        }
    }
};

window.onmousedown = () => {
    isMouseDown = true;
    selectStart = selectStart === null ? 0 : selectStart;
};

window.onmouseup = () => {
    isMouseDown = false;
    selectStart = null;
};

let currentDate = new Date(Date.now());

window.onload = () => {
    resetTimes();
    displayFromDate(currentDate);

    let prevMonth = document.getElementById("calendar-prev-month");
    let nextMonth = document.getElementById("calendar-next-month");

    let createTask = document.getElementById("create-task-button");

    prevMonth.onclick = () => {
        selectedDateElement = null;
        selectedDate = null;

        resetCalendar();
        onDayClick(selectedDateElement, selectedDate);

        currentDate.setMonth(currentDate.getMonth() - 1);
        displayFromDate(currentDate);
    };

    nextMonth.onclick = () => {
        selectedDateElement = null;
        selectedDate = null;

        resetCalendar();
        onDayClick(selectedDateElement, selectedDate);

        currentDate.setMonth(currentDate.getMonth() + 1);
        displayFromDate(currentDate);
    };

    createTask.onclick = () => {
        let taskTitleEl = document.getElementById("task-title");
        let taskTitle = document.getElementById("task-title").value.trim();

        if (taskTitle.length === 0) {
            alert("Enter a valid title for your task");
            return;
        }

        if (selectedDateElement === null) {
            alert("Select a valid date for your task");
            return;
        }

        let times = [];

        for (let i = 0; i < 96; i++) {
            if (document.getElementById("time-slice-" + i).classList.contains("selected")) {
                times.push(i);
            }
        }

        if (times.length === 0) {
            alert("Select a valid range of times for the task to run");
            return;
        }

        taskTitleEl.value = "";
        resetTimes();

        alert("Task created");

        chrome.storage.local.get(["events"]).then((result) => {
            // Just to be safe
            events = result.events || [];

            events.push({ title: taskTitle, date: selectedDate.toDateString(), times: times, completed: false });

            chrome.storage.local.set({ events: events }).then((result) => {});
        });
    }
};
