import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AuthLoading } from '@/features/auth/components/auth-loading';

describe('AuthLoading', () => {
  it('announces the loading state in Spanish', () => {
    render(<AuthLoading />);

    expect(screen.getByRole('status')).toHaveTextContent('Comprobando tu sesión…');
  });
});
