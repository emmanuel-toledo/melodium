import type { AuthUser } from '../interfaces/auth-user.interface';

export interface FirebaseUserLike {
  uid: string;
  email: string | null;
  displayName: string | null;
}

function mapUser(user: FirebaseUserLike): AuthUser {
  const displayName = user.displayName?.trim();

  return {
    uid: user.uid,
    email: user.email,
    displayName: displayName ? displayName : null,
  };
}

export function toAuthUser(user: FirebaseUserLike): AuthUser;
export function toAuthUser(user: null): null;
export function toAuthUser(user: FirebaseUserLike | null): AuthUser | null;
export function toAuthUser(user: FirebaseUserLike | null): AuthUser | null {
  return user ? mapUser(user) : null;
}
