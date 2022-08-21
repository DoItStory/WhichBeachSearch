import { initializeFirebase } from './initialize.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js';

export async function signUpWithEmailPassword(email, password) {
  const auth = getAuth();
  return await createUserWithEmailAndPassword(auth, email, password);
}
