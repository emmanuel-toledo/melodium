import { Suspense, useCallback } from 'react'
import { Music2 } from 'lucide-react'
import { Link, Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { Spinner } from '@/shared/components/shadcn/ui/spinner'
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle'

function RouteFallback() {
  return (
    <div
      role="status"
      className="flex min-h-[50vh] items-center justify-center"
    >
      <Spinner aria-label="Cargando página…" className="size-8 text-primary" />
      <span className="sr-only">Cargando página…</span>
    </div>
  )
}

/**
 * Root layout: top-level landmarks (skip link, header, main, footer),
 * theme toggle and route-level `<Suspense>`.
 */
export function RootLayout() {
  const location = useLocation()

  // Enfoca <main> en cada navegación: `key` remonta <main> por ruta y el ref
  // callback lo enfoca (event-driven, sin useEffect; react-a11y).
  const focusMain = useCallback((element: HTMLElement | null) => {
    element?.focus()
  }, [])

  return (
    <div className="flex min-h-svh flex-col">
      <ScrollRestoration />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Saltar al contenido principal
      </a>

      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-heading text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Music2 aria-hidden="true" className="size-5 text-primary" />
            Melodium
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main
        id="main-content"
        key={location.pathname}
        ref={focusMain}
        tabIndex={-1}
        className="flex-1 outline-none"
      >
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        Melodium — Composiciones musicales en un solo lugar
      </footer>
    </div>
  )
}
