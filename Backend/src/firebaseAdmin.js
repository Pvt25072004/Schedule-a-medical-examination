// src/firebaseAdmin.js
require('dotenv').config();
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.GOOGLE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://clinic-booking-system-18e7d-default-rtdb.asia-southeast1.firebasedatabase.app"
});

module.exports = admin;
