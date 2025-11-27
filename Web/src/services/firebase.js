import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAeFQtYU-VRFJnk-GRVwVozn597JK3BS-o",
  authDomain: "clinic-booking-system-18e7d.firebaseapp.com",
  projectId: "clinic-booking-system-18e7d",
  storageBucket: "clinic-booking-system-18e7d.firebasestorage.app",
  messagingSenderId: "591679405583",
  appId: "1:591679405583:web:67cd7c566ad8b96db6ad7a",
  measurementId: "G-FD4Q9SZP6S",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
