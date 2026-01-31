import { db, auth } from "./firebase.js";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, where } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

const provider = new GoogleAuthProvider();
const signInBtn = document.getElementById("signInBtn");
const signOutBtn = document.getElementById("signOutBtn");
const userNameSpan = document.getElementById("userName");

const createContainer = document.getElementById("createCalendarContainer");
const calendarNameInput = document.getElementById("calendarName");
const createCalendarBtn = document.getElementById("createCalendarBtn");
const calendarContainer = document.getElementById("calendarContainer");

let currentUser = null;

// ===== LOGIN / LOGOUT =====
signInBtn.onclick = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.error("Error login:", err);
  }
};

signOutBtn.onclick = async () => {
  await signOut(auth);
};

// Detectar cambios de usuario
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    userNameSpan.textContent = `Hola, ${user.displayName}`;
    signInBtn.style.display = "none";
    signOutBtn.style.display = "inline-block";
    createContainer.style.display = "block";

    loadCalendars();
  } else {
    currentUser = null;
    userNameSpan.textContent = "";
    signInBtn.style.display = "inline-block";
    signOutBtn.style.display = "none";
    createContainer.style.display = "none";
    calendarContainer.innerHTML = "<p>Inicia sesión para ver tus calendarios.</p>";
  }
});

// ===== CREAR CALENDARIO =====
createCalendarBtn.onclick = async () => {
  const name = calendarNameInput.value.trim();
  if (!name || !currentUser) return;

  try {
    await addDoc(collection(db, "calendarios"), {
      nombre: name,
      userId: currentUser.uid,
      tasks: [],
      createdAt: serverTimestamp()
    });
    calendarNameInput.value = "";
    loadCalendars();
  } catch (err) {
    console.error("Error crear calendario:", err);
  }
};

// ===== CARGAR CALENDARIOS =====
async function loadCalendars() {
  if (!currentUser) return;

  calendarContainer.innerHTML = "";

  try {
    const q = query(collection(db, "calendarios"), where("userId", "==", currentUser.uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      calendarContainer.innerHTML = "<p>No tienes calendarios creados.</p>";
      return;
    }

    snapshot.forEach(docSnap => {
      const calendar = docSnap.data();
      const id = docSnap.id;

      const card = document.createElement("div");
      card.className = "calendar-card";

      const avatar = document.createElement("div");
      avatar.className = "avatar";
      avatar.textContent = calendar.nombre[0].toUpperCase();

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

      card.appendChild(avatar);
      card.appendChild(title);
      card.appendChild(openBtn);
      card.appendChild(deleteBtn);

      calendarContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Error cargar calendarios:", err);
  }
}

// ===== PWA – INSTALAR APP =====
const installBtnContainer = document.getElementById("installBtnContainer");
const installBtn = document.getElementById("installBtn");
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
