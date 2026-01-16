// Comprehensive Firebase mock for testing

// Mock Timestamp
const mockTimestamp = {
  toDate: () => new Date(),
  seconds: Math.floor(Date.now() / 1000),
  nanoseconds: 0,
};

// Mock Firestore document snapshot
const createMockDocSnapshot = (id: string, data: Record<string, unknown> | null, exists = true) => ({
  id,
  exists: () => exists,
  data: () => data,
  ref: { id, path: `test/${id}` },
});

// Mock Firestore query snapshot
const createMockQuerySnapshot = (docs: Array<{ id: string; data: Record<string, unknown> }>) => ({
  docs: docs.map(doc => ({
    id: doc.id,
    data: () => doc.data,
    exists: () => true,
    ref: { id: doc.id, path: `test/${doc.id}` },
  })),
  empty: docs.length === 0,
  size: docs.length,
  forEach: (callback: (doc: unknown) => void) => docs.forEach((doc) => 
    callback(createMockDocSnapshot(doc.id, doc.data))
  ),
});

// Mock user
export const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  isAnonymous: false,
  photoURL: null,
  providerId: 'firebase',
  metadata: {},
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: jest.fn(),
  getIdToken: jest.fn().mockResolvedValue('mock-token'),
  getIdTokenResult: jest.fn(),
  reload: jest.fn(),
  toJSON: jest.fn(),
};

// Mock Auth
export const auth = {
  currentUser: mockUser,
  onAuthStateChanged: jest.fn((callback: (user: unknown) => void) => {
    callback(mockUser);
    return jest.fn(); // unsubscribe
  }),
  signInAnonymously: jest.fn().mockResolvedValue({ user: mockUser }),
  signOut: jest.fn().mockResolvedValue(undefined),
};

// Store for mock data
const mockDataStore: Record<string, Record<string, unknown>> = {};

// Mock Firestore
export const db = {
  _mockStore: mockDataStore,
};

// Mock Firestore functions
export const collection = jest.fn((_db: unknown, _path: string) => ({ _path }));

export const doc = jest.fn((_db: unknown, ...pathSegments: string[]) => ({
  path: pathSegments.join('/'),
  id: pathSegments[pathSegments.length - 1],
}));

export const query = jest.fn((...args: unknown[]) => ({ type: 'query', args }));

export const where = jest.fn((field: string, op: string, value: unknown) => ({
  type: 'where',
  field,
  op,
  value,
}));

export const orderBy = jest.fn((field: string, direction = 'asc') => ({
  type: 'orderBy',
  field,
  direction,
}));

export const onSnapshot = jest.fn((_ref: unknown, callback: (snap: unknown) => void) => {
  // Return empty by default
  callback(createMockQuerySnapshot([]));
  return jest.fn(); // unsubscribe
});

export const getDoc = jest.fn().mockResolvedValue(createMockDocSnapshot('test-id', null, false));

export const getDocs = jest.fn().mockResolvedValue(createMockQuerySnapshot([]));

export const addDoc = jest.fn().mockResolvedValue({ id: 'new-doc-id' });

export const updateDoc = jest.fn().mockResolvedValue(undefined);

export const deleteDoc = jest.fn().mockResolvedValue(undefined);

export const setDoc = jest.fn().mockResolvedValue(undefined);

export const serverTimestamp = jest.fn(() => mockTimestamp);

export const Timestamp = {
  now: () => mockTimestamp,
  fromDate: (date: Date) => ({
    toDate: () => date,
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
  }),
};

// Firebase Auth functions
export const signInAnonymously = jest.fn().mockResolvedValue({ user: mockUser });

export const onAuthStateChanged = jest.fn((_auth: unknown, callback: (user: unknown) => void) => {
  callback(mockUser);
  return jest.fn();
});

// Helper to reset all mocks
export const resetMocks = () => {
  jest.clearAllMocks();
  Object.keys(mockDataStore).forEach(key => delete mockDataStore[key]);
};

// Helper to set mock data for getDoc
export const setMockDocData = (data: Record<string, unknown> | null, exists = true) => {
  getDoc.mockResolvedValueOnce(createMockDocSnapshot('test-id', data, exists));
};

// Helper to set mock data for getDocs
export const setMockQueryData = (docs: Array<{ id: string; data: Record<string, unknown> }>) => {
  getDocs.mockResolvedValueOnce(createMockQuerySnapshot(docs));
};

// Helper to set mock snapshot data for onSnapshot
export const setMockSnapshotData = (docs: Array<{ id: string; data: Record<string, unknown> }>) => {
  onSnapshot.mockImplementationOnce((_ref: unknown, callback: (snap: unknown) => void) => {
    callback(createMockQuerySnapshot(docs));
    return jest.fn();
  });
};

export default {
  auth,
  db,
};
