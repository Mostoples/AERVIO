// Shared auth utilities
window.AervioAuth = {
  currentUser: null,
  userProfile: null,

  init(onLogin, onLogout) {
    auth.onAuthStateChanged(async user => {
      if (user) {
        this.currentUser = user;
        try {
          const snap = await db.collection('users').doc(user.uid).get();
          this.userProfile = snap.exists ? snap.data() : { name: user.displayName || 'User', age: 25 };
        } catch {
          this.userProfile = { name: user.displayName || 'User', age: 25 };
        }
        onLogin && onLogin(user, this.userProfile);
      } else {
        this.currentUser = null;
        this.userProfile = null;
        onLogout && onLogout();
      }
    });
  },

  async logout() {
    await auth.signOut();
  },

  getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  },

  friendlyError(code) {
    const map = {
      'auth/user-not-found': 'Akun tidak ditemukan. Silakan daftar.',
      'auth/wrong-password': 'Password salah.',
      'auth/email-already-in-use': 'Email sudah terdaftar.',
      'auth/weak-password': 'Password minimal 6 karakter.',
      'auth/invalid-email': 'Email tidak valid.',
      'auth/network-request-failed': 'Koneksi bermasalah.',
      'auth/invalid-credential': 'Email atau password salah.',
    };
    return map[code] || 'Terjadi kesalahan. Coba lagi.';
  }
};
