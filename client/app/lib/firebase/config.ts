/**
 * Firebase Client SDK Initialization & Authentication Helpers
 * Supports Google OAuth, Phone + OTP, and Email/Password flows
 */
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  Auth,
  User as FirebaseUser,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCWKDdKENjH0HBRbdhMcp9J5vokIpqQx3Q",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "testing-e6170.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "testing-e6170",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "testing-e6170.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "369311422418",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:369311422418:web:22838808562b78b566da0b",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-3R6L93SYYC",
};

// Initialize Firebase only if in browser environment or safe server SSR
let app: FirebaseApp;
let auth: Auth;
let analytics: Analytics | null = null;

if (typeof window !== "undefined" || getApps().length > 0) {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);

  if (typeof window !== "undefined") {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });
  }
}

export { app, auth, analytics };

/**
 * Sign in with Google OAuth using a popup window
 */
export async function signInWithGoogle(): Promise<{ user: FirebaseUser; token: string }> {
  if (!auth) throw new Error("Firebase Auth is not initialized.");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const result = await signInWithPopup(auth, provider);
  const token = await result.user.getIdToken();
  return { user: result.user, token };
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(email: string, pass: string): Promise<{ user: FirebaseUser; token: string }> {
  if (!auth) throw new Error("Firebase Auth is not initialized.");
  const result = await signInWithEmailAndPassword(auth, email, pass);
  const token = await result.user.getIdToken();
  return { user: result.user, token };
}

/**
 * Register with Email and Password
 */
export async function signUpWithEmail(email: string, pass: string): Promise<{ user: FirebaseUser; token: string }> {
  if (!auth) throw new Error("Firebase Auth is not initialized.");
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  const token = await result.user.getIdToken();
  return { user: result.user, token };
}

/**
 * Initialize invisible or visible RecaptchaVerifier for Phone OTP verification
 */
export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  if (!auth) throw new Error("Firebase Auth is not initialized.");
  return new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {
      console.log("Recaptcha verified successfully");
    },
  });
}

/**
 * Send OTP verification SMS to phone number (e.g., +919876543210)
 */
export async function sendPhoneOtp(
  phoneNumber: string,
  appVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  if (!auth) throw new Error("Firebase Auth is not initialized.");
  return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
}

/**
 * Confirm received 6-digit OTP code against confirmation result
 */
export async function verifyPhoneOtp(
  confirmationResult: ConfirmationResult,
  otpCode: string
): Promise<{ user: FirebaseUser; token: string }> {
  const result = await confirmationResult.confirm(otpCode);
  const token = await result.user.getIdToken();
  return { user: result.user, token };
}
