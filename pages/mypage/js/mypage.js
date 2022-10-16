import { initializeFirebase } from '../../../js/initialize.js';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js';
import {
  showCircularProgress,
  hideCircularProgress,
} from '../../../js/circular-progress.js';

function logout() {
  showCircularProgress();
  signOut(auth)
    .then(() => {
      alert('로그아웃 되었습니다.');
      window.location.href = 'http://127.0.0.1:5500/pages/login/login.html';
      hideCircularProgress();
      // Sign-out successful.
    })
    .catch(error => {
      hideCircularProgress();
      const errorCode = error.code;
      alert(`로그아웃에 실패 Error = ${errorCode}`);
      // An error happened.
    });
}

async function changePassword() {
  const password = prompt('사용자 확인을 위해 현재 비밀번호를 입력하세요', '');
  let credential = EmailAuthProvider.credential(
    auth.currentUser.email,
    password,
  );
  reauthenticateWithCredential(auth.currentUser, credential)
    .then(() => {
      passwordCheckWindow.style.display = 'flex';
      passwordInput.value = '';
      passwordCheckInput.value = '';
      const changeSubmitBtn = document.getElementById('change-submit__btn');
      changeSubmitBtn.addEventListener(
        'click',
        function () {
          const password = passwordInput.value;
          const checkPassword = passwordCheckInput.value;
          const result = passwordCheck(password, checkPassword);
          if (result) {
            alert('비밀번호 변경 성공하였습니다.');
            passwordCheckWindow.style.display = 'none';
            return updatePassword(auth.currentUser, password);
          }
        },
        { once: true },
      );
    })
    .catch(error => {
      const errorCode = error.code;
      alert(`사용자 인증 실패 Error = ${errorCode}`);
    });
  const changeCancleBtn = document.getElementById('change-cancle__btn');
  changeCancleBtn.addEventListener('click', () => {
    location.reload();
  });
}

function passwordCheck(password, checkPassword) {
  if (!password || !checkPassword) {
    alert('비밀번호를 다시 입력해주세요.');
    passwordCheckWindow.style.display = 'none';
    return false;
  } else if (password !== checkPassword) {
    alert('입력한 비밀번호가 서로 다릅니다. 다시 시도해주세요');
    passwordCheckWindow.style.display = 'none';
    return false;
  } else if (password.length < 6) {
    alert('비밀번호는 6자 이상으로 설정해주세요.');
    passwordCheckWindow.style.display = 'none';
    return false;
  }
  console.log('success');
  return true;
}

const auth = getAuth();
const changePasswordBtn = document.getElementById('mypage__change-password');
const logOutBtn = document.getElementById('logout-btn');
const passwordCheckWindow = document.getElementById('password-change');
const passwordInput = document.getElementById('new-password');
const passwordCheckInput = document.getElementById('new-password__check');
changePasswordBtn.addEventListener('click', changePassword);
logOutBtn.addEventListener('click', logout);
