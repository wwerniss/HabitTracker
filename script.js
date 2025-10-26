// ===  Тема ===
const themeToggle = document.getElementById("theme-toggle");

// Створюємо ефект плавного переходу фону
const animateThemeChange = () => {
  document.body.style.transition = "background 0.8s ease, color 0.8s ease";
  setTimeout(() => {
    document.body.style.transition = "";
  }, 800);
};

// Якщо користувач раніше вже обирав тему — застосовуємо її
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️";
  themeToggle.classList.add("sun");
} else {
  themeToggle.textContent = "🌙";
  themeToggle.classList.add("moon");
}

// Анімація кнопки при зміні теми
themeToggle.addEventListener("click", () => {
  animateThemeChange();
  document.body.classList.toggle("dark");

  themeToggle.classList.add("rotate");
  setTimeout(() => themeToggle.classList.remove("rotate"), 400);

  if (document.body.classList.contains("dark")) {
    themeToggle.textContent = "☀️";
    themeToggle.classList.remove("moon");
    themeToggle.classList.add("sun");
    localStorage.setItem("theme", "dark");
  } else {
    themeToggle.textContent = "🌙";
    themeToggle.classList.remove("sun");
    themeToggle.classList.add("moon");
    localStorage.setItem("theme", "light");
  }
});

// ===  Додавання звички ===
const habitForm = document.getElementById("habit-form");
const habitTableBody = document.getElementById("habit-table-body");

// Зчитуємо звички з localStorage (якщо є)
let habits = JSON.parse(localStorage.getItem("habits")) || [];

// ===  Оновлення статистики ===
function updateStats() {
  const total = habits.length;
  const done = habits.filter(h => h.done).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  const circle = document.querySelector(".circle-progress");
  const text = document.getElementById("progressText");
  const summary = document.getElementById("progressSummary");
  const progressContainer = document.getElementById("progressContainer");

  setTimeout(() => {
    circle.style.background = `conic-gradient(var(--accent-color) ${percent * 3.6}deg, var(--circle-bg) ${percent * 3.6}deg)`;
  }, 100);

  text.textContent = `${percent}%`;
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
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
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

// ===  Відображення звичок ===
function renderHabits() {
  habitTableBody.innerHTML = "";

  habits.forEach((habit, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${habit.name}</td>
      <td>${habit.desc}</td>
      <td>${habit.frequency}</td>
      <td><input type="checkbox" ${habit.done ? "checked" : ""} data-index="${index}"></td>
      <td>
        <button class="edit-btn" data-index="${index}" title="Редагувати">✏️</button>
        <button class="delete-btn" data-index="${index}" title="Видалити">🗑️</button>
      </td>
    `;
    habitTableBody.appendChild(row);
  });

  // Зміна стану виконання
  document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      const idx = e.target.dataset.index;
      habits[idx].done = e.target.checked;
      localStorage.setItem("habits", JSON.stringify(habits));
      updateStats();
    });
  });

  //  Редагування
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = e.target.dataset.index;
      const habit = habits[idx];

      document.getElementById("habit-name").value = habit.name;
      document.getElementById("habit-desc").value = habit.desc;
      document.getElementById("habit-frequency").value = habit.frequency;

      habitForm.dataset.editing = idx;

      // ✅ Показуємо фразу "Режим редагування"
      const indicator = document.getElementById("edit-indicator");
      const editName = document.getElementById("edit-name");
      indicator.style.display = "block";
      editName.textContent = habit.name;

      hideAllSections();
      addSection.classList.add("active");
    });
  });

  //  Видалення
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = e.target.dataset.index;
      habits.splice(idx, 1);
      localStorage.setItem("habits", JSON.stringify(habits));
      renderHabits();
      updateStats();
    });
  });

  updateStats();
}

// ===  Додавання / редагування звички ===
habitForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("habit-name").value.trim();
  const desc = document.getElementById("habit-desc").value.trim();
  const frequency = document.getElementById("habit-frequency").value;

  if (!name) return;

  const editingIndex = habitForm.dataset.editing;
  if (editingIndex !== undefined) {
    habits[editingIndex] = { name, desc, frequency, done: habits[editingIndex].done };
    delete habitForm.dataset.editing;
  } else {
    habits.push({ name, desc, frequency, done: false });
  }

  localStorage.setItem("habits", JSON.stringify(habits));
  habitForm.reset();

  //  Ховаємо фразу після збереження
  document.getElementById("edit-indicator").style.display = "none";

  renderHabits();
  hideAllSections();
  listSection.classList.add("active");
});

// ===  Перемикання секцій ===
const homeSection = document.getElementById("homeSection");
const addSection = document.getElementById("add-habit");
const listSection = document.getElementById("habit-list");
const statsSection = document.getElementById("statsSection");

const homeBtn = document.getElementById("homeBtn");
const addBtn = document.getElementById("addBtn");
const listBtn = document.getElementById("listBtn");
const statsBtn = document.getElementById("statsBtn");

function hideAllSections() {
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
}

homeBtn.addEventListener("click", () => { hideAllSections(); homeSection.classList.add("active"); });
addBtn.addEventListener("click", () => { hideAllSections(); addSection.classList.add("active"); });
listBtn.addEventListener("click", () => { hideAllSections(); listSection.classList.add("active"); });
statsBtn.addEventListener("click", () => { hideAllSections(); statsSection.classList.add("active"); });

// ===  Старт
document.addEventListener("DOMContentLoaded", () => {
  renderHabits();
  updateStats();
  hideAllSections();
  homeSection.classList.add("active");
});
