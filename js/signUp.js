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
        // 동작하지가 않슴다..
        /*         case 'auth/invalid-password': 
          document.getElementById('signUpPassword').focus();
          alert(
            `비밀번호가 6자 이상이어야 합니다. 비밀번호를 다시 입력해주세요.`,
          );
          break; */
        default:
          alert(`알 수 없는 오류가 발생하였습니다. 관리자에게 문의하십시오.`);
      }
    });
}

const signUpButton = document.getElementById('signUpbtn');

signUpButton.addEventListener('click', handleSignUpSubmit);

function handleSignUpSubmit(event) {
  event.preventDefault();
  const signUpEmail = document.getElementById('signUpEmail').value;
  if (!signUpEmail) {
    printNoneValue();
  } else {
    const signUpPassword = signUpPasswordCheck();
    signUp(signUpEmail, signUpPassword);
  }
}

function signUpPasswordCheck() {
  const password = document.getElementById('signUpPassword').value;
  const passwordCheck = document.getElementById('signUpPasswordCheck').value;

  if (password != passwordCheck) {
    document.getElementById('signUpPasswordCheck').focus();
    alert('비밀번호가 서로 다릅니다. 다시 확인해주세요.');
    throw new Error('different-password');
  } else if (!password) {
    printNoneValue();
  } else return password;
}

function printNoneValue() {
  alert('입력되지 않은 정보가 있습니다.');
  throw new Error('none-value-in-input');
}
