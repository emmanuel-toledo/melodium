import { act, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { RootLayout } from '@/app/layouts/RootLayout'

function renderLayout(initialPath = '/') {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <RootLayout />,
        children: [
          { index: true, element: <h1>Inicio</h1> },
          { path: 'acordes', element: <h1>Acordes</h1> },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  )
  render(<RouterProvider router={router} />)
  return router
}

describe('RootLayout', () => {
  it('define los landmarks de nivel superior', () => {
    renderLayout()

    expect(
      screen.getByRole('link', { name: 'Saltar al contenido principal' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /cambiar tema/i }),
    ).toBeInTheDocument()
  })

  it('muestra el fallback de Suspense durante la carga de la ruta', () => {
    renderLayout('/acordes')

    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('enfoca <main> al cargar la ruta (sin useEffect)', () => {
    renderLayout('/acordes')

    expect(document.activeElement).toBe(screen.getByRole('main'))
  })

  it('enfoca <main> tras navegar a otra ruta', async () => {
    const router = renderLayout('/')

    await act(async () => {
      await router.navigate('/acordes')
    })

    expect(document.activeElement).toBe(screen.getByRole('main'))
    expect(
      screen.getByRole('heading', { name: 'Acordes' }),
    ).toBeInTheDocument()
  })
})
