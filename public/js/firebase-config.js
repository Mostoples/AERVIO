const firebaseConfig = {
  apiKey: "AIzaSyAAEYxWofEE3k0K57nssUKgEYUNU4ZJXrg",
  authDomain: "aervio-id.firebaseapp.com",
  projectId: "aervio-id",
  storageBucket: "aervio-id.firebasestorage.app",
  messagingSenderId: "788636909860",
  appId: "1:788636909860:web:b6b1d1ec31b591037cb3b1"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

window.auth = firebase.auth();
window.db   = firebase.firestore();
