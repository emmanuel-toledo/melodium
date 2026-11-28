import { describe, expect, it, vi } from 'vitest'

describe('shared/config/env', () => {
  it('expone la config de Firebase y el flag del emulador', async () => {
    vi.stubEnv('VITE_USE_FIREBASE_EMULATOR', 'false')
    vi.resetModules()
    const { env } = await import('@/shared/config/env')

    expect(typeof env.firebase.apiKey).toBe('string')
    expect(env.firebase.apiKey.length).toBeGreaterThan(0)
    expect(typeof env.firebase.projectId).toBe('string')
    expect(env.useFirebaseEmulator).toBe(false)
    expect(env.firebaseEmulatorUrl).toMatch(/^https?:\/\//)
  })

  it('activa el emulador con VITE_USE_FIREBASE_EMULATOR=true', async () => {
    vi.stubEnv('VITE_USE_FIREBASE_EMULATOR', 'true')
    vi.resetModules()
    const { env } = await import('@/shared/config/env')
    expect(env.useFirebaseEmulator).toBe(true)
  })

  it('permite sobrescribir la URL del emulador (p. ej. Docker)', async () => {
    vi.stubEnv('VITE_FIREBASE_EMULATOR_URL', 'http://host.docker.internal:9099')
    vi.resetModules()
    const { env } = await import('@/shared/config/env')
    expect(env.firebaseEmulatorUrl).toBe('http://host.docker.internal:9099')
  })

  it('falla rápido si falta una variable requerida', async () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', '')
    vi.resetModules()
    await expect(import('@/shared/config/env')).rejects.toThrow(
      'VITE_FIREBASE_API_KEY',
    )
  })
})
