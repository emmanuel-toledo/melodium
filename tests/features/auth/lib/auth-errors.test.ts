import { describe, expect, it } from 'vitest';

import {
  AUTH_ERROR_MESSAGES,
  createAuthError,
  getAuthErrorMessage,
  isAuthError,
  toAuthError,
} from '@/features/auth/lib/auth-errors';

describe('auth errors', () => {
  it.each(Object.entries(AUTH_ERROR_MESSAGES))(
    'maps %s to its Spanish message',
    (code, message) => {
      expect(getAuthErrorMessage({ code })).toBe(message);
    },
  );

  it('maps an unknown Firebase code to the fallback message', () => {
    expect(getAuthErrorMessage({ code: 'auth/internal-error' })).toBe(
      AUTH_ERROR_MESSAGES['auth/unknown'],
    );
  });

  it('maps a non-Error rejection to the fallback message', () => {
    expect(getAuthErrorMessage('boom')).toBe(AUTH_ERROR_MESSAGES['auth/unknown']);
  });

  it('creates a typed AuthError with a code and message', () => {
    const error = createAuthError('auth/weak-password');

    expect(error.name).toBe('AuthError');
    expect(error.code).toBe('auth/weak-password');
    expect(error.message).toBe(AUTH_ERROR_MESSAGES['auth/weak-password']);
    expect(isAuthError(error)).toBe(true);
  });

  it('creates an overridden message when one is provided', () => {
    const error = createAuthError('auth/unknown', 'Mensaje personalizado');

    expect(error.message).toBe('Mensaje personalizado');
  });

  it('keeps an existing AuthError instance', () => {
    const error = createAuthError('auth/network-request-failed');

    expect(toAuthError(error)).toBe(error);
  });

  it('converts a raw Error without a code to the unknown code', () => {
    const error = toAuthError(new Error('boom'));

    expect(error.code).toBe('auth/unknown');
    expect(error.message).toBe(AUTH_ERROR_MESSAGES['auth/unknown']);
    expect(isAuthError(error)).toBe(true);
  });

  it('converts a raw Firebase error by its code', () => {
    const error = toAuthError({ code: 'auth/too-many-requests' });

    expect(error.code).toBe('auth/too-many-requests');
    expect(error.message).toBe(AUTH_ERROR_MESSAGES['auth/too-many-requests']);
  });

  it('rejects objects that only look like an AuthError', () => {
    expect(isAuthError({ name: 'AuthError', code: 'auth/unknown' })).toBe(false);
  });
});
