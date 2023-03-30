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
  hideCircularProgress,
} from '../../../js/circular-progress.js';

// 유저의 uid가 포함된 문서가 있는지 찾는 함수
export async function checkUserStore(userUID, db) {
    const q = query(collection(db, 'Bookmark'), where('uid', '==', userUID));
    const querySnapshot = await getDocs(q);
    let docRefId = '';
    querySnapshot.forEach(doc => {
      docRefId = doc.id;
    });
    return docRefId;
  }

// 새로운 문서(doc) 생성 함수
export function createUserDoc(beachData, db, userUID) {
  const userBookmarkList = [
    {
      name: beachData[0].beachName,
      address: beachData[0].address,
      beachNum: beachData[0].beachCode,
    },
  ];
  addDoc(collection(db, 'Bookmark'), {
    userBookmarkList,
    uid: userUID,
  }).then(() => {
    alert('북마크에 추가되었습니다.');
    hideCircularProgress();
  });
}

// 즐겨찾기 정보(map) 추가 함수
export function addDataInField(docRefId, beachData, db) {
  const docRef = doc(db, 'Bookmark', docRefId);
  updateDoc(docRef, {
    userBookmarkList: arrayUnion({
      name: beachData[0].beachName,
      address: beachData[0].address,
      beachNum: beachData[0].beachCode,
    }),
  }).then(() => {
    alert('북마크에 추가되었습니다.');
    hideCircularProgress();
  });
}
