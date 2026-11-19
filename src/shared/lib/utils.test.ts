import { describe, expect, it } from 'vitest';

import { cn } from '@/shared/lib/utils';

describe('cn', () => {
  it('merges conflicting Tailwind classes', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('ignores falsy values', () => {
    expect(cn('text-sm', false, undefined)).toBe('text-sm');
  });

  it('runs in a jsdom environment', () => {
    expect(document.body).toBeInTheDocument();
  });
});
