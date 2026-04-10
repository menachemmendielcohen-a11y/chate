// login.js
import { auth, db, googleProvider } from "./firebaseConfig.js";

import {
  signInWithEmailAndPassword,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const registerBtn = document.getElementById("registerBtn");
const errorMsg = document.getElementById("errorMsg");

// בדיקת אלמנטים
if (!loginUsername || !loginPassword || !loginBtn || !googleLoginBtn || !registerBtn || !errorMsg) {
  console.error("יש אלמנט חסר ב-login.html. בדוק IDs.");
}

// הודעות שגיאה
function showError(text) {
  errorMsg.textContent = text;
}

function clearError() {
  errorMsg.textContent = "";
}

function translateFirebaseError(error) {
  const code = error.code || "";
  const msg = error.message || "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "שם המשתמש או הסיסמה שגויים.";
    case "auth/too-many-requests":
      return "יותר מדי ניסיונות. נסה שוב מאוחר יותר.";
    case "auth/popup-closed-by-user":
      return "חלון ההתחברות עם Google נסגר.";
    case "auth/network-request-failed":
      return "יש בעיית אינטרנט או רשת.";
    default:
      return "שגיאה: " + msg;
  }
}

// התחברות רגילה
async function login() {
  clearError();

  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();

  if (!username || !password) {
    showError("אנא מלא שם משתמש וסיסמה.");
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = "מתחבר...";

  try {
    // חיפוש המשתמש לפי username כדי להביא את האימייל
    const q = query(collection(db, "users"), where("username", "==", username));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      showError("שם המשתמש לא קיים.");
      return;
    }

    const userData = snapshot.docs[0].data();
    const email = userData.email;

    // התחברות עם אימייל + סיסמה
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // טעינת נתוני המשתמש
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();

      sessionStorage.setItem("chatUsername", data.username || "Guest");
      sessionStorage.setItem("isAdmin", data.isAdmin ? "true" : "false");
      sessionStorage.setItem("userUid", user.uid);

      window.location.href = "index.html";
    } else {
      showError("לא נמצאו נתוני משתמש במסד.");
    }

  } catch (error) {
    console.error("Login Error:", error);
    showError(translateFirebaseError(error));
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "התחבר";
  }
}

// התחברות עם גוגל
async function loginWithGoogle() {
  clearError();

  googleLoginBtn.disabled = true;
  googleLoginBtn.textContent = "מתחבר עם Google...";

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    // אם המשתמש לא קיים עדיין ב-Firestore — ניצור אותו
    if (!userSnap.exists()) {
      const username = user.displayName || user.email.split("@")[0];

      await setDoc(userRef, {
        username: username,
        email: user.email,
        isAdmin: false,
        createdAt: new Date().toISOString()
      });

      sessionStorage.setItem("chatUsername", username);
      sessionStorage.setItem("isAdmin", "false");
      sessionStorage.setItem("userUid", user.uid);
    } else {
      const data = userSnap.data();

      sessionStorage.setItem("chatUsername", data.username || user.displayName || "Guest");
      sessionStorage.setItem("isAdmin", data.isAdmin ? "true" : "false");
      sessionStorage.setItem("userUid", user.uid);
    }

    window.location.href = "chat.html";

  } catch (error) {
    console.error("Google Login Error:", error);
    showError(translateFirebaseError(error));
  } finally {
    googleLoginBtn.disabled = false;
    googleLoginBtn.textContent = "התחברות עם Google";
  }
}

// אירועים
loginBtn.addEventListener("click", login);

googleLoginBtn.addEventListener("click", loginWithGoogle);

registerBtn.addEventListener("click", () => {
  window.location.href = "register.html";
});

// Enter = התחברות
loginPassword.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    login();
  }
});
