import { db } from "./firebase.js";

// ===============================
// CARGAR CALENDARIOS
// ===============================
function loadCalendars() {
  const calendarios = JSON.parse(localStorage.getItem("calendarios")) || { calendarios: [] };
  const container = document.getElementById("calendarContainer");
  container.innerHTML = "";

  if (calendarios.calendarios.length === 0) {
    container.innerHTML = "<p>No tienes calendarios creados.</p>";
    return;
  }

  calendarios.calendarios.forEach((calendario, index) => {
    const card = document.createElement("div");
    card.className = "calendar-card";

    const icon = document.createElement("div");
    icon.className = "calendar-icon";
    icon.textContent = calendario.nombre.charAt(0).toUpperCase();

    const title = document.createElement("h3");
    title.textContent = calendario.nombre;

    const link = document.createElement("a");
    link.href = `index.html?id=${calendario.id}`;
    link.textContent = "Abrir calendario";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️ Borrar";
    deleteBtn.onclick = () => {
      if (confirm("¿Borrar este calendario?")) {
        calendarios.calendarios.splice(index, 1);
        localStorage.setItem("calendarios", JSON.stringify(calendarios));
        loadCalendars();
      }
    };

    card.append(icon, title, link, deleteBtn);
    container.appendChild(card);
  });
}

// ===============================
// CREAR CALENDARIO
// ===============================
document.getElementById("createCalendarBtn").addEventListener("click", () => {
  const input = document.getElementById("calendarName");
  const name = input.value.trim();

  if (!name) {
    alert("Ingresá un nombre");
    return;
  }

  const data = JSON.parse(localStorage.getItem("calendarios")) || { calendarios: [] };

  data.calendarios.push({
    id: crypto.randomUUID(),
    nombre: name,
    tasks: []
  });

  localStorage.setItem("calendarios", JSON.stringify(data));
  input.value = "";
  loadCalendars();
});

document.addEventListener("DOMContentLoaded", loadCalendars);

// ===============================
// SERVICE WORKER (CORREGIDO)
// ===============================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .then(() => console.log("✅ Service Worker registrado"))
      .catch(err => console.error("❌ Error SW", err));
  });
}

// ===============================
// INSTALACIÓN PWA
// ===============================
let deferredPrompt;
const installBtnContainer = document.getElementById("installBtnContainer");
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtnContainer.style.display = "block";
});

installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
});
