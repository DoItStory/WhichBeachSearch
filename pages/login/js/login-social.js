import { initializeFirebase } from '../../../js/initialize.js';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js';
import { ERROR } from '../../../js/error.js';
import {
  showCircularProgress,
  hideCircularProgress,
} from '../../../js/circular-progress.js';

// Google 로그인
function googleLogInResult() {
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  return signInWithPopup(auth, provider);
}

function handleGoogleLogInBtn(event) {
  event.preventDefault();
  showCircularProgress();
  const result = googleLogInResult()
    .then(result => {
      hideCircularProgress();
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      window.location.href = 'http://127.0.0.1:5500/pages/main/main.html';
    })
    .catch(error => {
      hideCircularProgress();
      const errorMessage = error.message;
      const email = error.customData.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
      socialLogInErrorPrint(error.code);
    });
}

// Facebook 로그인
function facebookLogInResult() {
  const provider = new FacebookAuthProvider();
  const auth = getAuth();
  return signInWithPopup(auth, provider);
}

function handleFacebookLogInBtn(event) {
  event.preventDefault();
  showCircularProgress();
  const result = facebookLogInResult()
    .then(result => {
      hideCircularProgress();
      const credential = FacebookAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
      window.location.href = 'http://127.0.0.1:5500/pages/main/main.html';
    })
    .catch(error => {
      hideCircularProgress();
      const errorMessage = error.message;
      const email = error.customData.email;
      const credential = FacebookAuthProvider.credentialFromError(error);
      socialLogInErrorPrint(error.code);
    });
}

function socialLogInErrorPrint(errorCode) {
  switch (errorCode) {
    case 'auth/popup-blocked':
      alert(ERROR.POPUP_BLOCKED);
      break;
    case 'auth/popup-closed-by-user':
      break;
    case 'auth/cancelled-popup-request':
      alert(ERROR.CANCELLED_POPUP_REQUEST);
      break;
    default:
      errorCode = 'undefined-error';
      alert(ERROR.UNKNOWN_ERROR);
  }
}

const googleLogIn = document.getElementById('google-login');
googleLogIn.addEventListener('click', handleGoogleLogInBtn);

const facebookLogIn = document.getElementById('facebook-login');
facebookLogIn.addEventListener('click', handleFacebookLogInBtn);
