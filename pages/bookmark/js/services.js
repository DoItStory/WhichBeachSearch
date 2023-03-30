import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js';
import { hideCircularProgress } from '../../../js/circular-progress.js';

export function getUserDocument(uid, db) {
  const q = query(collection(db, 'Bookmark'), where('uid', '==', uid));
  return getDocs(q);
}

export function upDataDocument(docId, bookmarkList, db) {
  const BookmarkRef = doc(db, 'Bookmark', docId);
  updateDoc(BookmarkRef, {
    userBookmarkList: bookmarkList,
  }).then(() => {
    hideCircularProgress();
  });
}
