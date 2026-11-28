import { useSessionStore } from '@/shared/stores/session.store'
import { signOutUser, subscribeAuth } from '../apis/services/auth.service'
import { useAuthStore } from '../stores/auth.store'

let dispose: (() => void) | null = null

interface InitAuthSessionOptions {
  /** Called when an active session ends (logout or expiry) — used to clear caches. */
  onSignOut?: () => void
}

/**
 * Wires Firebase auth to the stores, outside React (no effects):
 * - `onAuthStateChanged` → `auth.store` + `session.store` (FR-6, AC-5).
 * - `session.store.requestLogout()` → `signOut` (plan D11: features ask the
 *   shared session store to log out; the auth feature performs it).
 *
 * Idempotent: returns the existing cleanup if already initialized.
 */
export function initAuthSession(
  options: InitAuthSessionOptions = {},
): () => void {
  if (dispose) return dispose

  let hadUser = useAuthStore.getState().user !== null

  const unsubscribeAuth = subscribeAuth((user) => {
    const sessionEnded = hadUser && user === null
    hadUser = user !== null

    useAuthStore.getState().setUser(user)
    useSessionStore.getState().setAuthenticated(user !== null)
    useSessionStore.getState().setLoading(false)

    if (sessionEnded) options.onSignOut?.()
  })

  const unsubscribeLogout = useSessionStore.subscribe((state, previous) => {
    if (state.logoutRequestId > previous.logoutRequestId) {
      // La limpieza de caché (onSignOut) ocurre al confirmarse el cambio de
      // estado de auth; aquí solo se pide el cierre de sesión.
      void signOutUser().catch(() => undefined)
    }
  })

  dispose = () => {
    unsubscribeAuth()
    unsubscribeLogout()
    dispose = null
  }
  return dispose
}
