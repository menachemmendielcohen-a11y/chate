# 💬 Real-Time Chat App

צ'אט בזמן אמת עם מערכת אדמין, חסימות, שליחת תמונות ועוד 🚀

---

## ✨ פיצ'רים

* 💬 שליחת הודעות בזמן אמת (Firebase)
* 📸 שליחת תמונות (Base64)
* 👤 מערכת משתמשים (Firebase Auth)
* ⛔ חסימות:

  * באן קבוע
  * טיים־אאוט עם ספירה לאחור
* 👑 פאנל אדמין:

  * מחיקת צ'אט
  * פתיחה / סגירה של הצ'אט
  * ביטול טיים־אאוט
  * הורדת אדמין
* 🎨 UI מודרני עם בועות הודעה
* 🔄 עדכון הודעות בלייב (onSnapshot)

---

## 🛠️ טכנולוגיות

* HTML
* CSS
* JavaScript (ES Modules)
* Firebase:

  * Authentication
  * Firestore

---

## 📁 מבנה הפרויקט

```
/project
│
├── index.html        # דף הצ'אט
├── login.html        # התחברות
├── admin.html        # פאנל אדמין
│
├── style.css         # עיצוב
├── script.js         # לוגיקה ראשית
├── admin.js          # אדמין
├── firebaseConfig.js # הגדרות Firebase
```

---

## 🚀 איך להריץ

1. פתח Firebase Project
2. הפעל:

   * Authentication (Email/Password)
   * Firestore Database
3. הוסף את פרטי Firebase לקובץ:

```
firebaseConfig.js
```

4. פתח את:

```
index.html
```

---

## 🔐 מבנה הנתונים (Firestore)

### users collection

```json
{
  "isAdmin": true,
  "banned": false,
  "timeoutUntil": 1710000000000
}
```

---

### messages collection

```json
{
  "name": "User",
  "text": "Hello!",
  "image": "base64...",
  "createdAt": "timestamp"
}
```

---

## ⛔ מערכת חסימות

* משתמש חסום → לא רואה input
* טיים־אאוט → ספירה לאחור
* אדמין יכול לבטל בזמן אמת

---

## 🎨 UI

* בועות הודעה (כמו WhatsApp)
* תמונות בתוך הודעה
* כפתור העלאת קבצים מותאם אישית

---

## ⚠️ מגבלות

* תמונות נשמרות כ־Base64 (מוגבל בגודל)
* מומלץ בעתיד לעבור ל־Firebase Storage

---

## 🔥 שדרוגים עתידיים

* 🟢 סטטוס אונליין
* 🗑 מחיקת הודעה
* ❤️ לייקים להודעות
* 📎 שליחת קבצים אמיתית
* 🔍 חיפוש הודעות
* 🧵 תגובות להודעות

---

## 👨‍💻 יוצר

נבנה על ידי מנדי כן
(המדריך הדיגיטלי 💻🔥)

---

## 📜 רישיון

לשימוש חופשי 🎉
