import { create } from 'zustand'

/**
 * Shared, domain-agnostic session signal (see plan D1/D11/D13).
 * - `auth` feature writes `isAuthenticated` / `loading` and reacts to
 *   `logoutRequestId`.
 * - Any feature may call `requestLogout()` without importing `auth`.
 * User data stays in `features/auth` until the promotion gate is met.
 */
interface SessionState {
  isAuthenticated: boolean
  /** true until the first auth state resolution (avoids redirect flash). */
  loading: boolean
  /** Incremented by `requestLogout()`; consumed by the auth feature. */
  logoutRequestId: number
  setAuthenticated: (isAuthenticated: boolean) => void
  setLoading: (loading: boolean) => void
  requestLogout: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  isAuthenticated: false,
  loading: true,
  logoutRequestId: 0,
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setLoading: (loading) => set({ loading }),
  requestLogout: () =>
    set((state) => ({ logoutRequestId: state.logoutRequestId + 1 })),
}))
