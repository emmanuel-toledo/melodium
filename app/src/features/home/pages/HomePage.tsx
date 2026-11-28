import { LogOut } from 'lucide-react'
import { Button } from '@/shared/components/shadcn/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/shared/components/shadcn/ui/card'
import { useSessionStore } from '@/shared/stores/session.store'

export function HomePage() {
  // FR-10 / plan D11: logout vía session.store compartido (sin importar `auth`).
  const requestLogout = useSessionStore((state) => state.requestLogout)

  return (
    <div className="flex min-h-[calc(100svh-9rem)] items-center justify-center px-4 py-12">
      <section
        aria-labelledby="home-title"
        className="flex w-full max-w-md flex-col items-center text-center"
      >
        <Card className="w-full shadow-xl shadow-primary/10">
          <CardHeader>
            <h1
              id="home-title"
              className="font-heading text-3xl font-semibold tracking-tight"
            >
              Hola mundo
            </h1>
            <CardDescription>
              Bienvenido a Melodium. Tu cuaderno de acordes ya está listo.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p
              aria-hidden="true"
              className="rounded-lg bg-muted px-4 py-3 font-mono text-sm font-semibold text-primary"
            >
              Am · G · C · F
            </p>
            <Button type="button" variant="outline" onClick={requestLogout}>
              <LogOut data-icon="inline-start" />
              Cerrar sesión
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
