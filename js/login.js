import { initializeFirebase } from './initialize.js';
import {
  getAuth,
  signInWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js';

async function loginWithEmailAndPassword(email, password) {
  const auth = getAuth();
  return await signInWithEmailAndPassword(auth, email, password);
}

function logIn(userEmail, userPassword) {
  const result = loginWithEmailAndPassword(userEmail, userPassword)
    .then(userCredential => {
      // Signed in
      const user = userCredential.user;
      // ...
    })
    .catch(error => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
}
