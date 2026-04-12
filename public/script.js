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
// 🎯 Elements
// ===============================

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");
const adminPanelBtn = document.getElementById("adminPanelBtn");
const statusBox = document.getElementById("statusBox");
const fileInput = document.getElementById("fileInput");


// ===============================
// 👤 State
// ===============================

let currentUser = null;
let currentUsername = "Guest";
let isAdmin = false;
let timerInterval = null;


// ===============================
// 🔐 Auth
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
    isAdmin = userSnap.data().isAdmin === true;
  }

  if (isAdmin) {
    adminPanelBtn.style.display = "inline-block";
  }

  checkChatDisabled();
});


// ===============================
// 🚫 UI BLOCK
// ===============================

function blockUI(text) {
  messageInput.style.display = "none";
  sendBtn.style.display = "none";
  if (fileInput) fileInput.style.display = "none";
  statusBox.innerHTML = `⛔ ${text}`;
}

function unblockUI() {
  messageInput.style.display = "block";
  sendBtn.style.display = "inline-block";
  if (fileInput) fileInput.style.display = "block";
  statusBox.innerHTML = "";
}

function startCountdown(until) {
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

    statusBox.innerHTML = `⏳ חסום זמנית: ${min}:${sec}`;
  }, 1000);
}


// ===============================
// ✅ canSend
// ===============================

async function canSend(userId) {
  const snap = await getDoc(doc(db, "users", userId));

  if (!snap.exists()) return true;

  const data = snap.data();

  if (data.banned) {
    blockUI("נחסמת מהמערכת");
    return false;
  }

  if (data.timeoutUntil && data.timeoutUntil > Date.now()) {
    startCountdown(data.timeoutUntil);
    return false;
  }

  unblockUI();
  return true;
}


// ===============================
// 🧠 Base64
// ===============================

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}


// ===============================
// 📤 Send Message
// ===============================

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

async function sendMessage() {
  const text = messageInput.value.trim();
  const file = fileInput?.files?.[0];

  if (!text && !file) return;

  if (!currentUser) {
    alert("אתה לא מחובר");
    return;
  }

  if (!(await canSend(currentUser.uid))) return;

  let imageBase64 = null;

  if (file) {
    imageBase64 = await toBase64(file);
  }

  try {
    await addDoc(collection(db, "messages"), {
      name: currentUsername,
      text: text || "",
      image: imageBase64,
      createdAt: serverTimestamp()
    });

    messageInput.value = "";
    if (fileInput) fileInput.value = "";

  } catch (err) {
    console.error(err);
    alert("שגיאה בשליחה");
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

    if (data.name === currentUsername) {
      div.classList.add("my-message");
    } else {
      div.classList.add("other-message");
    }

    let content = "";

    if (data.text) {
      content += `<div>${data.text}</div>`;
    }

    if (data.image) {
      content += `<img src="${data.image}" class="chat-img">`;
    }

    div.innerHTML = `
      <span class="name">${data.name}</span>
      ${content}
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
// ⛔ Chat disabled
// ===============================

async function checkChatDisabled() {
  const snap = await getDoc(doc(db, "settings", "chat"));

  if (snap.exists() && snap.data().disabled && !isAdmin) {
    document.body.innerHTML = "⛔ הצ'אט מושבת";
  }
}


// ===============================
// 🧹 Admin clear chat
// ===============================

window.clearChat = async function () {
  if (!isAdmin) return;

  const snap = await getDocs(collection(db, "messages"));

  snap.forEach(async (d) => {
    await deleteDoc(doc(db, "messages", d.id));
  });

  alert("הצ'אט נמחק");
};


// ===============================
// 🔒 Admin toggle chat
// ===============================

window.disableChat = async function (value) {
  if (!isAdmin) return;

  await setDoc(doc(db, "settings", "chat"), {
    disabled: value
  });

  alert(value ? "צ'אט נסגר" : "צ'אט נפתח");
};


// ===============================
// 👑 Admin panel
// ===============================

adminPanelBtn.addEventListener("click", () => {
  window.location.href = "admin.html";
});
fileInput.addEventListener("change", () => {
  const fileName = document.getElementById("fileName");
  fileName.textContent = fileInput.files[0]?.name || "";
});