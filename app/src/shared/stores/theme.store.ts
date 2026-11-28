import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** User preference stored in `localStorage` (key: `theme`). */
export type ThemePreference = 'light' | 'dark' | 'system'
/** Theme actually applied to `<html class="dark">`. */
export type ResolvedTheme = 'light' | 'dark'

interface ThemeState {
  theme: ThemePreference
  setTheme: (theme: ThemePreference) => void
}

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme',
      partialize: (state) => ({ theme: state.theme }),
      // EC-3: stored value invalid/corrupt → fallback to `system`.
      merge: (persisted, current) => {
        const stored = (persisted as { theme?: unknown } | undefined)?.theme
        return {
          ...current,
          theme: isThemePreference(stored) ? stored : 'system',
        }
      },
    },
  ),
)

export function resolveTheme(
  preference: ThemePreference,
  prefersDark: boolean,
): ResolvedTheme {
  if (preference === 'system') return prefersDark ? 'dark' : 'light'
  return preference
}

export function applyTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved
}

let disposeTheme: (() => void) | null = null

/**
 * Applies the stored theme to `<html>` and keeps it in sync with the store
 * and with `prefers-color-scheme`. Idempotent; returns a cleanup for tests.
 * Runs outside React (no effects).
 */
export function initTheme(): () => void {
  if (disposeTheme) return disposeTheme

  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const sync = () =>
    applyTheme(resolveTheme(useThemeStore.getState().theme, media.matches))

  sync()
  const unsubscribe = useThemeStore.subscribe(sync)
  const onMediaChange = () => sync()
  media.addEventListener('change', onMediaChange)

  disposeTheme = () => {
    unsubscribe()
    media.removeEventListener('change', onMediaChange)
    disposeTheme = null
  }
  return disposeTheme
}
