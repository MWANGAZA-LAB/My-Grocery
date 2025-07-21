// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFGwfwiOTu4lOt3jfa_SZwuErfCvZclBQ",
  authDomain: "my-grocery-a08a4.firebaseapp.com",
  projectId: "my-grocery-a08a4",
  storageBucket: "my-grocery-a08a4.appspot.com", // <-- fix: add 'appspot.com'
  messagingSenderId: "107671683682",
  appId: "1:107671683682:web:cba80974526fc5c130073b",
  measurementId: "G-BSC8RBHTP5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }; 