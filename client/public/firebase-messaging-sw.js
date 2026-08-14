importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCWKDdKENjH0HBRbdhMcp9J5vokIpqQx3Q",
  authDomain: "testing-e6170.firebaseapp.com",
  projectId: "testing-e6170",
  storageBucket: "testing-e6170.firebasestorage.app",
  messagingSenderId: "369311422418",
  appId: "1:369311422418:web:22838808562b78b566da0b",
  measurementId: "G-3R6L93SYYC",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new message.",
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
