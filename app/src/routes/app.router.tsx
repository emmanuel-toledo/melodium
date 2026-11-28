import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/app/layouts/RootLayout'
import { authRoutes } from '@/features/auth'
import { RouteErrorBoundary } from '@/shared/components/feedback/RouteErrorBoundary'
import { NotFound } from '@/shared/pages/NotFound'
import { protectedRoutes } from './protected.router'

/** Composes feature routes into the app router (app layer). */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      ...authRoutes,
      ...protectedRoutes,
      { path: '*', element: <NotFound /> },
    ],
  },
])
