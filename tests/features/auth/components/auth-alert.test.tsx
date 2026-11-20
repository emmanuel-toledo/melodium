import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AuthAlert } from '@/features/auth/components/auth-alert';

describe('AuthAlert', () => {
  it('renders the message as an alert and focuses it', () => {
    render(<AuthAlert message="El correo o la contraseña no son correctos." />);

    const alert = screen.getByRole('alert');

    expect(alert).toHaveTextContent('El correo o la contraseña no son correctos.');
    expect(alert).toHaveFocus();
  });

  it('renders nothing without a message', () => {
    const { container } = render(<AuthAlert message={null} />);

    expect(container).toBeEmptyDOMElement();
  });
});
