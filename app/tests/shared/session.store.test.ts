import { beforeEach, describe, expect, it } from 'vitest'
import { useSessionStore } from '@/shared/stores/session.store'

describe('session.store', () => {
  beforeEach(() => {
    useSessionStore.setState({
      isAuthenticated: false,
      loading: true,
      logoutRequestId: 0,
    })
  })

  it('empieza sin sesión y en loading', () => {
    const state = useSessionStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.loading).toBe(true)
    expect(state.logoutRequestId).toBe(0)
  })

  it('setAuthenticated / setLoading actualizan el estado', () => {
    useSessionStore.getState().setAuthenticated(true)
    useSessionStore.getState().setLoading(false)

    const state = useSessionStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.loading).toBe(false)
  })

  it('requestLogout incrementa el contador que consume la feature auth', () => {
    useSessionStore.getState().requestLogout()
    useSessionStore.getState().requestLogout()
    expect(useSessionStore.getState().logoutRequestId).toBe(2)
  })
})
