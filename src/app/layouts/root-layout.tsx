import { Link, Outlet } from 'react-router';
import { Toaster } from 'sonner';

import { APP_NAME } from '@/app/config/app';

export function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:ring-2 focus:ring-ring"
      >
        Saltar al contenido
      </a>
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center px-4">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            {APP_NAME}
          </Link>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
