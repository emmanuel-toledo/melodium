import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { RequireAuth } from '@/shared/components/routes/RequireAuth'
import { useSessionStore } from '@/shared/stores/session.store'

function renderGuard(isAuthenticated: boolean, loading: boolean) {
  useSessionStore.setState({ isAuthenticated, loading, logoutRequestId: 0 })
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <RequireAuth />,
        children: [{ index: true, element: <p>Contenido privado</p> }],
      },
      { path: '/login', element: <p>Pantalla de login</p> },
    ],
    { initialEntries: ['/'] },
  )
  render(<RouterProvider router={router} />)
  return router
}

describe('RequireAuth', () => {
  beforeEach(() => {
    useSessionStore.setState({
      isAuthenticated: false,
      loading: true,
      logoutRequestId: 0,
    })
  })

  it('muestra un estado de carga mientras se resuelve la sesión', () => {
    renderGuard(false, true)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Cargando sesión…')).toBeInTheDocument()
    expect(screen.queryByText('Pantalla de login')).not.toBeInTheDocument()
  })

  it('FR-2: redirige a /login si no está autenticado', () => {
    renderGuard(false, false)

    expect(screen.getByText('Pantalla de login')).toBeInTheDocument()
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument()
  })

  it('renderiza la ruta protegida si está autenticado', () => {
    renderGuard(true, false)

    expect(screen.getByText('Contenido privado')).toBeInTheDocument()
    expect(screen.queryByText('Pantalla de login')).not.toBeInTheDocument()
  })
})
