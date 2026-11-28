import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { auth } from '@/shared/apis/firebase/client'
import type { AuthUser } from '../../interfaces/auth.interface'

const googleProvider = new GoogleAuthProvider()

/** Maps the Firebase SDK user to the feature's domain user. */
export function mapFirebaseUser(user: User | null): AuthUser | null {
  if (!user) return null
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  }
}

/** Opens the Google popup; rejects with a Firebase error on failure. */
export async function signInWithGoogle(): Promise<void> {
  await signInWithPopup(auth, googleProvider)
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth)
}

/** Subscribes to auth state changes; returns the unsubscribe function. */
export function subscribeAuth(
  callback: (user: AuthUser | null) => void,
): () => void {
  return onAuthStateChanged(auth, (user) => callback(mapFirebaseUser(user)))
}
