import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

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
if (!activeCalendarId) window.location.href = "home.html";

// Referencia al documento del calendario
const calendarRef = doc(db, "calendarios", activeCalendarId);
let tasks = [];

// Escuchar cambios en tiempo real
onSnapshot(calendarRef, (docSnap) => {
  if (!docSnap.exists()) {
    alert("Calendario no encontrado");
    window.location.href = "home.html";
    return;
  }
  const calendarData = docSnap.data();
  tasks = calendarData.tasks || [];
  boardTitle.textContent = `Tablero - ${calendarData.nombre}`;
  renderBoard();
  renderCalendar();
});

// ==================== FUNCIONES ==================== //

// Guardar tasks completas en Firestore
async function saveTasksFirestore() {
  try {
    await updateDoc(calendarRef, { tasks });
  } catch (err) {
    console.error("Error al guardar tareas:", err);
  }
}

// Renderizar tablero
function renderBoard() {
  columns.forEach(c => document.getElementById(c).innerHTML = "");

  tasks.forEach((task, index) => {
    const card = document.createElement("div");
    card.className = `task ${task.priority}`;

    // Colores por prioridad
    if (task.priority === "alta") card.style.backgroundColor = "#ff4d4d";
    else if (task.priority === "media") card.style.backgroundColor = "#ffbf00";
    else card.style.backgroundColor = "#c7f7c1";

    const leftBtn = document.createElement("button");
    leftBtn.textContent = "⬅️";
    leftBtn.onclick = (e) => { e.stopPropagation(); moveTask(index, -1); };

    const rightBtn = document.createElement("button");
    rightBtn.textContent = "➡️";
    rightBtn.onclick = (e) => { e.stopPropagation(); moveTask(index, 1); };

    const title = document.createElement("span");
    title.textContent = task.text;
    title.addEventListener("click", () => openTaskModal(index));

    card.append(leftBtn, title, rightBtn);
    document.getElementById(task.status).appendChild(card);
  });
}

// Renderizar calendario
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

    if (tasks.some(task => task.date === dayStr)) {
      dayElement.classList.add("has-task");
    }

    dayElement.addEventListener("click", () => showTasksForDay(dayStr));
    calendar.appendChild(dayElement);
  }
}

// Mostrar tareas de un día
function showTasksForDay(date) {
  const tasksForDay = tasks.filter(task => task.date === date);
  if (tasksForDay.length === 0) alert(`No hay tareas para el día ${date}`);
  else alert(`Tareas para el día ${date}: \n` + tasksForDay.map(t => t.text).join("\n"));
}

// Agregar nueva tarea
document.getElementById("add").onclick = async () => {
  const text = textInput.value.trim();
  const description = descInput.value.trim();
  const date = dateInput.value;
  const priority = priorityInput.value;

  if (!text || !date) return;

  const newTask = { text, description, date, priority, status: "pending" };
  tasks.push(newTask);
  await saveTasksFirestore();
  textInput.value = "";
  descInput.value = "";
};

// Mover tarea
async function moveTask(index, direction) {
  const currentStatusIndex = columns.indexOf(tasks[index].status);
  const newStatusIndex = currentStatusIndex + direction;
  if (newStatusIndex < 0 || newStatusIndex >= columns.length) return;

  tasks[index].status = columns[newStatusIndex];
  await saveTasksFirestore();
}

// Modal
function openTaskModal(index) {
  activeTaskIndex = index;
  const task = tasks[index];
  modalInfo.textContent = `Fecha: ${task.date} | Prioridad: ${task.priority}`;
  editTitleInput.value = task.text;
  editDescInput.value = task.description || "";
  modal.classList.remove("hidden");
}

document.getElementById("closeModal").onclick = () => modal.classList.add("hidden");
document.getElementById("editBtn").onclick = async () => {
  const task = tasks[activeTaskIndex];
  task.text = editTitleInput.value;
  task.description = editDescInput.value;
  await saveTasksFirestore();
  modal.classList.add("hidden");
};
document.getElementById("deleteBtn").onclick = async () => {
  if (confirm("¿Borrar esta tarea?")) {
    tasks.splice(activeTaskIndex, 1);
    await saveTasksFirestore();
    modal.classList.add("hidden");
  }
};

// Navegación del calendario
document.getElementById("prev").onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
document.getElementById("next").onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };

// Volver a home
goHomeBtn.onclick = () => { window.location.href = "home.html"; };
