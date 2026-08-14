import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";
import { app } from "./config";
import { AuthAPI } from "../api/auth.api";

let messaging: Messaging | null = null;

// Initialize messaging only on client side
if (typeof window !== "undefined") {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error("Firebase Messaging could not be initialized:", error);
  }
}

export const requestNotificationPermission = async (): Promise<string | null> => {
  if (!messaging) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        console.warn("VAPID key is missing. FCM token generation might fail.");
      }
      
      const currentToken = await getToken(messaging, { vapidKey });
      
      if (currentToken) {
        // We will send this token to our backend later
        return currentToken;
      } else {
        console.warn("No registration token available. Request permission to generate one.");
        return null;
      }
    } else {
      console.warn("Notification permission denied");
      return null;
    }
  } catch (err) {
    console.error("Error retrieving FCM token:", err);
    return null;
  }
};

export const onForegroundMessage = (callback: (payload: any) => void) => {
  if (!messaging) return () => {};
  
  return onMessage(messaging, (payload) => {
    callback(payload);
  });
};

export const registerFcmTokenWithBackend = async (token: string) => {
  try {
    // Re-use AuthAPI structure or simple fetch
    // Since we created PUT /users/fcm-token
    const userToken = localStorage.getItem("token");
    if (!userToken) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/fcm-token`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userToken}`,
      },
      body: JSON.stringify({ fcmToken: token }),
    });
    console.log("FCM Token registered with backend");
  } catch (error) {
    console.error("Failed to register FCM token with backend", error);
  }
};
