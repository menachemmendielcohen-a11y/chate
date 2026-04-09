// script.js
import { db } from "./firebaseConfig.js";
import { collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
let username = sessionStorage.getItem("chatUsername");
if (!username) {
    username = prompt("מה השם שלך בצ'אט?") || "Guest";
    sessionStorage.setItem("chatUsername", username);
}
const usernameInput = { value: username };
messageInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") sendMessage();
});

window.sendMessage = async function () {
    const text = messageInput.value.trim();
    const username = usernameInput.value.trim();

    if (!text || !username) return alert("תכתוב הודעה!");

    await addDoc(collection(db, "messages"), {
        name: username,
        text,
        createdAt: Date.now()
    });

    messageInput.value = "";
};

const q = query(collection(db, "messages"), orderBy("createdAt"));

onSnapshot(q, (snapshot) => {
    chatBox.innerHTML = "";
    snapshot.forEach((doc) => {
        const data = doc.data();
        const currentUser = usernameInput.value.trim();

        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
        messageDiv.classList.add(data.name === currentUser ? "my-message" : "other-message");
        messageDiv.innerHTML = `<span class="name">${data.name}</span>${data.text}`;

        chatBox.appendChild(messageDiv);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
});

// התנתקות
document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem("chatUsername");
    window.location.href = "login.html";
});
