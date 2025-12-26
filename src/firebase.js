import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {

    apiKey: "AIzaSyBQW1809f2PicabNaCoqLGPpLqg9b0aAPA",

    authDomain: "fire-detection-system-34815.firebaseapp.com",

    databaseURL: "https://fire-detection-system-34815-default-rtdb.firebaseio.com",

    projectId: "fire-detection-system-34815",

    storageBucket: "fire-detection-system-34815.firebasestorage.app",

    messagingSenderId: "425432533026",

    appId: "1:425432533026:web:6184ad06f874fb7ecc227b"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
