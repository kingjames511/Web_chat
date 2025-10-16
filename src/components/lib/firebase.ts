// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD9XYlpZ3_TuwcGDm8R__kwem47Y5fAzsM",
  authDomain: "chatpp-5c8fa.firebaseapp.com",
  projectId: "chatpp-5c8fa",
  storageBucket: "chatpp-5c8fa.firebasestorage.app",
  messagingSenderId: "616782739243",
  appId: "1:616782739243:web:33aad7ed381d9244b6b76e",
  measurementId: "G-GQW2CM569L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth()
 export const db = getFirestore(app)