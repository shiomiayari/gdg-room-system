// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCPQJp1FYVtQS3IX_lWIpmP_ZAMSo7Wt6o",
  authDomain: "gdg-login-c758b.firebaseapp.com",
  projectId: "gdg-login-c758b",
  storageBucket: "gdg-login-c758b.firebasestorage.app",
  messagingSenderId: "7751423056",
  appId: "1:7751423056:web:974d0f7fe78a3453f36d55"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();