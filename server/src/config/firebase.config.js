const { initializeApp, cert } = require('firebase-admin/app');
const path = require('path');

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Production (Coolify): Read from environment variable
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error("Error parsing FIREBASE_SERVICE_ACCOUNT environment variable:", error.message);
  }
} else {
  // Local Development: Read from JSON file
  try {
    serviceAccount = require(path.resolve(__dirname, '../../plusone-app-b60de-firebase-adminsdk-fbsvc-12d445e978.json'));
  } catch (error) {
    console.error("Local Firebase JSON file not found!");
  }
}

const app = initializeApp({
  credential: cert(serviceAccount)
});

module.exports = app;
