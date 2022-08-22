import { initializeFirebase } from './initialize.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js';

export async function signUpWithEmailPassword(email, password) {
  const auth = getAuth();
  return await createUserWithEmailAndPassword(auth, email, password);
}

function signUp() {
  const result = signUpWithEmailPassword('test@test.com', 'testtest')
    .then(() => {
      alert('회원가입 성공');
      // 화면이동
    })
    .catch(error => {
      const errorCode = error.code;
      const errorMessage = error.message;
      switch (errorCode) {
        case 'auth/email-already-in-use':
          alert(`이미 가입된 이메일입니다. 다른 이메일을 이용해주세요.`);
          break;
      }
    });
}

const signUpButton = document.getElementById('signUpbtn');

signUpButton.addEventListener('click', handleSignUpSubmit);

function handleSignUpSubmit(event) {
  event.preventDefault();
  const signUpEmail = document.getElementById('signUpEmail').value;
  const signUpPassword = document.getElementById('signUpPassword').value;
  signUp(signUpEmail, signUpPassword);
}
