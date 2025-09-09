// ----- DOM -----
const todayList = document.getElementById("todayList");
const tomorrowList = document.getElementById("tomorrowList");
const todayInput = document.getElementById("todayInput");
const tomorrowInput = document.getElementById("tomorrowInput");
const todayAddBtn = document.getElementById("todayAddBtn");
const tomorrowAddBtn = document.getElementById("tomorrowAddBtn");

// ----- Storage -----
const STORAGE_KEY = "tasksData";

function getDefaultData() {
    return {
        today: [],
        tomorrow: [],
        lastDate: new Date().toDateString(),
    };
}

function getSaved() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || getDefaultData();
}

function saveTasks(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ----- Init / rollover -----
function loadTasks() {
    const saved = getSaved();
    const currentDate = new Date().toDateString();

    // Новий день → переносимо "Завтра" в "Сьогодні", але видаляємо виконані
    if (saved.lastDate !== currentDate) {
        // залишаємо лише невиконані задачі у сьогодні
        saved.today = saved.today.filter(task => !task.done);

        // додаємо всі задачі із завтра
        saved.today = [...saved.today, ...saved.tomorrow];

        // очищаємо завтра
        saved.tomorrow = [];

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

    updateBackground(data); // ← передаємо актуальні дані сюди
}

function createTaskElement(task, day, index) {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.onchange = () => toggleDone(day, index);

    const span = document.createElement("span");
    span.textContent = task.text;
    if (task.done) span.classList.add("done"); // стилізуй у CSS

    const delBtn = document.createElement("button");
    delBtn.textContent = "✖";
    delBtn.setAttribute("aria-label", "Видалити задачу");
    delBtn.onclick = () => deleteTask(day, index);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(delBtn);
    return li;
}

// ----- Background progress (знизу-вверх) -----
function updateBackground(data) {
    const allTasks = [...data.today];
    const total = allTasks.length;
    const done = allTasks.filter((t) => t.done).length;

    if (total === 0) {
        document.body.style.background = "#ffffff";
        return;
    }

    const percent = (done / total) * 100;

    // Заповнення знизу-вверх одним кольором
    document.body.style.background = `linear-gradient(
    to top,
    #c1e1c1 ${percent}%,
    #ffffff ${percent}%
  )`;

    if (done === total) {
        const sound = document.getElementById("successSound");
        if (sound) {
            sound.currentTime = 0; // почати з початку
            sound.play().catch(err => console.log("Автовідтворення заборонене:", err));
        }
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

// Додавання по Enter
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