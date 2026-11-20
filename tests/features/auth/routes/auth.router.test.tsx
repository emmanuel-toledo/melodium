import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

vi.mock('@/features/auth/hooks/use-auth', () => ({
  useAuth: mocks.useAuth,
}));

import { authRoutes } from '@/features/auth/routes/auth.router';

function mockStatus(status: 'loading' | 'authenticated' | 'unauthenticated') {
  mocks.useAuth.mockReturnValue({ status });
}

function renderRoutes(initialEntries: string[]) {
  const router = createMemoryRouter([...authRoutes, { path: '/', element: <p>Inicio</p> }], {
    initialEntries,
  });

  render(<RouterProvider router={router} />);

  return router;
}

describe('authRoutes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStatus('unauthenticated');
  });

  it('renders the login page on /login', async () => {
    renderRoutes(['/login']);

    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument();
  });

  it('renders the register page on /register', async () => {
    renderRoutes(['/register']);

    expect(await screen.findByRole('heading', { name: 'Crea tu cuenta' })).toBeInTheDocument();
  });

  it('renders the reset page on /reset-password', async () => {
    renderRoutes(['/reset-password']);

    expect(
      await screen.findByRole('heading', { name: 'Recupera tu contraseña' }),
    ).toBeInTheDocument();
  });

  it('redirects authenticated users visiting /login to home', async () => {
    mockStatus('authenticated');

    renderRoutes(['/login']);

    expect(await screen.findByText('Inicio')).toBeInTheDocument();
  });

  it('redirects authenticated users visiting /register to home', async () => {
    mockStatus('authenticated');

    renderRoutes(['/register']);

    expect(await screen.findByText('Inicio')).toBeInTheDocument();
  });

  it('redirects authenticated users visiting /reset-password to home', async () => {
    mockStatus('authenticated');

    renderRoutes(['/reset-password']);

    expect(await screen.findByText('Inicio')).toBeInTheDocument();
  });
});
