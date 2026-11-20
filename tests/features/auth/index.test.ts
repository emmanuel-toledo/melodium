import { describe, expect, it } from 'vitest';

import * as auth from '@/features/auth';

describe('auth public API', () => {
  it('exports only the approved public surface', () => {
    expect(Object.keys(auth).sort()).toEqual(
      ['RequireAuth', 'UserMenu', 'authRoutes', 'initializeAuth', 'useAuth'].sort(),
    );
  });

  it('exports the approved types', () => {
    type _AuthState = auth.AuthState;
    type _AuthUser = auth.AuthUser;
    type _SignUpResult = auth.SignUpResult;
    type _AuthStatus = auth.AuthStatus;

    const check = (_a: _AuthState, _b: _AuthUser, _c: _SignUpResult, _d: _AuthStatus) =>
      Boolean(_a || _b || _c || _d);

    expect(check).toBeDefined();
  });

  it('does not expose internal modules', () => {
    const forbidden = [
      'useAuthStore',
      'toAuthUser',
      'getAuthErrorMessage',
      'loginSchema',
      'LoginForm',
      'LoginPage',
    ];

    for (const name of forbidden) {
      expect(auth).not.toHaveProperty(name);
    }
  });
});
