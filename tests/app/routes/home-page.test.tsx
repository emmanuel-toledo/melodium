import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

vi.mock('@/features/auth', () => ({
  useAuth: mocks.useAuth,
}));

import { HomePage } from '@/app/routes/home-page';

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a session skeleton while loading', () => {
    mocks.useAuth.mockReturnValue({ user: null, status: 'loading' });

    const { container } = render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>,
    );

    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('shows the guest call to action', () => {
    mocks.useAuth.mockReturnValue({ user: null, status: 'unauthenticated' });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Tu biblioteca musical' })).toBeInTheDocument();
    expect(screen.getByText('Inicia sesión para empezar')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Crear una cuenta' })).toHaveAttribute(
      'href',
      '/register',
    );
  });

  it('greets the authenticated user', () => {
    mocks.useAuth.mockReturnValue({
      user: { uid: 'user-1', email: 'ana@example.com', displayName: 'Ana' },
      status: 'authenticated',
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Hola, Ana' })).toBeInTheDocument();
  });
});
