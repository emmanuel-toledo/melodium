import type { RouteObject } from 'react-router-dom'
import { homeRoutes } from '@/features/home'
import { RequireAuth } from '@/shared/components/routes/RequireAuth'

/**
 * Centralizes route guards (react-routing): everything declared here requires
 * an authenticated session; unauthenticated users are redirected to `/login`.
 */
export const protectedRoutes: RouteObject[] = [
  { element: <RequireAuth />, children: homeRoutes },
]
