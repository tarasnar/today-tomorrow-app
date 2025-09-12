// ----- DOM -----
const todayList = document.getElementById("todayList");
const tomorrowList = document.getElementById("tomorrowList");
const todayInput = document.getElementById("todayInput");
const tomorrowInput = document.getElementById("tomorrowInput");
const todayAddBtn = document.getElementById("todayAddBtn");
const tomorrowAddBtn = document.getElementById("tomorrowAddBtn");

// ----- Storage -----
const STORAGE_KEY = "tasksData";

let lastTodayState = { total: 0, done: 0 };
let allDonePlayed = false;

function getDefaultData() {
    return {
        today: [],
        tomorrow: [],
        lastDate: new Date().toDateString(),
        allDoneNotified: false // прапорець — чи ми вже повідомили про 100% (запобігає повторному звуку)
    };
}

function getSaved() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || getDefaultData();
}

function saveTasks(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ----- Init / rollover (переносимо лише невиконані з сьогодні і додаємо завтра) -----
function loadTasks() {
    const saved = getSaved();
    const currentDate = new Date().toDateString();

    if (saved.lastDate !== currentDate) {
        // 🔹 Залишаємо тільки невиконані задачі з учорашнього "сьогодні"
        saved.today = saved.today.filter(task => !task.done);

        // 🔹 Переносимо задачі з "завтра", обнуляючи статус виконання
        const moved = saved.tomorrow.map(task => ({
            text: task.text,
            done: false
        }));
        saved.today = [...saved.today, ...moved];

        // 🔹 Очищаємо "завтра" і скидаємо прапорець звуку
        saved.tomorrow = [];
        saved.allDoneNotified = false;

        saved.lastDate = currentDate;
        saveTasks(saved);
    }

    renderTasks(saved);
}

// ----- CRUD -----
function addTask(day, text) {
    const trimmed = (text || "").trim();
    if (!trimmed) return;

    const data = getSaved();
    data[day].push({ text: trimmed, done: false });

    // Додавання нових задач має скинути прапорець — користувач може знову досягти 100%
    data.allDoneNotified = false;

    saveTasks(data);
    renderTasks(data);
}

function deleteTask(day, index) {
    const data = getSaved();
    if (!Array.isArray(data[day])) return;
    data[day].splice(index, 1);
    saveTasks(data);
    renderTasks(data);
}

function toggleDone(day, index) {
    const data = getSaved();
    if (!data[day] || !data[day][index]) return;
    data[day][index].done = !data[day][index].done;
    saveTasks(data);
    renderTasks(data);
}

// ----- Render -----
function renderTasks(data) {
    todayList.innerHTML = "";
    tomorrowList.innerHTML = "";

    data.today.forEach((task, index) => {
        todayList.appendChild(createTaskElement(task, "today", index));
    });

    data.tomorrow.forEach((task, index) => {
        tomorrowList.appendChild(createTaskElement(task, "tomorrow", index));
    });

    updateBackground(data); // передаємо актуальні дані сюди
}

function createTaskElement(task, day, index) {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.onchange = () => toggleDone(day, index);

    const span = document.createElement("span");
    span.textContent = task.text;
    if (task.done) span.classList.add("done");

    const delBtn = document.createElement("button");
    delBtn.textContent = "✖";
    delBtn.setAttribute("aria-label", "Видалити задачу");
    delBtn.onclick = () => deleteTask(day, index);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(delBtn);
    return li;
}

// ----- Background progress (тільки для блоку "Сьогодні") -----
function updateBackground(data) {
    const allTasks = [...data.today];
    const total = allTasks.length;
    const done = allTasks.filter((t) => t.done).length;

    if (total === 0) {
        document.body.style.background = "#ffffff";
        allDonePlayed = false; // якщо нема задач — скидаємо стан
        lastTodayState = { total: 0, done: 0 };
        return;
    }

    const percent = (done / total) * 100;

    document.body.style.background = `linear-gradient(
    to top,
    #c1e1c1 ${percent}%,
    #ffffff ${percent}%
  ) no-repeat`;
    document.body.style.backgroundSize = "100% 100vh";

    // Якщо змінились кількість або виконання у today
    const stateChanged =
        total !== lastTodayState.total || done !== lastTodayState.done;

    if (stateChanged) {
        if (done === total && !allDonePlayed) {
            const sound = document.getElementById("successSound");
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(err => console.log("Автовідтворення заборонене:", err));
            }
            allDonePlayed = true;
        }
        if (done !== total) {
            allDonePlayed = false;
        }
        lastTodayState = { total, done };
    }
}

// ----- Events -----
todayAddBtn.onclick = () => {
    addTask("today", todayInput.value);
    todayInput.value = "";
};

tomorrowAddBtn.onclick = () => {
    addTask("tomorrow", tomorrowInput.value);
    tomorrowInput.value = "";
};

todayInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        addTask("today", todayInput.value);
        todayInput.value = "";
    }
});
tomorrowInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        addTask("tomorrow", tomorrowInput.value);
        tomorrowInput.value = "";
    }
});

// ----- Start -----
loadTasks();