import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-analytics.js';

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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
