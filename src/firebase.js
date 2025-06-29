import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAYaxkURb_zDd0QmsQbl4J3Rfn6r4RD080",
    authDomain: "focusflow-fcb33.firebaseapp.com",
    projectId: "focusflow-fcb33",
    storageBucket: "focusflow-fcb33.firebasestorage.app",
    messagingSenderId: "121107241824",
    appId: "1:121107241824:web:5fbd69b24e588e38b51c05"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);