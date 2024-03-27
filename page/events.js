window.onload = () => {
    let todoTasks = document.getElementById("todo-tasks");
    let completedTasks = document.getElementById("completed-tasks");

    chrome.storage.local.get(["events"]).then((result) => {
        // TODO: Add checkbox functionality later.
        for (let e of result.events) {
            let li = document.createElement("li");
            let p = document.createElement("p");

            // TODO: Add times in later using that one block algorithm
            p.innerText = e.title;

            li.appendChild(p);

            if (e.completed) {
                completedTasks.appendChild(li);
            } else {
                todoTasks.appendChild(li);
            }

            console.log(e);
        }
    });
};
