import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';

import { Button } from '@/shared/components/ui/button';

import { useAuth } from '../hooks/use-auth';
import { getAuthErrorMessage } from '../lib/auth-errors';
import { resetPasswordSchema } from '../lib/auth-schemas';
import type { ResetPasswordFormValues } from '../types/auth-form.type';
import { AuthAlert } from './auth-alert';
import { AuthField } from './auth-field';

const confirmationMessage =
  'Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.';

export function ResetPasswordForm() {
  const { requestPasswordReset } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      await requestPasswordReset(values.email.trim().toLowerCase());
      setSent(true);
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    }
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Recupera tu contraseña</h1>
        <p className="text-sm text-muted-foreground">
          Te enviaremos un enlace para elegir una contraseña nueva.
        </p>
      </div>

      {sent ? (
        <p
          role="status"
          className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground"
        >
          {confirmationMessage}
        </p>
      ) : (
        <>
          <AuthAlert message={formError} />

          <form onSubmit={(event) => void onSubmit(event)} noValidate className="space-y-4">
            <AuthField
              id="reset-email"
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando…' : 'Enviar enlace'}
            </Button>
          </form>
        </>
      )}

      <p className="text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}
