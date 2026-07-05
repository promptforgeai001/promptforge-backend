import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyCnkNF4w989Okvpzgc9H5LnrGDNTq_biSY",
  authDomain: "promptforge-ai-c84be.firebaseapp.com",
  projectId: "promptforge-ai-c84be",
  storageBucket: "promptforge-ai-c84be.firebasestorage.app",
  messagingSenderId: "615746243033",
  appId: "1:615746243033:web:22efa860527939071ef1c8"
};


const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);

export const db = getFirestore(app);