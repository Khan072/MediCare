import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA2jgJ9tWHKaIKcf20qyaoSY-EElAc9CPk",
  authDomain: "medicare-app-1a7cb.firebaseapp.com",
  projectId: "medicare-app-1a7cb",
  storageBucket: "medicare-app-1a7cb.firebasestorage.app",
  messagingSenderId: "811229783437",
  appId: "1:811229783437:web:3643324b5cad423a8249c4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);