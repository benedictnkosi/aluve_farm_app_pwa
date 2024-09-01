// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCtHfhQ6TlXw1v9DgtgkN4KbKkxtrCU4J4",
    authDomain: "aluve-farm.firebaseapp.com",
    projectId: "aluve-farm",
    storageBucket: "aluve-farm.appspot.com",
    messagingSenderId: "31277834988",
    appId: "1:31277834988:web:412b7b5eb9034882b23bc9",
    measurementId: "G-1N3VBGKXS5"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };