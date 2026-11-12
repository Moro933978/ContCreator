// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC0nFBPrOKDISCJXXLalhtpi5QLKTTo9ss",
    authDomain: "teckhookstudio.firebaseapp.com",
    projectId: "teckhookstudio",
    storageBucket: "teckhookstudio.firebasestorage.app",
    messagingSenderId: "265820744503",
    appId: "1:265820744503:web:9156e39abefa6c1e2c48b2",
    measurementId: "G-79CR6X6FVP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);