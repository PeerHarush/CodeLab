import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBbGJN4gcIk3AKlALZX1Y9dLyEargBnJLM",
  authDomain: "moveo-peer.firebaseapp.com",
  projectId: "moveo-peer",
  storageBucket: "moveo-peer.firebasestorage.app",
  messagingSenderId: "111244144469",
  appId: "1:111244144469:web:cef06df4e8aefb38d709dc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); 

export default db;
