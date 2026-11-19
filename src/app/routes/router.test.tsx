import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';

import { routes } from '@/app/routes/router';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });

  render(<RouterProvider router={router} />);
}

describe('application shell', () => {
  it('renders the Spanish home and the skip link', () => {
    renderAt('/');

    expect(screen.getByRole('heading', { name: 'Tu biblioteca musical' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Saltar al contenido' })).toHaveAttribute(
      'href',
      '#main',
    );
    expect(screen.getByRole('link', { name: 'Melodium' })).toHaveAttribute('href', '/');
  });

  it('renders the Spanish not-found page', () => {
    renderAt('/ruta-inexistente');

    expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/');
  });
});
