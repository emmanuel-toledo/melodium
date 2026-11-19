import { describe, expect, it } from 'vitest';

import { parseEnv } from '@/shared/config/env';

const demoEnv = {
  VITE_FIREBASE_API_KEY: 'demo-api-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'demo-melodium.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'demo-melodium',
  VITE_FIREBASE_APP_ID: '1:000000000000:web:demo',
  VITE_USE_FIREBASE_EMULATORS: 'true',
};

describe('parseEnv', () => {
  it('accepts the documented demo values', () => {
    expect(parseEnv(demoEnv)).toEqual({
      firebaseConfig: {
        apiKey: 'demo-api-key',
        authDomain: 'demo-melodium.firebaseapp.com',
        projectId: 'demo-melodium',
        appId: '1:000000000000:web:demo',
      },
      useEmulators: true,
    });
  });

  it('maps "false" to a disabled emulator flag', () => {
    expect(parseEnv({ ...demoEnv, VITE_USE_FIREBASE_EMULATORS: 'false' }).useEmulators).toBe(false);
  });

  it('rejects a missing variable and points to the setup command', () => {
    const incomplete: Record<string, string> = { ...demoEnv };

    delete incomplete.VITE_FIREBASE_PROJECT_ID;

    expect(() => parseEnv(incomplete)).toThrowError(/VITE_FIREBASE_PROJECT_ID/);
    expect(() => parseEnv(incomplete)).toThrowError(/\.env\.example/);
    expect(() => parseEnv(incomplete)).toThrowError(/pnpm env:setup/);
  });

  it('rejects empty values', () => {
    expect(() => parseEnv({ ...demoEnv, VITE_FIREBASE_API_KEY: '  ' })).toThrowError(
      /VITE_FIREBASE_API_KEY/,
    );
  });

  it('rejects an invalid emulator flag', () => {
    expect(() => parseEnv({ ...demoEnv, VITE_USE_FIREBASE_EMULATORS: 'yes' })).toThrowError(
      /VITE_USE_FIREBASE_EMULATORS/,
    );
  });
});
