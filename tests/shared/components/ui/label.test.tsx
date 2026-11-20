import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Label } from '@/shared/components/ui/label';

describe('Label', () => {
  it('associates with its control through htmlFor', () => {
    render(
      <>
        <Label htmlFor="email">Correo electrónico</Label>
        <input id="email" />
      </>,
    );

    expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute('id', 'email');
  });

  it('merges custom classes with the base styles', () => {
    render(
      <Label htmlFor="email" className="custom-label">
        Correo
      </Label>,
    );

    expect(screen.getByText('Correo')).toHaveClass('custom-label');
  });
});
