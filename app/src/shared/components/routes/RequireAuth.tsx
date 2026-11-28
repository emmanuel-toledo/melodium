import { Navigate, Outlet } from 'react-router-dom'
import { useSessionStore } from '@/shared/stores/session.store'

/**
 * Route guard (criterion: authenticated). Centralized in `routes/protected.router.tsx`.
 * Redirect is declarative — no `useEffect` (plan D15).
 */
export function RequireAuth() {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated)
  const loading = useSessionStore((state) => state.loading)

  if (loading) {
    return (
      <div
        role="status"
        className="flex min-h-[50vh] items-center justify-center text-muted-foreground"
      >
        <span
          aria-hidden="true"
          className="size-8 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
        />
        <span className="sr-only">Cargando sesión…</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
