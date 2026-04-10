// ===============================
// 🔥 Firebase
// ===============================

import { auth, db } from "./firebaseConfig.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ===============================
// 🎯 HTML Elements
// ===============================

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");
const adminPanelBtn = document.getElementById("adminPanelBtn");
const statusBox = document.getElementById("statusBox");


// ===============================
// 👤 User State
// ===============================

let currentUser = null;
let currentUsername = "Guest";
let isAdmin = false;

let timerInterval = null;


// ===============================
// 🔐 Auth Check
// ===============================

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    sessionStorage.clear();
    window.location.href = "login.html";
    return;
  }

  currentUser = user;

  currentUsername =
    sessionStorage.getItem("chatUsername") ||
    user.displayName ||
    "Guest";

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    isAdmin = data.isAdmin || false;
  }

  if (isAdmin) {
    adminPanelBtn.style.display = "inline-block";
  }

  checkChatDisabled();
});


// ===============================
// 🚫 UI BLOCK SYSTEM
// ===============================

function blockUI(text) {
  messageInput.style.display = "none";
  sendBtn.style.display = "none";
  statusBox.innerHTML = `⛔ ${text}`;
}

function unblockUI() {
  messageInput.style.display = "block";
  sendBtn.style.display = "inline-block";
  statusBox.innerHTML = "";
}

function startCountdown(until) {
  messageInput.style.display = "none";
  sendBtn.style.display = "none";

  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    const diff = until - Date.now();

    if (diff <= 0) {
      clearInterval(timerInterval);
      unblockUI();
      return;
    }

    const min = Math.floor(diff / 1000 / 60);
    const sec = Math.floor(diff / 1000) % 60;

    statusBox.innerHTML = `
      ⏳ אתה חסום זמנית<br>
      נשאר: ${min}:${sec}
    `;
  }, 1000);
}


// ===============================
// 📤 Send Message
// ===============================

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

async function canSend(userId) {
  const snap = await getDoc(doc(db, "users", userId));
  const data = snap.data();

  if (data?.banned) {
    blockUI("🚫 נחסמת מהמערכת");
    return false;
  }

  if (data?.timeoutUntil && data.timeoutUntil > Date.now()) {
    startCountdown(data.timeoutUntil);
    return false;
  }

  // אם אין טיים־אאוט → תבטל UI חסימה אם היה
  unblockUI(); {
    startCountdown(data.timeoutUntil);
    return false;
  }

  // אם אין טיים־אאוט → תבטל UI חסימה אם היה
  unblockUI(); {
    startCountdown(data.timeoutUntil);
    return false;
  }

  return true;
}

async function sendMessage() {
  const text = messageInput.value.trim();

  if (!text) return;

  if (!currentUser) {
    alert("אתה לא מחובר");
    return;
  }

  if (!(await canSend(currentUser.uid))) return;

  try {
    await addDoc(collection(db, "messages"), {
      name: currentUsername,
      text: text,
      createdAt: serverTimestamp()
    });

    messageInput.value = "";

  } catch (error) {
    console.error(error);
    alert("אין הרשאה לשלוח הודעה!");
  }
}


// ===============================
// 💬 Load Messages
// ===============================

const q = query(collection(db, "messages"), orderBy("createdAt"));

onSnapshot(q, (snapshot) => {
  chatBox.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    const div = document.createElement("div");
    div.classList.add("message");

    div.classList.add(
      data.name === currentUsername ? "my-message" : "other-message"
    );

    div.innerHTML = `
      <span class="name">${data.name}</span>
      ${data.text}
    `;

    chatBox.appendChild(div);
  });

  chatBox.scrollTop = chatBox.scrollHeight;
});


// ===============================
// 🚪 Logout
// ===============================

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  sessionStorage.clear();
  window.location.href = "login.html";
});


// ===============================
// ⛔ Chat Disabled
// ===============================

async function checkChatDisabled() {
  const snap = await getDoc(doc(db, "settings", "chat"));

  if (snap.exists() && snap.data()?.disabled && !isAdmin) {
    document.body.innerHTML = "⛔ הצ'אט מושבת";
  }
}


// ===============================
// 🧹 Admin: Clear Chat
// ===============================

window.clearChat = async function () {
  if (!isAdmin) return;

  const snap = await getDocs(collection(db, "messages"));

  snap.forEach(async (d) => {
    await deleteDoc(doc(db, "messages", d.id));
  });

  alert("🧹 הצ'אט נמחק");
};


// ===============================
// 🔒 Admin: Toggle Chat
// ===============================

window.disableChat = async function (value) {
  if (!isAdmin) return;

  await setDoc(doc(db, "settings", "chat"), {
    disabled: value
  });

  alert(value ? "⛔ צ'אט נסגר" : "✅ צ'אט נפתח");
};


// ===============================
// 👑 Admin: Remove Timeout
// ===============================

window.removeTimeout = async function (uid) {
  if (!isAdmin) return;

  await updateDoc(doc(db, "users", uid), {
    timeoutUntil: null
  });

  alert("⏳ הטיים־אאוט בוטל");
};


// ===============================
// 👑 Admin: Remove Admin
// ===============================

window.removeAdmin = async function (uid) {
  if (!isAdmin) return;

  await updateDoc(doc(db, "users", uid), {
    isAdmin: false
  });

  alert("👑 הוסר מאדמין");
};


// ===============================
// 👑 Admin Panel Button
// ===============================

adminPanelBtn.addEventListener("click", () => {
  window.location.href = "admin.html";
});