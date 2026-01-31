import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

const calendarNameInput = document.getElementById("calendarName");
const createCalendarBtn = document.getElementById("createCalendarBtn");
const calendarContainer = document.getElementById("calendarContainer");
const installBtnContainer = document.getElementById("installBtnContainer");
const installBtn = document.getElementById("installBtn");

let user = null; // Usuario actual

// ===== LOGIN CON GOOGLE =====
const provider = new GoogleAuthProvider();
async function login() {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.error("Error login:", err);
  }
}

// Verificar usuario
onAuthStateChanged(auth, (currentUser) => {
  if (currentUser) {
    user = currentUser;
    loadCalendars(); // cargar calendarios solo del usuario
  } else {
    login(); // pedir login si no hay usuario
  }
});

// ===== CREAR CALENDARIO =====
createCalendarBtn.addEventListener("click", async () => {
  if (!user) return;
  const name = calendarNameInput.value.trim();
  if (!name) return;

  try {
    await addDoc(collection(db, "calendarios"), {
      nombre: name,
      tasks: [],
      createdAt: serverTimestamp(),
      userId: user.uid // dueño del calendario
    });
    calendarNameInput.value = "";
  } catch (err) {
    console.error("Error al crear calendario:", err);
  }
});

// ===== CARGAR CALENDARIOS =====
async function loadCalendars() {
  if (!user) return;

  calendarContainer.innerHTML = "";
  calendarContainer.classList.add("calendars-grid");

  const q = query(collection(db, "calendarios"), where("userId", "==", user.uid));

  onSnapshot(q, (snapshot) => {
    calendarContainer.innerHTML = "";
    if (snapshot.empty) {
      calendarContainer.innerHTML = "<p>No tienes calendarios creados.</p>";
      return;
    }

    snapshot.forEach((docSnap) => {
      const calendar = docSnap.data();
      const id = docSnap.id;

      const card = document.createElement("div");
      card.className = "calendar-card";

      const thumbnail = document.createElement("div");
      thumbnail.className = "calendar-thumbnail";
      thumbnail.textContent = calendar.nombre.charAt(0).toUpperCase();

      const title = document.createElement("h3");
      title.textContent = calendar.nombre;

      const openBtn = document.createElement("button");
      openBtn.className = "open-btn";
      openBtn.textContent = "Abrir";
      openBtn.onclick = () => window.location.href = `index.html?id=${id}`;

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "🗑️ Borrar";
      deleteBtn.onclick = async () => {
        if (confirm("¿Borrar este calendario?")) {
          await deleteDoc(doc(db, "calendarios", id));
        }
      };

      card.appendChild(thumbnail);
      card.appendChild(title);
      card.appendChild(openBtn);
      card.appendChild(deleteBtn);

      calendarContainer.appendChild(card);
    });
  });
}

// ===== PWA – INSTALAR APP =====
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

// ===== SERVICE WORKER =====
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}
