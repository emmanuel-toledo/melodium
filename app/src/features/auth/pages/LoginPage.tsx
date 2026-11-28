import type { MouseEvent } from 'react'
import { Check, Lock, Music2 } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/shared/components/shadcn/ui/alert'
import { Button } from '@/shared/components/shadcn/ui/button'
import { Spinner } from '@/shared/components/shadcn/ui/spinner'
import { useSessionStore } from '@/shared/stores/session.store'
import { GoogleIcon } from '../components/GoogleIcon'
import { useAuth } from '../hooks/useAuth'

const BENEFITS = [
  'Una biblioteca para acordes y canciones',
  'Los detalles que van con la música',
  'Listo donde quiera que toques',
] as const

export function LoginPage() {
  const { loading, error, signInWithGoogle } = useAuth()
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated)

  // FR-3: sesión activa → redirect declarativo (sin useEffect, plan D15).
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSignIn = async (event: MouseEvent<HTMLButtonElement>) => {
    const trigger = event.currentTarget
    await signInWithGoogle()
    // EC-5: el foco vuelve al disparador tras cerrar el popup.
    trigger.focus()
  }

  return (
    <div className="relative flex min-h-[calc(100svh-9rem)] items-center justify-center overflow-hidden px-10 py-12">
      {/* Glow violeta sutil detrás de la tarjeta (decorativo). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(55% 45% at 50% 0%, oklch(0.541 0.245 276.9 / 0.14), transparent 70%)',
        }}
      />

      <section
        aria-labelledby="login-title"
        className="relative grid w-full max-w-4xl overflow-hidden rounded-3xl border border-border shadow-[0_24px_70px_-24px_oklch(0.541_0.245_276.9/0.45)] lg:min-h-[30rem] lg:grid-cols-[1.05fr_1fr]"
      >
        {/* Panel de marca: gradiente violeta (dual theme, constante). */}
        <div
          className="relative flex flex-col justify-between gap-8 overflow-hidden p-7 text-white sm:p-9 lg:p-10"
          style={{
            backgroundImage:
              'linear-gradient(160deg, oklch(0.46 0.2 292) 0%, oklch(0.34 0.16 302) 100%)',
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -right-16 size-60 rounded-full bg-white/25 blur-3xl"
          />
          <span
            aria-hidden="true"
            className="absolute right-6 top-7 hidden font-mono text-base font-semibold text-white/15 lg:block"
          >
            Am7
          </span>
          <span
            aria-hidden="true"
            className="absolute right-7 bottom-8 hidden font-mono text-base font-semibold text-white/15 lg:block"
          >
            Fmaj7
          </span>

          {/* Lockup de marca */}
          <div className="relative flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-white/15 shadow-lg shadow-black/10 ring-1 ring-white/25">
              <Music2 aria-hidden="true" className="size-5 text-white" />
            </span>
            <div>
              <h1
                id="login-title"
                className="text-xl font-semibold leading-none tracking-tight"
              >
                Melodium
              </h1>
              <p className="mt-1.5 text-[0.65rem] font-medium tracking-[0.2em] text-white/90 uppercase">
                Tu espacio de composición musical
              </p>
            </div>
          </div>

          {/* Titular + subcopy */}
          <div className="relative flex flex-col gap-4">
            <h2 className="max-w-[14ch] text-3xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-4xl">
              Tu música, en un solo lugar.
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-white/90">
              Un lugar tranquilo para cada acorde, canción y borrador — pensado
              para la forma en que tocas.
            </p>
          </div>

          {/* Beneficios */}
          <ul className="relative flex flex-col gap-3">
            {BENEFITS.map((benefit) => (
              <li
                key={benefit}
                className="flex items-center gap-3 text-sm text-white/90"
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
                  <Check aria-hidden="true" className="size-3" />
                </span>
                {benefit}
              </li>
            ))}
          </ul>

          {/* FR-4: tagline */}
          <p className="relative text-sm text-white/70">
            Tu espacio de composición musical, siempre contigo.
          </p>
        </div>

        {/* Panel de acceso */}
        <div className="relative flex flex-col justify-center gap-6 bg-background p-7 sm:p-9 lg:p-10">
          <div className="flex flex-col gap-2.5">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
              Inicia sesión
            </p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
              Bienvenido a Melodium
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Usa tu cuenta de Google para abrir tu cuaderno. Sin contraseñas
              nuevas que recordar.
            </p>
          </div>

          {error !== null && (
            <Alert variant="destructive">
              <AlertTitle>No se pudo iniciar sesión</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="button"
            size="lg"
            variant="outline"
            className="h-12 w-full cursor-pointer"
            disabled={loading}
            onClick={handleSignIn}
          >
            {loading ? (
              <Spinner
                data-icon="inline-start"
                aria-label="Iniciando sesión…"
              />
            ) : (
              <GoogleIcon data-icon="inline-start" />
            )}
            {loading ? 'Iniciando sesión…' : 'Continuar con Google'}
          </Button>

          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Lock aria-hidden="true" className="mt-px size-3.5 shrink-0" />
            <span>
              Melodium solo usa Google para iniciar sesión. Nunca vemos tu
              contraseña.
            </span>
          </p>
        </div>
      </section>
    </div>
  )
}
