import { beforeEach, describe, expect, it, vi } from 'vitest'

const { subscribeAuthMock, signOutUserMock, unsubscribeMock } = vi.hoisted(
  () => ({
    subscribeAuthMock: vi.fn(),
    signOutUserMock: vi.fn(),
    unsubscribeMock: vi.fn(),
  }),
)

vi.mock('@/features/auth/apis/services/auth.service', () => ({
  subscribeAuth: subscribeAuthMock,
  signOutUser: signOutUserMock,
}))

import { initAuthSession } from '@/features/auth/utils/initAuthSession'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { useSessionStore } from '@/shared/stores/session.store'

let lastDispose: (() => void) | null = null

/** Arranca la sesión (y guarda el dispose para limpiar entre tests). */
function start(options?: Parameters<typeof initAuthSession>[0]) {
  const dispose = initAuthSession(options)
  lastDispose = dispose
  return dispose
}

const authListener = (): ((user: unknown) => void) =>
  subscribeAuthMock.mock.calls[0][0] as (user: unknown) => void

describe('initAuthSession', () => {
  beforeEach(() => {
    lastDispose?.()
    lastDispose = null
    vi.clearAllMocks()
    subscribeAuthMock.mockReturnValue(unsubscribeMock)
    signOutUserMock.mockResolvedValue(undefined)
    useAuthStore.setState({ user: null, loading: false, error: null })
    useSessionStore.setState({
      isAuthenticated: false,
      loading: true,
      logoutRequestId: 0,
    })
  })

  it('se suscribe a la auth state y es idempotente', () => {
    const dispose = start()
    const disposeAgain = initAuthSession()

    expect(subscribeAuthMock).toHaveBeenCalledTimes(1)
    expect(disposeAgain).toBe(dispose)
  })

  it('FR-6/AC-5: sincroniza el usuario con los stores al iniciar sesión', () => {
    start()

    authListener()({
      uid: 'u1',
      displayName: 'Ana',
      email: 'ana@example.com',
      photoURL: null,
    })

    expect(useAuthStore.getState().user?.uid).toBe('u1')
    expect(useSessionStore.getState().isAuthenticated).toBe(true)
    expect(useSessionStore.getState().loading).toBe(false)
  })

  it('FR-2: al cerrar la sesión limpia stores y dispara onSignOut', () => {
    const onSignOut = vi.fn()
    start({ onSignOut })

    authListener()({
      uid: 'u1',
      displayName: null,
      email: null,
      photoURL: null,
    })
    authListener()(null)

    expect(useAuthStore.getState().user).toBeNull()
    expect(useSessionStore.getState().isAuthenticated).toBe(false)
    // D14: la caché se limpia cuando termina una sesión activa.
    expect(onSignOut).toHaveBeenCalledTimes(1)
  })

  it('no dispara onSignOut si nunca hubo sesión', () => {
    const onSignOut = vi.fn()
    start({ onSignOut })

    authListener()(null)

    expect(onSignOut).not.toHaveBeenCalled()
    expect(useSessionStore.getState().loading).toBe(false)
  })

  it('D11: requestLogout del session store ejecuta el signOut', () => {
    start()

    useSessionStore.getState().requestLogout()

    return vi
      .waitFor(() => expect(signOutUserMock).toHaveBeenCalledTimes(1))
  })

  it('D14: un fallo de signOut no rompe el flujo', async () => {
    signOutUserMock.mockRejectedValue(new Error('offline'))
    start()

    useSessionStore.getState().requestLogout()

    await vi.waitFor(() => expect(signOutUserMock).toHaveBeenCalledTimes(1))
  })

  it('el dispose cancela las suscripciones', () => {
    const dispose = start()
    dispose()

    expect(unsubscribeMock).toHaveBeenCalledTimes(1)
  })
})
