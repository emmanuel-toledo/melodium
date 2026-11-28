import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle'
import { useThemeStore } from '@/shared/stores/theme.store'

describe('ThemeToggle', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'system' })
  })

  it('FR-8: muestra el tema actual en el nombre accesible', () => {
    render(<ThemeToggle />)

    expect(
      screen.getByRole('button', { name: /actual: sistema/i }),
    ).toBeInTheDocument()
  })

  it('FR-8: cicla sistema → claro → oscuro → sistema', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    const button = screen.getByRole('button')

    await user.click(button)
    expect(useThemeStore.getState().theme).toBe('light')

    await user.click(button)
    expect(useThemeStore.getState().theme).toBe('dark')

    await user.click(button)
    expect(useThemeStore.getState().theme).toBe('system')
  })

  it('es operable con teclado (Enter)', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    screen.getByRole('button').focus()
    await user.keyboard('{Enter}')

    expect(useThemeStore.getState().theme).toBe('light')
  })
})
