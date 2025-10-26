// === 🌙 Тема ===
const themeToggle = document.getElementById("theme-toggle");

const animateThemeChange = () => {
  document.body.style.transition = "background 0.8s ease, color 0.8s ease";
  setTimeout(() => (document.body.style.transition = ""), 800);
};

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️";
  themeToggle.classList.add("sun");
} else {
  themeToggle.textContent = "🌙";
  themeToggle.classList.add("moon");
}

themeToggle.addEventListener("click", () => {
  animateThemeChange();
  document.body.classList.toggle("dark");
  themeToggle.classList.add("rotate");
  setTimeout(() => themeToggle.classList.remove("rotate"), 400);

  if (document.body.classList.contains("dark")) {
    themeToggle.textContent = "☀️";
    themeToggle.classList.replace("moon", "sun");
    localStorage.setItem("theme", "dark");
  } else {
    themeToggle.textContent = "🌙";
    themeToggle.classList.replace("sun", "moon");
    localStorage.setItem("theme", "light");
  }
});

// === 🧩 Звички ===
const habitForm = document.getElementById("habit-form");
const habitTableBody = document.getElementById("habit-table-body");
let habits = JSON.parse(localStorage.getItem("habits")) || [];

// === 📈 Оновлення статистики ===
function updateStats() {
  const total = habits.length;
  const done = habits.filter((h) => h.done).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  const circle = document.querySelector(".circle-progress");
  const text = document.getElementById("progressText");
  const summary = document.getElementById("progressSummary");
  const progressContainer = document.getElementById("progressContainer");

  if (circle)
    circle.style.background = `conic-gradient(var(--accent-color) ${
      percent * 3.6
    }deg, var(--circle-bg) ${percent * 3.6}deg)`;

  if (text) text.textContent = `${percent}%`;
  if (summary)
    summary.innerHTML = `📈 Виконано <strong>${done}</strong> із <strong>${total}</strong> звичок`;

  const oldMsg = document.querySelector(".success-message");
  if (oldMsg) oldMsg.remove();

  if (percent === 100 && total > 0) {
    const msg = document.createElement("p");
    msg.innerHTML = `🎉 <strong>Всі звички виконано! Молодець! 💚</strong>`;
    msg.classList.add("success-message");
    progressContainer.appendChild(msg);
    launchConfetti();
  }
}

// === 🎉 Конфетті ===
function launchConfetti() {
  const colors = ["#A28CF2", "#B8E986", "#FFD86F", "#FF6F91", "#6B48B8"];
  for (let i = 0; i < 40; i++) {
    const confetti = document.createElement("div");
    confetti.style.position = "fixed";
    confetti.style.top = "-10px";
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.width = "10px";
    confetti.style.height = "10px";
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    confetti.style.opacity = Math.random();
    confetti.style.borderRadius = "50%";
    confetti.style.zIndex = "9999";
    confetti.style.transition = "top 3s ease, opacity 3s ease";
    document.body.appendChild(confetti);

    setTimeout(() => {
      confetti.style.top = "100vh";
      confetti.style.opacity = "0";
    }, 100);
    setTimeout(() => confetti.remove(), 3000);
  }
}

// === 📋 Фільтрація та рендер звичок ===
let currentFilter = "all";
let currentCategory = "all";

function renderFilteredHabits() {
  habitTableBody.innerHTML = "";

  const filtered = habits.filter((habit) => {
    if (currentFilter === "done" && !habit.done) return false;
    if (currentFilter === "notdone" && habit.done) return false;
    if (currentCategory !== "all" && habit.category !== currentCategory)
      return false;
    return true;
  });

  filtered.forEach((habit, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${habit.name}</td>
      <td>${habit.desc}</td>
      <td>${habit.frequency}</td>
      <td><span class="badge badge-${habit.category?.toLowerCase() || "none"}">${habit.category || "—"}</span></td>
      <td><input type="checkbox" ${habit.done ? "checked" : ""} data-index="${index}"></td>
      <td>${habit.streak || 0}</td>
      <td>
        <button class="edit-btn" data-index="${index}" title="Редагувати">✏️</button>
        <button class="delete-btn" data-index="${index}" title="Видалити">🗑️</button>
      </td>
    `;
    habitTableBody.appendChild(row);
  });

  attachHabitEventListeners();
  updateStats();
}

// === 🧹 Очистити всі звички ===
const clearAllBtn = document.getElementById("clearAllBtn");
if (clearAllBtn) {
  clearAllBtn.addEventListener("click", () => {
    if (habits.length === 0) {
      alert("Список звичок вже порожній 🌸");
      return;
    }
    if (confirm("Ти впевнений(а), що хочеш видалити всі звички? 😢")) {
      habits = [];
      localStorage.removeItem("habits");
      renderFilteredHabits();
      updateStats();
      alert("Усі звички очищено 🧹");
    }
  });
}

// === 🧠 Події чекбоксів, редагування, видалення ===
function attachHabitEventListeners() {
  document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) =>
  checkbox.addEventListener("change", (e) => {
    const idx = e.target.dataset.index;
    const habit = habits[idx];
    const today = new Date().toISOString().split("T")[0];
    const todayDate = new Date(today);

    if (e.target.checked) {
      habit.done = true;

      // Ініціалізуємо масив дат
      if (!habit.dates) habit.dates = [];

      // Якщо день ще не записано — додаємо
      if (!habit.dates.includes(today)) habit.dates.push(today);

      // Сортуємо дати (на випадок збоїв)
      habit.dates.sort();

      // === Рахуємо серію 🔥 ===
      if (habit.dates.length > 1) {
        const lastDate = new Date(habit.dates[habit.dates.length - 2]);
        const diffDays = Math.floor(
          (todayDate - lastDate) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          habit.streak = (habit.streak || 0) + 1;
        } else {
          habit.streak = 1;
        }
      } else {
        habit.streak = 1;
      }

    } else {
      // Якщо зняли позначку
      habit.done = false;
    }

    localStorage.setItem("habits", JSON.stringify(habits));
    renderFilteredHabits();
  })
);
  document.querySelectorAll(".edit-btn").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const idx = e.target.dataset.index;
      const habit = habits[idx];
      document.getElementById("habit-name").value = habit.name;
      document.getElementById("habit-desc").value = habit.desc;
      document.getElementById("habit-frequency").value = habit.frequency;
      document.getElementById("habit-category").value =
        habit.category || "Інше";
      habitForm.dataset.editing = idx;
      document.getElementById("edit-indicator").style.display = "block";
      document.getElementById("edit-name").textContent = habit.name;
      hideAllSections();
      addSection.classList.add("active");
    })
  );

  document.querySelectorAll(".delete-btn").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const idx = e.target.dataset.index;
      habits.splice(idx, 1);
      localStorage.setItem("habits", JSON.stringify(habits));
      renderFilteredHabits();
      updateStats();
    })
  );
}

// === 🔍 Фільтрація ===
const filterAll = document.getElementById("filterAll");
const filterDone = document.getElementById("filterDone");
const filterNotDone = document.getElementById("filterNotDone");
const categoryFilter = document.getElementById("categoryFilter");

if (categoryFilter) {
  categoryFilter.addEventListener("change", () => {
    currentCategory = categoryFilter.value;
    renderFilteredHabits();
  });
}

[filterAll, filterDone, filterNotDone].forEach((btn) => {
  btn.addEventListener("click", () => {
    [filterAll, filterDone, filterNotDone].forEach((b) =>
      b.classList.remove("active")
    );
    btn.classList.add("active");

    if (btn === filterDone) currentFilter = "done";
    else if (btn === filterNotDone) currentFilter = "notdone";
    else currentFilter = "all";

    renderFilteredHabits();
  });
});

// === ➕ Додавання / редагування звички ===
habitForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("habit-name").value.trim();
  const desc = document.getElementById("habit-desc").value.trim();
  const frequency = document.getElementById("habit-frequency").value;
  const category = document.getElementById("habit-category").value;

  if (!name) return;

  const editingIndex = habitForm.dataset.editing;
  if (editingIndex !== undefined) {
    habits[editingIndex] = {
      ...habits[editingIndex],
      name,
      desc,
      frequency,
      category,
    };
    delete habitForm.dataset.editing;
  } else {
    habits.push({
      name,
      desc,
      frequency,
      category,
      done: false,
      streak: 0,
      dates: [],
    });
  }

  localStorage.setItem("habits", JSON.stringify(habits));
  habitForm.reset();
  document.getElementById("edit-indicator").style.display = "none";

  renderFilteredHabits();
  hideAllSections();
  listSection.classList.add("active");
});

// === 🔁 Перемикання секцій ===
const homeSection = document.getElementById("homeSection");
const addSection = document.getElementById("add-habit");
const listSection = document.getElementById("habit-list");
const statsSection = document.getElementById("statsSection");
const calendarSection = document.getElementById("calendarSection");

const homeBtn = document.getElementById("homeBtn");
const addBtn = document.getElementById("addBtn");
const listBtn = document.getElementById("listBtn");
const statsBtn = document.getElementById("statsBtn");
const calendarBtn = document.getElementById("calendarBtn");

function hideAllSections() {
  document.querySelectorAll("section").forEach((sec) =>
    sec.classList.remove("active")
  );
}

homeBtn.addEventListener("click", () => {
  hideAllSections();
  homeSection.classList.add("active");
});
addBtn.addEventListener("click", () => {
  hideAllSections();
  addSection.classList.add("active");
});
listBtn.addEventListener("click", () => {
  hideAllSections();
  listSection.classList.add("active");
});
statsBtn.addEventListener("click", () => {
  hideAllSections();
  statsSection.classList.add("active");
});
calendarBtn.addEventListener("click", () => {
  hideAllSections();
  calendarSection.classList.add("active");
  renderCalendar();
});

// === 📅 КАЛЕНДАР ===
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const monthLabel = document.getElementById("monthLabel");
const calendarContainer = document.getElementById("calendarContainer");

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function renderCalendar() {
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const today = new Date().toISOString().split("T")[0];

  monthLabel.textContent = firstDay.toLocaleString("uk-UA", {
    month: "long",
    year: "numeric",
  });

  calendarContainer.innerHTML = "";

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(currentYear, currentMonth, i);
    const dateStr = date.toISOString().split("T")[0];
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day");
    dayDiv.textContent = i;

    if (dateStr === today) dayDiv.classList.add("today");

    const doneThatDay = habits.some((h) => h.dates && h.dates.includes(dateStr));
    if (doneThatDay) dayDiv.classList.add("done");

    calendarContainer.appendChild(dayDiv);
  }
}

prevMonthBtn.addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
});

// === 🚀 Старт ===
document.addEventListener("DOMContentLoaded", () => {
  renderFilteredHabits();
  updateStats();
  hideAllSections();
  homeSection.classList.add("active");
});
