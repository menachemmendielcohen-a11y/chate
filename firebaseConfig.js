// firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyA9XpGHgpzeUvA8CGIL-OYuKOTcTKKB_rg",
    authDomain: "chat-app-6c55d.firebaseapp.com",
    projectId: "chat-app-6c55d",
    storageBucket: "chat-app-6c55d.firebasestorage.app",
    messagingSenderId: "193935015893",
    appId: "1:193935015893:web:535f24e6e67e0ac91fc75c",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);