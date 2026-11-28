import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const signInWithGoogleMock = vi.hoisted(() => vi.fn())

vi.mock('@/features/auth/apis/services/auth.service', () => ({
  signInWithGoogle: signInWithGoogleMock,
  signOutUser: vi.fn(),
  subscribeAuth: vi.fn(),
}))

import { DEFAULT_AUTH_ERROR } from '@/features/auth/utils/authErrors'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAuthStore } from '@/features/auth/stores/auth.store'

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ user: null, loading: false, error: null })
  })

  it('FR-6: en éxito no queda error y termina el loading', async () => {
    signInWithGoogleMock.mockResolvedValue(undefined)
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signInWithGoogle()
    })

    expect(signInWithGoogleMock).toHaveBeenCalledTimes(1)
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('FR-7: error sin código muestra el mensaje genérico en español', async () => {
    signInWithGoogleMock.mockRejectedValue(new Error('fallo desconocido'))
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signInWithGoogle()
    })

    expect(result.current.error).toBe(DEFAULT_AUTH_ERROR)
    expect(result.current.loading).toBe(false)
  })

  it('FR-7: error de red muestra mensaje en español', async () => {
    signInWithGoogleMock.mockRejectedValue({
      code: 'auth/network-request-failed',
    })
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signInWithGoogle()
    })

    expect(result.current.error).toContain('conexión')
  })

  it('EC-4: cancelar el popup no muestra error', async () => {
    signInWithGoogleMock.mockRejectedValue({
      code: 'auth/popup-closed-by-user',
    })
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signInWithGoogle()
    })

    expect(result.current.error).toBeNull()
  })

  it('limpia el error anterior en un nuevo intento', async () => {
    useAuthStore.setState({ error: DEFAULT_AUTH_ERROR })
    signInWithGoogleMock.mockResolvedValue(undefined)
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signInWithGoogle()
    })

    expect(result.current.error).toBeNull()
  })

  it('mientras el sign-in está en curso, loading es true', async () => {
    let resolve!: () => void
    signInWithGoogleMock.mockReturnValue(
      new Promise<void>((r) => {
        resolve = r
      }),
    )
    const { result } = renderHook(() => useAuth())

    act(() => {
      void result.current.signInWithGoogle()
    })

    await waitFor(() => expect(result.current.loading).toBe(true))

    await act(async () => {
      resolve()
    })

    expect(result.current.loading).toBe(false)
  })
})
