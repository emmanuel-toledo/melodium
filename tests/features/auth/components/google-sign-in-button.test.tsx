import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { GoogleSignInButton } from '@/features/auth/components/google-sign-in-button';

describe('GoogleSignInButton', () => {
  it('calls the handler when pressed', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<GoogleSignInButton onClick={onClick} />);

    await user.click(screen.getByRole('button', { name: 'Continuar con Google' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables itself and shows pending text while connecting', () => {
    render(<GoogleSignInButton onClick={vi.fn()} pending />);

    const button = screen.getByRole('button', { name: 'Conectando con Google…' });

    expect(button).toBeDisabled();
  });
});
