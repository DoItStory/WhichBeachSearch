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
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js';

import {
  showCircularProgress,
  hideCircularProgress,
} from '../../../js/circular-progress.js';

import { ERROR } from '../../../js/error.js';

const bookmarkBtn = document.querySelector('.search__bookmark-btn');
const beachName = document.querySelector('.beach-name > span');
const beachAddress = document.querySelector('.beach-address');
const HIDDEN_CLASSNAME = 'hidden';

function mainScreenUpdate() {
  try {
    showCircularProgress();
    const urlParams = new URLSearchParams(window.location.search);
    const getbeachName = urlParams.get('pushBeachName');
    const getbeachAddress = urlParams.get('pushBeachAddress');
    if (getbeachName && getbeachAddress) {
      beachName.innerHTML = getbeachName;
      beachAddress.innerHTML = getbeachAddress;
      hideCircularProgress();
    } else {
      beachName.innerHTML = '해수욕장 이름';
      beachAddress.innerHTML = '해수욕장 주소';
      hideCircularProgress();
    }
  } catch (error) {
    hideCircularProgress();
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} main-error L35 : ${errorCode}`);
  }
}

const auth = getAuth();
onAuthStateChanged(auth, user => {
  if (user) {
    bookmarkBtn.classList.remove(HIDDEN_CLASSNAME);
  } else return;
});

// firestore
const db = fireStoreInitialize();

function handleBookmarkBtn() {
  showCircularProgress();
  checkUserStore()
    .then(docRefId => {
      if (!docRefId) {
        createUserDoc();
      } else {
        addDataInField(docRefId);
      }
      hideCircularProgress();
    })
    .catch(error => {
      hideCircularProgress();
      const errorCode = error.code;
      alert(
        `${ERROR.UNKNOWN_ERROR} main-error handleBookmarkBtn : ${errorCode}`,
      );
    });
}

// 새로운 문서(doc) 생성 함수
async function createUserDoc() {
  const userUID = auth.currentUser.uid;
  try {
    const userBookmarkList = [
      {
        name: '해운대 해수욕장',
        address: '부산광역시 해운대구 우동',
      },
    ];
    await addDoc(collection(db, 'Bookmark'), {
      userBookmarkList,
      uid: userUID,
    });
  } catch (error) {
    hideCircularProgress();
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} main-error createUserDoc : ${errorCode}`);
  }
}

// 즐겨찾기 정보(map) 추가 함수
async function addDataInField(docRefId) {
  const docRef = doc(db, 'Bookmark', docRefId);
  await updateDoc(docRef, {
    userBookmarkList: arrayUnion({
      name: '명사십리 해수욕장',
      address: '전라남도 완도군',
    }),
  }).catch(error => {
    hideCircularProgress();
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} main-error addDataInField : ${errorCode}`);
  });
}
// 유저의 uid가 포함된 문서가 있는지 찾는 함수
async function checkUserStore() {
  const userUID = auth.currentUser.uid;
  const q = query(collection(db, 'Bookmark'), where('uid', '==', userUID));
  const querySnapshot = await getDocs(q).catch(error => {
    hideCircularProgress();
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} main-error checkUserStore : ${errorCode}`);
  });
  let docRefId = '';
  querySnapshot.forEach(doc => {
    docRefId = doc.id;
  });
  return docRefId;
}

const addBookmarkBtn = document.getElementById('bookmark-btn');
addBookmarkBtn.addEventListener('click', handleBookmarkBtn);

window.onload = mainScreenUpdate;

// test용 로그아웃 버튼
const logOutBtn = document.getElementById('logout-btn');
logOutBtn.addEventListener('click', logout);

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
