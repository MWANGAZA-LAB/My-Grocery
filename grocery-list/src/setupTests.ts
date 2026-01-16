// Testing setup for Vitest
// Adds custom matchers for asserting on DOM nodes
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock crypto API for tests
Object.defineProperty(globalThis, 'crypto', {
  value: {
    getRandomValues: (arr: Uint32Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 4294967296);
      }
      return arr;
    }
  }
});

// Mock Firebase completely for all tests
vi.mock('./firebase', () => ({
  auth: {
    currentUser: { uid: 'test-uid' },
    onAuthStateChanged: vi.fn((callback: (user: { uid: string } | null) => void) => {
      callback({ uid: 'test-uid' });
      return vi.fn();
    }),
    signInAnonymously: vi.fn(),
    signOut: vi.fn()
  },
  db: {}
}));

// Mock Firebase modules
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: { uid: 'test-uid' }
  })),
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback({ uid: 'test-uid' });
    return vi.fn();
  }),
  signInAnonymously: vi.fn().mockResolvedValue({ user: { uid: 'anon-user-123' } })
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  addDoc: vi.fn().mockResolvedValue({ id: 'new-doc-id' }),
  getDoc: vi.fn().mockResolvedValue({ exists: () => true, data: () => ({}) }),
  getDocs: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  deleteDoc: vi.fn().mockResolvedValue(undefined),
  onSnapshot: vi.fn((ref, callback) => {
    if (typeof callback === 'function') {
      setTimeout(() => callback({ docs: [], data: () => ({}), exists: () => true }), 0);
    }
    return vi.fn();
  }),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  limit: vi.fn(() => ({})),
  serverTimestamp: vi.fn(() => ({ seconds: Date.now() / 1000 })),
  Timestamp: {
    now: () => ({ toDate: () => new Date(), seconds: Date.now() / 1000 }),
    fromDate: (date: Date) => ({ toDate: () => date, seconds: date.getTime() / 1000 })
  }
}));

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({}))
}));

// Mock environment variables for tests
process.env.REACT_APP_FIREBASE_API_KEY = 'test-api-key';
process.env.REACT_APP_FIREBASE_AUTH_DOMAIN = 'test-domain.firebaseapp.com';
process.env.REACT_APP_FIREBASE_PROJECT_ID = 'test-project';
process.env.REACT_APP_FIREBASE_STORAGE_BUCKET = 'test-bucket.appspot.com';
process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID = '123456789';
process.env.REACT_APP_FIREBASE_APP_ID = 'test-app-id';
process.env.REACT_APP_FIREBASE_MEASUREMENT_ID = 'test-measurement-id';
