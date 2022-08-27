import { initializeFirebase } from './initialize.js';
import {
  getAuth,
  signInWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js';

async function logInWithEmailAndPassword(email, password) {
  const auth = getAuth();
  return await signInWithEmailAndPassword(auth, email, password);
}

function logIn(userEmail, userPassword) {
  const result = logInWithEmailAndPassword(userEmail, userPassword)
    .then(userCredential => {
      // Signed in
      const user = userCredential.user;
      alert('환영합니다!');
      window.location.href = 'http://127.0.0.1:5500/pages/main/main.html';
      // ...
    })
    .catch(error => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
}

const logInBtn = document.getElementById('loginBtn');
logInBtn.addEventListener('click', handleLogInBtn);

function handleLogInBtn(event) {
  event.preventDefault();
  const getLogInId = document.getElementById('user-id').value;
  const getLogInPassword = document.getElementById('user-pw').value;
  logIn(getLogInId, getLogInPassword);
}
