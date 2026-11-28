import { defineConfig, devices } from '@playwright/test'

/**
 * E2E against a production build + Firebase Auth Emulator (plan D9).
 * `VITE_USE_FIREBASE_EMULATOR=true` is baked into the build so the client
 * connects to the local emulator instead of production Firebase.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command:
        'pnpm exec firebase emulators:start --only auth --project melodium-development',
      url: 'http://localhost:9099',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command:
        'VITE_USE_FIREBASE_EMULATOR=true pnpm build && pnpm preview --port 4173 --strictPort',
      url: 'http://localhost:4173',
      reuseExistingServer: true,
      timeout: 180_000,
    },
  ],
})
