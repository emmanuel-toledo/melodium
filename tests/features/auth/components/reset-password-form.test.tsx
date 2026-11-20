import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

vi.mock('@/features/auth/hooks/use-auth', () => ({
  useAuth: mocks.useAuth,
}));

import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';

const actions = {
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  signInWithGoogle: vi.fn(),
  requestPasswordReset: vi.fn(),
  signOut: vi.fn(),
};

const confirmation =
  'Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.';

function renderForm() {
  const router = createMemoryRouter(
    [
      { path: '/reset-password', element: <ResetPasswordForm /> },
      { path: '/login', element: <p>Iniciar sesión</p> },
    ],
    { initialEntries: ['/reset-password'] },
  );

  render(<RouterProvider router={router} />);
}

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actions.requestPasswordReset.mockResolvedValue(undefined);
    mocks.useAuth.mockReturnValue({ user: null, status: 'unauthenticated', ...actions });
  });

  it('validates the email in Spanish', async () => {
    const user = userEvent.setup();

    renderForm();

    await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    expect(await screen.findByText('El correo electrónico no es válido.')).toBeInTheDocument();
    expect(actions.requestPasswordReset).not.toHaveBeenCalled();
  });

  it('shows the generic confirmation and normalizes the email', async () => {
    const user = userEvent.setup();

    renderForm();

    await user.type(screen.getByLabelText('Correo electrónico'), ' ANA@Example.com ');
    await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    expect(await screen.findByRole('status')).toHaveTextContent(confirmation);
    expect(actions.requestPasswordReset).toHaveBeenCalledWith('ana@example.com');
    expect(screen.queryByLabelText('Correo electrónico')).not.toBeInTheDocument();
  });

  it('shows a network error inline', async () => {
    const user = userEvent.setup();

    actions.requestPasswordReset.mockRejectedValueOnce({ code: 'auth/network-request-failed' });
    renderForm();

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.',
    );
  });

  it('shows a rate-limit error inline', async () => {
    const user = userEvent.setup();

    actions.requestPasswordReset.mockRejectedValueOnce({ code: 'auth/too-many-requests' });
    renderForm();

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
    );
  });
});
