import type { z } from 'zod';

import type { loginSchema, registerSchema, resetPasswordSchema } from '../lib/auth-schemas';

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
