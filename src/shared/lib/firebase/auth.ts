import { connectAuthEmulator, getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';

import { useEmulators } from '@/shared/config/env';
import { firebaseApp } from '@/shared/lib/firebase/app';

type EmulatorState = {
  melodiumAuthEmulatorConnected?: boolean;
};

const emulatorState = globalThis as unknown as EmulatorState;

export const auth: Auth = getAuth(firebaseApp);

if (useEmulators && !emulatorState.melodiumAuthEmulatorConnected) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  emulatorState.melodiumAuthEmulatorConnected = true;
}
