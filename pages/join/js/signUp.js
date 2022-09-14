import { initializeFirebase } from '../../../js/initialize.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js';
import { ERROR } from '../../../js/error.js';
import {
  showCircularProgress,
  hideCircularProgress,
} from '../../../js/circular-progress.js';

async function signUpWithEmailPassword(email, password) {
  const auth = getAuth();
  return createUserWithEmailAndPassword(auth, email, password);
}

function signUp(getUserEmail, getUserPassword) {
  showCircularProgress();
  const result = signUpWithEmailPassword(getUserEmail, getUserPassword)
    .then(userCredential => {
      hideCircularProgress();
      const user = userCredential.user;
      alert('회원가입에 성공하였습니다. 다시 로그인하고 이용해주세요.');
      // 화면이동
      window.location.href = 'http://127.0.0.1:5500/pages/login/login.html';
    })
    .catch(error => {
      hideCircularProgress();
      const errorCode = error.code;
      const errorMessage = error.message;
      signUpErrorPrint(errorCode);
    });
}

function signUpErrorPrint(errorCode) {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      document.getElementById('join-form__email').focus();
      alert(ERROR.EMAIL_ALREADY_IN_USE);
      break;
    case 'auth/invalid-argument':
    case 'auth/invalid-creation-time':
      alert(`${errorCode}: ${ERROR.ADMIN_ERROR}`);
      break;
    case 'auth/invalid-email':
      document.getElementById('join-form__email').focus();
      alert(ERROR.INVALID_EMAIL);
      break;
    case 'auth/weak-password':
      document.getElementById('join-form__password').focus();
      alert(ERROR.WEAK_PASSWORD);
      break;
    default:
      errorCode = 'undefined-error';
      alert(ERROR.UNKNOWN_ERROR);
  }
}

function handleSignUpSubmit(event) {
  event.preventDefault();
  const signUpEmail = document.getElementById('join-form__email').value;
  const password = document.getElementById('join-form__password').value;
  const passwordCheck = document.getElementById(
    'join-form__password-check',
  ).value;

  const result = signUpCheck(signUpEmail, password, passwordCheck);
  if (result) signUp(signUpEmail, password);
}

// 회원 가입 정보 값이 비어있는지 확인
function signUpCheck(writtenEmail, writtenPassword, writtenPasswordCheck) {
  try {
    signUpEmailCheck(writtenEmail);
    signUpPasswordCheck(writtenPassword, writtenPasswordCheck);
    return true;
  } catch (e) {
    alert(`${e.message}`);
    return false;
  }
}

function signUpEmailCheck(inputEmail) {
  if (!inputEmail) {
    throw new Error(ERROR.EMPTY_VALUE_IN_INPUT);
  } else return true;
}

function signUpPasswordCheck(inputPassword, inputPasswordCheck) {
  if (!inputPassword || !inputPasswordCheck) {
    throw new Error(ERROR.EMPTY_VALUE_IN_INPUT);
  } else if (inputPassword !== inputPasswordCheck) {
    throw new Error(ERROR.DIFFERENT_PASSWORD);
  } else return true;
}

const signUpButton = document.getElementById('join-submit__btn');
signUpButton.addEventListener('click', handleSignUpSubmit);

const cancelButton = document.getElementById('join-cancel__btn');
cancelButton.addEventListener('click', () => {
  window.location.href = 'http://127.0.0.1:5500/pages/login/login.html';
});
