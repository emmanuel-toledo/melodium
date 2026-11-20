import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

vi.mock('@/features/auth', () => ({
  UserMenu: () => <span>Menú de usuario</span>,
  useAuth: mocks.useAuth,
}));

import { RootLayout } from '@/app/layouts/root-layout';

function renderLayout() {
  const router = createMemoryRouter(
    [
      {
        Component: RootLayout,
        children: [{ index: true, element: <p>Contenido</p> }],
      },
    ],
    { initialEntries: ['/'] },
  );

  render(<RouterProvider router={router} />);
}

describe('RootLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading placeholder while the session resolves', () => {
    mocks.useAuth.mockReturnValue({ user: null, status: 'loading' });

    renderLayout();

    const placeholder = document.querySelector('[aria-hidden="true"].animate-pulse');
    expect(placeholder).not.toBeNull();
    expect(screen.queryByText('Iniciar sesión')).not.toBeInTheDocument();
    expect(screen.queryByText('Menú de usuario')).not.toBeInTheDocument();
  });

  it('shows the login link for guests', () => {
    mocks.useAuth.mockReturnValue({ user: null, status: 'unauthenticated' });

    renderLayout();

    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/login');
    expect(screen.queryByText('Menú de usuario')).not.toBeInTheDocument();
  });

  it('shows the user menu when authenticated', () => {
    mocks.useAuth.mockReturnValue({
      user: { uid: 'user-1', email: 'ana@example.com', displayName: 'Ana' },
      status: 'authenticated',
    });

    renderLayout();

    expect(screen.getByText('Menú de usuario')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Iniciar sesión' })).not.toBeInTheDocument();
  });
});
