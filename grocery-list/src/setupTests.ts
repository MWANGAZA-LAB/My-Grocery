// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Firebase completely for all tests
jest.mock('./firebase', () => ({
  auth: {
    currentUser: { uid: 'test-uid' },
    onAuthStateChanged: jest.fn((callback) => {
      // Simulate a logged-in user
      callback({ uid: 'test-uid' });
      return jest.fn(); // unsubscribe function
    }),
    signInAnonymously: jest.fn()
  },
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn().mockResolvedValue({}),
        get: jest.fn().mockResolvedValue({ exists: true, data: () => ({}) }),
        onSnapshot: jest.fn()
      })),
      add: jest.fn().mockResolvedValue({ id: 'test-doc-id' }),
      where: jest.fn(() => ({
        onSnapshot: jest.fn()
      })),
      onSnapshot: jest.fn()
    }))
  }
}));

// Mock Firebase modules
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: 'test-uid' }
  })),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback({ uid: 'test-uid' });
    return jest.fn();
  }),
  signInAnonymously: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      set: jest.fn(),
      get: jest.fn(),
      onSnapshot: jest.fn((callback) => {
        if (callback) {
          setTimeout(() => callback({
            docs: [],
            data: () => ({}),
            exists: true
          }), 0);
        }
        return jest.fn(); // return unsubscribe function
      })
    })),
    add: jest.fn(),
    where: jest.fn(() => ({
      onSnapshot: jest.fn((callback) => {
        if (callback) {
          setTimeout(() => callback({
            docs: [],
            data: () => ({}),
            exists: true
          }), 0);
        }
        return jest.fn(); // return unsubscribe function
      })
    })),
    onSnapshot: jest.fn((callback) => {
      if (callback) {
        setTimeout(() => callback({
          docs: [],
          data: () => ({}),
          exists: true
        }), 0);
      }
      return jest.fn(); // return unsubscribe function
    })
  })),
  doc: jest.fn(() => ({
    set: jest.fn(),
    get: jest.fn(),
    onSnapshot: jest.fn((callback) => {
      if (callback) {
        setTimeout(() => callback({
          docs: [],
          data: () => ({}),
          exists: true
        }), 0);
      }
      return jest.fn(); // return unsubscribe function
    })
  })),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  onSnapshot: jest.fn((ref, callback) => {
    // Call callback with mock data
    if (callback) {
      setTimeout(() => callback({
        docs: [],
        data: () => ({}),
        exists: true
      }), 0);
    }
    return jest.fn(); // return unsubscribe function
  }),
  query: jest.fn(() => ({})),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn()
}));

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({}))
}));

// Mock environment variables for tests
process.env.REACT_APP_FIREBASE_API_KEY = 'test-api-key';
process.env.REACT_APP_FIREBASE_AUTH_DOMAIN = 'test-domain.firebaseapp.com';
process.env.REACT_APP_FIREBASE_PROJECT_ID = 'test-project';
process.env.REACT_APP_FIREBASE_STORAGE_BUCKET = 'test-bucket.appspot.com';
process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID = '123456789';
process.env.REACT_APP_FIREBASE_APP_ID = 'test-app-id';
process.env.REACT_APP_FIREBASE_MEASUREMENT_ID = 'test-measurement-id';
