import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const HomePage = lazy(() =>
  import('../pages/HomePage').then((module) => ({
    default: module.HomePage,
  })),
)

/** Protected route of the home feature (`/`, FR-10). */
export const homeRoutes: RouteObject[] = [{ index: true, element: <HomePage /> }]
