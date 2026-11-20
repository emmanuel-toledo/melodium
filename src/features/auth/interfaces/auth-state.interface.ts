import type { AuthStatus } from '../types/auth-status.type';
import type { AuthUser } from './auth-user.interface';
import type { SignUpResult } from './sign-up-result.interface';

export interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<SignUpResult>;
  signInWithGoogle: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}
