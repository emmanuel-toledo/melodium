import { Link } from 'react-router-dom'

interface RouteErrorBoundaryProps {
  /** Error passed by React Router to `errorElement`. */
  error?: unknown
}

/** Per-route error boundary: isolates failures and shows a friendly message. */
export function RouteErrorBoundary({ error }: RouteErrorBoundaryProps) {
  const message =
    error instanceof Error ? error.message : 'Error inesperado en la ruta.'

  return (
    <div
      role="alert"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <h1 className="text-2xl font-bold tracking-tight">
        Algo salió mal
      </h1>
      <p className="max-w-sm text-muted-foreground">{message}</p>
      <Link
        to="/login"
        className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground underline-offset-4 hover:underline"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
