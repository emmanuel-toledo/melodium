import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  initializeAuth: vi.fn(),
}));

vi.mock('@/features/auth', () => ({
  authRoutes: [
    {
      path: '/login',
      element: <p>Login route</p>,
    },
    {
      path: '/register',
      element: <p>Register route</p>,
    },
    {
      path: '/reset-password',
      element: <p>Reset route</p>,
    },
  ],
  useAuth: mocks.useAuth,
  initializeAuth: mocks.initializeAuth,
  UserMenu: () => <span>Menú de usuario</span>,
  RequireAuth: ({ children }: { children?: unknown }) => <>{children}</>,
}));

import { routes } from '@/app/routes/router';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });

  render(<RouterProvider router={router} />);
}

describe('application shell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useAuth.mockReturnValue({
      user: null,
      status: 'unauthenticated',
    });
  });

  it('renders the home page and the skip link on /', () => {
    renderAt('/');

    expect(screen.getByRole('heading', { name: 'Tu biblioteca musical' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Saltar al contenido' })).toHaveAttribute(
      'href',
      '#main',
    );
    expect(screen.getByRole('link', { name: 'Melodium' })).toHaveAttribute('href', '/');
  });

  it('renders the auth route on /login', () => {
    renderAt('/login');

    expect(screen.getByText('Login route')).toBeInTheDocument();
  });

  it('renders the Spanish not-found page for an unknown path', () => {
    renderAt('/ruta-inexistente');

    expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/');
  });
});
