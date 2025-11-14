// src/services/firebase/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: trocar pelos dados do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCtAohRSz9NeeHkKqCR3xF7Wv0MWbGKRIM",
  authDomain: "innoma-crm-59c0a.firebaseapp.com",
  projectId: "innoma-crm-59c0a",
  storageBucket: "innoma-crm-59c0a.firebasestorage.app",
  messagingSenderId: "562371454192",
  appId: "1:562371454192:web:4337991a1f3474e0e78e35",
  measurementId: "G-T06L1QHX2P"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
