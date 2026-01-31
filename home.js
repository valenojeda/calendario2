import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const calendarNameInput = document.getElementById("calendarName");
const createCalendarBtn = document.getElementById("createCalendarBtn");
const calendarContainer = document.getElementById("calendarContainer");

const installBtnContainer = document.getElementById("installBtnContainer");
const installBtn = document.getElementById("installBtn");

const calendarsRef = collection(db, "calendarios");

/* =========================
   CREAR CALENDARIO
========================= */
createCalendarBtn.addEventListener("click", async () => {
  const name = calendarNameInput.value.trim();
  if (!name) return;

  try {
    await addDoc(calendarsRef, {
      nombre: name,
      tasks: [],
      createdAt: serverTimestamp()
    });

    calendarNameInput.value = "";
    loadCalendars();
  } catch (err) {
    console.error("Error al crear calendario:", err);
  }
});

/* =========================
   CARGAR CALENDARIOS
========================= */
async function loadCalendars() {
  calendarContainer.innerHTML = "";

  try {
    const snapshot = await getDocs(calendarsRef);

    if (snapshot.empty) {
      calendarContainer.innerHTML = "<p>No tienes calendarios creados.</p>";
      return;
    }

    snapshot.forEach((docSnap) => {
      const calendar = docSnap.data();
      const id = docSnap.id;

      const card = document.createElement("div");
      card.className = "calendar-card";

      const title = document.createElement("h3");
      title.textContent = calendar.nombre;

      const openBtn = document.createElement("button");
      openBtn.textContent = "Abrir";
      openBtn.onclick = () => {
        window.location.href = `index.html?id=${id}`;
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️ Borrar";
      deleteBtn.onclick = async () => {
        if (confirm("¿Borrar este calendario?")) {
          await deleteDoc(doc(db, "calendarios", id));
          loadCalendars();
        }
      };

      card.appendChild(title);
      card.appendChild(openBtn);
      card.appendChild(deleteBtn);
      calendarContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Error al cargar calendarios:", err);
  }
}

loadCalendars();

/* =========================
   PWA – INSTALAR APP
========================= */
let deferredPrompt;

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
  installBtnContainer.style.display = "none";
});

/* =========================
   SERVICE WORKER
========================= */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}
