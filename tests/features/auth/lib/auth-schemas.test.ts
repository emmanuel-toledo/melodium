import { describe, expect, it } from 'vitest';

import { loginSchema, registerSchema, resetPasswordSchema } from '@/features/auth/lib/auth-schemas';

function firstIssue(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.success ? undefined : result.error?.issues[0]?.message;
}

describe('loginSchema', () => {
  it('trims and lowercases the email', () => {
    const result = loginSchema.parse({ email: '  Ana@Example.COM ', password: 'secreto' });

    expect(result.email).toBe('ana@example.com');
  });

  it('requires a password without a minimum length', () => {
    expect(loginSchema.safeParse({ email: 'ana@example.com', password: 'x' }).success).toBe(true);
    expect(firstIssue(loginSchema.safeParse({ email: 'ana@example.com', password: '' }))).toBe(
      'Introduce tu contraseña.',
    );
  });

  it('rejects an invalid email in Spanish', () => {
    expect(firstIssue(loginSchema.safeParse({ email: 'no-es-un-correo', password: 'x' }))).toBe(
      'El correo electrónico no es válido.',
    );
  });
});

describe('registerSchema', () => {
  const valid = {
    email: 'ana@example.com',
    password: 'contraseña-segura',
    confirmPassword: 'contraseña-segura',
  };

  it('accepts a registration without a display name', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts and trims an optional display name', () => {
    const result = registerSchema.parse({ ...valid, displayName: '  Ana  ' });

    expect(result.displayName).toBe('Ana');
  });

  it('rejects a password shorter than 8 characters', () => {
    expect(
      firstIssue(
        registerSchema.safeParse({
          ...valid,
          password: 'corta',
          confirmPassword: 'corta',
        }),
      ),
    ).toBe('La contraseña debe tener al menos 8 caracteres.');
  });

  it('rejects a confirmation that does not match', () => {
    expect(firstIssue(registerSchema.safeParse({ ...valid, confirmPassword: 'otra' }))).toBe(
      'Las contraseñas no coinciden.',
    );
  });

  it('rejects a display name longer than 60 characters', () => {
    expect(firstIssue(registerSchema.safeParse({ ...valid, displayName: 'a'.repeat(61) }))).toBe(
      'El nombre no puede superar los 60 caracteres.',
    );
  });
});

describe('resetPasswordSchema', () => {
  it('normalizes a valid email', () => {
    expect(resetPasswordSchema.parse({ email: ' ANA@Example.com ' }).email).toBe('ana@example.com');
  });

  it('rejects an invalid email', () => {
    expect(resetPasswordSchema.safeParse({ email: 'nope' }).success).toBe(false);
  });
});
