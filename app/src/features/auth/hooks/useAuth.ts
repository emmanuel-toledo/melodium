import { useCallback } from 'react'
import { signInWithGoogle as signInWithGoogleService } from '../apis/services/auth.service'
import { useAuthStore } from '../stores/auth.store'
import { getAuthErrorCode, getAuthErrorMessage } from '../utils/authErrors'

interface UseAuth {
  user: ReturnType<typeof useAuthStore.getState>['user']
  loading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
}

/** Orchestrates the auth service and the auth store (react-feature). */
export function useAuth(): UseAuth {
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const error = useAuthStore((state) => state.error)

  const signInWithGoogle = useCallback(async () => {
    useAuthStore.getState().setLoading(true)
    useAuthStore.getState().setError(null)
    try {
      await signInWithGoogleService()
      // Éxito: la sesión la resuelve subscribeAuth (initAuthSession).
    } catch (error_) {
      // EC-4: cancelación → mensaje null → sin banner de error.
      const message = getAuthErrorMessage(getAuthErrorCode(error_))
      useAuthStore.getState().setError(message)
    } finally {
      useAuthStore.getState().setLoading(false)
    }
  }, [])

  return { user, loading, error, signInWithGoogle }
}
