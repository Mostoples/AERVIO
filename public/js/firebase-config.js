const firebaseConfig = {
  apiKey: "AIzaSyAYFfmwVacq1sZN296YacTfS2J34ZQmagM",
  authDomain: "aervinex.firebaseapp.com",
  projectId: "aervinex",
  storageBucket: "aervinex.firebasestorage.app",
  messagingSenderId: "1032158217152",
  appId: "1:1032158217152:web:3f3b436fe7c50023077e25"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

window.auth = firebase.auth();
window.db   = firebase.firestore();
