"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AuthAPI, User } from "../api/auth.api";
import { AdminAPI } from "../api/admin.api";
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  sendPhoneOtp,
  verifyPhoneOtp,
  auth,
} from "../firebase/config";
import { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<{ user: User; isNewUser: boolean }>;
  loginWithEmail: (email: string, pass: string) => Promise<User>;
  loginWithAdmin: (email: string, pass: string) => Promise<User>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<{ user: User; isNewUser: boolean }>;
  sendPhoneCode: (phone: string, verifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  confirmPhoneCode: (result: ConfirmationResult, otp: string) => Promise<{ user: User; isNewUser: boolean }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<User | null>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const storedToken = localStorage.getItem("plusone_auth_token");
        const storedUserId = localStorage.getItem("plusone_user_id");

        if (storedToken && storedUserId) {
          setToken(storedToken);
          try {
            const profile = await AuthAPI.getProfile(storedUserId);
            setUser(profile);
          } catch (err) {
            console.warn("Failed to refresh session from backend, clearing local storage.", err);
            localStorage.removeItem("plusone_auth_token");
            localStorage.removeItem("plusone_user_id");
            setToken(null);
            setUser(null);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, []);

  const saveSession = (userId: string, idToken: string, profile: User) => {
    localStorage.setItem("plusone_auth_token", idToken);
    localStorage.setItem("plusone_user_id", userId);
    setToken(idToken);
    setUser(profile);
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { user: fbUser, token: idToken } = await signInWithGoogle();
      const payload = {
        firebaseUid: fbUser.uid,
        email: fbUser.email || undefined,
        displayName: fbUser.displayName || undefined,
        avatarUrl: fbUser.photoURL || undefined,
        authProvider: "google",
      };

      const { user: profile, isNewUser } = await AuthAPI.register(payload);
      saveSession(profile.userId, idToken, profile);
      return { user: profile, isNewUser };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const { user: fbUser, token: idToken } = await signInWithEmail(email, pass);
      const profile = await AuthAPI.verifyToken(fbUser.uid);
      saveSession(profile.userId, idToken, profile);
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithAdmin = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const { user: profile, token: idToken } = await AdminAPI.adminLogin(email, pass);
      saveSession(profile.userId, idToken, profile);
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    setIsLoading(true);
    try {
      const { user: fbUser, token: idToken } = await signUpWithEmail(email, pass);
      const payload = {
        firebaseUid: fbUser.uid,
        email: fbUser.email || email,
        displayName: name,
        authProvider: "email",
      };

      const { user: profile, isNewUser } = await AuthAPI.register(payload);
      saveSession(profile.userId, idToken, profile);
      return { user: profile, isNewUser };
    } finally {
      setIsLoading(false);
    }
  };

  const sendPhoneCode = async (phone: string, verifier: RecaptchaVerifier) => {
    return await sendPhoneOtp(phone, verifier);
  };

  const confirmPhoneCode = async (result: ConfirmationResult, otp: string) => {
    setIsLoading(true);
    try {
      const { user: fbUser, token: idToken } = await verifyPhoneOtp(result, otp);
      const payload = {
        firebaseUid: fbUser.uid,
        phone: fbUser.phoneNumber || undefined,
        authProvider: "phone",
      };

      const { user: profile, isNewUser } = await AuthAPI.register(payload);
      saveSession(profile.userId, idToken, profile);
      return { user: profile, isNewUser };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user?.userId) return null;
    try {
      const updated = await AuthAPI.getProfile(user.userId);
      setUser(updated);
      return updated;
    } catch (err) {
      console.error("Failed to refresh profile:", err);
      return null;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (auth) {
        await auth.signOut();
      }
      localStorage.removeItem("plusone_auth_token");
      localStorage.removeItem("plusone_user_id");
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        loginWithGoogle,
        loginWithEmail,
        loginWithAdmin,
        registerWithEmail,
        sendPhoneCode,
        confirmPhoneCode,
        logout,
        refreshProfile,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
