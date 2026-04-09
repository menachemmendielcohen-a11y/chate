import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  getDoc,
  deleteDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA9XpGHgpzeUvA8CGIL-OYUKOTCTKKB_rg",
  authDomain: "chat-app-6c55d.firebaseapp.com",
  projectId: "chat-app-6c55d",
  storageBucket: "chat-app-6c55d.firebasestorage.app",
  messagingSenderId: "193935015893",
  appId: "1:193935015893:web:535f24e6e67e0ac91fc75c",
  measurementId: "G-XC81L59WZV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const usersList = document.getElementById("usersList");
const messagesList = document.getElementById("messagesList");

document.getElementById("backChatBtn").addEventListener("click", () => {
  window.location.href = "index.html";
});

document.getElementById("logoutAdminBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists() || !userSnap.data().isAdmin) {
    alert("אין לך גישה לדשבורד מנהל!");
    window.location.href = "index.html";
    return;
  }

  loadUsers(user.uid);
  loadMessages();
});

function loadUsers(currentUid) {
  onSnapshot(collection(db, "users"), (snapshot) => {
    usersList.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const user = docSnap.data();
      const userId = docSnap.id;

      const div = document.createElement("div");
      div.className = "admin-card";
      div.innerHTML = `
        <strong>${escapeHTML(user.username || "ללא שם")}</strong><br>
        ${escapeHTML(user.email || "")}<br>
        ${user.isAdmin ? "👑 מנהל" : "👤 משתמש"}
        ${userId !== currentUid ? `<br><button onclick="deleteUser('${userId}')">מחק משתמש</button>` : ""}
      `;
      usersList.appendChild(div);
    });
  });
}

function loadMessages() {
  const q = query(collection(db, "messages"), orderBy("createdAt"));

  onSnapshot(q, (snapshot) => {
    messagesList.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const msg = docSnap.data();
      const msgId = docSnap.id;

      const div = document.createElement("div");
      div.className = "admin-card";
      div.innerHTML = `
        <strong>${escapeHTML(msg.name || "משתמש")}</strong><br>
        ${escapeHTML(msg.text || "")}
        <br><button onclick="deleteMessage('${msgId}')">מחק הודעה</button>
      `;
      messagesList.appendChild(div);
    });
  });
}

window.deleteMessage = async function(msgId) {
  if (confirm("למחוק את ההודעה?")) {
    await deleteDoc(doc(db, "messages", msgId));
  }
};

window.deleteUser = async function(userId) {
  if (confirm("למחוק את המשתמש?")) {
    await deleteDoc(doc(db, "users", userId));
  }
};

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}