import { Link, Outlet } from 'react-router';

import { APP_NAME } from '@/app/config/app';
import { UserMenu, useAuth } from '@/features/auth';

export function RootLayout() {
  const { status, user } = useAuth();

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:ring-2 focus:ring-ring"
      >
        Saltar al contenido
      </a>
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            {APP_NAME}
          </Link>
          <div className="flex items-center">
            {status === 'loading' ? (
              <span
                aria-hidden="true"
                className="inline-block size-8 animate-pulse rounded-full bg-muted"
              />
            ) : user ? (
              <UserMenu />
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
