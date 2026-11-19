import { z } from 'zod';

const rawEnvSchema = z.object({
  VITE_FIREBASE_API_KEY: z.string().trim().min(1, 'must not be empty'),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().trim().min(1, 'must not be empty'),
  VITE_FIREBASE_PROJECT_ID: z.string().trim().min(1, 'must not be empty'),
  VITE_FIREBASE_APP_ID: z.string().trim().min(1, 'must not be empty'),
  VITE_USE_FIREBASE_EMULATORS: z.enum(['true', 'false'], {
    message: 'must be "true" or "false"',
  }),
});

export type RawEnv = Record<string, string | undefined>;

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
};

export type Env = {
  firebaseConfig: FirebaseConfig;
  useEmulators: boolean;
};

export function parseEnv(raw: RawEnv): Env {
  const result = rawEnvSchema.safeParse(raw);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `- ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(
      `Invalid environment configuration. See .env.example and run "pnpm env:setup" to create .env.local.\n${details}`,
    );
  }

  const values = result.data;

  return {
    firebaseConfig: {
      apiKey: values.VITE_FIREBASE_API_KEY,
      authDomain: values.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: values.VITE_FIREBASE_PROJECT_ID,
      appId: values.VITE_FIREBASE_APP_ID,
    },
    useEmulators: values.VITE_USE_FIREBASE_EMULATORS === 'true',
  };
}

export const env = parseEnv(import.meta.env);
export const firebaseConfig: FirebaseConfig = env.firebaseConfig;
export const useEmulators = env.useEmulators;
