import { auth, db } from "./firebaseConfig.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ===============================
// 👑 בדיקת אדמין
// ===============================

let isAdmin = false;
let currentUser = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists() || snap.data().isAdmin !== true) {
    document.body.innerHTML = "⛔ אין לך הרשאה להיכנס לדף הזה";
    return;
  }

  isAdmin = true;

  console.log("🔥 Admin logged in");

  loadUsers();
});


// ===============================
// 👥 טעינת משתמשים
// ===============================

async function loadUsers() {
  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);

  const container = document.getElementById("usersList");
  container.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const user = docSnap.data();

    container.innerHTML += `
      <div style="border:1px solid #ccc; margin:8px; padding:10px; border-radius:8px;">

        <p><b>שם:</b> ${user.username || "ללא שם"}</p>
        <p><b>אימייל:</b> ${user.email}</p>

        <p><b>אדמין:</b> ${user.isAdmin ? "כן 👑" : "לא"}</p>

        <button onclick="timeoutUser('${docSnap.id}', 10)">⏳ טיים־אאוט 10 דק'</button>

      </div>
    `;
  });
}


// ===============================
// 🧹 ניקוי צ'אט
// ===============================

window.clearChat = async function () {
  if (!isAdmin) return;

  const snap = await getDocs(collection(db, "messages"));

  const tasks = [];

  snap.forEach((d) => {
    tasks.push(deleteDoc(doc(db, "messages", d.id)));
  });

  await Promise.all(tasks);

  alert("🧹 הצ'אט נמחק");
};


// ===============================
// ⛔ סגירה / פתיחה של צ'אט
// ===============================

window.disableChat = async function (value) {
  if (!isAdmin) return;

  await setDoc(doc(db, "settings", "chat"), {
    disabled: value
  });

  alert(value ? "⛔ הצ'אט נסגר" : "✅ הצ'אט נפתח");
};


// ===============================
// 🚫 טיים־אאוט למשתמש
// ===============================

window.timeoutUser = async function (userId, minutes) {
  if (!isAdmin) return;

  const until = Date.now() + minutes * 60000;

  await setDoc(doc(db, "users", userId), {
    timeoutUntil: until
  }, { merge: true });

  alert("⏳ משתמש קיבל טיים־אאוט");
};