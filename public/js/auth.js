// Shared auth utilities — Firebase email/password + Google + Anonymous (guest/debug)
// Hardened: rate-limit detection, email verification flow, friendlier errors.
window.AERVINEXAuth = {
  currentUser: null,
  userProfile: null,

  init(onLogin, onLogout) {
    auth.onAuthStateChanged(async user => {
      if (user) {
        this.currentUser = user;
        try {
          const snap = await db.collection('users').doc(user.uid).get();
          this.userProfile = snap.exists
            ? snap.data()
            : { name: user.displayName || (user.isAnonymous ? 'Guest' : 'User'), age: 25, isGuest: user.isAnonymous };
        } catch {
          this.userProfile = { name: user.displayName || 'User', age: 25, isGuest: user.isAnonymous };
        }
        onLogin && onLogin(user, this.userProfile);
      } else {
        this.currentUser = null;
        this.userProfile = null;
        onLogout && onLogout();
      }
    });
  },

  async loginEmail(email, password) {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    // Soft-check email verification — caller may decide to gate features
    if (cred.user && !cred.user.emailVerified && !cred.user.isAnonymous) {
      // Don't block login; just expose flag for UI.
      try { sessionStorage.setItem('aervinex-email-unverified', '1'); } catch {}
    } else {
      try { sessionStorage.removeItem('aervinex-email-unverified'); } catch {}
    }
    return cred;
  },

  async registerEmail(email, password, name) {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    if (name) await cred.user.updateProfile({ displayName: name });
    await db.collection('users').doc(cred.user.uid).set({
      uid: cred.user.uid,
      name: name || '',
      email,
      emailVerified: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    // Fire-and-forget verification email (don't fail registration if SMTP rate-limits)
    try {
      await cred.user.sendEmailVerification({
        url: window.location.origin + '/login.html?verified=1',
        handleCodeInApp: false
      });
    } catch (err) {
      console.warn('[auth] sendEmailVerification failed:', err && err.code);
    }
    return cred;
  },

  async resendEmailVerification() {
    if (!auth.currentUser || auth.currentUser.isAnonymous) {
      throw new Error('Tidak ada akun email aktif.');
    }
    if (auth.currentUser.emailVerified) {
      throw new Error('Email sudah terverifikasi.');
    }
    return auth.currentUser.sendEmailVerification({
      url: window.location.origin + '/login.html?verified=1'
    });
  },

  isEmailVerified() {
    const u = auth.currentUser;
    if (!u) return false;
    if (u.isAnonymous) return true; // anonymous N/A
    return u.emailVerified === true;
  },

  async signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await auth.signInWithPopup(provider);
    // First-time Google users: write profile if missing
    const ref = db.collection('users').doc(cred.user.uid);
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set({
        uid: cred.user.uid,
        name: cred.user.displayName || 'Google User',
        email: cred.user.email || '',
        photoURL: cred.user.photoURL || '',
        emailVerified: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        provider: 'google'
      });
    }
    return cred;
  },

  async signInAsGuest() {
    return auth.signInAnonymously();
  },

  async sendPasswordReset(email) {
    return auth.sendPasswordResetEmail(email);
  },

  async logout() {
    await auth.signOut();
  },

  getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  },

  // Redirect helper for protected pages — call early in inline script
  requireAuth(loginPath = '/login.html') {
    return new Promise(resolve => {
      auth.onAuthStateChanged(user => {
        if (!user) location.replace(loginPath);
        else resolve(user);
      });
    });
  },

  // True when a Firebase auth error indicates we should back off and ask the
  // user to wait (rate limit, too many attempts, blocked).
  isRateLimitError(code) {
    return code === 'auth/too-many-requests'
        || code === 'auth/quota-exceeded'
        || code === 'auth/captcha-check-failed';
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
      'auth/popup-closed-by-user': 'Login Google dibatalkan.',
      'auth/popup-blocked': 'Popup diblokir browser. Izinkan popup untuk login Google.',
      'auth/operation-not-allowed': 'Metode login ini belum diaktifkan di Firebase Console.',
      'auth/admin-restricted-operation': 'Guest/Anonymous belum diaktifkan di Firebase Console.',
      'auth/too-many-requests': 'Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi, atau reset password.',
      'auth/quota-exceeded': 'Kuota request terlampaui. Coba lagi nanti.',
      'auth/captcha-check-failed': 'Verifikasi keamanan gagal. Refresh halaman dan coba lagi.',
      'auth/user-disabled': 'Akun dinonaktifkan oleh admin. Hubungi support.',
      'auth/requires-recent-login': 'Sesi terlalu lama. Logout dan login ulang untuk lanjutkan.',
    };
    return map[code] || 'Terjadi kesalahan. Coba lagi.';
  }
};
