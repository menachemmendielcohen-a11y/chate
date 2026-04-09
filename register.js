// register.js
import { auth, db } from "./firebaseConfig.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.getElementById("registerUserBtn").addEventListener("click", async () => {
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const passwordConfirm = document.getElementById("regPasswordConfirm").value.trim();

  if (!name || !email || !password || !passwordConfirm) {
    return alert("כל השדות חייבים להיות מלאים!");
  }

  if (password !== passwordConfirm) {
    return alert("הסיסמאות לא תואמות!");
  }

  // בדיקה אם המייל כבר קיים ב-Firestore
  const q = query(collection(db, "users"), where("email", "==", email));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    return alert("מייל זה כבר קיים! השתמש במייל אחר.");
  }

  try {
    // יצירת משתמש ב-Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // שמירת פרטים נוספים ב-Firestore
    await addDoc(collection(db, "users"), {
      uid: userCredential.user.uid,
      name,
      email,
      createdAt: new Date().toISOString()
    });

    alert("נרשמת בהצלחה!");
    window.location.href = "login.html";

  } catch (error) {
    console.error(error);
    alert("אירעה שגיאה בהרשמה: " + error.message);
  }
});

// כפתור חזור להתחברות
document.getElementById("backLoginBtn").addEventListener("click", () => {
  window.location.href = "login.html";
});
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("registerUserBtn").addEventListener("click", async () => {
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    const passwordConfirm = document.getElementById("regPasswordConfirm").value.trim();

    if (!name || !email || !password || !passwordConfirm) {
      return alert("כל השדות חייבים להיות מלאים!");
    }

    if (password !== passwordConfirm) {
      return alert("הסיסמאות לא תואמות!");
    }

    // כאן השאר הקוד של Firebase
  });

  document.getElementById("backLoginBtn").addEventListener("click", () => {
    window.location.href = "login.html";
  });
});