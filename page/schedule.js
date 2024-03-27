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

const displayFromDate = (currentTime) => {
    let year = currentTime.getFullYear();
    let monthIndex = currentTime.getMonth();

    let calendarYear = document.getElementById("calendar-year");
    let calendarMonth = document.getElementById("calendar-month");

    calendarYear.innerText = year;
    calendarMonth.innerText = monthNames[monthIndex];
    
    let it = new Date(currentTime);
    
    while (it.getDate() != 1) {
        it.setDate(it.getDate() - 1);
    }

    let dayOfWeek = it.getDay();

    for (let i = 0; i < 42; i++) {
        let el = document.getElementById("day-slot" + i);
        if (i >= dayOfWeek && i < dayOfWeek + daysInMonth(it.getFullYear(), it.getMonth())) {
            // Give each element a date object?
            // NOTE: Also check to see if there are any events this day and highlight them.
            el.innerText = "" + (i - dayOfWeek + 1);
        } else {
            el.innerText = "";
        }
    }
};

// If true, then dragging will select times; otherwise, it will remove them.
let isSelectingTime = true;

const resetTimes = () => {
    isSelectingTime = true;

    // NOTE: If we change the time slices to 5, we'll have to change this later
    for (let i = 0; i < 96; i++) {
        let el = document.getElementById("time-slice-" + i);

        el.className = "time-slice";
    }
};

let currentDate = new Date(Date.now());

window.onload = () => {
    displayFromDate(currentDate);

    let prevMonth = document.getElementById("calendar-prev-month");
    let nextMonth = document.getElementById("calendar-next-month");

    prevMonth.onclick = () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        displayFromDate(currentDate);
    }

    nextMonth.onclick = () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        displayFromDate(currentDate);
    }
};
