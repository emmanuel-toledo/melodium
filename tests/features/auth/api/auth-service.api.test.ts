import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: { name: 'auth' },
  createUserWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock('@/shared/lib/firebase', () => ({
  auth: mocks.auth,
  createUserWithEmailAndPassword: mocks.createUserWithEmailAndPassword,
  GoogleAuthProvider: class GoogleAuthProvider {
    providerId = 'google.com';
  },
  onAuthStateChanged: mocks.onAuthStateChanged,
  sendPasswordResetEmail: mocks.sendPasswordResetEmail,
  signInWithEmailAndPassword: mocks.signInWithEmailAndPassword,
  signInWithPopup: mocks.signInWithPopup,
  signOut: mocks.signOut,
  updateProfile: mocks.updateProfile,
}));

import {
  requestPasswordReset,
  signInWithEmail,
  signInWithGoogle,
  signOutOfFirebase,
  signUpWithEmail,
  subscribeToAuthChanges,
} from '@/features/auth/api/auth-service.api';

const firebaseUser = {
  uid: 'user-1',
  email: 'ana@example.com',
  displayName: 'Ana',
};

const authUser = {
  uid: 'user-1',
  email: 'ana@example.com',
  displayName: 'Ana',
};

describe('auth service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('signs in with email and maps the user', async () => {
    mocks.signInWithEmailAndPassword.mockResolvedValueOnce({ user: firebaseUser });

    await expect(signInWithEmail('ana@example.com', 'secreto')).resolves.toEqual(authUser);
    expect(mocks.signInWithEmailAndPassword).toHaveBeenCalledWith(
      mocks.auth,
      'ana@example.com',
      'secreto',
    );
  });

  it('signs in with a Google popup and maps the user', async () => {
    mocks.signInWithPopup.mockResolvedValueOnce({ user: firebaseUser });

    await expect(signInWithGoogle()).resolves.toEqual(authUser);
    expect(mocks.signInWithPopup).toHaveBeenCalledWith(
      mocks.auth,
      expect.objectContaining({ providerId: 'google.com' }),
    );
  });

  it('treats a cancelled popup as a no-op', async () => {
    mocks.signInWithPopup.mockRejectedValueOnce({ code: 'auth/cancelled-popup-request' });

    await expect(signInWithGoogle()).resolves.toBeNull();
  });

  it('rethrows other Google popup errors', async () => {
    const error = { code: 'auth/popup-blocked' };
    mocks.signInWithPopup.mockRejectedValueOnce(error);

    await expect(signInWithGoogle()).rejects.toBe(error);
  });

  it('registers without a display name', async () => {
    mocks.createUserWithEmailAndPassword.mockResolvedValueOnce({ user: firebaseUser });

    await expect(signUpWithEmail('ana@example.com', 'secreto')).resolves.toEqual({
      user: authUser,
      displayNameSaved: true,
    });
    expect(mocks.updateProfile).not.toHaveBeenCalled();
  });

  it('saves a trimmed display name after registration', async () => {
    mocks.createUserWithEmailAndPassword.mockResolvedValueOnce({ user: firebaseUser });
    mocks.updateProfile.mockResolvedValueOnce(undefined);

    await expect(signUpWithEmail('ana@example.com', 'secreto', '  Ana  ')).resolves.toEqual({
      user: authUser,
      displayNameSaved: true,
    });
    expect(mocks.updateProfile).toHaveBeenCalledWith(firebaseUser, { displayName: 'Ana' });
  });

  it('still registers when the display name cannot be saved', async () => {
    mocks.createUserWithEmailAndPassword.mockResolvedValueOnce({ user: firebaseUser });
    mocks.updateProfile.mockRejectedValueOnce(new Error('profile failed'));

    await expect(signUpWithEmail('ana@example.com', 'secreto', 'Ana')).resolves.toEqual({
      user: authUser,
      displayNameSaved: false,
    });
  });

  it('swallows user-not-found when requesting a password reset', async () => {
    mocks.sendPasswordResetEmail.mockRejectedValueOnce({ code: 'auth/user-not-found' });

    await expect(requestPasswordReset('ana@example.com')).resolves.toBeUndefined();
    expect(mocks.sendPasswordResetEmail).toHaveBeenCalledWith(mocks.auth, 'ana@example.com');
  });

  it('rethrows network errors when requesting a password reset', async () => {
    const error = { code: 'auth/network-request-failed' };
    mocks.sendPasswordResetEmail.mockRejectedValueOnce(error);

    await expect(requestPasswordReset('ana@example.com')).rejects.toBe(error);
  });

  it('rethrows rate-limit errors when requesting a password reset', async () => {
    const error = { code: 'auth/too-many-requests' };
    mocks.sendPasswordResetEmail.mockRejectedValueOnce(error);

    await expect(requestPasswordReset('ana@example.com')).rejects.toBe(error);
  });

  it('signs out through the facade', async () => {
    mocks.signOut.mockResolvedValueOnce(undefined);

    await signOutOfFirebase();

    expect(mocks.signOut).toHaveBeenCalledWith(mocks.auth);
  });

  it('maps the auth subscription and returns its unsubscribe', () => {
    const unsubscribe = vi.fn();
    let notify: ((user: typeof firebaseUser | null) => void) | undefined;

    mocks.onAuthStateChanged.mockImplementationOnce(
      (_auth: unknown, callback: (user: typeof firebaseUser | null) => void) => {
        notify = callback;
        return unsubscribe;
      },
    );

    const listener = vi.fn();
    const result = subscribeToAuthChanges(listener);

    notify?.(firebaseUser);
    notify?.(null);

    expect(listener).toHaveBeenNthCalledWith(1, authUser);
    expect(listener).toHaveBeenNthCalledWith(2, null);
    expect(result).toBe(unsubscribe);
  });
});
