import { Link } from 'react-router';

import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { useAuth } from '@/features/auth';

export function HomePage() {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return (
      <section className="space-y-6" aria-busy="true">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
        <div className="h-40 max-w-xl animate-pulse rounded-xl bg-muted" />
      </section>
    );
  }

  if (status === 'unauthenticated' || !user) {
    return (
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Tu biblioteca musical</h1>
          <p className="mt-2 max-w-prose text-muted-foreground">
            Melodium centralizará tus composiciones para guitarra, con acordes, transposición y
            setlists.
          </p>
        </div>
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Inicia sesión para empezar</CardTitle>
            <CardDescription>
              Crea tu cuenta o entra con tu correo y contraseña para guardar tus composiciones.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/login">Iniciar sesión</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/register">Crear una cuenta</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Hola, {user.displayName || user.email}
        </h1>
        <p className="mt-2 max-w-prose text-muted-foreground">
          Tu biblioteca de composiciones estará disponible en la próxima fase.
        </p>
      </div>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Biblioteca en preparación</CardTitle>
          <CardDescription>
            La plataforma de autenticación ya está lista. La gestión de composiciones llegará
            pronto.
          </CardDescription>
        </CardHeader>
      </Card>
    </section>
  );
}
