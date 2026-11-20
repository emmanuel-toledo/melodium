import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requestPasswordReset: vi.fn(),
  signInWithEmail: vi.fn(),
  signInWithGoogle: vi.fn(),
  signOutOfFirebase: vi.fn(),
  signUpWithEmail: vi.fn(),
  subscribeToAuthChanges: vi.fn(),
}));

vi.mock('@/features/auth/api/auth-service.api', () => ({
  requestPasswordReset: mocks.requestPasswordReset,
  signInWithEmail: mocks.signInWithEmail,
  signInWithGoogle: mocks.signInWithGoogle,
  signOutOfFirebase: mocks.signOutOfFirebase,
  signUpWithEmail: mocks.signUpWithEmail,
  subscribeToAuthChanges: mocks.subscribeToAuthChanges,
}));

import { initializeAuth, useAuthStore } from '@/features/auth/stores/auth.store';

const user = {
  uid: 'user-1',
  email: 'ana@example.com',
  displayName: 'Ana',
};

function resetStore() {
  useAuthStore.setState({ user: null, status: 'loading' });
}

describe('auth store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
    mocks.subscribeToAuthChanges.mockReturnValue(vi.fn());
  });

  it('starts loading with no user and no global error', () => {
    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.status).toBe('loading');
    expect(state).not.toHaveProperty('error');
  });

  it('signs in with email and marks the session as authenticated', async () => {
    mocks.signInWithEmail.mockResolvedValueOnce(user);

    await useAuthStore.getState().signInWithEmail('ana@example.com', 'secreto');

    expect(useAuthStore.getState().user).toEqual(user);
    expect(useAuthStore.getState().status).toBe('authenticated');
  });

  it('rejects with a typed AuthError when sign-in fails', async () => {
    mocks.signInWithEmail.mockRejectedValueOnce({ code: 'auth/invalid-credential' });

    await expect(
      useAuthStore.getState().signInWithEmail('ana@example.com', 'nope'),
    ).rejects.toMatchObject({
      name: 'AuthError',
      code: 'auth/invalid-credential',
    });
    expect(useAuthStore.getState().status).toBe('loading');
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('signs up and returns whether the display name was saved', async () => {
    mocks.signUpWithEmail.mockResolvedValueOnce({ user, displayNameSaved: false });

    await expect(
      useAuthStore.getState().signUpWithEmail('ana@example.com', 'secreto', 'Ana'),
    ).resolves.toEqual({ displayNameSaved: false });
    expect(useAuthStore.getState().status).toBe('authenticated');
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it('signs in with Google and updates the session', async () => {
    mocks.signInWithGoogle.mockResolvedValueOnce(user);

    await useAuthStore.getState().signInWithGoogle();

    expect(useAuthStore.getState().user).toEqual(user);
    expect(useAuthStore.getState().status).toBe('authenticated');
  });

  it('leaves the session untouched when the Google popup is cancelled', async () => {
    mocks.signInWithGoogle.mockResolvedValueOnce(null);

    await useAuthStore.getState().signInWithGoogle();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().status).toBe('loading');
  });

  it('requests a password reset without changing the session', async () => {
    mocks.requestPasswordReset.mockResolvedValueOnce(undefined);

    await useAuthStore.getState().requestPasswordReset('ana@example.com');

    expect(mocks.requestPasswordReset).toHaveBeenCalledWith('ana@example.com');
    expect(useAuthStore.getState().status).toBe('loading');
  });

  it('signs out and clears the session', async () => {
    useAuthStore.setState({ user, status: 'authenticated' });
    mocks.signOutOfFirebase.mockResolvedValueOnce(undefined);

    await useAuthStore.getState().signOut();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().status).toBe('unauthenticated');
  });

  it('keeps the session when sign-out fails', async () => {
    useAuthStore.setState({ user, status: 'authenticated' });
    mocks.signOutOfFirebase.mockRejectedValueOnce({ code: 'auth/network-request-failed' });

    await expect(useAuthStore.getState().signOut()).rejects.toMatchObject({
      code: 'auth/network-request-failed',
    });
    expect(useAuthStore.getState().user).toEqual(user);
    expect(useAuthStore.getState().status).toBe('authenticated');
  });

  it('subscribes once and returns the same cleanup for repeated calls', () => {
    const unsubscribe = vi.fn();
    mocks.subscribeToAuthChanges.mockReturnValueOnce(unsubscribe);

    const first = initializeAuth();
    const second = initializeAuth();

    expect(mocks.subscribeToAuthChanges).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);

    first();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('reconciles the session from the subscription', () => {
    let notify: ((value: typeof user | null) => void) | undefined;
    mocks.subscribeToAuthChanges.mockImplementationOnce(
      (listener: (value: typeof user | null) => void) => {
        notify = listener;
        return vi.fn();
      },
    );

    const cleanup = initializeAuth();

    notify?.(user);
    expect(useAuthStore.getState().status).toBe('authenticated');
    expect(useAuthStore.getState().user).toEqual(user);

    notify?.(null);
    expect(useAuthStore.getState().status).toBe('unauthenticated');
    expect(useAuthStore.getState().user).toBeNull();

    cleanup();
  });

  it('can resubscribe after cleanup', () => {
    const firstUnsubscribe = vi.fn();
    const secondUnsubscribe = vi.fn();
    mocks.subscribeToAuthChanges
      .mockReturnValueOnce(firstUnsubscribe)
      .mockReturnValueOnce(secondUnsubscribe);

    const cleanup = initializeAuth();
    cleanup();

    const nextCleanup = initializeAuth();

    expect(mocks.subscribeToAuthChanges).toHaveBeenCalledTimes(2);

    nextCleanup();

    expect(secondUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
