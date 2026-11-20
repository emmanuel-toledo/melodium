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

import { LoginForm } from '@/features/auth/components/login-form';

const actions = {
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  signInWithGoogle: vi.fn(),
  requestPasswordReset: vi.fn(),
  signOut: vi.fn(),
};

function renderForm() {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <LoginForm /> },
      { path: '/', element: <p>Inicio</p> },
      { path: '/register', element: <p>Registro</p> },
      { path: '/reset-password', element: <p>Recuperación</p> },
    ],
    { initialEntries: ['/login'] },
  );

  render(<RouterProvider router={router} />);
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actions.signInWithEmail.mockResolvedValue(undefined);
    actions.signInWithGoogle.mockResolvedValue(undefined);
    mocks.useAuth.mockReturnValue({ user: null, status: 'unauthenticated', ...actions });
  });

  it('renders the email and password fields, the Google button and the links', () => {
    renderForm();

    expect(screen.getByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar con Google' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '¿Olvidaste tu contraseña?' })).toHaveAttribute(
      'href',
      '/reset-password',
    );
    expect(screen.getByRole('link', { name: 'Crear una cuenta' })).toHaveAttribute(
      'href',
      '/register',
    );
  });

  it('shows Spanish validation errors and focuses the first invalid field', async () => {
    const user = userEvent.setup();

    renderForm();

    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('El correo electrónico no es válido.')).toBeInTheDocument();
    expect(screen.getByText('Introduce tu contraseña.')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toHaveFocus();
    expect(actions.signInWithEmail).not.toHaveBeenCalled();
  });

  it('shows the generic credential error inline and focuses it', async () => {
    const user = userEvent.setup();

    actions.signInWithEmail.mockRejectedValueOnce({ code: 'auth/invalid-credential' });
    renderForm();

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'incorrecta');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    const alert = await screen.findByRole('alert');

    expect(alert).toHaveTextContent('El correo o la contraseña no son correctos.');
    expect(alert).toHaveFocus();
  });

  it('normalizes the email, keeps the password untouched and navigates home', async () => {
    const user = userEvent.setup();

    renderForm();

    await user.type(screen.getByLabelText('Correo electrónico'), ' Ana@Example.com ');
    await user.type(screen.getByLabelText('Contraseña'), ' secreto ');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Inicio')).toBeInTheDocument();
    expect(actions.signInWithEmail).toHaveBeenCalledWith('ana@example.com', ' secreto ');
  });

  it('disables the submit button while the request is pending', async () => {
    const user = userEvent.setup();
    let resolve: (() => void) | undefined;

    actions.signInWithEmail.mockReturnValueOnce(
      new Promise<void>((done) => {
        resolve = done;
      }),
    );
    renderForm();

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'secreto');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(screen.getByRole('button', { name: 'Entrando…' })).toBeDisabled();

    resolve?.();
    await screen.findByText('Inicio');
  });

  it('signs in with Google and navigates home', async () => {
    const user = userEvent.setup();

    renderForm();

    await user.click(screen.getByRole('button', { name: 'Continuar con Google' }));

    expect(await screen.findByText('Inicio')).toBeInTheDocument();
    expect(actions.signInWithGoogle).toHaveBeenCalledTimes(1);
  });
});
