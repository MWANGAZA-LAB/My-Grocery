// Mock Firebase completely
const mockAuth = {
  currentUser: { uid: 'test-uid' }
};

const mockDb = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      set: jest.fn(),
      get: jest.fn(),
      onSnapshot: jest.fn()
    })),
    add: jest.fn(),
    where: jest.fn(() => ({
      onSnapshot: jest.fn()
    })),
    onSnapshot: jest.fn()
  }))
};

export { mockAuth as auth, mockDb as db };
