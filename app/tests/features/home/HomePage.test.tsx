import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { beforeEach, describe, expect, it } from 'vitest'
import { HomePage } from '@/features/home/pages/HomePage'
import { useSessionStore } from '@/shared/stores/session.store'

describe('HomePage', () => {
  beforeEach(() => {
    useSessionStore.setState({
      isAuthenticated: true,
      loading: false,
      logoutRequestId: 0,
    })
  })

  it('FR-10: muestra "Hola mundo"', () => {
    render(<HomePage />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Hola mundo' }),
    ).toBeInTheDocument()
  })

  it('FR-10: el botón de logout pide cerrar sesión vía session store', async () => {
    const user = userEvent.setup()
    render(<HomePage />)

    await user.click(
      screen.getByRole('button', { name: 'Cerrar sesión' }),
    )

    expect(useSessionStore.getState().logoutRequestId).toBe(1)
  })

  it('no tiene violaciones de accesibilidad (axe)', async () => {
    const { container } = render(<HomePage />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
