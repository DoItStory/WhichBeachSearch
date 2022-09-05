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

const bookmarkBtn = document.querySelector('.search__bookmark-btn');
const HIDDEN_CLASSNAME = 'hidden';
let userUid;

const auth = getAuth();
onAuthStateChanged(auth, user => {
  if (user) {
    bookmarkBtn.classList.remove(HIDDEN_CLASSNAME);
    userUid = user.uid;
  } else return;
});

// firestore
const db = fireStoreInitialize();
let docRefId;

async function handleBookmarkBtn() {
  await checkUserStore();
  if (!docRefId) {
    createUserDoc();
  } else {
    addDataInField(docRefId);
  }
}
// 새로운 문서(doc) 생성 함수
async function createUserDoc() {
  showCircularProgress();
  try {
    const userBookmarkList = [
      {
        name: '해운대 해수욕장',
        address: '부산광역시 해운대구 우동',
      },
    ];
    const docRef = await addDoc(collection(db, 'Bookmark'), {
      userBookmarkList,
      uid: userUid,
    });
    hideCircularProgress();
    docRefId = docRef.id;
  } catch (e) {
    hideCircularProgress();
    console.error('Error adding document: ', e);
  }
}

// 즐겨찾기 정보(map) 추가 함수
async function addDataInField(docRefId) {
  showCircularProgress();
  const docRef = doc(db, 'Bookmark', docRefId);
  await updateDoc(docRef, {
    userBookmarkList: arrayUnion({
      name: '명사십리 해수욕장',
      address: '전라남도 완도군',
    }),
  });
  hideCircularProgress();
}

// 유저의 uid가 포함된 문서가 있는지 찾는 함수
async function checkUserStore() {
  const q = query(collection(db, 'Bookmark'), where('uid', '==', userUid));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach(doc => {
    docRefId = doc.id;
  });
  // 해당 유저의 저장소가 1개가 아닌 모종의 이유로 1개 이상일 경우를 대비하여 에러 작성필요할듯?
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
