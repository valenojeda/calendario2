// Importamos solo lo que necesitamos del SDK modular
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

// Configuración de Firebase para tu app web
const firebaseConfig = {
  apiKey: "AIzaSyBcBa27i_b_0fxNhPqzkfbLt1EI0J-AAO0",
  authDomain: "calendarios-app2.firebaseapp.com",
  projectId: "calendarios-app2",
  storageBucket: "calendarios-app2.appspot.com",
  messagingSenderId: "694562662304",
  appId: "1:694562662304:web:540f864090a54f3253e6c5"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Exportamos Firestore y Auth para usar en otras partes de la app
export const db = getFirestore(app);
export const auth = getAuth(app);
