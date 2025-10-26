// === 🌙 Тема ===
// Тема 
const themeToggle = document.getElementById("theme-toggle");

// Створюємо ефект плавного переходу фону
const animateThemeChange = () => {
  document.body.style.transition = "background 0.8s ease, color 0.8s ease";
  setTimeout(() => {
    document.body.style.transition = "";
  }, 800);
};

// Якщо користувач раніше вже обирав тему — застосовуємо її
// Застосування теми
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️";
  themeToggle.classList.add("sun");
} else {
  themeToggle.textContent = "🌙";
  themeToggle.classList.add("moon");
}

// Анімація кнопки при зміні теми
// Кнопка перемикання теми
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

// === 🧩 Додавання звички ===
// Додавання звички 
const habitForm = document.getElementById("habit-form");
const habitTableBody = document.getElementById("habit-table-body");
let habits = JSON.parse(localStorage.getItem("habits")) || [];

// Перемикання секцій 
const homeSection = document.getElementById("homeSection");
const addSection = document.getElementById("add-habit");
const listSection = document.getElementById("habit-list");
const statsSection = document.getElementById("statsSection");

const homeBtn = document.getElementById("homeBtn");
const addBtn = document.getElementById("addBtn");
const listBtn = document.getElementById("listBtn");
const statsBtn = document.getElementById("statsBtn");

function showSection(section) {
  // Ховаємо всі секції
  document.querySelectorAll("section").forEach((sec) => {
    sec.style.display = "none";
  });
  // Показуємо потрібну
  section.style.display = "block";
}

homeBtn.addEventListener("click", () => showSection(homeSection));
addBtn.addEventListener("click", () => showSection(addSection));
listBtn.addEventListener("click", () => showSection(listSection));
statsBtn.addEventListener("click", () => showSection(statsSection));

// Таблиця звичок 
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

  // Чекбокси
  document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      const idx = e.target.dataset.index;
      habits[idx].done = e.target.checked;
      localStorage.setItem("habits", JSON.stringify(habits));
    });
  });

  // Редагування
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = e.target.dataset.index;
      const habit = habits[idx];

      document.getElementById("habit-name").value = habit.name;
      document.getElementById("habit-desc").value = habit.desc;
      document.getElementById("habit-frequency").value = habit.frequency;

      document.getElementById("edit-indicator").style.display = "block";
      document.getElementById("edit-name").textContent = habit.name;

      habitForm.dataset.editing = idx;

      // Автоматично переходимо на вкладку "Додати звичку"
      showSection(addSection);
    });
  });

  // Видалення
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = e.target.dataset.index;
      habits.splice(idx, 1);
      localStorage.setItem("habits", JSON.stringify(habits));
      renderHabits();
    });
  });
}

// Додавання / редагування звички   
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
  renderHabits();
  document.getElementById("edit-indicator").style.display = "none";

  // Повертаємось до списку звичок
  showSection(listSection);
});

// При старті
renderHabits();
showSection(homeSection);
