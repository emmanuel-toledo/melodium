import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { PasswordInput } from '@/features/auth/components/password-input';

describe('PasswordInput', () => {
  it('starts hidden and toggles visibility', async () => {
    const user = userEvent.setup();

    render(<PasswordInput id="password" label="Contraseña" />);

    const input = screen.getByLabelText('Contraseña');
    const toggle = screen.getByRole('button', { name: 'Mostrar contraseña' });

    expect(input).toHaveAttribute('type', 'password');
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await user.click(toggle);

    expect(input).toHaveAttribute('type', 'text');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toBe(toggle);

    await user.click(toggle);

    expect(input).toHaveAttribute('type', 'password');
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows the validation error and describes the input with it', () => {
    render(
      <PasswordInput
        id="password"
        label="Contraseña"
        error="La contraseña debe tener al menos 8 caracteres."
      />,
    );

    const input = screen.getByLabelText('Contraseña');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('La contraseña debe tener al menos 8 caracteres.');
  });
});
