import { initAuthSession } from '@/features/auth'
import { initTheme } from '@/shared/stores/theme.store'
import { queryClient } from './queryClient'

let disposeBootstrap: (() => void) | null = null

/**
 * Wires app-wide listeners outside React (no effects, plan D15):
 * - theme: applies and syncs the light/dark preference (FR-8, FR-9).
 * - auth: syncs Firebase auth with the stores and clears the React Query
 *   cache when a session ends (D14).
 *
 * Idempotent; called once from `main.tsx` before rendering.
 */
export function bootstrapApp(): void {
  if (disposeBootstrap) return

  initTheme()
  const disposeAuth = initAuthSession({
    onSignOut: () => queryClient.clear(),
  })

  disposeBootstrap = () => {
    disposeAuth()
    disposeBootstrap = null
  }
}
