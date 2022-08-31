import { initializeFirebase } from './initialize.js';
import {
  getAuth,
  onAuthStateChanged,
  // test용 로그아웃 버튼 생성
  signOut,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js';

function getUserProfile() {
  const auth = getAuth();
  onAuthStateChanged(auth, user => {
    if (user) {
      const uid = user.uid;
      const email = user.email;
      window.location.href =
        'http://127.0.0.1:5500/pages/bookmark/bookmark.html';
    } else {
      const askSignUp = confirm(
        '이 페이지는 로그인을 하셔야 사용이 가능합니다. 로그인 하시겠습니까?',
      );
      if (askSignUp) {
        window.location.href = 'http://127.0.0.1:5500/pages/login/login.html';
      } else return;
    }
  });
}

const bookMarkBtn = document.getElementById('bookmark-icon');
bookMarkBtn.addEventListener('click', getUserProfile);

// test용 로그아웃 버튼
const logOutBtn = document.getElementById('logout-btn');
logOutBtn.addEventListener('click', logout);

function logout() {
  const auth = getAuth();
  signOut(auth)
    .then(() => {
      alert('로그아웃 되었습니다.');
      window.location.href = 'http://127.0.0.1:5500/pages/login/login.html';
      // Sign-out successful.
    })
    .catch(error => {
      // An error happened.
    });
}
