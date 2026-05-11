// ================= FIREBASE CORE =================

import { initializeApp } from "firebase/app";


// ================= FIREBASE SERVICES =================

import {
  getAuth,
  GoogleAuthProvider
} from "firebase/auth";

import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";

import { getAnalytics } from "firebase/analytics";


// ================= FIREBASE CONFIG =================

const firebaseConfig = {
  apiKey: "AIzaSyAWGmc-QJFPKiwxeMujxFDm_p4CihzJvhA",
  authDomain: "golden-biashnet.firebaseapp.com",
  projectId: "golden-biashnet",
  storageBucket: "golden-biashnet.firebasestorage.app",
  messagingSenderId: "194190440580",
  appId: "1:194190440580:web:3eef75c4e5f665974daad1",
  measurementId: "G-ZY66NJM1EC"
};


// ================= INITIALIZE APP =================

const app = initializeApp(firebaseConfig);


// ================= FIRESTORE (OFFLINE SUPPORT) =================

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});


// ================= AUTH =================

export const auth = getAuth(app);


// ================= GOOGLE LOGIN =================

export const googleProvider = new GoogleAuthProvider();


// Optional improvements for Google login
googleProvider.setCustomParameters({
  prompt: "select_account"
});


// ================= ANALYTICS =================

let analytics;

if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { analytics };


// ================= EXPORT APP =================

export default app;