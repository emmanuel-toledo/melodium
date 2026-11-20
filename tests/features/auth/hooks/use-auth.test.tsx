import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { useAuthStore } from '@/features/auth/stores/auth.store';

const user = {
  uid: 'user-1',
  email: 'ana@example.com',
  displayName: 'Ana',
};

describe('useAuth', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, status: 'loading' });
  });

  it('exposes the user, the status and the actions', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.status).toBe('loading');
    expect(typeof result.current.signInWithEmail).toBe('function');
    expect(typeof result.current.signUpWithEmail).toBe('function');
    expect(typeof result.current.signInWithGoogle).toBe('function');
    expect(typeof result.current.requestPasswordReset).toBe('function');
    expect(typeof result.current.signOut).toBe('function');
  });

  it('updates when the session changes', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      useAuthStore.setState({ user, status: 'authenticated' });
    });

    expect(result.current.user).toEqual(user);
    expect(result.current.status).toBe('authenticated');
  });
});
