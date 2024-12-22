import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
export const firebaseConfig = {
    apiKey: "AIzaSyCULLCCLK40pBUQcxbRzfjZ1KP8vX2ja9A",
    authDomain: "chillflix-media.firebaseapp.com",
    projectId: "chillflix-media",
    storageBucket: "chillflix-media.firebasestorage.app",
    messagingSenderId: "706383741150",
    appId: "1:706383741150:web:e840fedf17b667cb49c24f",
    measurementId: "G-1VSF768QHP"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);