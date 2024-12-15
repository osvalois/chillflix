// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCULLCCLK40pBUQcxbRzfjZ1KP8vX2ja9A",
  authDomain: "chillflix-media.firebaseapp.com",
  projectId: "chillflix-media",
  storageBucket: "chillflix-media.firebasestorage.app",
  messagingSenderId: "706383741150",
  appId: "1:706383741150:web:e840fedf17b667cb49c24f",
  measurementId: "G-1VSF768QHP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);