import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '@/app/App'
import { router } from '@/routes/app.router'
import { useSessionStore } from '@/shared/stores/session.store'

describe('app router (composición)', () => {
  beforeEach(async () => {
    useSessionStore.setState({
      isAuthenticated: false,
      loading: false,
      logoutRequestId: 0,
    })
    await router.navigate('/login')
  })

  it('AC-1: / sin sesión redirige a /login', async () => {
    await router.navigate('/')
    render(<App />)

    await waitFor(() => expect(window.location.pathname).toBe('/login'))
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Melodium' }),
    ).toBeInTheDocument()
  })

  it('AC-5: / con sesión muestra el home sin volver a iniciar sesión', async () => {
    useSessionStore.setState({ isAuthenticated: true })
    await router.navigate('/')
    render(<App />)

    expect(
      await screen.findByRole('heading', { name: 'Hola mundo' }),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
  })

  it('FR-3: /login con sesión redirige a /', async () => {
    useSessionStore.setState({ isAuthenticated: true })
    await router.navigate('/login')
    render(<App />)

    await waitFor(() => expect(window.location.pathname).toBe('/'))
    expect(
      await screen.findByRole('heading', { name: 'Hola mundo' }),
    ).toBeInTheDocument()
  })

  it('muestra la página 404 para rutas desconocidas', async () => {
    await router.navigate('/ruta-que-no-existe')
    render(<App />)

    expect(
      await screen.findByRole('heading', { name: 'Página no encontrada' }),
    ).toBeInTheDocument()
  })

  it('FR-8: el toggle de tema está disponible en todas las rutas', async () => {
    await router.navigate('/login')
    render(<App />)

    expect(
      await screen.findByRole('button', { name: /cambiar tema/i }),
    ).toBeInTheDocument()
  })
})
