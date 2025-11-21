// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCSGlNROS6fv-Cv_jDUMwFu_hB47BNfdq8",
    authDomain: "fire-detection-system-65059.firebaseapp.com",
    databaseURL: "https://fire-detection-system-65059-default-rtdb.firebaseio.com",
    projectId: "fire-detection-system-65059",
    storageBucket: "fire-detection-system-65059.firebasestorage.app",
    messagingSenderId: "182876633372",
    appId: "1:182876633372:web:62996e33fece8ed737e2d9",
    measurementId: "G-QSE3LFQ6N2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);