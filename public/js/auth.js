// Shared auth utilities — Firebase email/password + Google + Anonymous (guest/debug)
// Hardened: rate-limit detection, email verification flow, friendlier errors,
// mobile redirect fallback (Android Chrome popup unreliability), getRedirectResult.

// Mobile detection — Android Chrome popup auth often fails silently; use redirect.
function _isMobile() {
  try {
    if (navigator.userAgentData && typeof navigator.userAgentData.mobile === 'boolean') {
      return navigator.userAgentData.mobile;
    }
  } catch {}
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '');
}

window.AERVINEXAuth = {
  currentUser: null,
  userProfile: null,
  _redirectHandled: false,

  init(onLogin, onLogout) {
    // Handle Google redirect-sign-in result (mobile flow)
    if (!this._redirectHandled) {
      this._redirectHandled = true;
      auth.getRedirectResult().then(async (cred) => {
        if (cred && cred.user) {
          await this._ensureUserDocForGoogle(cred.user);
        }
      }).catch((err) => {
        if (err && err.code && err.code !== 'auth/null-user') {
          console.warn('[auth] getRedirectResult error:', err.code, err.message);
        }
      });
    }
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

  async _ensureUserDocForGoogle(user) {
    try {
      const ref = db.collection('users').doc(user.uid);
      const snap = await ref.get();
      if (!snap.exists) {
        await ref.set({
          uid: user.uid,
          name: user.displayName || 'Google User',
          email: user.email || '',
          photoURL: user.photoURL || '',
          emailVerified: true,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          provider: 'google'
        });
      }
    } catch (e) {
      console.warn('[auth] ensure Google user doc failed:', e.code || e.message);
    }
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
    provider.addScope('email');
    provider.addScope('profile');

    // Mobile (esp. Android Chrome) — popup-based sign-in is unreliable due to
    // tab-grouping, custom tabs, and aggressive popup blockers. Use redirect.
    // The redirect result is then handled by getRedirectResult() in init().
    if (_isMobile()) {
      try { sessionStorage.setItem('aervinex-google-redirect-pending', '1'); } catch {}
      await auth.signInWithRedirect(provider);
      // Page will navigate away; this Promise effectively never resolves.
      return new Promise(() => {});
    }

    // Desktop — try popup, fall back to redirect on popup block / network glitch.
    try {
      const cred = await auth.signInWithPopup(provider);
      await this._ensureUserDocForGoogle(cred.user);
      return cred;
    } catch (err) {
      const code = err && err.code;
      // Common popup failure modes on mobile-ish browsers — retry via redirect.
      if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user' ||
          code === 'auth/cancelled-popup-request' || code === 'auth/network-request-failed') {
        try { sessionStorage.setItem('aervinex-google-redirect-pending', '1'); } catch {}
        await auth.signInWithRedirect(provider);
        return new Promise(() => {});
      }
      throw err;
    }
  },

  async signInAsGuest() {
    try {
      const cred = await auth.signInAnonymously();
      return cred;
    } catch (err) {
      const code = err && err.code;
      // 'admin-restricted-operation' = Anonymous provider OFF di Firebase Console.
      // 'operation-not-allowed' = same root cause, different SDK version surface.
      // Log clearly to aid debugging on user's device.
      console.error('[auth] Anonymous sign-in failed:', code, err.message);
      if (code === 'auth/admin-restricted-operation' || code === 'auth/operation-not-allowed') {
        const e = new Error('Guest login belum diaktifkan. Hubungi admin untuk enable Anonymous auth di Firebase Console.');
        e.code = code;
        throw e;
      }
      throw err;
    }
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
