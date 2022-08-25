import { initializeFirebase } from './initialize.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js';
import { ERROR } from './error.js';

export async function signUpWithEmailPassword(email, password) {
  const auth = getAuth();
  return await createUserWithEmailAndPassword(auth, email, password);
}

function signUp(getUserEmail, getUserPassword) {
  const result = signUpWithEmailPassword(getUserEmail, getUserPassword)
    .then(userCredential => {
      const user = userCredential.user;
      alert('회원가입에 성공하였습니다. 다시 로그인하고 이용해주세요.');
      // 화면이동
      window.location.href = 'http://127.0.0.1:5500/pages/login/login.html';
    })
    .catch(error => {
      const errorCode = error.code;
      const errorMessage = error.message;
      switch (errorCode) {
        case 'auth/email-already-in-use':
          document.getElementById('signUpEmail').focus();
          alert(ERROR.CHECK_MAIL_DUPLICATES);
          break;
        case 'auth/invalid-argument':
          alert(`${errorCode}: ${ERROR.ADMIN_ERROR}`);
          break;
        case 'auth/invalid-creation-time':
          alert(`${errorCode}: ${ERROR.ADMIN_ERROR}`);
        case 'auth/invalid-email':
          document.getElementById('signUpEmail').focus();
          alert(ERROR.MAIL_DOESNT_FIT);
          break;
        case 'auth/weak-password':
          document.getElementById('signUpPassword').focus();
          alert(ERROR.CONFIRM_PASSWORD_DIGITS);
          break;
        default:
          alert();
      }
    });
}

function handleSignUpSubmit(event) {
  event.preventDefault();
  const signUpEmail = document.getElementById('signUpEmail').value;
  const password = document.getElementById('signUpPassword').value;
  const passwordCheck = document.getElementById('signUpPasswordCheck').value;

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

const signUpButton = document.getElementById('signUpbtn');
signUpButton.addEventListener('click', handleSignUpSubmit);
