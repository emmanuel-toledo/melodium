import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

import { useEmulators } from '@/shared/config/env';
import { firebaseApp } from '@/shared/lib/firebase/app';

type EmulatorState = {
  melodiumFirestoreEmulatorConnected?: boolean;
};

const emulatorState = globalThis as unknown as EmulatorState;

export const db: Firestore = getFirestore(firebaseApp);

if (useEmulators && !emulatorState.melodiumFirestoreEmulatorConnected) {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  emulatorState.melodiumFirestoreEmulatorConnected = true;
}
