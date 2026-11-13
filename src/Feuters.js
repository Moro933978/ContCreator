import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBXkDUPWLuLac3qHX167-GApVWKFIrM37k",
    authDomain: "futuresform.firebaseapp.com",
    projectId: "futuresform", // حروف صغيرة بالكامل    
    storageBucket: "futuresform.firebasestorage.app",
    messagingSenderId: "48096877889",
    appId: "1:48096877889:web:6199d65cdaeda30a1bd5c0",
    measurementId: "G-L8ZGDTTZKR"
};

const app = getApps().length
    ? getApp()
    : initializeApp(firebaseConfig);

export const db = getFirestore(app);

console.log("Firestore:", db);