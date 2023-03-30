import {
  fireStoreInitialize,
} from '../../../js/initialize.js';
import {
  getAuth,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js';
import {
  showCircularProgress,
  hideCircularProgress,
} from '../../../js/circular-progress.js';
import { ERROR } from '../../../js/error.js';
const bookmarkList = document.getElementById('bookmark-list');
const BOOKMARK_ITEM_CLASSNAME = 'bookmark__item';
const BOOKMARK_DIV_CLASS = 'bookmark__info';
const BOOKMARK_BTN_STYLE_CLASS = 'bookmark__icon';
const BOOKMARK_BTN_CLASS = 'bookmark__btn';
const BOOKMARK_IMAGE_SRC = '/assets/images/TrashBin.svg';

const db = fireStoreInitialize();
const auth = getAuth();

onAuthStateChanged(auth, user => {
  if (user) {
    loadBookmarkScreen(user.uid);
  } else {
    const askSignUp = confirm(
      '이 기능은 로그인을 하셔야 사용이 가능합니다. 로그인 하시겠습니까?',
    );
    if (askSignUp) {
      window.location.href = 'http://127.0.0.1:5500/pages/login/login.html';
    } else history.back();
  }
});

function loadBookmarkScreen(uid) {
  showCircularProgress();
  getUserDocument(uid)
    .then(querySnapshot => {
      let bookmarkListData = [];
      querySnapshot.forEach(doc => {
        bookmarkListData = doc.data().userBookmarkList.sort(sortListName);
      });
      paintBookmarkList(bookmarkListData);
      hideCircularProgress();
    })
    .catch(error => {
      hideCircularProgress();
      const errorCode = error.code;
      alert(
        `${ERROR.UNKNOWN_ERROR} bookmark-error loadBookmarkScreen : ${errorCode}`,
      );
    });
}

function sortListName(firstArr, secondArr) {
  try {
    let x = firstArr.name.toLowerCase();
    let y = secondArr.name.toLowerCase();
    if (x > y) return 1;
    if (x < y) return -1;
    return 0;
  } catch (error) {
    hideCircularProgress();
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} bookmark-error sortListName : ${errorCode}`);
  }
}

function paintBookmarkList(beachList) {
  try {
    for (let data of beachList) {
      const beachList = document.createElement('li');
      beachList.classList.add(BOOKMARK_ITEM_CLASSNAME);
      const beachInfoDiv = document.createElement('div');
      beachInfoDiv.classList.add(BOOKMARK_DIV_CLASS);
      const beachNameSpan = document.createElement('span');
      beachNameSpan.textContent = data.name;
      const beachAddress = document.createElement('address');
      beachAddress.textContent = data.address;
      const bookmarkButton = document.createElement('button');
      bookmarkButton.classList.add(BOOKMARK_BTN_STYLE_CLASS);
      bookmarkButton.classList.add(BOOKMARK_BTN_CLASS);
      const bookmarkIcon = document.createElement('img');
      bookmarkIcon.src = BOOKMARK_IMAGE_SRC;
      const beachCode = document.createElement('span');
      beachCode.classList.add('hidden');
      beachCode.textContent = data.beachNum;

      bookmarkButton.addEventListener('click', handleBookmarkDeleteButton);
      beachInfoDiv.addEventListener('click', goMainScreen);

      beachInfoDiv.appendChild(beachNameSpan);
      beachInfoDiv.appendChild(beachAddress);
      beachInfoDiv.appendChild(beachCode);
      bookmarkButton.appendChild(bookmarkIcon);
      beachList.appendChild(beachInfoDiv);
      beachList.appendChild(bookmarkButton);
      bookmarkList.appendChild(beachList);
    }
  } catch (error) {
    hideCircularProgress();
    const errorCode = error.code;
    alert(
      `${ERROR.UNKNOWN_ERROR} bookmark-error paintBookmarkList : ${errorCode}`,
    );
  }
}

function goMainScreen(event) {
  showCircularProgress();
  try {
    const sendBeachCode = event.currentTarget.lastElementChild.textContent;
    location.href = `../main/main.html?sendBeachCode=${sendBeachCode}`;
  } catch (error) {
    hideCircularProgress();
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} bookmark-error goMainScreen : ${errorCode}`);
  }
}

function handleBookmarkDeleteButton(event) {
  const userUid = auth.currentUser.uid;
  const beachName =
    event.target.parentElement.parentElement.childNodes[0].childNodes[0]
      .innerText;
  deleteBookmarkList(userUid, beachName)
    .then(() => {
      const beachList = event.target.parentElement.parentElement;
      beachList.remove();
    })
    .catch(error => {
      hideCircularProgress();
      const errorCode = error.code;
      alert(
        `${ERROR.UNKNOWN_ERROR} bookmark-error handleBookmarkDeleteButton : ${errorCode}`,
      );
    });
}

async function deleteBookmarkList(uid, beachName) {
  const querySnapshot = await getUserDocument(uid).catch(error => {
    hideCircularProgress();
    const errorCode = error.code;
    alert(
      `${ERROR.UNKNOWN_ERROR} bookmark-error deleteBookmarkList : ${errorCode}`,
    );
  });
  querySnapshot.forEach(doc => {
    const docRefId = doc.id;
    const deleteBookmarkIndex = doc
      .data()
      .userBookmarkList.findIndex(beachInfo => beachInfo.name == beachName);
    const bookmarkList = doc.data().userBookmarkList;
    deleteBookmark(docRefId, deleteBookmarkIndex, bookmarkList);
  });
}

function getUserDocument(uid) {
  const q = query(collection(db, 'Bookmark'), where('uid', '==', uid));
  return getDocs(q);
}

function deleteBookmark(docRefId, deleteBookmarkIndex, copiedBookmarkList) {
  try {
    copiedBookmarkList.splice(deleteBookmarkIndex, 1);
    upDataDocument(docRefId, copiedBookmarkList);
  } catch (error) {
    hideCircularProgress();
    const errorCode = error.code;
    alert(
      `${ERROR.UNKNOWN_ERROR} bookmark-error handleBookmarkDeleteButton : ${errorCode}`,
    );
  }
}

function upDataDocument(docId, bookmarkList) {
  const BookmarkRef = doc(db, 'Bookmark', docId);
  updateDoc(BookmarkRef, {
    userBookmarkList: bookmarkList,
  }).catch(error => {
    hideCircularProgress();
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} main-error upDataDocument : ${errorCode}`);
  });
}
