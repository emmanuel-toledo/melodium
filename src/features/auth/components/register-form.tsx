import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';

import { useAuth } from '../hooks/use-auth';
import { getAuthErrorMessage } from '../lib/auth-errors';
import { registerSchema } from '../lib/auth-schemas';
import type { RegisterFormValues } from '../types/auth-form.type';
import { AuthAlert } from './auth-alert';
import { AuthField } from './auth-field';
import { GoogleSignInButton } from './google-sign-in-button';
import { PasswordInput } from './password-input';

export function RegisterForm() {
  const navigate = useNavigate();
  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [googlePending, setGooglePending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      const displayName = values.displayName?.trim();
      const { displayNameSaved } = await signUpWithEmail(
        values.email.trim().toLowerCase(),
        values.password,
        displayName ? displayName : undefined,
      );

      if (!displayNameSaved) {
        toast.warning('Tu cuenta se creó, pero no se pudo guardar el nombre.');
      }

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
        <h1 className="text-2xl font-semibold tracking-tight">Crea tu cuenta</h1>
        <p className="text-sm text-muted-foreground">
          Empieza a guardar tus composiciones para guitarra.
        </p>
      </div>

      <AuthAlert message={formError} />

      <form onSubmit={(event) => void onSubmit(event)} noValidate className="space-y-4">
        <AuthField
          id="register-name"
          label="Nombre (opcional)"
          autoComplete="name"
          hint="Aparecerá en la cabecera de la aplicación."
          error={errors.displayName?.message}
          {...register('displayName')}
        />
        <AuthField
          id="register-email"
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordInput
          id="register-password"
          label="Contraseña"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <PasswordInput
          id="register-confirm-password"
          label="Confirma la contraseña"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting || googlePending}>
          {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        o
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleSignInButton onClick={() => void handleGoogleSignIn()} pending={googlePending} />

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
