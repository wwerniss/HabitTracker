// === 🌙 Тема ===
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

  // додаємо ефект обертання і зміну іконки
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

// === 🧩 Додавання звички ===
const habitForm = document.getElementById("habit-form");
const habitTableBody = document.getElementById("habit-table-body");

// Зчитуємо звички з localStorage (якщо є)
let habits = JSON.parse(localStorage.getItem("habits")) || [];

// Функція для оновлення таблиці
function renderHabits() {
  habitTableBody.innerHTML = "";
  habits.forEach((habit, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${habit.name}</td>
      <td>${habit.desc}</td>
      <td>${habit.frequency}</td>
      <td><input type="checkbox" ${habit.done ? "checked" : ""} data-index="${index}"></td>
    `;

    habitTableBody.appendChild(row);
  });

  // При зміні checkbox оновлюємо виконані звички
  document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      const idx = e.target.dataset.index;
      habits[idx].done = e.target.checked;
      localStorage.setItem("habits", JSON.stringify(habits));
    });
  });
}

// При відправленні форми
habitForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("habit-name").value.trim();
  const desc = document.getElementById("habit-desc").value.trim();
  const frequency = document.getElementById("habit-frequency").value;

  if (!name) return;

  const newHabit = { name, desc, frequency, done: false };
  habits.push(newHabit);

  localStorage.setItem("habits", JSON.stringify(habits));

  habitForm.reset();
  renderHabits();
});

// При першому запуску показуємо звички
renderHabits();

// === 📁 Перемикання секцій ===
const homeSection = document.getElementById("homeSection");
const addSection = document.getElementById("add-habit");
const listSection = document.getElementById("habit-list");
const statsSection = document.getElementById("statsSection");

const homeBtn = document.getElementById("homeBtn");
const addBtn = document.getElementById("addBtn");
const listBtn = document.getElementById("listBtn");
const statsBtn = document.getElementById("statsBtn");

// Функція, яка ховає всі секції
function hideAllSections() {
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
}

// Показуємо потрібну секцію
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

// При старті показуємо лише головну
hideAllSections();
homeSection.classList.add("active");
