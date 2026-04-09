// login.js
import { auth, db } from "./firebaseConfig.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    return alert("תכתוב מייל וסיסמה!");
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const uid = userCredential.user.uid;

      // שולף שם משתמש מ-Firestore לפי UID
      const q = query(collection(db, "users"), where("uid", "==", uid));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const user = snapshot.docs[0].data();
        sessionStorage.setItem("chatUsername", user.name);
        window.location.href = "index.html";
      } else {
        alert("משתמש לא נמצא במסד הנתונים!");
      }
    })
    .catch((error) => {
      console.error(error);
      alert("מייל או סיסמה לא נכונים!");
    });
}

document.getElementById("registerBtn").addEventListener("click", () => {
  window.location.href = "register.html";
});

document.getElementById("loginPassword").addEventListener("keypress", (event) => {
  if (event.key === "Enter") login();
});

window.login = login;