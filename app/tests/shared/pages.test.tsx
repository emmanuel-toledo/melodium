import { axe } from 'jest-axe'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { RouteErrorBoundary } from '@/shared/components/feedback/RouteErrorBoundary'
import { NotFound } from '@/shared/pages/NotFound'

describe('NotFound', () => {
  it('muestra el 404 en español con enlace al inicio', () => {
    const router = createMemoryRouter([{ path: '*', element: <NotFound /> }])
    render(<RouterProvider router={router} />)

    expect(
      screen.getByRole('heading', { name: 'Página no encontrada' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toBeInTheDocument()
  })

  it('no tiene violaciones de accesibilidad', async () => {
    const router = createMemoryRouter([{ path: '*', element: <NotFound /> }])
    const { container } = render(<RouterProvider router={router} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('RouteErrorBoundary', () => {
  function renderError(error: unknown) {
    const router = createMemoryRouter([
      { path: '*', element: <RouteErrorBoundary error={error} /> },
    ])
    render(<RouterProvider router={router} />)
  }

  it('muestra el mensaje del error en español', () => {
    renderError(new Error('Fallo del router'))

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Algo salió mal' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Fallo del router')).toBeInTheDocument()
  })

  it('usa un mensaje genérico si el error no es una Error', () => {
    renderError('algo raro')

    expect(screen.getByText('Error inesperado en la ruta.')).toBeInTheDocument()
  })
})
