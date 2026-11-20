import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Input } from '@/shared/components/ui/input';

describe('Input', () => {
  it('renders an input with the given value and name', () => {
    render(<Input aria-label="Correo" name="email" defaultValue="ana@example.com" />);

    const input = screen.getByRole('textbox', { name: 'Correo' });

    expect(input).toHaveValue('ana@example.com');
    expect(input).toHaveAttribute('name', 'email');
  });

  it('renders the requested type', () => {
    render(<Input aria-label="Contraseña" type="password" />);

    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password');
  });

  it('supports the disabled state', () => {
    render(<Input aria-label="Correo" disabled />);

    expect(screen.getByRole('textbox', { name: 'Correo' })).toBeDisabled();
  });

  it('merges custom classes with the base styles', () => {
    render(<Input aria-label="Correo" className="custom-input" />);

    expect(screen.getByRole('textbox', { name: 'Correo' })).toHaveClass('custom-input');
  });
});
