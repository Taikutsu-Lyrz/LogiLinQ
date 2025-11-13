import { initializeApp } from "firebase/app";
import {
    getAuth,
    signInWithRedirect,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    signInWithPopup,
    sendEmailVerification,
    sendPasswordResetEmail,
    updatePassword
} from "firebase/auth";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    getDocs,
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    setLogLevel,
    updateDoc,
    deleteDoc,
    enableIndexedDbPersistence
} from "firebase/firestore";

// --- Standard Firebase Configuration ---
// Setup in env file using Vite's import.meta.env
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Offline Data ---
try {
    enableIndexedDbPersistence(db)
        .catch((err) => {
            if (err.code == 'failed-precondition') {
                console.warn('Firestore persistence failed: multiple tabs open.');
            } else if (err.code == 'unimplemented') {
                console.warn('Firestore persistence is not supported in this browser.');
            }
        });
} catch (err) {
    console.error("Error enabling Firestore persistence: ", err);
}

setLogLevel('Debug');

// Export the services and all the functions you need
export {
    auth,
    db,
    signInWithRedirect,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    signInWithPopup,
    sendEmailVerification,
    sendPasswordResetEmail,
    updatePassword,
    doc,
    setDoc,
    getDoc,
    getDocs,
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    updateDoc,
    deleteDoc
};