import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

vi.mock('@/features/auth/hooks/use-auth', () => ({
  useAuth: mocks.useAuth,
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

import { UserMenu } from '@/features/auth/components/user-menu';

const actions = {
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  signInWithGoogle: vi.fn(),
  requestPasswordReset: vi.fn(),
  signOut: vi.fn(),
};

function renderMenu() {
  const router = createMemoryRouter(
    [
      { path: '/', element: <UserMenu /> },
      { path: '/login', element: <p>Iniciar sesión</p> },
    ],
    { initialEntries: ['/'] },
  );

  render(<RouterProvider router={router} />);
}

describe('UserMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actions.signOut.mockResolvedValue(undefined);
  });

  it('shows the initials and the display name', () => {
    mocks.useAuth.mockReturnValue({
      user: { uid: 'user-1', email: 'ana@example.com', displayName: 'Ana López' },
      status: 'authenticated',
      ...actions,
    });

    renderMenu();

    expect(screen.getByText('Ana López')).toBeInTheDocument();
    expect(screen.getByText('AL')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toHaveTextContent('Salir');
  });

  it('falls back to the email when there is no display name', () => {
    mocks.useAuth.mockReturnValue({
      user: { uid: 'user-1', email: 'ana@example.com', displayName: null },
      status: 'authenticated',
      ...actions,
    });

    renderMenu();

    expect(screen.getByText('ana@example.com')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('signs out and navigates to login', async () => {
    const user = userEvent.setup();

    mocks.useAuth.mockReturnValue({
      user: { uid: 'user-1', email: 'ana@example.com', displayName: 'Ana' },
      status: 'authenticated',
      ...actions,
    });

    renderMenu();

    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    expect(actions.signOut).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Iniciar sesión')).toBeInTheDocument();
  });

  it('shows a Spanish toast and keeps the user signed in when logout fails', async () => {
    const user = userEvent.setup();

    actions.signOut.mockRejectedValueOnce({ code: 'auth/network-request-failed' });
    mocks.useAuth.mockReturnValue({
      user: { uid: 'user-1', email: 'ana@example.com', displayName: 'Ana' },
      status: 'authenticated',
      ...actions,
    });

    renderMenu();

    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.',
    );
    expect(screen.queryByText('Iniciar sesión')).not.toBeInTheDocument();
  });
});
