import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@/features/auth/stores/auth.store'

describe('auth.store', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, loading: false, error: null })
  })

  it('empieza sin usuario, sin loading y sin error', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('setUser / setLoading / setError actualizan el estado', () => {
    useAuthStore.getState().setUser({
      uid: 'u1',
      displayName: 'Ana',
      email: 'ana@example.com',
      photoURL: null,
    })
    useAuthStore.getState().setLoading(true)
    useAuthStore.getState().setError('Fallo')

    const state = useAuthStore.getState()
    expect(state.user?.uid).toBe('u1')
    expect(state.loading).toBe(true)
    expect(state.error).toBe('Fallo')
  })

  it('permite volver al estado inicial', () => {
    useAuthStore.getState().setUser({
      uid: 'u1',
      displayName: null,
      email: null,
      photoURL: null,
    })
    useAuthStore.getState().setError('Fallo')

    useAuthStore.getState().setUser(null)
    useAuthStore.getState().setError(null)

    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().error).toBeNull()
  })
})
