import { initializeFirebase } from './initialize.js';
import {
  getAuth,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js';

function getUserProfile() {
  const auth = getAuth();
  onAuthStateChanged(auth, user => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      const uid = user.uid;
      const email = user.email;
      console.log(`${uid}, ${email}`);
      // ...
    } else {
      console.log(`i'm guest`);
      // User is signed out
      // ...
    }
  });
}

const bookMarkBtn = document.getElementById('bookmark-icon');
bookMarkBtn.addEventListener('click', getUserProfile);
