import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthStatus } from '@/features/auth/types/auth-status.type';

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

vi.mock('@/features/auth/hooks/use-auth', () => ({
  useAuth: mocks.useAuth,
}));

import { RequireAuth } from '@/features/auth/components/require-auth';

function mockStatus(status: AuthStatus) {
  mocks.useAuth.mockReturnValue({ status });
}

function renderGuard() {
  const router = createMemoryRouter(
    [
      {
        path: '/protected',
        Component: RequireAuth,
        children: [{ index: true, element: <p>Contenido privado</p> }],
      },
      { path: '/login', element: <p>Iniciar sesión</p> },
    ],
    { initialEntries: ['/protected'] },
  );

  render(<RouterProvider router={router} />);
}

describe('RequireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the loading state while the session resolves', () => {
    mockStatus('loading');

    renderGuard();

    expect(screen.getByRole('status')).toHaveTextContent('Comprobando tu sesión…');
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated users to the login route', async () => {
    mockStatus('unauthenticated');

    renderGuard();

    expect(await screen.findByText('Iniciar sesión')).toBeInTheDocument();
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
  });

  it('renders the protected outlet when authenticated', () => {
    mockStatus('authenticated');

    renderGuard();

    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
  });
});
