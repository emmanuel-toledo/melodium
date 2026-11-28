import { beforeEach, describe, expect, it, vi } from 'vitest'

const getAuthMock = vi.fn(() => ({}))
const connectAuthEmulatorMock = vi.fn()
const getFirestoreMock = vi.fn(() => ({}))
const initializeAppMock = vi.fn(() => ({}))
const getAppsMock = vi.fn((): unknown[] => [])
const getAppMock = vi.fn(() => ({}))

vi.mock('firebase/app', () => ({
  initializeApp: initializeAppMock,
  getApp: getAppMock,
  getApps: getAppsMock,
}))

vi.mock('firebase/auth', () => ({
  getAuth: getAuthMock,
  connectAuthEmulator: connectAuthEmulatorMock,
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: getFirestoreMock,
}))

describe('shared/apis/firebase/client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('inicializa la app y exporta auth y db (singleton)', async () => {
    vi.stubEnv('VITE_USE_FIREBASE_EMULATOR', 'false')
    const client = await import('@/shared/apis/firebase/client')

    expect(initializeAppMock).toHaveBeenCalledTimes(1)
    expect(client.auth).toBeDefined()
    expect(client.db).toBeDefined()
    expect(connectAuthEmulatorMock).not.toHaveBeenCalled()
  })

  it('reutiliza la app existente si ya hay una inicializada', async () => {
    vi.stubEnv('VITE_USE_FIREBASE_EMULATOR', 'false')
    getAppsMock.mockReturnValue([{}])
    await import('@/shared/apis/firebase/client')

    expect(initializeAppMock).not.toHaveBeenCalled()
    expect(getAppMock).toHaveBeenCalledTimes(1)
  })

  it('conecta el emulador de Auth solo con el flag activo', async () => {
    vi.stubEnv('VITE_USE_FIREBASE_EMULATOR', 'true')
    vi.stubEnv('VITE_FIREBASE_EMULATOR_URL', 'http://localhost:9099')
    await import('@/shared/apis/firebase/client')

    expect(connectAuthEmulatorMock).toHaveBeenCalledWith(
      expect.anything(),
      'http://localhost:9099',
      { disableWarnings: true },
    )
  })
})
