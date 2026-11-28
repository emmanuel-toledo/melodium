import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const LoginPage = lazy(() =>
  import('../pages/LoginPage').then((module) => ({
    default: module.LoginPage,
  })),
)

/** Public routes of the auth feature (FR-1). */
export const authRoutes: RouteObject[] = [
  { path: 'login', element: <LoginPage /> },
]
