/**
 * Single place where `import.meta.env` is read (react-architecture rule).
 * The rest of the app imports the validated `env` object.
 */

interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`[env] Missing required environment variable: ${name}`)
  }
  return value
}

const raw = import.meta.env

const firebaseConfig: FirebaseConfig = {
  apiKey: required('VITE_FIREBASE_API_KEY', raw.VITE_FIREBASE_API_KEY),
  authDomain: required('VITE_FIREBASE_AUTH_DOMAIN', raw.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: required('VITE_FIREBASE_PROJECT_ID', raw.VITE_FIREBASE_PROJECT_ID),
  storageBucket: required(
    'VITE_FIREBASE_STORAGE_BUCKET',
    raw.VITE_FIREBASE_STORAGE_BUCKET,
  ),
  messagingSenderId: required(
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    raw.VITE_FIREBASE_MESSAGING_SENDER_ID,
  ),
  appId: required('VITE_FIREBASE_APP_ID', raw.VITE_FIREBASE_APP_ID),
}

export const env = {
  /** Public Firebase web app config (safe to expose in the client bundle). */
  firebase: firebaseConfig,
  /** Never true in production: gates all emulator connections (react-data). */
  useFirebaseEmulator: raw.VITE_USE_FIREBASE_EMULATOR === 'true',
  /** Auth emulator URL; overridable for Docker (host.docker.internal:9099). */
  firebaseEmulatorUrl: raw.VITE_FIREBASE_EMULATOR_URL ?? 'http://localhost:9099',
} as const
