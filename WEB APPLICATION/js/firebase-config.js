// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDGKIJ9PrjuMbQutYtTZRL2g-scrsegbhs",
  authDomain: "campus-connect-7f6db.firebaseapp.com",
  databaseURL: "https://campus-connect-7f6db-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "campus-connect-7f6db",
  storageBucket: "campus-connect-7f6db.firebasestorage.app",
  messagingSenderId: "614427518149",
  appId: "1:614427518149:web:b8ba0c6ba3be4e52fcfcac",
  measurementId: "G-6H4MT552M4"
};

// Initialize Firebase (Start the connection)
firebase.initializeApp(firebaseConfig);

// Get references to services we'll use (Make them global for other files!)
window.auth = firebase.auth();           // For login/signup
window.db = firebase.firestore();        // Our database

// Enable offline data persistence
db.enablePersistence()
    .catch((err) => {
        console.error("Offline persistence error:", err);
    });