// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyDS9QJtZBmMBbBZb6Sowxvc-PYEtlHe3LU",
    authDomain: "seeways-be14b.firebaseapp.com",
    databaseURL: "https://seeways-be14b-default-rtdb.firebaseio.com",
    projectId: "seeways-be14b",
    storageBucket: "seeways-be14b.firebasestorage.app",
    messagingSenderId: "53598789861",
    appId: "1:53598789861:web:bcae5bc7423a56de49b40c",
    measurementId: "G-KZT8FJM8LD"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
export const auth = getAuth(app);
export const db = getDatabase(app);

export default app;