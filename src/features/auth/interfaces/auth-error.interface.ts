import type { AuthErrorCode } from '../types/auth-error-code.type';

export interface AuthError extends Error {
  readonly code: AuthErrorCode;
}
