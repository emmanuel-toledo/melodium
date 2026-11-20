import {
  auth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from '@/shared/lib/firebase';
import type { Unsubscribe } from '@/shared/lib/firebase';

import type { AuthUser } from '../interfaces/auth-user.interface';
import type { SignUpResult } from '../interfaces/sign-up-result.interface';
import { toAuthUser } from '../lib/auth-user';

export interface SignUpResponse extends SignUpResult {
  user: AuthUser;
}

function hasCode(error: unknown, code: string): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === code;
}

export function subscribeToAuthChanges(onChange: (user: AuthUser | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, (user) => onChange(toAuthUser(user)));
}

export async function signInWithEmail(email: string, password: string): Promise<AuthUser> {
  const credential = await signInWithEmailAndPassword(auth, email, password);

  return toAuthUser(credential.user);
}

export async function signInWithGoogle(): Promise<AuthUser | null> {
  try {
    const credential = await signInWithPopup(auth, new GoogleAuthProvider());

    return toAuthUser(credential.user);
  } catch (error) {
    if (hasCode(error, 'auth/cancelled-popup-request')) {
      return null;
    }

    throw error;
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string,
): Promise<SignUpResponse> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const trimmedName = displayName?.trim();
  let displayNameSaved = true;

  if (trimmedName) {
    try {
      await updateProfile(credential.user, { displayName: trimmedName });
    } catch {
      displayNameSaved = false;
    }
  }

  return {
    user: toAuthUser(credential.user),
    displayNameSaved,
  };
}

export async function requestPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    if (hasCode(error, 'auth/user-not-found')) {
      return;
    }

    throw error;
  }
}

export async function signOutOfFirebase(): Promise<void> {
  await signOut(auth);
}
