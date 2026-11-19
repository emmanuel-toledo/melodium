import { Link } from 'react-router';

import { Button } from '@/shared/components/ui/button';

export function NotFoundPage() {
  return (
    <section className="space-y-4">
      <p className="text-sm font-medium text-muted-foreground">Error 404</p>
      <h1 className="text-3xl font-semibold tracking-tight">Página no encontrada</h1>
      <p className="max-w-prose text-muted-foreground">
        La dirección que buscas no existe o se ha movido.
      </p>
      <Button asChild>
        <Link to="/">Volver al inicio</Link>
      </Button>
    </section>
  );
}
