import { create } from 'zustand'
import type { AuthState, AuthUser } from '../interfaces/auth.interface'

interface AuthStore extends AuthState {
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

/** Auth domain state (plan D1: stays in the feature, not in shared). */
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  error: null,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))
