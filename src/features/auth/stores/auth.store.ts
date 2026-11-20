import { create } from 'zustand';

import {
  requestPasswordReset as requestReset,
  signInWithEmail as signInEmail,
  signInWithGoogle as signInGoogle,
  signOutOfFirebase,
  signUpWithEmail as signUpEmail,
  subscribeToAuthChanges,
} from '../api/auth-service.api';
import type { AuthState } from '../interfaces/auth-state.interface';
import type { AuthUser } from '../interfaces/auth-user.interface';
import { toAuthError } from '../lib/auth-errors';

type AuthStore = AuthState & {
  setUser(user: AuthUser | null): void;
};

function statusFor(user: AuthUser | null): AuthState['status'] {
  return user ? 'authenticated' : 'unauthenticated';
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  status: 'loading',
  setUser: (user) => set({ user, status: statusFor(user) }),
  signInWithEmail: async (email, password) => {
    try {
      const user = await signInEmail(email, password);

      set({ user, status: 'authenticated' });
    } catch (error) {
      throw toAuthError(error);
    }
  },
  signUpWithEmail: async (email, password, displayName) => {
    try {
      const { user, displayNameSaved } = await signUpEmail(email, password, displayName);

      set({ user, status: 'authenticated' });

      return { displayNameSaved };
    } catch (error) {
      throw toAuthError(error);
    }
  },
  signInWithGoogle: async () => {
    try {
      const user = await signInGoogle();

      if (user) {
        set({ user, status: 'authenticated' });
      }
    } catch (error) {
      throw toAuthError(error);
    }
  },
  requestPasswordReset: async (email) => {
    try {
      await requestReset(email);
    } catch (error) {
      throw toAuthError(error);
    }
  },
  signOut: async () => {
    try {
      await signOutOfFirebase();

      set({ user: null, status: 'unauthenticated' });
    } catch (error) {
      throw toAuthError(error);
    }
  },
}));

let cleanup: (() => void) | null = null;

export function initializeAuth(): () => void {
  if (cleanup) {
    return cleanup;
  }

  const unsubscribe = subscribeToAuthChanges((user) => {
    useAuthStore.getState().setUser(user);
  });

  let active = true;

  cleanup = () => {
    if (!active) {
      return;
    }

    active = false;
    unsubscribe();
    cleanup = null;
  };

  return cleanup;
}
