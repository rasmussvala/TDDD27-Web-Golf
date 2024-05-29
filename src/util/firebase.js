// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: "tddd27-aweb.firebaseapp.com",
  databaseURL: "https://tddd27-aweb-default-rtdb.firebaseio.com",
  projectId: "tddd27-aweb",
  storageBucket: "tddd27-aweb.appspot.com",
  messagingSenderId: "426999646914",
  appId: "1:426999646914:web:8d0f60d9e747601641895b",
  measurementId: "G-0Q516KB9Y9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);
