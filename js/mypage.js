import { initializeFirebase } from './initialize.js';
import {
  getAuth,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js';

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
      } else history.back();
    }
  });
}

function getUserProfile() {
  const auth = getAuth();
  checkUserInfo(auth);
}
