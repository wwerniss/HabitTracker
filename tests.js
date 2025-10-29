// Unit-тестування
// Перевірка основних функцій, елементів інтерфейсу та роботи DOM у проєкті Habit Tracker
console.log("🔍 Запуск базових unit-тестів Habit Tracker...");

// Тест 1: чи існує головна функція оновлення статистики
console.assert(typeof updateStats === "function", "❌ Функція updateStats не знайдена");

// Тест 2: чи існує функція відображення звичок
console.assert(typeof renderFilteredHabits === "function", "❌ Функція renderFilteredHabits не знайдена");

// Тест 3: чи існує функція конфетті
console.assert(typeof launchConfetti === "function", "❌ Функція launchConfetti не знайдена");

// Тест 4: чи існує функція для тостів
console.assert(typeof showToast === "function", "❌ Функція showToast не знайдена");

// Тест 5: перевірка створення toast-повідомлення
showToast("Тестове повідомлення");
setTimeout(() => {
  const toast = document.querySelector(".toast");
  console.assert(toast !== null, "❌ Toast не зʼявився в DOM");
  if (toast) toast.remove();
}, 500);

// Тест 6: наявність основних секцій сторінки
["homeSection", "add-habit", "habit-list", "statsSection", "calendarSection"].forEach(id => {
  console.assert(document.getElementById(id), `❌ Секція ${id} не знайдена`);
});

// Тест 7: наявність таблиці звичок
console.assert(document.getElementById("habit-table-body"), "❌ Таблиця звичок не знайдена");

// Тест 8: наявність перемикача теми
console.assert(document.getElementById("theme-toggle"), "❌ Перемикач теми не знайдено");

// Тест 9: чи оновлення статистики працює без помилок
try {
  updateStats();
  console.log("✅ updateStats працює без помилок");
} catch (err) {
  console.error("❌ updateStats викликав помилку:", err);
}

console.log("✅ Усі базові тести виконані.");
