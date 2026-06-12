const firebaseConfig = {
  apiKey: "AIzaSyAYFfmwVacq1sZN296YacTfS2J34ZQmagM",
  authDomain: "aervinex.firebaseapp.com",
  projectId: "aervinex",
  storageBucket: "aervinex.firebasestorage.app",
  messagingSenderId: "1032158217152",
  appId: "1:1032158217152:web:3f3b436fe7c50023077e25"
};

try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('[Firebase] Initialized successfully');
  }

  window.auth = firebase.auth();
  window.db   = firebase.firestore();

  console.log('[Firebase] Auth and Firestore ready');
} catch (error) {
  console.error('[Firebase] Initialization failed:', error);
  alert('Gagal menginisialisasi Firebase. Pastikan Anda terkoneksi ke internet dan refresh halaman.');
}
