import { Link } from 'react-router-dom'

/** Generic 404 page (react-routing: catch-all route). */
export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold tracking-wide text-primary">404</p>
      <h1 className="text-3xl font-bold tracking-tight">Página no encontrada</h1>
      <p className="max-w-sm text-muted-foreground">
        La página que buscas no existe o fue movida.
      </p>
      <Link
        to="/login"
        className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
