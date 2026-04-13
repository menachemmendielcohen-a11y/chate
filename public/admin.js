// ===============================
// 🔥 Firebase
// ===============================

import { auth, db } from "./firebaseConfig.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  deleteDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ===============================
// 🎯 Elements
// ===============================

const usersList = document.getElementById("usersList");


// ===============================
// 👤 State
// ===============================

let currentUser = null;
let isAdmin = false;


// ===============================
// 🔐 Auth Check
// ===============================

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;

  const userSnap = await getDoc(doc(db, "users", user.uid));

  if (userSnap.exists()) {
    isAdmin = userSnap.data().isAdmin === true;
  }

  if (!isAdmin) {
    alert("אין לך הרשאת מנהל");
    window.location.href = "chat.html";
    return;
  }

  loadUsers();
});


// ===============================
// 👥 Load Users
// ===============================

function loadUsers() {
  onSnapshot(collection(db, "users"), (snapshot) => {
    usersList.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const uid = docSnap.id;

      const div = document.createElement("div");
      div.className = "user-card";

      let timerHTML = "";

      if (data.timeoutUntil && data.timeoutUntil > Date.now()) {
        timerHTML = `<div class="timer" id="timer-${uid}">⏳ טוען...</div>`;

        const interval = setInterval(() => {
          const el = document.getElementById(`timer-${uid}`);
          if (!el) return clearInterval(interval);

          const diff = data.timeoutUntil - Date.now();

          if (diff <= 0) {
            el.innerHTML = "✅ נגמר";
            clearInterval(interval);
            return;
          }

          const m = Math.floor(diff / 60000);
          const s = Math.floor(diff / 1000) % 60;

          el.innerHTML = `⏳ ${m}:${s.toString().padStart(2, "0")}`;
        }, 1000);
      }

      div.innerHTML = `
        <div><b>${data.email || uid}</b></div>
        ${timerHTML}

        <div class="admin-buttons">
          <button onclick="setTimeoutUser('${uid}')">⏳ טיים־אאוט</button>
          <button onclick="removeTimeout('${uid}')">❌ בטל</button>
          <button onclick="banUser('${uid}')">🚫 חסום</button>
          <button onclick="unbanUser('${uid}')">✅ בטל חסימה</button>
          <button onclick="makeAdmin('${uid}')">👑 הפוך לאדמין</button>
          <button onclick="removeAdmin('${uid}')">👤 הסר אדמין</button>
        </div>
      `;

      usersList.appendChild(div);
    });
  });
}


// ===============================
// ⏳ Timeout
// ===============================

window.setTimeoutUser = async function (uid) {
  const minutes = prompt("כמה דקות לחסום?");
  if (!minutes) return;

  const ms = Number(minutes) * 60 * 1000;

  await updateDoc(doc(db, "users", uid), {
    timeoutUntil: Date.now() + ms
  });

  alert("⏳ טיים־אאוט הופעל");
};

window.removeTimeout = async function (uid) {
  await updateDoc(doc(db, "users", uid), {
    timeoutUntil: null
  });

  alert("⏳ בוטל");
};


// ===============================
// 🚫 Ban
// ===============================

window.banUser = async function (uid) {
  await updateDoc(doc(db, "users", uid), {
    banned: true
  });

  alert("🚫 המשתמש נחסם");
};

window.unbanUser = async function (uid) {
  await updateDoc(doc(db, "users", uid), {
    banned: false
  });

  alert("✅ החסימה בוטלה");
};


// ===============================
// 👑 Admin Control (FIX ADDED)
// ===============================

window.makeAdmin = async function (uid) {
  await updateDoc(doc(db, "users", uid), {
    isAdmin: true
  });

  alert("👑 המשתמש הפך לאדמין");
};

window.removeAdmin = async function (uid) {
  await updateDoc(doc(db, "users", uid), {
    isAdmin: false
  });

  alert("👤 האדמין הוסר");
};


// ===============================
// 🧹 Clear Chat
// ===============================

window.clearChat = async function () {
  const snap = await getDocs(collection(db, "messages"));

  snap.forEach(async (d) => {
    await deleteDoc(doc(db, "messages", d.id));
  });

  alert("🧹 הצ'אט נמחק");
};


// ===============================
// ⛔ Toggle Chat
// ===============================

window.disableChat = async function (value) {
  try {
    await setDoc(doc(db, "settings", "chat"), {
      disabled: value
    }, { merge: true });

    alert(value ? "⛔ צ'אט נסגר" : "✅ צ'אט נפתח");
  } catch (err) {
    console.error(err);
    alert("שגיאה בעדכון מצב הצ'אט");
  }
};