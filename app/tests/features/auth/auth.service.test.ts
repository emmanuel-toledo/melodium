import { beforeEach, describe, expect, it, vi } from 'vitest'

const { signInWithPopupMock, signOutMock, onAuthStateChangedMock } = vi.hoisted(
  () => ({
    signInWithPopupMock: vi.fn(),
    signOutMock: vi.fn(),
    onAuthStateChangedMock: vi.fn(),
  }),
)

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  connectAuthEmulator: vi.fn(),
  GoogleAuthProvider: class GoogleAuthProvider {},
  signInWithPopup: signInWithPopupMock,
  signOut: signOutMock,
  onAuthStateChanged: onAuthStateChangedMock,
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
}))

import {
  mapFirebaseUser,
  signInWithGoogle,
  signOutUser,
  subscribeAuth,
} from '@/features/auth/apis/services/auth.service'

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('mapFirebaseUser', () => {
    it('devuelve null para sesión cerrada', () => {
      expect(mapFirebaseUser(null)).toBeNull()
    })

    it('mapea los campos del usuario de Firebase al dominio', () => {
      const mapped = mapFirebaseUser({
        uid: 'uid-1',
        displayName: 'Ana Guitarra',
        email: 'ana@example.com',
        photoURL: 'https://example.com/foto.png',
      } as never)

      expect(mapped).toEqual({
        uid: 'uid-1',
        displayName: 'Ana Guitarra',
        email: 'ana@example.com',
        photoURL: 'https://example.com/foto.png',
      })
    })
  })

  it('FR-5: signInWithGoogle abre el popup con el provider de Google', async () => {
    signInWithPopupMock.mockResolvedValue(undefined)

    await signInWithGoogle()

    expect(signInWithPopupMock).toHaveBeenCalledTimes(1)
    expect(signInWithPopupMock.mock.calls[0][1]).toBeDefined()
  })

  it('FR-10: signOutUser cierra la sesión', async () => {
    signOutMock.mockResolvedValue(undefined)

    await signOutUser()

    expect(signOutMock).toHaveBeenCalledTimes(1)
  })

  it('subscribeAuth traduce el usuario antes de notificar', () => {
    const callback = vi.fn()
    subscribeAuth(callback)

    expect(onAuthStateChangedMock).toHaveBeenCalledTimes(1)
    const handler = onAuthStateChangedMock.mock.calls[0][1]
    handler({
      uid: 'uid-2',
      displayName: 'Luis',
      email: null,
      photoURL: null,
    })
    handler(null)

    expect(callback).toHaveBeenNthCalledWith(1, {
      uid: 'uid-2',
      displayName: 'Luis',
      email: null,
      photoURL: null,
    })
    expect(callback).toHaveBeenNthCalledWith(2, null)
  })
})
