import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, OAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCTjpckjRHugUZLWQdTd9DQSNw24JluYvA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "arkdevpro-55228.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "arkdevpro-55228",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "arkdevpro-55228.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "628025491118",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:628025491118:web:34fac8bb2c75a6e430373f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-1D5SM9VFLL",
};

const hasFirebaseConfig = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

let app;
let auth = null;
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const gitlabProvider = new OAuthProvider('oidc.gitlab');
const bitbucketProvider = new OAuthProvider('oidc.bitbucket');

// Configure OAuth provider defaults
googleProvider.addScope('email');
googleProvider.addScope('profile');
githubProvider.addScope('user:email');

if (hasFirebaseConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    console.log("🔥 Firebase Client SDK initialized successfully.");
  } catch (err) {
    console.error("❌ Failed to initialize Firebase Client SDK:", err);
  }
} else {
  console.warn("⚠️ Firebase Client SDK is running in FALLBACK MOCK MODE. Please add VITE_FIREBASE_* keys to your .env file to enable real logins.");
}

export { auth, googleProvider, githubProvider, gitlabProvider, bitbucketProvider, hasFirebaseConfig };
