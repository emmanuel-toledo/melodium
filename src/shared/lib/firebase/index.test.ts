import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  addDoc: vi.fn(),
  collection: vi.fn(),
  connectAuthEmulator: vi.fn(),
  connectFirestoreEmulator: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  getApps: vi.fn((): { name: string }[] => []),
  getAuth: vi.fn(() => ({ name: 'auth' })),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  getFirestore: vi.fn(() => ({ name: 'db' })),
  getFirestoreLimit: vi.fn(),
  initializeApp: vi.fn(() => ({ name: 'app' })),
  limit: vi.fn(),
  onAuthStateChanged: vi.fn(),
  onSnapshot: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  serverTimestamp: vi.fn(),
  setDoc: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  updateDoc: vi.fn(),
  where: vi.fn(),
  writeBatch: vi.fn(),
}));

vi.mock('firebase/app', () => ({
  getApps: mocks.getApps,
  initializeApp: mocks.initializeApp,
}));

vi.mock('firebase/auth', () => ({
  connectAuthEmulator: mocks.connectAuthEmulator,
  createUserWithEmailAndPassword: mocks.createUserWithEmailAndPassword,
  getAuth: mocks.getAuth,
  GoogleAuthProvider: class GoogleAuthProvider {},
  onAuthStateChanged: mocks.onAuthStateChanged,
  sendPasswordResetEmail: mocks.sendPasswordResetEmail,
  signInWithEmailAndPassword: mocks.signInWithEmailAndPassword,
  signInWithPopup: mocks.signInWithPopup,
  signOut: mocks.signOut,
}));

vi.mock('firebase/firestore', () => ({
  addDoc: mocks.addDoc,
  collection: mocks.collection,
  connectFirestoreEmulator: mocks.connectFirestoreEmulator,
  deleteDoc: mocks.deleteDoc,
  doc: mocks.doc,
  getDoc: mocks.getDoc,
  getDocs: mocks.getDocs,
  getFirestore: mocks.getFirestore,
  limit: mocks.limit,
  onSnapshot: mocks.onSnapshot,
  orderBy: mocks.orderBy,
  query: mocks.query,
  serverTimestamp: mocks.serverTimestamp,
  setDoc: mocks.setDoc,
  Timestamp: class Timestamp {},
  updateDoc: mocks.updateDoc,
  where: mocks.where,
  writeBatch: mocks.writeBatch,
}));

vi.mock('@/shared/config/env', () => ({
  firebaseConfig: {
    apiKey: 'demo-api-key',
    authDomain: 'demo-melodium.firebaseapp.com',
    projectId: 'demo-melodium',
    appId: '1:000000000000:web:demo',
  },
  useEmulators: true,
}));

type EmulatorState = {
  melodiumAuthEmulatorConnected?: boolean;
  melodiumFirestoreEmulatorConnected?: boolean;
};

function resetEmulatorState() {
  const state = globalThis as unknown as EmulatorState;

  delete state.melodiumAuthEmulatorConnected;
  delete state.melodiumFirestoreEmulatorConnected;
}

describe('firebase facade', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    resetEmulatorState();
    mocks.getApps.mockReturnValue([]);
  });

  it('initializes the app once and reuses an existing app', async () => {
    const { firebaseApp, getFirebaseApp } = await import('@/shared/lib/firebase/app');

    expect(mocks.initializeApp).toHaveBeenCalledTimes(1);
    expect(firebaseApp).toEqual({ name: 'app' });

    mocks.getApps.mockReturnValue([{ name: 'existing' }]);

    expect(getFirebaseApp()).toEqual({ name: 'existing' });
    expect(mocks.initializeApp).toHaveBeenCalledTimes(1);
  });

  it('connects Auth and Firestore to the local emulators', async () => {
    const facade = await import('@/shared/lib/firebase');

    expect(mocks.connectAuthEmulator).toHaveBeenCalledWith(
      { name: 'auth' },
      'http://127.0.0.1:9099',
      { disableWarnings: true },
    );
    expect(mocks.connectFirestoreEmulator).toHaveBeenCalledWith({ name: 'db' }, '127.0.0.1', 8080);
    expect(facade.auth).toEqual({ name: 'auth' });
    expect(facade.db).toEqual({ name: 'db' });
  });

  it('does not connect twice after a module reload', async () => {
    await import('@/shared/lib/firebase');
    expect(mocks.connectAuthEmulator).toHaveBeenCalledTimes(1);
    expect(mocks.connectFirestoreEmulator).toHaveBeenCalledTimes(1);

    vi.resetModules();
    await import('@/shared/lib/firebase');

    expect(mocks.connectAuthEmulator).toHaveBeenCalledTimes(1);
    expect(mocks.connectFirestoreEmulator).toHaveBeenCalledTimes(1);
  });

  it('exposes the curated facade surface', async () => {
    const facade = await import('@/shared/lib/firebase');

    expect(Object.keys(facade)).toEqual(
      expect.arrayContaining([
        'auth',
        'db',
        'collection',
        'doc',
        'query',
        'where',
        'orderBy',
        'limit',
        'onSnapshot',
        'getDoc',
        'getDocs',
        'addDoc',
        'setDoc',
        'updateDoc',
        'deleteDoc',
        'serverTimestamp',
        'Timestamp',
        'writeBatch',
      ]),
    );
  });
});

describe('firebase facade with emulators disabled', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    resetEmulatorState();
  });

  it('does not connect to the emulators', async () => {
    vi.doMock('@/shared/config/env', () => ({
      firebaseConfig: {
        apiKey: 'demo-api-key',
        authDomain: 'demo-melodium.firebaseapp.com',
        projectId: 'demo-melodium',
        appId: '1:000000000000:web:demo',
      },
      useEmulators: false,
    }));

    await import('@/shared/lib/firebase');

    expect(mocks.connectAuthEmulator).not.toHaveBeenCalled();
    expect(mocks.connectFirestoreEmulator).not.toHaveBeenCalled();
  });
});
