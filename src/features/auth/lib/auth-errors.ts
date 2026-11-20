import type { AuthError } from '../interfaces/auth-error.interface';
import type { AuthErrorCode } from '../types/auth-error-code.type';

export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  'auth/invalid-email': 'El correo electrónico no es válido.',
  'auth/missing-password': 'Introduce tu contraseña.',
  'auth/user-not-found': 'El correo o la contraseña no son correctos.',
  'auth/wrong-password': 'El correo o la contraseña no son correctos.',
  'auth/invalid-credential': 'El correo o la contraseña no son correctos.',
  'auth/email-already-in-use': 'Ya existe una cuenta con este correo electrónico.',
  'auth/weak-password': 'La contraseña debe tener al menos 8 caracteres.',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  'auth/popup-closed-by-user':
    'Se cerró la ventana de Google antes de completar el inicio de sesión.',
  'auth/popup-blocked':
    'El navegador bloqueó la ventana de Google. Permite las ventanas emergentes e inténtalo de nuevo.',
  'auth/account-exists-with-different-credential':
    'Ya existe una cuenta con este correo usando otro método de acceso.',
  'auth/operation-not-allowed': 'Este método de inicio de sesión no está habilitado.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada.',
  'auth/network-request-failed': 'No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.',
  'auth/cancelled-popup-request': 'Se canceló la solicitud de inicio de sesión.',
  'auth/unknown': 'No se pudo completar la operación. Inténtalo de nuevo.',
};

const knownCodes = new Set<string>(Object.keys(AUTH_ERROR_MESSAGES));

function isAuthErrorCode(value: string): value is AuthErrorCode {
  return knownCodes.has(value);
}

function hasStringCode(value: unknown): value is { code: string } {
  return (
    typeof value === 'object' && value !== null && 'code' in value && typeof value.code === 'string'
  );
}

export function isAuthError(value: unknown): value is AuthError {
  return (
    value instanceof Error &&
    value.name === 'AuthError' &&
    hasStringCode(value) &&
    isAuthErrorCode(value.code)
  );
}

export function createAuthError(
  code: AuthErrorCode,
  message: string = AUTH_ERROR_MESSAGES[code],
): AuthError {
  const error = new Error(message);

  error.name = 'AuthError';

  return Object.assign(error, { code });
}

export function toAuthError(error: unknown): AuthError {
  if (isAuthError(error)) {
    return error;
  }

  const code = hasStringCode(error) && isAuthErrorCode(error.code) ? error.code : 'auth/unknown';

  return createAuthError(code);
}

export function getAuthErrorMessage(error: unknown): string {
  return AUTH_ERROR_MESSAGES[toAuthError(error).code];
}
