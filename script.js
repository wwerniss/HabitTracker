// ===  Тема ===
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
  updateStats();
});

// ===  Звички ===
const habitForm = document.getElementById("habit-form");
const habitTableBody = document.getElementById("habit-table-body");
let habits = JSON.parse(localStorage.getItem("habits")) || [];

// ===  Оновлення статистики ===
function updateStats() {
  const total = habits.length;
  const done = habits.filter((h) => h.done).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  const circle = document.querySelector(".circle-progress");
  const text = document.getElementById("progressText");
  const summary = document.getElementById("progressSummary");
  const progressContainer = document.getElementById("progressContainer");

  if (circle) {
    const styles = getComputedStyle(document.body);
    const accentColor = styles.getPropertyValue("--accent-color").trim();
    const circleBg = styles.getPropertyValue("--circle-bg").trim();
    circle.style.background = `conic-gradient(${accentColor} ${
      percent * 3.6
    }deg, ${circleBg} ${percent * 3.6}deg)`;
  }

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

// ===  Конфетті ===
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

// ===  Рендер звичок ===
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
      <td>${habit.reminderTime || "—"}</td>
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

// ===  Очистити всі звички ===
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

// ===  Події ===
function attachHabitEventListeners() {
  document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) =>
    checkbox.addEventListener("change", (e) => {
      const idx = e.target.dataset.index;
      const habit = habits[idx];
      const today = new Date().toISOString().split("T")[0];
      const todayDate = new Date(today);

      if (e.target.checked) {
        habit.done = true;
        if (!habit.dates) habit.dates = [];
        if (!habit.dates.includes(today)) habit.dates.push(today);
        habit.dates.sort();
        showToast(`🎉 Молодець! "${habit.name}" виконано!`);

        if (habit.dates.length > 1) {
          const lastDate = new Date(habit.dates[habit.dates.length - 2]);
          const diffDays = Math.floor(
            (todayDate - lastDate) / (1000 * 60 * 60 * 24)
          );
          if (diffDays === 1) habit.streak = (habit.streak || 0) + 1;
          else habit.streak = 1;
        } else habit.streak = 1;
      } else {
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
      document.getElementById("habit-category").value = habit.category || "Інше";
      document.getElementById("habit-reminder").value =
        habit.reminderTime || "";
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

// ===  Фільтрація ===
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

// ===  Додавання / редагування звички ===
habitForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("habit-name").value.trim();
  const desc = document.getElementById("habit-desc").value.trim();
  const frequency = document.getElementById("habit-frequency").value;
  const category = document.getElementById("habit-category").value;
  const reminderTime = document.getElementById("habit-reminder").value;

  if (!name) return;

  const editingIndex = habitForm.dataset.editing;
  if (editingIndex !== undefined) {
    habits[editingIndex] = {
      ...habits[editingIndex],
      name,
      desc,
      frequency,
      category,
      reminderTime,
    };
    delete habitForm.dataset.editing;
  } else {
    habits.push({
      name,
      desc,
      frequency,
      category,
      reminderTime,
      done: false,
      streak: 0,
      dates: [],
    });
  }

  localStorage.setItem("habits", JSON.stringify(habits));
  habitForm.reset();
  document.getElementById("edit-indicator").style.display = "none";
  showToast(`✅ Звичку "${name}" додано!`);

  renderFilteredHabits();
  hideAllSections();
  listSection.classList.add("active");
});

// ===  НАГАДУВАННЯ ===
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

function checkReminders() {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);

  habits.forEach((habit) => {
    if (habit.reminderTime === currentTime && !habit.done) {
      showNotification(habit);
    }
  });
}

function showNotification(habit) {
  showToast(`⏰ Нагадування: не забудь — "${habit.name}"`);
}

setInterval(checkReminders, 60000);

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

// ===  КАЛЕНДАР ===
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

// ===  Локальне візуальне нагадування ===
function showToast(message) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 6000);
}

// ===  Старт ===
document.addEventListener("DOMContentLoaded", () => {
  renderFilteredHabits();
  updateStats();
  hideAllSections();
  homeSection.classList.add("active");
  renderCalendar();
  initTutorial();
});

// ===  ІНТЕРАКТИВНИЙ ТУТОРІАЛ ===
function initTutorial() {
  const overlay = document.getElementById("tutorial-overlay");
  const title = document.getElementById("tutorial-title");
  const text = document.getElementById("tutorial-text");
  const nextBtn = document.getElementById("tutorial-next");
  const prevBtn = document.getElementById("tutorial-prev");
  const skipBtn = document.getElementById("tutorial-skip");
  const progress = document.getElementById("tutorial-progress");
  const dontShow = document.getElementById("tutorial-dont-show");
  const helpBtn = document.getElementById("helpBtn");
  const KEY = "habitTutorialSeen";

  const steps = [
    { title: "Ласкаво просимо 💜", text: "Це Habit Tracker — твій помічник у формуванні звичок!", selector: "#homeSection" },
    { title: "Додай звичку", text: "Тут ти можеш створювати нові звички та ставити нагадування.", selector: "#add-habit" },
    { title: "Список звичок", text: "Відмічай виконані звички, редагуй і видаляй їх тут.", selector: "#habit-list" },
    { title: "Статистика", text: "Переглядай відсоток виконання і мотивуй себе 💪", selector: "#statsSection" },
    { title: "Календар", text: "Бач свій прогрес по днях 📅", selector: "#calendarSection" },
    { title: "Тема", text: "Перемикай світлу/темну тему 🌙☀️", selector: "#theme-toggle" },
    { title: "Готово!", text: "Тепер ти знаєш усе 😊 Натисни 'Почати', щоб користуватись додатком!", selector: null },
  ];

  let i = 0;
  let highlighted = null;

  function showTutorial(force = false) {
    if (!force && localStorage.getItem(KEY) === "true") return;
    overlay.classList.remove("hidden");
    renderStep();
  }

  function hideTutorial(save = true) {
    overlay.classList.add("hidden");
    clearHighlight();
    if (save || dontShow.checked) localStorage.setItem(KEY, "true");
  }

  function highlight(selector) {
    clearHighlight();
    if (!selector) return;
    const el = document.querySelector(selector);
    if (el) {
      el.classList.add("pulse-highlight");
      highlighted = el;
    }
  }

  function clearHighlight() {
    if (highlighted) {
      highlighted.classList.remove("pulse-highlight");
      highlighted = null;
    }
  }

  function renderStep() {
    const step = steps[i];
    title.textContent = step.title;
    text.textContent = step.text;
    highlight(step.selector);

    prevBtn.disabled = i === 0;
    nextBtn.textContent = i === steps.length - 1 ? "Почати" : "Далі";

    progress.innerHTML = steps
      .map(
        (_, idx) =>
          `<span class="tutorial__dot ${idx === i ? "is-active" : ""}"></span>`
      )
      .join("");
  }

  nextBtn.onclick = () => {
    if (i < steps.length - 1) {
      i++;
      renderStep();
    } else hideTutorial();
  };

  prevBtn.onclick = () => {
    if (i > 0) {
      i--;
      renderStep();
    }
  };

  skipBtn.onclick = () => hideTutorial(false);
  overlay.onclick = (e) => {
    if (e.target === overlay) hideTutorial(false);
  };

  if (helpBtn) helpBtn.addEventListener("click", () => showTutorial(true));

  window.addEventListener("DOMContentLoaded", () => {
    if (!localStorage.getItem(KEY)) showTutorial();
  });
}

// ===  Привітальна анімація ===
document.addEventListener("DOMContentLoaded", () => {
  const greeting = document.getElementById("tutorialGreeting");
  if (greeting) {
    const animation = lottie.loadAnimation({
      container: greeting,
      renderer: "svg",
      loop: true,
      autoplay: false,
      path: "animations/greetings.json",
    });

    const observer = new MutationObserver(() => {
      const activeDot = document.querySelector(".tutorial__dot.is-active");
      if (activeDot && activeDot === document.querySelector(".tutorial__dot:first-child")) {
        greeting.style.opacity = "1";
        animation.play();
      } else {
        greeting.style.opacity = "0";
        animation.stop();
      }
    });

    observer.observe(document.getElementById("tutorial-progress"), {
      childList: true,
      subtree: true,
    });
  }
});
