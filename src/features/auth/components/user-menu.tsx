import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';

import { useAuth } from '../hooks/use-auth';
import { getAuthErrorMessage } from '../lib/auth-errors';

function initialsFor(user: { displayName: string | null; email: string | null }) {
  const source = user.displayName?.trim() || user.email?.trim() || '?';

  return source
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function UserMenu() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [pending, setPending] = useState(false);

  if (!user) {
    return null;
  }

  async function handleSignOut() {
    setPending(true);

    try {
      await signOut();
      void navigate('/login');
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
        >
          {initialsFor(user)}
        </span>
        <span className="hidden text-sm font-medium sm:inline">
          {user.displayName || user.email}
        </span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => void handleSignOut()}
        disabled={pending}
        aria-label="Cerrar sesión"
      >
        {pending ? 'Saliendo…' : 'Salir'}
      </Button>
    </div>
  );
}
