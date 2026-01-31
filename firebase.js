// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBcBa27i_b_0fxNhPqzkfbLt1EI0J-AAO0",
  authDomain: "calendarios-app2.firebaseapp.com",
  projectId: "calendarios-app2",
  storageBucket: "calendarios-app2.firebasestorage.app",
  messagingSenderId: "694562662304",
  appId: "1:694562662304:web:540f864090a54f3253e6c5"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
