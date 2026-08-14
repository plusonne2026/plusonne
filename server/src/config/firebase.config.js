const { initializeApp, cert } = require('firebase-admin/app');
const path = require('path');
const serviceAccount = require(path.resolve(__dirname, '../../plusone-app-b60de-firebase-adminsdk-fbsvc-12d445e978.json'));

const app = initializeApp({
  credential: cert(serviceAccount)
});

module.exports = app;
