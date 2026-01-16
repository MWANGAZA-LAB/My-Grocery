// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Helper to get environment variables (supports both Vite and CRA)
const getEnvVar = (viteKey: string, craKey: string): string | undefined => {
  // Try Vite first (import.meta.env), then fall back to process.env (CRA)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[viteKey as keyof ImportMetaEnv] as string | undefined;
  }
  // Fallback for CRA or test environment
  return process.env[craKey];
};

// Validate required environment variables
const requiredEnvVars = [
  { vite: 'VITE_FIREBASE_API_KEY', cra: 'REACT_APP_FIREBASE_API_KEY' },
  { vite: 'VITE_FIREBASE_AUTH_DOMAIN', cra: 'REACT_APP_FIREBASE_AUTH_DOMAIN' },
  { vite: 'VITE_FIREBASE_PROJECT_ID', cra: 'REACT_APP_FIREBASE_PROJECT_ID' },
] as const;

const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
const missingVars = requiredEnvVars.filter(vars => !getEnvVar(vars.vite, vars.cra));
if (missingVars.length > 0 && !isTest) {
  console.error(`Missing required Firebase environment variables: ${missingVars.map(v => v.vite).join(', ')}`);
  console.error('Please set up your .env.local file. See .env.example for reference.');
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY', 'REACT_APP_FIREBASE_API_KEY'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN', 'REACT_APP_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID', 'REACT_APP_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET', 'REACT_APP_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID', 'REACT_APP_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID', 'REACT_APP_FIREBASE_APP_ID'),
  measurementId: getEnvVar('VITE_FIREBASE_MEASUREMENT_ID', 'REACT_APP_FIREBASE_MEASUREMENT_ID')
};

// Initialize Firebase with error handling
let app: any;
let auth: Auth;
let db: Firestore;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  // Firebase initialization failed - app will not function
  throw error;
}

export { auth, db };
