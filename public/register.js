// register.js
import { auth, db } from "./firebaseConfig.js";

import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const regName = document.getElementById("regName");
const regEmail = document.getElementById("regEmail");
const regPassword = document.getElementById("regPassword");
const regPasswordConfirm = document.getElementById("regPasswordConfirm");

const registerUserBtn = document.getElementById("registerUserBtn");
const backLoginBtn = document.getElementById("backLoginBtn");
const errorMsg = document.getElementById("errorMsg");

// אם חסר אלמנט ב-HTML, לעצור מיד כדי שלא תקבל null errors
if (
  !regName ||
  !regEmail ||
  !regPassword ||
  !regPasswordConfirm ||
  !registerUserBtn ||
  !backLoginBtn ||
  !errorMsg
) {
  console.error("יש אלמנט חסר ב-register.html. בדוק IDs.");
}

// תרגום שגיאות Firebase לעברית
function translateFirebaseError(error) {
  const code = error.code || "";
  const msg = error.message || "";

  switch (code) {
    case "auth/email-already-in-use":
      return "האימייל הזה כבר רשום במערכת.";
    case "auth/invalid-email":
      return "כתובת האימייל לא תקינה.";
    case "auth/weak-password":
      return "הסיסמה חלשה מדי. בחר סיסמה חזקה יותר.";
    case "auth/network-request-failed":
      return "אין חיבור לאינטרנט או שיש בעיית רשת.";
    case "permission-denied":
      return "אין הרשאה לשמור נתונים ב-Firebase.";
    default:
      if (msg.includes("Missing or insufficient permissions")) {
        return "אין הרשאה לשמור נתונים ב-Firestore. בדוק את Rules.";
      }
      return "אירעה שגיאה בהרשמה: " + msg;
  }
}

// ניקוי הודעת שגיאה
function clearError() {
  errorMsg.textContent = "";
}

// הצגת שגיאה
function showError(text) {
  errorMsg.textContent = text;
}

// פונקציית הרשמה
async function registerUser() {
  clearError();

  const username = regName.value.trim();
  const email = regEmail.value.trim();
  const password = regPassword.value.trim();
  const passwordConfirm = regPasswordConfirm.value.trim();

  // בדיקות בסיס
  if (!username || !email || !password || !passwordConfirm) {
    showError("כל השדות חייבים להיות מלאים.");
    return;
  }

  if (username.length < 3) {
    showError("שם המשתמש חייב להכיל לפחות 3 תווים.");
    return;
  }

  if (password.length < 6) {
    showError("הסיסמה חייבת להכיל לפחות 6 תווים.");
    return;
  }

  if (password !== passwordConfirm) {
    showError("הסיסמאות לא תואמות.");
    return;
  }

  // נעילת כפתור בזמן הרשמה
  registerUserBtn.disabled = true;
  registerUserBtn.textContent = "נרשם...";

  try {
    // בדיקה אם שם המשתמש כבר תפוס
    const usernameQuery = query(
      collection(db, "users"),
      where("username", "==", username)
    );

    const usernameSnapshot = await getDocs(usernameQuery);

    if (!usernameSnapshot.empty) {
      showError("שם המשתמש כבר תפוס. בחר שם אחר.");
      registerUserBtn.disabled = false;
      registerUserBtn.textContent = "הרשם";
      return;
    }

    // יצירת המשתמש ב-Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // שמירת נתוני המשתמש ב-Firestore
    await setDoc(doc(db, "users", user.uid), {
      username: username,
      email: email,
      isAdmin: false,
      createdAt: new Date().toISOString()
    });

    alert("נרשמת בהצלחה!");
    window.location.href = "login.html";

  } catch (error) {
    console.error("Register Error:", error);
    showError(translateFirebaseError(error));
  } finally {
    registerUserBtn.disabled = false;
    registerUserBtn.textContent = "הרשם";
  }
}

// אירועים
registerUserBtn.addEventListener("click", registerUser);

backLoginBtn.addEventListener("click", () => {
  window.location.href = "login.html";
});

// Enter = הרשמה
regPasswordConfirm.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    registerUser();
  }
});ד