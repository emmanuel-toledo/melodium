import { Monitor, Moon, Sun } from 'lucide-react'
import {
  useThemeStore,
  type ThemePreference,
} from '@/shared/stores/theme.store'
import { cn } from '@/shared/utils/cn'

const CYCLE: ThemePreference[] = ['system', 'light', 'dark']

const NAMES: Record<ThemePreference, string> = {
  system: 'sistema',
  light: 'claro',
  dark: 'oscuro',
}

/**
 * Cycles theme: sistema → claro → oscuro → sistema.
 * Lives in the root layout header (global, FR-8).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)

  const currentIndex = CYCLE.indexOf(theme)
  const next = CYCLE[(currentIndex + 1) % CYCLE.length]
  const Icon = theme === 'system' ? Monitor : theme === 'light' ? Sun : Moon

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Cambiar tema. Actual: ${NAMES[theme]}. Siguiente: ${NAMES[next]}`}
      className={cn(
        'inline-flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'cursor-pointer',
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-4" />
    </button>
  )
}
