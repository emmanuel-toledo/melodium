import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

vi.mock('@/features/auth/hooks/use-auth', () => ({
  useAuth: mocks.useAuth,
}));

import { AuthLayout } from '@/features/auth/layouts/auth.layout';

function mockStatus(status: 'loading' | 'authenticated' | 'unauthenticated') {
  mocks.useAuth.mockReturnValue({ status });
}

function renderLayout() {
  const router = createMemoryRouter(
    [
      {
        path: '/auth',
        Component: AuthLayout,
        children: [{ index: true, element: <p>Formulario de acceso</p> }],
      },
      { path: '/', element: <p>Inicio</p> },
    ],
    { initialEntries: ['/auth'] },
  );

  render(<RouterProvider router={router} />);
}

describe('AuthLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the skip link and the main landmark', () => {
    mockStatus('unauthenticated');

    renderLayout();

    expect(screen.getByRole('link', { name: 'Saltar al contenido' })).toHaveAttribute(
      'href',
      '#main',
    );
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main');
  });

  it('renders the brand and the footer link to home', () => {
    mockStatus('unauthenticated');

    renderLayout();

    expect(screen.getByRole('link', { name: 'Melodium' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/');
  });

  it('shows the loading state while the session resolves', () => {
    mockStatus('loading');

    renderLayout();

    expect(screen.getByRole('status')).toHaveTextContent('Comprobando tu sesión…');
    expect(screen.queryByText('Formulario de acceso')).not.toBeInTheDocument();
  });

  it('renders the lazy child for unauthenticated users', () => {
    mockStatus('unauthenticated');

    renderLayout();

    expect(screen.getByText('Formulario de acceso')).toBeInTheDocument();
  });

  it('redirects authenticated users to home', async () => {
    mockStatus('authenticated');

    renderLayout();

    expect(await screen.findByText('Inicio')).toBeInTheDocument();
    expect(screen.queryByText('Formulario de acceso')).not.toBeInTheDocument();
  });
});
