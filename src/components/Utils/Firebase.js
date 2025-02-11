//Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC1keQCSx0MMDPkuk23c44TpvjVa0LNB64",
  authDomain: "tripleten-coh16.firebaseapp.com",
  projectId: "tripleten-coh16",
  storageBucket: "tripleten-coh16.firebasestorage.app",
  messagingSenderId: "424615625310",
  appId: "1:424615625310:web:42ceef1b3f414d3a6daacf",
  measurementId: "G-FLC09JBZE2",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { db, storage, analytics };
