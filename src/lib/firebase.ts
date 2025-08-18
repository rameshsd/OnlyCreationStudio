
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDtM4lGG4IAnhPRmx10fhI7NjMUy_oq25k",
  authDomain: "creator-canvas-w47i3.firebaseapp.com",
  projectId: "creator-canvas-w47i3",
  storageBucket: "creator-canvas-w47i3.appspot.com",
  messagingSenderId: "705093519264",
  appId: "1:705093519264:web:dc72ed537b6a83454746c5"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


export { app, auth, db, storage };
