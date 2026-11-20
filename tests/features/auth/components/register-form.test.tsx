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
    warning: vi.fn(),
  },
}));

import { RegisterForm } from '@/features/auth/components/register-form';

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
      { path: '/register', element: <RegisterForm /> },
      { path: '/', element: <p>Inicio</p> },
      { path: '/login', element: <p>Iniciar sesión</p> },
    ],
    { initialEntries: ['/register'] },
  );

  render(<RouterProvider router={router} />);
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Correo electrónico'), ' anA@Example.com ');
  await user.type(screen.getByLabelText('Contraseña'), 'contraseña-segura');
  await user.type(screen.getByLabelText('Confirma la contraseña'), 'contraseña-segura');
}

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actions.signUpWithEmail.mockResolvedValue({ displayNameSaved: true });
    actions.signInWithGoogle.mockResolvedValue(undefined);
    mocks.useAuth.mockReturnValue({ user: null, status: 'unauthenticated', ...actions });
  });

  it('renders the optional name, email and password fields', () => {
    renderForm();

    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre (opcional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirma la contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar con Google' })).toBeInTheDocument();
  });

  it('shows the password length and confirmation errors', async () => {
    const user = userEvent.setup();

    renderForm();

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'corta');
    await user.type(screen.getByLabelText('Confirma la contraseña'), 'otra');
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(
      await screen.findByText('La contraseña debe tener al menos 8 caracteres.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument();
    expect(actions.signUpWithEmail).not.toHaveBeenCalled();
  });

  it('registers without a display name and navigates home', async () => {
    const user = userEvent.setup();

    renderForm();
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByText('Inicio')).toBeInTheDocument();
    expect(actions.signUpWithEmail).toHaveBeenCalledWith(
      'ana@example.com',
      'contraseña-segura',
      undefined,
    );
  });

  it('sends a trimmed display name when provided', async () => {
    const user = userEvent.setup();

    renderForm();
    await user.type(screen.getByLabelText('Nombre (opcional)'), '  Ana  ');
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await screen.findByText('Inicio');
    expect(actions.signUpWithEmail).toHaveBeenCalledWith(
      'ana@example.com',
      'contraseña-segura',
      'Ana',
    );
  });

  it('warns when the display name could not be saved but still registers', async () => {
    const user = userEvent.setup();

    actions.signUpWithEmail.mockResolvedValueOnce({ displayNameSaved: false });
    renderForm();
    await user.type(screen.getByLabelText('Nombre (opcional)'), 'Ana');
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await screen.findByText('Inicio');
    expect(toast.warning).toHaveBeenCalledWith(
      'Tu cuenta se creó, pero no se pudo guardar el nombre.',
    );
  });

  it('shows a Firebase error inline', async () => {
    const user = userEvent.setup();

    actions.signUpWithEmail.mockRejectedValueOnce({ code: 'auth/email-already-in-use' });
    renderForm();
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(
      await screen.findByText('Ya existe una cuenta con este correo electrónico.'),
    ).toBeInTheDocument();
  });

  it('registers with Google and navigates home', async () => {
    const user = userEvent.setup();

    renderForm();

    await user.click(screen.getByRole('button', { name: 'Continuar con Google' }));

    expect(await screen.findByText('Inicio')).toBeInTheDocument();
    expect(actions.signInWithGoogle).toHaveBeenCalledTimes(1);
  });
});
