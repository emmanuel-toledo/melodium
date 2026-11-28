import { initializeApp, getApp, getApps } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { env } from '@/shared/config/env'

/**
 * Firebase transport client (react-data: one instance per client,
 * always in `shared/apis/<client>/client.ts`).
 */
const app = getApps().length > 0 ? getApp() : initializeApp(env.firebase)

export const auth = getAuth(app)

// Firestore instance (used by future specs; no connection until first use).
export const db = getFirestore(app)

// Emulator wiring is gated by env flag and never runs in production.
if (env.useFirebaseEmulator) {
  connectAuthEmulator(auth, env.firebaseEmulatorUrl, { disableWarnings: true })
}
