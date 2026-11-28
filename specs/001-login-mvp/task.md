# Tasks — 001 Login MVP

## Fase 0 — Firebase setup (sin código)
- [ ] **T0.1** Habilitar Google Auth en Firebase Console (Authentication → Sign-in method → Google).  
  RF: FR-5, FR-6. Hecho cuando: provider Google aparece como "Enabled".
- [x] **T0.2** Crear base de datos Firestore (modo test).  
  RF: setup. Hecho cuando: DB creada y visible en consola.
- [x] **T0.3** Registrar Web App y copiar `firebaseConfig`.  
  RF: setup. Hecho cuando: config copiado a `app/.env` local.
- [x] **T0.4** Crear `app/.env` y `app/.env.example` con `VITE_FIREBASE_*` y `VITE_USE_FIREBASE_EMULATOR` (gitignored).  
  RF: FR-5. Hecho cuando: archivos existen y `pnpm dev` lee las vars.
- [x] **T0.5** Configurar Firebase Auth Emulator (firebase.json + emulators).  
  RF: setup. Hecho cuando: `firebase emulators:start --only auth` corre sin error.

## Fase 1 — Infraestructura compartida
- [x] **T1.1** Crear `shared/config/env.ts` (valida y exporta `VITE_FIREBASE_*` y flags).  
  RF: D4. Hecho cuando: typecheck pasa y solo este archivo lee `import.meta.env`.
- [x] **T1.2** Crear `shared/apis/firebase/client.ts` (app/auth/firestore singleton + emulator wiring por flag).  
  RF: FR-5, FR-6. Hecho cuando: client inicializa sin error en dev.
- [x] **T1.3** Crear `shared/stores/theme.store.ts` (Zustand, persist, system default).  
  RF: FR-8, FR-9. Hecho cuando: unit test pasa.
- [x] **T1.4** Crear `shared/stores/session.store.ts` (`isAuthenticated` + `requestLogout`).  
  RF: FR-10. Hecho cuando: unit test pasa.
- [x] **T1.5** Crear `shared/components/routes/RequireAuth.tsx`.  
  RF: FR-1, FR-2. Hecho cuando: test de redirect pasa.

## Fase 2 — Feature `auth`
- [x] **T2.1** Crear `auth/interfaces/auth.interface.ts` (`AuthState`).  
  RF: FR-5. Hecho cuando: typecheck pasa.
- [x] **T2.2** Crear `auth/stores/auth.store.ts` (user, loading, error).  
  RF: FR-5, FR-7. Hecho cuando: unit test pasa.
- [x] **T2.3** Crear `auth/utils/authErrors.ts` (map Firebase code → español).  
  RF: FR-7. Hecho cuando: unit test cubre casos principales.
- [x] **T2.4** Crear `auth/apis/services/auth.service.ts` (signInWithGoogle, signOut, subscribeAuth).  
  RF: FR-5, FR-6, FR-10. Hecho cuando: integration test con mock pasa.
- [x] **T2.5** Crear `auth/hooks/useAuth.ts` (orquestación service + store).  
  RF: FR-5, FR-6, FR-7. Hecho cuando: unit test pasa.
- [x] **T2.6** Crear `auth/pages/LoginPage.tsx` (marca, tagline, botón Google, toggle tema, loading, error).  
  RF: FR-4, FR-5, FR-7, FR-8. Hecho cuando: RTL test renderiza y a11y básico OK.
- [x] **T2.7** Crear `auth/routes/auth.routes.tsx` (`/login`, lazy).  
  RF: FR-1, FR-3. Hecho cuando: route test pasa.
- [x] **T2.8** Crear `auth/index.ts` (public API minimal).  
  RF: all. Hecho cuando: lint + typecheck pasan.

## Fase 3 — Feature `home`
- [x] **T3.1** Crear `home/pages/HomePage.tsx` ("Hola mundo" + logout via session.requestLogout).  
  RF: FR-10. Hecho cuando: RTL test pasa.
- [x] **T3.2** Crear `home/routes/home.routes.tsx` (`/`, lazy).  
  RF: FR-1, FR-10. Hecho cuando: route test pasa.
- [x] **T3.3** Crear `home/index.ts`.  
  RF: all. Hecho cuando: lint + typecheck pasan.

## Fase 4 — Composición de la app
- [x] **T4.1** Crear `routes/app.router.tsx` + `protected.router.tsx` (compose + guards + 404).  
  RF: FR-1, FR-2, FR-3. Hecho cuando: navigation test pasa.
- [x] **T4.2** Crear `app/layouts/RootLayout.tsx` (skip link, header+ThemeToggle, main, footer, Suspense).  
  RF: FR-8, a11y. Hecho cuando: render test pasa.
- [x] **T4.3** Crear `app/App.tsx` (providers + router + theme init).  
  RF: all. Hecho cuando: app arranca.
- [x] **T4.4** Modificar `main.tsx` para renderizar `App`.  
  RF: all. Hecho cuando: dev server muestra login en `/login`.

## Fase 5 — UI / diseño
- [x] **T5.1** Inicializar shadcn/ui y añadir Button, Card, etc. en `shared/components/shadcn/ui/`.  
  RF: FR-4, FR-5. Hecho cuando: componentes importables.
- [x] **T5.2** Aplicar tema dual (Tailwind class) + toggle en RootLayout/LoginPage.  
  RF: FR-8, FR-9. Hecho cuando: toggle cambia claro/oscuro y persiste.

## Fase 6 — Tests
- [x] **T6.1** Unit tests `auth` (store, service, LoginPage, RequireAuth).  
  RF: FR-1..FR-7, FR-10. Hecho cuando: vitest pasa, coverage ≥ 90%.
- [x] **T6.2** Unit tests `home` (HomePage).  
  RF: FR-10. Hecho cuando: vitest pasa.
- [x] **T6.3** Unit tests `shared` (theme, session, env, firebase client).  
  RF: FR-8, FR-9. Hecho cuando: vitest pasa.
- [x] **T6.4** E2E Playwright (Firebase Auth Emulator: sign-in flow, redirect, logout con cache clear, tema).  
  RF: AC-1..AC-6. Hecho cuando: playwright pasa.

## Fase 7 — Quality gates
- [x] **T7.1** Ejecutar typecheck + lint + tests.  
  RF: all. Hecho cuando: `pnpm tsc -b` y lint sin errores.
- [ ] **T7.2** Sign-off del usuario.  
  RF: Constitution §4. Hecho cuando: usuario aprueba.