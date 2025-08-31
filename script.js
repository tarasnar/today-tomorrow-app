const todayList = document.getElementById("todayList");
const tomorrowList = document.getElementById("tomorrowList");
const todayInput = document.getElementById("todayInput");
const tomorrowInput = document.getElementById("tomorrowInput");
const todayAddBtn = document.getElementById("todayAddBtn");
const tomorrowAddBtn = document.getElementById("tomorrowAddBtn");

const STORAGE_KEY = "tasksData";

function loadTasks() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
        today: [],
        tomorrow: [],
        lastDate: new Date().toDateString(),
    };

    const currentDate = new Date().toDateString();
    if (saved.lastDate !== currentDate) {
        saved.today = [...saved.today, ...saved.tomorrow];
        saved.tomorrow = [];
        saved.lastDate = currentDate;
        saveTasks(saved);
    }

    renderTasks(saved);
}

function saveTasks(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function addTask(day, text) {
    if (!text.trim()) return;
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
        today: [],
        tomorrow: [],
        lastDate: new Date().toDateString(),
    };
    saved[day].push({ text, done: false });
    saveTasks(saved);
    renderTasks(saved);
}

function deleteTask(day, index) {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    saved[day].splice(index, 1);
    saveTasks(saved);
    renderTasks(saved);
}

function toggleDone(day, index) {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    saved[day][index].done = !saved[day][index].done;
    saveTasks(saved);
    renderTasks(saved);
}

function renderTasks(data) {
    todayList.innerHTML = "";
    tomorrowList.innerHTML = "";

    data.today.forEach((task, index) => {
        const li = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.done;
        checkbox.onchange = () => toggleDone("today", index);

        const span = document.createElement("span");
        span.textContent = task.text;
        if (task.done) span.classList.add("done");

        const delBtn = document.createElement("button");
        delBtn.textContent = "✖";
        delBtn.onclick = () => deleteTask("today", index);

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(delBtn);
        todayList.appendChild(li);
    });

    data.tomorrow.forEach((task, index) => {
        const li = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.done;
        checkbox.onchange = () => toggleDone("tomorrow", index);

        const span = document.createElement("span");
        span.textContent = task.text;
        if (task.done) span.classList.add("done");

        const delBtn = document.createElement("button");
        delBtn.textContent = "✖";
        delBtn.onclick = () => deleteTask("tomorrow", index);

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(delBtn);
        tomorrowList.appendChild(li);
    });
}

todayAddBtn.onclick = () => {
    addTask("today", todayInput.value);
    todayInput.value = "";
};

tomorrowAddBtn.onclick = () => {
    addTask("tomorrow", tomorrowInput.value);
    tomorrowInput.value = "";
};

loadTasks();