# AGENTS.md — Melodium

## Proyecto

Melodium es una biblioteca personal de composiciones musicales. El MVP se centra en hojas de acordes para guitarra: letra con acordes en ChordPro, transposición, etiquetas y setlists. Es una SPA sin backend propio: Vite + React + TypeScript estricto, Firebase Auth y Cloud Firestore.

Estado: bootstrap. El scaffold aún no existe; `001-platform` debe crear Vite, Tailwind/shadcn, alias `@/`, tests, emuladores y `eslint-plugin-boundaries`.

## Stack

- React + Vite + TypeScript estricto. Sin SSR.
- Node 24 LTS (`.nvmrc`), pnpm 10.19.0 vía corepack; lockfile commiteado.
- Tailwind CSS + shadcn/ui, mobile-first.
- React Router, react-hook-form + Zod y sonner.
- Firebase Auth (Google + email/contraseña) y Cloud Firestore; sin backend ni Cloud Functions.
- Parser ChordPro y transposición propios, más svguitar y `@tombatossals/chords-db` para diagramas, en `src/features/compositions/lib`.
- Vitest + React Testing Library + Firebase Emulator Suite + `@firebase/rules-unit-testing`.
- ESLint + Prettier + Husky/lint-staged + `eslint-plugin-boundaries`.

## Comandos

```bash
corepack enable && pnpm install   # setup
pnpm dev                          # Vite
pnpm emulators                    # Auth + Firestore
pnpm lint                         # ESLint
pnpm lint:fix                     # autofix
pnpm format                       # Prettier
pnpm format:check                 # verificación
pnpm typecheck                    # TypeScript
pnpm test                         # Vitest
pnpm test:watch                   # Vitest watch
pnpm test:rules                   # reglas Firestore
pnpm check:arch                   # arquitectura
pnpm build                        # build
pnpm preview                      # preview
pnpm verify                       # format, lint, types, tests, arch, build
```

`pnpm verify` es la puerta obligatoria. `pnpm test:rules` requiere emuladores. No ejecutes `firebase deploy` hasta que existan proyectos y hosting.

## Reglas duras

- Dirección `app → features → shared`; sin excepciones.
- Features solo por `@/features/<feature>`; prohibido deep import y ciclos.
- `shared` no conoce dominio; nunca importa `app` ni `features`.
- Firebase SDK solo en `src/shared/lib/firebase`; `import.meta.env` solo en `src/shared/config/env.ts`.
- `useEffect`/`useLayoutEffect`/`useInsertionEffect` prohibidos por defecto; excepción aprobada y registrada en `docs/decisions/effects.md`.
- Sin `any`, `dangerouslySetInnerHTML` ni `console.log`.
- UI en español; código, comentarios, commits, specs y docs técnicos en inglés.
- No desactives reglas de lint/TS; no borres ni omitas tests que fallan.

## Skills

- `melodium-architecture`: cárgala antes de crear o mover módulos, cambiar imports, Firebase/env o una API pública.
- `melodium-react`: cárgala antes de escribir o revisar componentes, hooks, estado, efectos, formularios o UI.
- `spec-driven-development`: cárgala antes de especificar o implementar una feature.

## Flujo

1. Lee `docs/constitution.md` y la spec activa en `docs/specs/`.
2. Sigue `spec-driven-development`: Specify → Plan → Tasks → Implement. No avances sin revisión humana.
3. Si la constitución o la spec no existen, detente y pide que se creen antes de implementar.
4. No implementes nada fuera de `tasks.md`; si aparece trabajo nuevo, añádelo o consúltalo.
5. Actualiza la spec y `tasks.md` al terminar; registra lo diferido en "Out of Scope".

## Datos

- `users/{uid}/compositions/{compositionId}`: título, metadatos, tags, `instrument`, `content` ChordPro y timestamps.
- `users/{uid}/setlists/{setlistId}`: nombre, `compositionIds` ordenados y timestamps.
- Reglas deny-by-default; solo el propietario lee y escribe.
- `setlists` guarda IDs y resuelve datos con la API pública de `compositions`; no duplica.
- Al borrar una composición, elimínala de los setlists del usuario.
- No se persiste HTML ni el resultado de transponer. La spec y Zod son la fuente de verdad.

## Testing

- Unitarios/componentes junto al código, con Vitest + RTL; setup en `tests/setup.ts`.
- Reglas Firestore en `tests/rules/` con emuladores.
- Obligatorio probar: ChordPro, transposición, schemas Zod, CRUD de composiciones, setlists y reglas de propiedad.
- Sin umbral global. Un cambio no está terminado si sus tests críticos no existen o fallan.
- Los tests no dependen de red ni de un Firebase real; mockean `@/shared/lib/firebase`.

## Preguntar primero

- Añadir, quitar o actualizar dependencias.
- Cambiar el modelo, las reglas o los índices de Firestore.
- Cambiar auth, rutas, estructura de features, capas, boundaries o contratos públicos.
- Añadir una dependencia entre features o cambiar el grafo.
- Configurar CI/CD, deploy o proyectos Firebase.
- Hacer commit, push o abrir un PR.

## Nunca

- Importar archivos internos de una feature o importar `app` desde features/shared.
- Crear ciclos entre features.
- Commitear secretos, `.env.local`, claves de servicio o credenciales.
- Editar `pnpm-lock.yaml` a mano o commitear `dist/`.
- Llamar a Firebase desde componentes de UI.
- Hacer force push a `main`, reescribir historial compartido o commitear directo a `main`.
- Implementar compartir público, tablatura, partituras, audio, pagos, PWA/offline, i18n, Cloud Functions o Storage sin una spec aprobada.

## Fuera de alcance / pendientes

- Deploy sin definir; no hay proyectos Firebase ni Hosting. Usa emuladores.
- CI no configurado; preguntar antes de añadirlo.
- El scaffold y `pnpm check:arch` se implementan en `001-platform`.

## Al terminar

1. Ejecuta `pnpm verify`; corrige lo que falle.
2. Ejecuta `pnpm test:rules` si tocaste reglas o índices.
3. Si tocaste UI, revisa vacío/carga/error, responsive y teclado.
4. Actualiza spec, `tasks.md` y `index.ts` si cambió la API pública.
5. Resume cambios, comandos ejecutados y pendientes. No declares terminado si algo falla.
