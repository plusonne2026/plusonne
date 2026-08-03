/**
 * Firebase Realtime Database (RTDB) service helpers
 * Supports live GPS location tracking, instant status synchronization, and real-time in-app chat
 */
import { getDatabase, ref, set, onValue, push, off, Database } from "firebase/database";
import { app } from "./config";

let db: Database | null = null;

if (typeof window !== "undefined" && app) {
  try {
    db = getDatabase(app);
  } catch (err) {
    console.warn("Firebase RTDB initialization warning:", err);
  }
}

export interface LocationCoords {
  lat: number;
  lng: number;
  updatedAt?: string;
  heading?: number;
  speed?: number;
}

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

/**
 * Pushes host live GPS coordinates to Firebase RTDB for an active session
 */
export async function pushHostLocation(bookingId: string, coords: LocationCoords): Promise<void> {
  if (!db) return;
  const locationRef = ref(db, `sessions/${bookingId}/hostLocation`);
  const payload = {
    ...coords,
    updatedAt: new Date().toISOString(),
  };
  await set(locationRef, payload);
}

/**
 * Listens for host real-time location changes
 */
export function listenToHostLocation(
  bookingId: string,
  callback: (coords: LocationCoords | null) => void
): () => void {
  if (!db) return () => {};
  const locationRef = ref(db, `sessions/${bookingId}/hostLocation`);
  const unsubscribe = onValue(locationRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as LocationCoords);
    } else {
      callback(null);
    }
  });
  return () => off(locationRef, "value", unsubscribe);
}

/**
 * Pushes instantaneous booking status update to RTDB
 */
export async function pushBookingStatusRealtime(bookingId: string, status: string): Promise<void> {
  if (!db) return;
  const statusRef = ref(db, `sessions/${bookingId}/status`);
  await set(statusRef, { status, updatedAt: new Date().toISOString() });
}

/**
 * Listens for real-time booking status transitions
 */
export function listenToBookingStatus(
  bookingId: string,
  callback: (statusData: { status: string; updatedAt: string } | null) => void
): () => void {
  if (!db) return () => {};
  const statusRef = ref(db, `sessions/${bookingId}/status`);
  const unsubscribe = onValue(statusRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  });
  return () => off(statusRef, "value", unsubscribe);
}

/**
 * Listens to incoming chat messages for a booking session
 */
export function listenToChatMessages(
  bookingId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  if (!db) return () => {};
  const chatRef = ref(db, `chats/${bookingId}`);
  const unsubscribe = onValue(chatRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const list: ChatMessage[] = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      callback(list);
    } else {
      callback([]);
    }
  });
  return () => off(chatRef, "value", unsubscribe);
}

/**
 * Sends an in-app chat message
 */
export async function sendChatMessage(bookingId: string, message: Omit<ChatMessage, "id" | "timestamp">): Promise<void> {
  if (!db) return;
  const chatRef = ref(db, `chats/${bookingId}`);
  const newMsgRef = push(chatRef);
  await set(newMsgRef, {
    ...message,
    timestamp: new Date().toISOString(),
  });
}
