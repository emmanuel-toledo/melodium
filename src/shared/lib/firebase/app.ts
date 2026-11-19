import { getApps, initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';

import { firebaseConfig } from '@/shared/config/env';

export function getFirebaseApp(): FirebaseApp {
  const [existingApp] = getApps();

  return existingApp ?? initializeApp(firebaseConfig);
}

export const firebaseApp = getFirebaseApp();
