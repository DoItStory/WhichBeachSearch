import { initializeFirebase } from '../../../js/initialize.js';
import {
  getAuth,
  onAuthStateChanged,
  // test용 로그아웃 버튼 생성
  signOut,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js';

const bookmarkBtn = document.querySelector('.search__bookmark-btn');
const HIDDEN_CLASSNAME = 'hidden';

const auth = getAuth();
onAuthStateChanged(auth, user => {
  if (user) {
    bookmarkBtn.classList.remove(HIDDEN_CLASSNAME);
    const uid = user.uid;
    const email = user.email;
  } else return;
});

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
