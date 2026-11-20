import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ message: 'El correo electrónico no es válido.' }));

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Introduce tu contraseña.'),
});

export const registerSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .max(60, 'El nombre no puede superar los 60 caracteres.')
      .optional(),
    email: emailSchema,
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden.',
  });

export const resetPasswordSchema = z.object({
  email: emailSchema,
});
