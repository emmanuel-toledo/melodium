import { describe, expect, it } from 'vitest';

import { toAuthUser } from '@/features/auth/lib/auth-user';

describe('toAuthUser', () => {
  it('returns null for a missing user', () => {
    expect(toAuthUser(null)).toBeNull();
  });

  it('maps the Firebase user to the domain user', () => {
    expect(
      toAuthUser({
        uid: 'user-1',
        email: 'ana@example.com',
        displayName: 'Ana',
      }),
    ).toEqual({
      uid: 'user-1',
      email: 'ana@example.com',
      displayName: 'Ana',
    });
  });

  it('keeps null email and null display name', () => {
    expect(toAuthUser({ uid: 'user-1', email: null, displayName: null })).toEqual({
      uid: 'user-1',
      email: null,
      displayName: null,
    });
  });

  it('treats a blank display name as null', () => {
    expect(toAuthUser({ uid: 'user-1', email: 'ana@example.com', displayName: '   ' })).toEqual({
      uid: 'user-1',
      email: 'ana@example.com',
      displayName: null,
    });
  });

  it('trims a display name with surrounding spaces', () => {
    expect(toAuthUser({ uid: 'user-1', email: null, displayName: '  Ana  ' })?.displayName).toBe(
      'Ana',
    );
  });
});
