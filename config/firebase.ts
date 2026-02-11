import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAPdUwlf29PMXN81FfZ8QXHeaLR0mc0V9M",
  authDomain: "clody-messenger.firebaseapp.com",
  projectId: "clody-messenger",
  storageBucket: "clody-messenger.firebasestorage.app",
  messagingSenderId: "23889091836",
  appId: "1:23889091836:web:d59be5360325abc76e4b79",
};

let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
