import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  applyTheme,
  initTheme,
  resolveTheme,
  useThemeStore,
  type ThemePreference,
} from '@/shared/stores/theme.store'

describe('theme.store', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'system' })
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = ''
  })

  it('empieza en `system`', () => {
    expect(useThemeStore.getState().theme).toBe('system')
  })

  it('setTheme actualiza el estado y persiste en localStorage', () => {
    useThemeStore.getState().setTheme('dark')
    expect(useThemeStore.getState().theme).toBe('dark')

    const stored = JSON.parse(localStorage.getItem('theme') ?? '{}')
    expect(stored.state.theme).toBe('dark')
  })

  it('resolveTheme deriva light/dark según la preferencia y el sistema', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
  })

  it('applyTheme alterna la clase `dark` y color-scheme en <html>', () => {
    applyTheme('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')

    applyTheme('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.style.colorScheme).toBe('light')
  })

  it('initTheme aplica el tema y reacciona a cambios del store', () => {
    const dispose = initTheme()
    initTheme() // idempotente

    useThemeStore.getState().setTheme('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    useThemeStore.getState().setTheme('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    dispose()
  })

  it('EC-3: valor corrupto en localStorage cae a `system`', async () => {
    localStorage.setItem('theme', 'no-es-json')
    vi.resetModules()
    const fresh = await import('@/shared/stores/theme.store')
    expect(fresh.useThemeStore.getState().theme).toBe('system')
  })

  it('EC-3: valor inválido en el almacenamiento cae a `system`', async () => {
    localStorage.setItem(
      'theme',
      JSON.stringify({ state: { theme: 'purple' }, version: 0 }),
    )
    vi.resetModules()
    const fresh = await import('@/shared/stores/theme.store')
    const stored: ThemePreference = fresh.useThemeStore.getState().theme
    expect(stored).toBe('system')
  })
})
