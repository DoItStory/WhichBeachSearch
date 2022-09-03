import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-analytics.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCm5Fi1TsI5l-CSz5XE0AbvbBNIT27vCn4',
  authDomain: 'whichbeachsearch.firebaseapp.com',
  projectId: 'whichbeachsearch',
  storageBucket: 'whichbeachsearch.appspot.com',
  messagingSenderId: '47154938670',
  appId: '1:47154938670:web:d25b9d603d73e09f2270bf',
  measurementId: 'G-KWXNHGMVY6',
};

// Initialize Firebase
export function initializeFirebase() {
  const app = initializeApp(firebaseConfig);
  getAnalytics(app);
}

export function fireStoreInitialize() {
  const app = initializeApp(firebaseConfig);
  return getFirestore(app);
}

initializeFirebase();

fireStoreInitialize();
