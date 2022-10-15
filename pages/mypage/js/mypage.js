import { initializeFirebase } from '../../../js/initialize.js';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js';
import {
  showCircularProgress,
  hideCircularProgress,
} from '../../../js/circular-progress.js';

function checkUserInfo(auth) {
  onAuthStateChanged(auth, user => {
    if (user) {
      const uid = user.uid;
      const email = user.email;
      alert('내 정보 변경이 가능하십니다.');
    } else {
      const askSignUp = confirm(
        '이 기능은 로그인을 하셔야 사용이 가능합니다. 로그인 하시겠습니까?',
      );
      if (askSignUp) {
        window.location.href = 'http://127.0.0.1:5500/pages/login/login.html';
      } else return;
    }
  });
}

function getUserProfile() {
  const auth = getAuth();
  checkUserInfo(auth);
}

function logout() {
  showCircularProgress();
  const auth = getAuth();
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

const changePassword = document.getElementById('mypage__change-password');
const logOutBtn = document.getElementById('logout-btn');

changePassword.addEventListener('click', getUserProfile);
logOutBtn.addEventListener('click', logout);
