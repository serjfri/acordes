// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics"; // Opcional, si usas Analytics
// import { getAuth } from "firebase/auth"; // Opcional, si usas Autenticación
import { getFirestore } from "firebase/firestore"; // Necesario para Firestore

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAOULjr32_YeOROVHMGgtgH39Ff6dMnaTQ",
  authDomain: "acordes-399ff.firebaseapp.com",
  projectId: "acordes-399ff",
  storageBucket: "acordes-399ff.firebasestorage.app",
  messagingSenderId: "1020084301196",
  appId: "1:1020084301196:web:2e090aea88fff39abf7aa9"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Exporta db para usarlo en otros archivos
// export const analytics = getAnalytics(app); // Si lo usas
// export const auth = getAuth(app); // Si lo usas
