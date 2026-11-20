import { Suspense } from 'react';
import { Link, Navigate, Outlet } from 'react-router';

import { AuthLoading } from '../components/auth-loading';
import { useAuth } from '../hooks/use-auth';

export function AuthLayout() {
  const { status } = useAuth();

  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-muted/30">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:ring-2 focus:ring-ring"
      >
        Saltar al contenido
      </a>
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center px-4">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            Melodium
          </Link>
        </div>
      </header>
      <main id="main" className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-sm sm:p-8">
          {status === 'loading' ? (
            <AuthLoading />
          ) : (
            <Suspense fallback={<AuthLoading />}>
              <Outlet />
            </Suspense>
          )}
        </div>
      </main>
      <footer className="border-t bg-background">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-center px-4 text-sm text-muted-foreground">
          <Link to="/" className="underline-offset-4 hover:underline">
            Volver al inicio
          </Link>
        </div>
      </footer>
    </div>
  );
}
