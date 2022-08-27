import { initializeFirebase } from './initialize.js';
import {
  getAuth,
  signInWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js';
import { ERROR } from './error.js';

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
      console.log(`errorCode = ${errorCode}, ${errorMessage}`);
      logInErrorPrint(errorCode);
    });
}

function logInErrorPrint(errorCode) {
  switch (errorCode) {
    case 'auth/invalid-email':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      alert(ERROR.INCORRECT_LOGIN_INFO);
      break;
    case 'auth/internal-error':
      alert(ERROR.INTERNAL_ERROR);
      break;
    case 'auth/too-many-requests':
      alert(ERROR.TOO_MANY_REQUESTS);
      break;
    default:
      alert();
  }
}
//errorCode = auth/too-many-requests, Firebase: Access to this account has been temporarily disabled due to many failed login attempts.
//You can immediately restore it by resetting your password or you can try again later. (auth/too-many-requests).
const logInBtn = document.getElementById('loginBtn');
logInBtn.addEventListener('click', handleLogInBtn);

function handleLogInBtn(event) {
  event.preventDefault();
  const getLogInId = document.getElementById('login-id').value;
  const getLogInPassword = document.getElementById('login-pw').value;
  logIn(getLogInId, getLogInPassword);
}
