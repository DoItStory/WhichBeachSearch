import { initializeFirebase } from './initialize.js';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js';
import { ERROR } from './error.js';

// Google 로그인
async function googleLogInResult() {
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  return await signInWithPopup(auth, provider);
}

function handleGoogleLogInBtn(event) {
  event.preventDefault();
  const result = googleLogInResult()
    .then(result => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
    })
    .catch(error => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      socialLogInErrorPrint(errorCode);
    });
}

// Facebook 로그인
async function facebookLogInResult() {
  const provider = new FacebookAuthProvider();
  const auth = getAuth();
  return await signInWithPopup(auth, provider);
}

function handleFacebookLogInBtn(event) {
  event.preventDefault();
  const result = facebookLogInResult()
    .then(result => {
      // The signed-in user info.
      const user = result.user;
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      const credential = FacebookAuthProvider.credentialFromResult(result);
      const accessToken = credential.accessToken;
    })
    .catch(error => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = FacebookAuthProvider.credentialFromError(error);
      socialLogInErrorPrint(errorCode);
    });
}

const googleLogIn = document.getElementById('google-login');
googleLogIn.addEventListener('click', handleGoogleLogInBtn);

const facebookLogIn = document.getElementById('facebook-login');
facebookLogIn.addEventListener('click', handleFacebookLogInBtn);

function socialLogInErrorPrint(errorCode) {
  switch (errorCode) {
    case 'auth/popup-blocked':
      alert(ERROR.POPUP_BLOCKED);
      break;
    case 'auth/popup-closed-by-user':
      alert(ERROR.POPUP_CLOSED_BY_USER);
      break;
    case 'auth/cancelled-popup-request':
      alert(ERROR.CANCELLED_POPUP_REQUEST);
      break;
    default:
      errorCode = 'undefined-error';
      alert(ERROR.UNKNOWN_ERROR);
  }
}