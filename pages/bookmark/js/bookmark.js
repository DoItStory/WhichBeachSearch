import {
  initializeFirebase,
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
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js';

const bookmarkList = document.getElementById('bookmark-list');
const BOOKMARK_ITEM_CLASSNAME = 'bookmark__item';
const BOOKMARK_DIV_CLASS = 'bookmark__info';
const BOOKMARK_BTN_STYLE_CLASS = 'bookmark__icon';
const BOOKMARK_BTN_CLASS = 'bookmark__btn';
const BOOKMARK_ICON_CLASS = 'fa-solid';
const BOOKMARK_ICON_CLASS2 = 'fa-star';

const db = fireStoreInitialize();
const auth = getAuth();

onAuthStateChanged(auth, user => {
  if (user) {
    getUserData(user.uid);
  } else {
    const askSignUp = confirm(
      '이 기능은 로그인을 하셔야 사용이 가능합니다. 로그인 하시겠습니까?',
    );
    if (askSignUp) {
      window.location.href = 'http://127.0.0.1:5500/pages/login/login.html';
    } else history.back();
  }
});

async function getUserData(uid) {
  const querySnapshot = await getUserDoc(uid);
  let bookmarkListData = [];
  querySnapshot.forEach(doc => {
    bookmarkListData = doc.data().userBookmarkList.sort(listSortByName);
  });
  paintBookmarkList(bookmarkListData);
}

function listSortByName(firstArr, secondArr) {
  let x = firstArr.name.toLowerCase();
  let y = secondArr.name.toLowerCase();
  if (x > y) return 1;
  if (x < y) return -1;
  return 0;
}

function paintBookmarkList(dataList) {
  for (let data of dataList) {
    const list = document.createElement('li');
    list.classList.add(BOOKMARK_ITEM_CLASSNAME);
    const div = document.createElement('div');
    div.classList.add(BOOKMARK_DIV_CLASS);
    const span = document.createElement('span');
    span.textContent = data.name;
    const address = document.createElement('address');
    address.textContent = data.address;
    const button = document.createElement('button');
    button.classList.add(BOOKMARK_BTN_STYLE_CLASS);
    button.classList.add(BOOKMARK_BTN_CLASS);
    const icon = document.createElement('i');
    icon.classList.add(BOOKMARK_ICON_CLASS);
    icon.classList.add(BOOKMARK_ICON_CLASS2);

    button.addEventListener('click', deleteBookmark);

    div.appendChild(span);
    div.appendChild(address);
    button.appendChild(icon);
    list.appendChild(div);
    list.appendChild(button);
    bookmarkList.appendChild(list);
  }
}

async function deleteBookmark(event) {
  const userUid = auth.currentUser.uid;
  const beachName =
    event.target.parentElement.parentElement.childNodes[0].childNodes[0]
      .innerText;
  let docRefId;
  const querySnapshot = await getUserDoc(userUid);
  querySnapshot.forEach(doc => {
    console.log(doc.id);
  });
}

function getUserDoc(uid) {
  const q = query(collection(db, 'Bookmark'), where('uid', '==', uid));
  return getDocs(q);
}
