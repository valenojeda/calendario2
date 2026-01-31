// ================================
// Cargar calendarios desde localStorage
// ================================
function loadCalendars() {
  const calendarios = JSON.parse(localStorage.getItem("calendarios")) || { calendarios: [] };
  const calendarContainer = document.getElementById("calendarContainer");

  calendarContainer.innerHTML = "";

  if (calendarios.calendarios.length === 0) {
    calendarContainer.innerHTML = "<p>No tienes calendarios creados.</p>";
    return;
  }

  calendarios.calendarios.forEach((calendario, index) => {
    const calendarCard = document.createElement("div");
    calendarCard.classList.add("calendar-card");

    const calendarIcon = document.createElement("div");
    calendarIcon.classList.add("calendar-icon");
    calendarIcon.textContent = calendario.nombre.charAt(0).toUpperCase();

    const calendarName = document.createElement("h3");
    calendarName.textContent = calendario.nombre;

    const calendarLink = document.createElement("a");
    calendarLink.href = `index.html?id=${calendario.id}`;
    calendarLink.textContent = "Abrir calendario";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️ Borrar";
    deleteBtn.onclick = () => {
      if (confirm("¿Seguro que quieres borrar este calendario?")) {
        deleteCalendar(calendarios, index);
      }
    };

    calendarCard.append(calendarIcon, calendarName, calendarLink, deleteBtn);
    calendarContainer.appendChild(calendarCard);
  });
}

// ================================
// Crear nuevo calendario
// ================================
document.getElementById("createCalendarBtn").addEventListener("click", () => {
  const calendarNameInput = document.getElementById("calendarName");
  const calendarName = calendarNameInput.value.trim();

  if (!calendarName) {
    alert("Por favor, ingresa un nombre para el calendario.");
    return;
  }

  const calendarios = JSON.parse(localStorage.getItem("calendarios")) || { calendarios: [] };

  const newCalendar = {
    id: crypto.randomUUID(), // ID único moderno
    nombre: calendarName,
    tasks: []
  };

  calendarios.calendarios.push(newCalendar);
  localStorage.setItem("calendarios", JSON.stringify(calendarios));

  calendarNameInput.value = "";
  loadCalendars();
});

// ================================
// Borrar calendario
// ================================
function deleteCalendar(calendarios, index) {
  calendarios.calendarios.splice(index, 1);
  localStorage.setItem("calendarios", JSON.stringify(calendarios));
  loadCalendars();
}

// ================================
// Inicializar
// ================================
document.addEventListener("DOMContentLoaded", loadCalendars);

// ================================
// PWA - Service Worker
// ================================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(reg => console.log("Service Worker registrado", reg))
      .catch(err => console.log("Error SW", err));
  });
}

// ================================
// Instalación PWA
// ================================
let deferredPrompt;
const installBtnContainer = document.getElementById("installBtnContainer");
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtnContainer.style.display = "block";
});

installBtn.addEventListener("click", () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(() => {
    deferredPrompt = null;
    installBtnContainer.style.display = "none";
  });
});
