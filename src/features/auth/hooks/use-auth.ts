import { useAuthStore } from '../stores/auth.store';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const signInWithEmail = useAuthStore((state) => state.signInWithEmail);
  const signUpWithEmail = useAuthStore((state) => state.signUpWithEmail);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const requestPasswordReset = useAuthStore((state) => state.requestPasswordReset);
  const signOut = useAuthStore((state) => state.signOut);

  return {
    user,
    status,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    requestPasswordReset,
    signOut,
  };
}
