import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';

import { Button } from '@/shared/components/ui/button';

import { useAuth } from '../hooks/use-auth';
import { getAuthErrorMessage } from '../lib/auth-errors';
import { loginSchema } from '../lib/auth-schemas';
import type { LoginFormValues } from '../types/auth-form.type';
import { AuthAlert } from './auth-alert';
import { AuthField } from './auth-field';
import { GoogleSignInButton } from './google-sign-in-button';
import { PasswordInput } from './password-input';

export function LoginForm() {
  const navigate = useNavigate();
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [googlePending, setGooglePending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      await signInWithEmail(values.email.trim().toLowerCase(), values.password);
      void navigate('/');
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    }
  });

  async function handleGoogleSignIn() {
    setFormError(null);
    setGooglePending(true);

    try {
      await signInWithGoogle();
      void navigate('/');
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setGooglePending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Inicia sesión</h1>
        <p className="text-sm text-muted-foreground">
          Entra para acceder a tu biblioteca de composiciones.
        </p>
      </div>

      <AuthAlert message={formError} />

      <form onSubmit={(event) => void onSubmit(event)} noValidate className="space-y-4">
        <AuthField
          id="login-email"
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordInput
          id="login-password"
          label="Contraseña"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting || googlePending}>
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        o
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleSignInButton onClick={() => void handleGoogleSignIn()} pending={googlePending} />

      <div className="space-y-2 text-center text-sm">
        <p>
          <Link
            to="/reset-password"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
        <p className="text-muted-foreground">
          ¿No tienes cuenta?{' '}
          <Link
            to="/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Crear una cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
