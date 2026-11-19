import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

export function HomePage() {
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
          <CardTitle>Plataforma lista</CardTitle>
          <CardDescription>
            La base de la aplicación ya funciona. El inicio de sesión y las composiciones llegan en
            las próximas fases.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button disabled>Próximamente</Button>
        </CardContent>
      </Card>
    </section>
  );
}
