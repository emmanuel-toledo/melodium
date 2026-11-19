import { createBrowserRouter, isRouteErrorResponse, useRouteError } from 'react-router';
import type { RouteObject } from 'react-router';

import { RootLayout } from '@/app/layouts/root-layout';
import { HomePage } from '@/app/routes/home-page';
import { NotFoundPage } from '@/app/routes/not-found-page';
import { Button } from '@/shared/components/ui/button';

function RouteErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `No se pudo cargar la página (error ${error.status}).`
    : 'Ha ocurrido un error inesperado.';

  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Algo salió mal</h1>
      <p className="mt-2 text-muted-foreground">{message}</p>
      <Button asChild className="mt-6">
        <a href="/">Volver al inicio</a>
      </Button>
    </main>
  );
}

export const routes: RouteObject[] = [
  {
    path: '/',
    Component: RootLayout,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      { index: true, Component: HomePage },
      { path: '*', Component: NotFoundPage },
    ],
  },
];

export const router = createBrowserRouter(routes);
