import { beforeEach, describe, expect, it, vi } from 'vitest'

const { initThemeMock, initAuthSessionMock, disposeAuthMock } = vi.hoisted(
  () => ({
    initThemeMock: vi.fn(() => vi.fn()),
    initAuthSessionMock: vi.fn(),
    disposeAuthMock: vi.fn(),
  }),
)

vi.mock('@/shared/stores/theme.store', () => ({
  initTheme: initThemeMock,
}))

vi.mock('@/features/auth', () => ({
  initAuthSession: initAuthSessionMock,
}))

/** Importa una instancia fresca (bootstrap es idempotente por módulo). */
async function loadBootstrap() {
  vi.resetModules()
  const [{ bootstrapApp }, { queryClient }] = await Promise.all([
    import('@/app/bootstrap'),
    import('@/app/queryClient'),
  ])
  return { bootstrapApp, queryClient }
}

describe('bootstrapApp', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    initAuthSessionMock.mockReturnValue(disposeAuthMock)
  })

  it('inicializa tema y auth una sola vez (idempotente)', async () => {
    const { bootstrapApp } = await loadBootstrap()

    bootstrapApp()
    bootstrapApp()

    expect(initThemeMock).toHaveBeenCalledTimes(1)
    expect(initAuthSessionMock).toHaveBeenCalledTimes(1)
  })

  it('D14: registra un onSignOut que limpia la caché de React Query', async () => {
    const { bootstrapApp, queryClient } = await loadBootstrap()
    const clearSpy = vi.spyOn(queryClient, 'clear')

    bootstrapApp()

    const { onSignOut } = initAuthSessionMock.mock.calls[0][0] as {
      onSignOut: () => void
    }
    expect(typeof onSignOut).toBe('function')

    onSignOut()

    expect(clearSpy).toHaveBeenCalledTimes(1)
    clearSpy.mockRestore()
  })
})
