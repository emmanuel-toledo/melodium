import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { signInWithGoogleMock } = vi.hoisted(() => ({
  signInWithGoogleMock: vi.fn(),
}))

vi.mock('@/features/auth/apis/services/auth.service', () => ({
  signInWithGoogle: signInWithGoogleMock,
  signOutUser: vi.fn(),
  subscribeAuth: vi.fn(),
}))

import { LoginPage } from '@/features/auth/pages/LoginPage'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { useSessionStore } from '@/shared/stores/session.store'

function renderLogin() {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <LoginPage /> },
      { path: '/', element: <p>Inicio privado</p> },
    ],
    { initialEntries: ['/login'] },
  )
  const result = render(<RouterProvider router={router} />)
  return { ...result, router }
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ user: null, loading: false, error: null })
    useSessionStore.setState({
      isAuthenticated: false,
      loading: false,
      logoutRequestId: 0,
    })
  })

  it('FR-4: muestra la marca y el tagline', () => {
    renderLogin()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Melodium' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Tu cuaderno de acordes, siempre contigo.'),
    ).toBeInTheDocument()
  })

  it('FR-5: muestra el botón de Google', () => {
    renderLogin()

    expect(
      screen.getByRole('button', { name: 'Continuar con Google' }),
    ).toBeInTheDocument()
  })

  it('no tiene violaciones de accesibilidad (axe)', async () => {
    const { container } = renderLogin()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('FR-5: al hacer clic llama al sign-in con Google', async () => {
    signInWithGoogleMock.mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderLogin()

    await user.click(
      screen.getByRole('button', { name: 'Continuar con Google' }),
    )

    await waitFor(() => expect(signInWithGoogleMock).toHaveBeenCalledTimes(1))
  })

  it('muestra loading y deshabilita el botón durante el sign-in', async () => {
    signInWithGoogleMock.mockReturnValue(new Promise<void>(() => undefined))
    const user = userEvent.setup()
    renderLogin()

    await user.click(
      screen.getByRole('button', { name: 'Continuar con Google' }),
    )

    const button = screen.getByRole('button', { name: /iniciando sesión/i })
    expect(button).toBeDisabled()
  })

  it('FR-7: muestra el banner de error en español', () => {
    useAuthStore.setState({ error: 'No se pudo iniciar sesión con Google.' })
    renderLogin()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudo iniciar sesión con Google.',
    )
  })

  it('EC-4: cancelar el popup no muestra banner de error', async () => {
    signInWithGoogleMock.mockRejectedValue({
      code: 'auth/popup-closed-by-user',
    })
    const user = userEvent.setup()
    renderLogin()

    await user.click(
      screen.getByRole('button', { name: 'Continuar con Google' }),
    )

    await waitFor(() => expect(signInWithGoogleMock).toHaveBeenCalledTimes(1))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it.each([
    ['éxito', 'resolve' as const],
    ['cancelación', 'reject' as const],
  ])(
    'EC-5: el foco vuelve al botón tras cerrar el popup (%s)',
    async (_label, outcome) => {
      let settle: () => void = () => undefined
      signInWithGoogleMock.mockReturnValue(
        new Promise<void>((resolve, reject) => {
          settle = () => {
            if (outcome === 'resolve') resolve()
            else reject({ code: 'auth/popup-closed-by-user' })
          }
        }),
      )
      const user = userEvent.setup()
      renderLogin()

      const button = screen.getByRole('button', {
        name: 'Continuar con Google',
      })
      await user.click(button)

      // El popup roba el foco mientras está abierto (simulado con blur).
      button.blur()
      expect(button).not.toHaveFocus()

      settle()

      await waitFor(() => expect(button).toHaveFocus())
    },
  )

  it('FR-3: con sesión activa redirige a /', async () => {
    useSessionStore.setState({ isAuthenticated: true })
    renderLogin()

    await waitFor(() =>
      expect(screen.getByText('Inicio privado')).toBeInTheDocument(),
    )
  })
})
