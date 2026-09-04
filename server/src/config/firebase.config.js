const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');

let firebaseApp = null;
let isFirebaseAvailable = false;

const initFirebase = () => {
  // Agar already initialized hai to skip karo
  if (getApps().length > 0) {
    firebaseApp = getApps()[0];
    isFirebaseAvailable = true;
    return;
  }

  let serviceAccount = null;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Production (Coolify): Environment variable se lo
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (error) {
      console.error('[Firebase] FIREBASE_SERVICE_ACCOUNT parse error:', error.message);
    }
  } else {
    // Local Development: JSON file se lo
    try {
      serviceAccount = require(path.resolve(__dirname, '../../plusone-app-b60de-firebase-adminsdk-fbsvc-12d445e978.json'));
    } catch (error) {
      // File nahi mili — BYPASS mode mein chalega
    }
  }

  if (!serviceAccount || typeof serviceAccount !== 'object') {
    console.warn('============================================================');
    console.warn('[Firebase] ⚠️  Service Account NOT found.');
    console.warn('[Firebase] 🔓 Running in BYPASS mode (local dev only).');
    console.warn('[Firebase] Token verification DISABLED — NOT safe for production!');
    console.warn('============================================================');
    isFirebaseAvailable = false;
    return;
  }

  try {
    firebaseApp = initializeApp({ credential: cert(serviceAccount) });
    isFirebaseAvailable = true;
    console.log('[Firebase] ✅ Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('[Firebase] ❌ Initialization failed:', error.message);
    isFirebaseAvailable = false;
  }
};

// App start hote hi initialize karo
initFirebase();

/**
 * Firebase Auth instance return karta hai.
 * Agar Firebase available nahi hai to null return karta hai.
 */
const getFirebaseAuth = () => {
  if (!isFirebaseAvailable || !firebaseApp) return null;
  return getAuth(firebaseApp);
};

module.exports = {
  firebaseApp,
  getFirebaseAuth,
  isFirebaseAvailable,
};
