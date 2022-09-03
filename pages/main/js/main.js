import {
  initializeFirebase,
  fireStoreInitialize,
} from '../../../js/initialize.js';
import {
  getAuth,
  onAuthStateChanged,
  // test용 로그아웃 버튼 생성
  signOut,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js';

import {
  collection,
  addDoc,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js';

const bookmarkBtn = document.querySelector('.search__bookmark-btn');
const HIDDEN_CLASSNAME = 'hidden';
let USER_UID;

const auth = getAuth();
onAuthStateChanged(auth, user => {
  if (user) {
    bookmarkBtn.classList.remove(HIDDEN_CLASSNAME);
    USER_UID = user.uid;
  } else return;
});

// firestore
const db = fireStoreInitialize();
async function handleBookmarkBtn() {
  try {
    const docRef = await addDoc(collection(db, 'Bookmark'), {
      name: '해운대 해수욕장',
      address: '부산광역시 해운대구 우동',
      uid: USER_UID,
    });
    // 테스트 확인용 console.log (기능 구현 완료 시 비동기 형식과 같이 삭제)
    console.log('Document written with ID: ', docRef);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
}

const addBookmarkBtn = document.getElementById('bookmark-btn');
addBookmarkBtn.addEventListener('click', handleBookmarkBtn);

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
