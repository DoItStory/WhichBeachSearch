import { initializeFirebase } from './initialize.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js';
import { ERROR } from './error.js';
import {
  showCircularProgress,
  hideCircularProgress,
} from './circular-progress.js';

function logInWithEmailAndPassword(email, password) {
  const auth = getAuth();
  return signInWithEmailAndPassword(auth, email, password);
}

function logIn(userEmail, userPassword) {
  showCircularProgress();
  const result = logInWithEmailAndPassword(userEmail, userPassword)
    .then(userCredential => {
      hideCircularProgress();
      const user = userCredential.user;
      alert('환영합니다!');
      window.location.href = 'http://127.0.0.1:5500/pages/main/main.html';
    })
    .catch(error => {
      hideCircularProgress();
      const errorCode = error.code;
      const errorMessage = error.message;
      errorPrint(errorCode);
    });
}

function getPasswordUserInfo() {
  const auth = getAuth();
  const email = prompt('귀하의 이메일을 입력해주세요.');
  return sendPasswordResetEmail(auth, email);
}

function handlePasswordReset() {
  const result = getPasswordUserInfo()
    .then(() => {
      alert('비밀번호를 재설정하는 메일이 전송되었습니다.');
    })
    .catch(error => {
      const errorCode = error.code;
      const errorMessage = error.message;
      if (errorCode === 'auth/user-not-found') alert(ERROR.USER_NOT_FOUND);
    });
}

function errorPrint(errorCode) {
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
      errorCode = 'undefined-error';
      alert(ERROR.UNKNOWN_ERROR);
  }
}

function handleLogInBtn(event) {
  event.preventDefault();
  const getLogInId = document.getElementById('login-id').value;
  const getLogInPassword = document.getElementById('login-pw').value;
  logIn(getLogInId, getLogInPassword);
}

function passwordReset(event) {
  event.preventDefault();
  return handlePasswordReset();
}

const logInBtn = document.getElementById('loginBtn');
logInBtn.addEventListener('click', handleLogInBtn);

const passwordResetBtn = document.getElementById('password-reset');
passwordResetBtn.addEventListener('click', passwordReset);
