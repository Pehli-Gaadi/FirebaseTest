import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyA08Tw2B2rc-ixXOsuQ1JWzhu9Kkyob4Gg",
    authDomain: "canaryspg.firebaseapp.com",
    projectId: "canaryspg",
    storageBucket: "canaryspg.appspot.com",
    messagingSenderId: "456897923115",
    appId: "1:456897923115:web:c9aee2ce0abfc86edb426e",
    measurementId: "G-KFPRG020YQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
