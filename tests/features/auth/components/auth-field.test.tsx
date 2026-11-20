import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AuthField } from '@/features/auth/components/auth-field';

describe('AuthField', () => {
  it('associates the label and the input', () => {
    render(<AuthField id="email" label="Correo electrónico" type="email" />);

    expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute('type', 'email');
  });

  it('describes the input with the hint', () => {
    render(<AuthField id="email" label="Correo" hint="Usa tu correo habitual." />);

    expect(screen.getByLabelText('Correo')).toHaveAccessibleDescription('Usa tu correo habitual.');
  });

  it('marks the input invalid and describes the error', () => {
    render(<AuthField id="email" label="Correo" error="El correo electrónico no es válido." />);

    const input = screen.getByLabelText('Correo');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('El correo electrónico no es válido.');
    expect(screen.getByText('El correo electrónico no es válido.')).toBeInTheDocument();
  });
});
