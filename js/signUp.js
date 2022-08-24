import { initializeFirebase } from './initialize.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js';

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
          alert(`이미 가입된 이메일입니다. 다른 이메일을 이용해주세요.`);
          break;
        case 'auth/invalid-argument':
          alert(
            `${errorCode}: 예기치 못한 문제가 발생하였습니다. 관리자에게 문의하십시오.`,
          );
          break;
        case 'auth/invalid-creation-time':
          alert(
            `${errorCode}: 예기치 못한 문제가 발생하였습니다. 관리자에게 문의하십시오.`,
          );
        case 'auth/invalid-email':
          document.getElementById('signUpEmail').focus();
          alert(`메일 형식에 맞지 않습니다. 메일 정보를 다시 확인해주세요.`);
          break;
        case 'auth/weak-password':
          document.getElementById('signUpPassword').focus();
          alert(
            `비밀번호가 6자 이상이어야 합니다. 비밀번호를 다시 입력해주세요.`,
          );
          break;
        default:
          alert(`알 수 없는 오류가 발생하였습니다. 관리자에게 문의하십시오.`);
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
    throw new Error(
      '비어있는 정보가 있습니다. 양식을 다시 한 번 확인해주세요.',
    );
  } else return true;
}

function signUpPasswordCheck(inputPassword, inputPasswordCheck) {
  if (!inputPassword || !inputPasswordCheck) {
    throw new Error(
      '비어있는 정보가 있습니다. 양식을 다시 한 번 확인해주세요.',
    );
  } else if (inputPassword !== inputPasswordCheck) {
    throw new Error('비밀번호가 서로 다릅니다. 다시 입력해주세요.');
  } else return true;
}

const signUpButton = document.getElementById('signUpbtn');
signUpButton.addEventListener('click', handleSignUpSubmit);
