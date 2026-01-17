import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAjjVRpKVhZL89ZufkYuvjyRkht0gKoD4M",
  authDomain: "deepfraud-ef936.firebaseapp.com",
  projectId: "deepfraud-ef936",
  storageBucket: "deepfraud-ef936.firebasestorage.app",
  messagingSenderId: "1025168785871",
  appId: "1:1025168785871:web:08c49508cf55fdd3a252ba",
  measurementId: "G-GNENHY30SY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();