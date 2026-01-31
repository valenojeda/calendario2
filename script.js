import { db } from "./firebase.js";


// Variables globales
const calendar = document.getElementById("calendar");
const monthLabel = document.getElementById("month");

const textInput = document.getElementById("text");
const descInput = document.getElementById("description");
const dateInput = document.getElementById("date");
const priorityInput = document.getElementById("priority");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const modalInfo = document.getElementById("modalInfo");

const editTitleInput = document.getElementById("editTitle");
const editDescInput = document.getElementById("editDescription");

const goHomeBtn = document.getElementById("goHome");
const boardTitle = document.getElementById("boardTitle");

const columns = ["pending", "progress", "done"];
let currentDate = new Date();
let activeTaskIndex = null;

// Obtener el ID del calendario desde la URL
const urlParams = new URLSearchParams(window.location.search);
const activeCalendarId = urlParams.get('id');

// Si no se encuentra un ID, redirigir al inicio
if (!activeCalendarId) {
  window.location.href = "home.html"; // Redirige a home si no hay ID
} 

// Cargar el calendario desde localStorage
let data = JSON.parse(localStorage.getItem("calendarios")) || { calendarios: [] };
let calendarData = data.calendarios.find(c => c.id === activeCalendarId);

// Verificar si se encontró el calendario, si no, redirigir al inicio
if (!calendarData) {
  window.location.href = "home.html"; // Redirigir a home si no se encuentra el calendario
} 

let tasks = calendarData.tasks;

// Funciones para manejar las tareas y el calendario

// Guardar tareas en localStorage
function saveTasks() {
  calendarData.tasks = tasks;
  localStorage.setItem("calendarios", JSON.stringify(data));
}

// Función para renderizar el calendario
function renderCalendar() {
  calendar.innerHTML = "";
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  monthLabel.textContent = currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayElement = document.createElement("div");
    dayElement.className = "day";
    dayElement.textContent = day;

    // Resaltar días que tienen tareas asociadas
    if (tasks.some(task => task.date === dayStr)) {
      dayElement.classList.add("has-task");
    }

    dayElement.addEventListener("click", () => showTasksForDay(dayStr));  // Mostrar tareas al hacer clic
    calendar.appendChild(dayElement);
  }
}

// Mostrar tareas para un día específico
function showTasksForDay(date) {
  const tasksForDay = tasks.filter(task => task.date === date);
  alert(`Tareas para el día ${date}: \n` + tasksForDay.map(task => task.text).join("\n"));
}

// Función para agregar nuevas tareas
document.getElementById("add").onclick = () => {
  const text = textInput.value.trim();
  const description = descInput.value.trim();
  const date = dateInput.value;
  const priority = priorityInput.value;

  if (!text || !date) return;

  const newTask = {
    text,
    description,
    date,
    priority,
    status: "pending"  // Asignamos la tarea como pendiente por defecto
  };

  tasks.push(newTask);
  saveTasks();
  renderBoard();  // Actualizamos el tablero
  renderCalendar();  // Actualizamos el calendario
  textInput.value = "";
  descInput.value = "";
};

// Función para mover tareas entre columnas del tablero
function moveTask(index, direction) {
  const currentStatusIndex = columns.indexOf(tasks[index].status);
  const newStatusIndex = currentStatusIndex + direction;

  if (newStatusIndex >= 0 && newStatusIndex < columns.length) {
    tasks[index].status = columns[newStatusIndex];
    saveTasks();
    renderBoard();  // Actualizamos el tablero
    renderCalendar();  // Actualizamos el calendario
  }
}

// Función para renderizar el tablero
function renderBoard() {
  columns.forEach(c => document.getElementById(c).innerHTML = "");  // Limpiar las columnas

  tasks.forEach((task, index) => {
    const card = document.createElement("div");
    card.className = `task ${task.priority}`; // Agregar clase de prioridad

    // Cambiar color de fondo según la prioridad
    if (task.priority === "alta") {
      card.style.backgroundColor = "#ff4d4d";  // Rojo para alta prioridad
    } else if (task.priority === "media") {
      card.style.backgroundColor = "#ffbf00";  // Amarillo para media prioridad
    } else {
      card.style.backgroundColor = "#c7f7c1";  // Verde suave para baja prioridad
    }

    // Agregar botones para mover la tarea
    const leftBtn = document.createElement("button");
    leftBtn.textContent = "⬅️";
    leftBtn.onclick = (e) => { e.stopPropagation(); moveTask(index, -1); };

    const rightBtn = document.createElement("button");
    rightBtn.textContent = "➡️";
    rightBtn.onclick = (e) => { e.stopPropagation(); moveTask(index, 1); };

    const title = document.createElement("span");
    title.textContent = task.text;
    title.addEventListener("click", () => openTaskModal(index));  // Abre el modal para editar la tarea

    card.append(leftBtn, title, rightBtn);
    document.getElementById(task.status).appendChild(card);
  });
}

// Función para abrir el modal de edición de tarea
function openTaskModal(index) {
  activeTaskIndex = index;
  const task = tasks[index];

  // Mostrar la fecha de la tarea en el modal
  modalInfo.textContent = `Fecha: ${task.date} | Prioridad: ${task.priority}`;

  // Mostrar el título y la descripción
  editTitleInput.value = task.text;
  editDescInput.value = task.description || "";

  modal.classList.remove("hidden");
}

// Función para cerrar el modal
document.getElementById("closeModal").onclick = () => modal.classList.add("hidden");

// Función para editar tarea
document.getElementById("editBtn").onclick = () => {
  const task = tasks[activeTaskIndex];
  task.text = editTitleInput.value;
  task.description = editDescInput.value;
  saveTasks();
  renderBoard();
  renderCalendar();
  modal.classList.add("hidden");
};

// Función para eliminar tarea
document.getElementById("deleteBtn").onclick = () => {
  if (confirm("¿Borrar esta tarea?")) {
    tasks.splice(activeTaskIndex, 1);
    saveTasks();
    renderBoard();
    renderCalendar();
    modal.classList.add("hidden");
  }
};

// Función para manejar la navegación del calendario (mes anterior y siguiente)
document.getElementById("prev").onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
document.getElementById("next").onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };

// Volver a la página de inicio
goHomeBtn.onclick = () => { window.location.href = "home.html"; };

// Inicializar la página
boardTitle.textContent = `Tablero - ${calendarData.nombre}`;
renderBoard();
renderCalendar();
