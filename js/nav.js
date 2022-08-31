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
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      const uid = user.uid;
      const email = user.email;
      console.log(`${uid}, ${email}`);
      // ...
    } else {
      console.log(`i'm guest`);
      // User is signed out
      // ...
    }
  });
}

const bookMarkBtn = document.getElementById('bookmark-icon');
bookMarkBtn.addEventListener('click', getUserProfile);

// test용 로그아웃 버튼 함수

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
