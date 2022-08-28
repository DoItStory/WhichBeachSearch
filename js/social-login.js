import { initializeFirebase } from './initialize.js';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js';

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
      // ...
    })
    .catch(error => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
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
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = FacebookAuthProvider.credentialFromError(error);
      // ...
    });
}

const googleLogIn = document.getElementById('google-login');
googleLogIn.addEventListener('click', handleGoogleLogInBtn);

const facebookLogIn = document.getElementById('facebook-login');
facebookLogIn.addEventListener('click', handleFacebookLogInBtn);
