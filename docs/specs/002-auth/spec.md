# Spec 002: Auth — V1.1

Status: Shipped
Version: 1.1
Last updated: 2026-11-19
Module id: `auth`
Depends on: `001-platform` (Shipped) + delta `001-test-layout` (approved with this spec)
Runtime feature edges: none

## 1. Objective

Add personal authentication before composition and setlist ownership exists. The module provides Google and email/password authentication, a persisted Firebase session, a Zustand-backed session store, reusable route guards, password reset and Spanish auth feedback.

Success means:

- A visitor can register, sign in with email/password or Google, reset a password and sign out.
- The session survives a reload.
- Auth errors are in Spanish and accessible.
- The shell reflects the authenticated user and offers logout.
- The feature follows the project feature convention and becomes its reference implementation.
- Application tests live under `tests/`, grouped by feature, and the convention is documented in `melodium-feature` and `melodium-testing`.
- `pnpm verify` passes and auth behavior is covered by tests.

## 2. Resolved decisions

| Area               | Decision                                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| Routes             | `/login`, `/register`, `/reset-password`; code and paths in English, UI in Spanish.                            |
| Home               | `/` is public and reflects the session.                                                                        |
| Session            | Zustand 5.1.0; Firebase Auth is the source of truth; Zustand is not persisted.                                 |
| Profile            | Minimal `AuthUser`; Firebase `User` never leaves the feature.                                                  |
| Providers          | Email/password and Google popup.                                                                               |
| Post-auth          | `/` after login/register; `/login` after logout.                                                               |
| Email verification | Out of scope.                                                                                                  |
| Reset              | Firebase-hosted page; generic confirmation.                                                                    |
| Layout             | Standalone `AuthLayout`, outside the root header.                                                              |
| Shared UI          | `Input` and `Label` in `shared`; `Label` is a plain label, no new Radix dependency.                            |
| Password           | Registration minimum 8; login only requires a value.                                                           |
| Errors             | Inline per form; toasts only for logout failure and display-name warning. No global `error` in the store.      |
| Feature structure  | Canonical tree; `melodium-feature` + `docs/decisions/feature-structure.md`.                                    |
| Tests              | `tests/` mirrors `src/`; grouped by feature; rules in `tests/firestore-rules/`; tooling next to the script.    |
| Convention docs    | `melodium-feature`, `melodium-testing` and the ADR; `ARCH010` enforcement deferred.                            |
| Capability map     | Amend `AuthProvider` to `initializeAuth`, `useAuth`, `authRoutes`, `RequireAuth`, `UserMenu` and public types. |

## 3. Feature structure convention

### 3.1 Canonical tree

```text
src/features/<feature>/
  index.ts
  api/
    <feature>-service.api.ts
  components/
  pages/
  stores/
    <feature>.store.ts
  interfaces/
    <name>.interface.ts
  types/
    <name>.type.ts
  layouts/
    <feature>.layout.tsx
  routes/
    <feature>.router.tsx
  hooks/
    use-<name>.ts
  lib/
```

Rules:

- `api/`: external I/O boundary. Files end in `.api.ts`.
- `components/`: UI used only by this feature. A component consumed by another feature moves to `shared` only with owner approval and written justification.
- `pages/`: route-level screens, named `<name>-page.tsx`.
- `stores/`: Zustand stores; files end in `.store.ts`.
- `interfaces/`: object contracts shared across the feature or exported publicly.
- `types/`: unions, aliases, inferred form values and utility types.
- `layouts/`: one feature layout; files end in `.layout.tsx`.
- `routes/`: exactly one route module named `<feature>.router.tsx`; pages are lazy-loaded.
- `hooks/`: only when a real hook is needed; files are `use-*.ts`.
- `lib/`: pure helpers, Zod schemas and mappers.
- `index.ts`: the only public entry point and the only barrel.
- Tests are not part of the feature tree; they live under `tests/features/<feature>/` mirroring the source path. See §11.
- No `providers/` folder. App-level providers live in `src/app`; a feature-level React context requires a spec amendment.
- The tree is exhaustive. A new top-level folder inside a feature requires a spec or ADR amendment.
- No empty folders; create a folder only when it has a responsibility.
- Local component props stay next to the component. Domain or exported contracts go to `interfaces/` or `types/`.
- App imports only `@/features/<feature>`; it never imports pages or internals directly.
- App-level pages such as `/` and 404 stay in `src/app/routes`.

### 3.2 Auth tree

```text
src/features/auth/
  api/auth-service.api.ts
  components/
    auth-alert.tsx
    auth-field.tsx
    auth-loading.tsx
    google-sign-in-button.tsx
    login-form.tsx
    password-input.tsx
    register-form.tsx
    require-auth.tsx
    reset-password-form.tsx
    user-menu.tsx
  hooks/use-auth.ts
  interfaces/
    auth-error.interface.ts
    auth-state.interface.ts
    auth-user.interface.ts
    sign-up-result.interface.ts
  layouts/auth.layout.tsx
  lib/
    auth-errors.ts
    auth-schemas.ts
    auth-user.ts
  pages/
    login-page.tsx
    register-page.tsx
    reset-password-page.tsx
  routes/auth.router.tsx
  stores/auth.store.ts
  types/
    auth-error-code.type.ts
    auth-form.type.ts
    auth-status.type.ts
  index.ts
```

`UserMenu` and `RequireAuth` are domain-specific auth components exported through the public API for app composition. If another feature needs them, promotion to `shared` still requires approval.

### 3.3 Routes and lazy loading

```tsx
// src/features/auth/routes/auth.router.tsx
const LoginPage = lazy(() =>
  import('../pages/login-page').then((module) => ({ default: module.LoginPage })),
);

export const authRoutes: RouteObject[] = [
  {
    Component: AuthLayout,
    children: [
      { path: '/login', Component: LoginPage },
      { path: '/register', Component: RegisterPage },
      { path: '/reset-password', Component: ResetPasswordPage },
    ],
  },
];
```

- Each feature exports `<feature>Routes`.
- The feature layout provides `<Suspense>` for its lazy pages.
- The app wraps feature routes with the existing route error boundary.
- The auth branch sits outside `RootLayout`.
- Future features follow the same pattern.

### 3.4 Shared promotion gate

Before moving a component to `src/shared/components`, ask the owner and provide:

- The component and its current consumers.
- Why it is domain-agnostic.
- Which features will use it.
- The proposed public API.
- Confirmation that it imports no feature or domain type.

### 3.5 Test placement

- Application tests live under `tests/app`, `tests/shared` and `tests/features/<feature>`.
- A test mirrors the source path: `src/features/auth/stores/auth.store.ts` → `tests/features/auth/stores/auth.store.test.ts`.
- Firestore rules tests live under `tests/firestore-rules/`.
- Tooling tests stay next to the script they test.
- No `*.test.ts(x)` file lives under `src/`.

## 4. Dependencies and platform changes

Adds to `001-platform`:

- `zustand@^5.1.0`
- `react-hook-form@^7.92.0`
- `@hookform/resolvers@^7.0.7`
- `Input` and `Label` under `src/shared/components/ui`
- `updateProfile` in the Firebase facade and its tests
- Global `<Toaster />` in `main.tsx` instead of `RootLayout`
- Vitest, Vitest rules and ESLint path updates for the new test layout

No `@radix-ui/react-label`. No other dependencies.

No Firestore rules, indexes or data-model changes.

## 5. Public API

`@/features/auth` exports only:

```ts
export { authRoutes } from './routes/auth.router';
export { initializeAuth } from './stores/auth.store';
export { useAuth } from './hooks/use-auth';
export { RequireAuth } from './components/require-auth';
export { UserMenu } from './components/user-menu';

export type { AuthState } from './interfaces/auth-state.interface';
export type { AuthUser } from './interfaces/auth-user.interface';
export type { SignUpResult } from './interfaces/sign-up-result.interface';
export type { AuthStatus } from './types/auth-status.type';
```

Not exported: pages, forms, store, service, schemas, error helpers, form types, `AuthError` or `AuthErrorCode`.

```ts
export interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  signInWithEmail(email: string, password: string): Promise<void>;
  signUpWithEmail(email: string, password: string, displayName?: string): Promise<SignUpResult>;
  signInWithGoogle(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  signOut(): Promise<void>;
}
```

- `AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'`.
- `AuthUser` is `{ uid: string; email: string | null; displayName: string | null }`.
- `SignUpResult = { displayNameSaved: boolean }`.
  - `displayNameSaved` is `true` when no display name was provided or `updateProfile` succeeded.
  - It is `false` only when a provided display name could not be saved; registration still succeeds.
- `status` starts as `'loading'` until the first `onAuthStateChanged` callback.
- `initializeAuth()` is idempotent, is called once from `main.tsx` before render, and returns a cleanup function for tests. Repeated calls return the same cleanup and do not create a second subscription.
- The cleanup unsubscribes; it does not reset state. Tests reset the store explicitly.
- The store module exports its Zustand hook for internal use and tests; `index.ts` does not re-export it.
- `useAuth()` selects `user`, `status` and each action atomically from the store. The store itself is not public.
- The store is not persisted.
- Actions reject with an internal typed `AuthError`; forms map it to Spanish. No global `error` field.
- On success, actions update the store from the service result; the `onAuthStateChanged` subscription reconciles reloads and external changes.
- `RequireAuth` is exported and tested in 002, but no app route uses it until 003.
- `UserMenu` is used by `RootLayout`.

## 6. Routes and behavior

| Route             | Behavior                                                                |
| ----------------- | ----------------------------------------------------------------------- |
| `/`               | Public home. Shows loading, guest CTA or authenticated greeting.        |
| `/login`          | Email/password form, Google button, links to register and reset.        |
| `/register`       | Email, password, confirmation and optional display name; Google button. |
| `/reset-password` | Email form and generic success confirmation.                            |

- Auth routes render under standalone `AuthLayout`, outside the root header.
- Authenticated users visiting `/login`, `/register` or `/reset-password` are redirected to `/`.
- Successful login or registration navigates to `/`.
- Logout clears the session and navigates to `/login`.
- `RequireAuth`:
  - `loading` → accessible loading state.
  - `unauthenticated` → `<Navigate to="/login" replace />`.
  - `authenticated` → `<Outlet />`.
- Returning to the originally requested route is deferred to 003.
- `/` never redirects.
- 404 remains inside the root layout.
- The auth branch is wrapped by the app route error boundary.
- `Toaster` is global so auth pages and the header can show toasts.

Loading behavior:

- No auth form flash while the session is resolving.
- `AuthLayout` and `RequireAuth` show `AuthLoading`.
- The header reserves space with an `aria-hidden` placeholder.
- The home shows a session skeleton.

## 7. Password reset flow

| Step | User                                                    | System                                                                                                          |
| ---- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1    | Opens `/login` and selects “¿Olvidaste tu contraseña?”. | Navigates to `/reset-password`.                                                                                 |
| 2    | Enters the email and submits.                           | Validates the email with Zod, trims and lowercases it.                                                          |
| 3    | —                                                       | Calls `requestPasswordReset(email)` → `sendPasswordResetEmail(auth, email)`.                                    |
| 4    | —                                                       | Firebase checks the address and sends a one-use link, or the emulator prints it to the terminal.                |
| 5    | —                                                       | The UI always shows: “Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.” |
| 6    | Opens the email link.                                   | Firebase serves its secure reset page; Melodium never sees the password or the code.                            |
| 7    | Enters and confirms the new password.                   | Firebase validates the code, updates the password and invalidates the link.                                     |
| 8    | Returns to `/login`.                                    | Signs in with the new password.                                                                                 |
| 9    | If the link expired, requests another.                  | The same generic flow runs again.                                                                               |

Rules:

- `auth/user-not-found` is swallowed so the message is identical for known and unknown emails.
- Network and rate-limit errors are shown in Spanish.
- No `/reset-password/confirm`, no `oobCode` handling, no custom email template and no `actionCodeSettings` in V1.
- Email/password and Google providers, authorized domains and templates are Firebase console configuration; deploy is deferred to `005-environments`.

## 8. Forms and validation

React Hook Form with Zod resolver.

| Form     | Fields                                        | Rules                                                                              |
| -------- | --------------------------------------------- | ---------------------------------------------------------------------------------- |
| Login    | email, password                               | Email valid; password required (no 8-character minimum on login).                  |
| Register | displayName, email, password, confirmPassword | Name optional, trimmed, max 60; email valid; password min 8; confirmation matches. |
| Reset    | email                                         | Email valid.                                                                       |

- Email is trimmed and lowercased before the call; password is never trimmed.
- Labels are associated with inputs; autocomplete is set (`email`, `name`, `current-password`, `new-password`).
- Inline errors in Spanish; the first invalid field receives focus.
- Form-level Firebase errors render in an `AuthAlert` that receives focus when it appears, using a callback ref, not an effect.
- Submit buttons disable while pending and show Spanish pending text.
- Password inputs include a show/hide toggle with `aria-pressed`.
- Forms use `noValidate`; Zod is the validation source.
- Google button and email form each prevent duplicate submissions.
- No `console.log`, no `any`, no `dangerouslySetInnerHTML`.

## 9. Error mapping

| Firebase code                                                           | Spanish message                                                                                  |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `auth/invalid-email`                                                    | El correo electrónico no es válido.                                                              |
| `auth/missing-password`                                                 | Introduce tu contraseña.                                                                         |
| `auth/user-not-found`, `auth/wrong-password`, `auth/invalid-credential` | El correo o la contraseña no son correctos.                                                      |
| `auth/email-already-in-use`                                             | Ya existe una cuenta con este correo electrónico.                                                |
| `auth/weak-password`                                                    | La contraseña debe tener al menos 8 caracteres.                                                  |
| `auth/too-many-requests`                                                | Demasiados intentos. Espera unos minutos e inténtalo de nuevo.                                   |
| `auth/popup-closed-by-user`                                             | Se cerró la ventana de Google antes de completar el inicio de sesión.                            |
| `auth/popup-blocked`                                                    | El navegador bloqueó la ventana de Google. Permite las ventanas emergentes e inténtalo de nuevo. |
| `auth/account-exists-with-different-credential`                         | Ya existe una cuenta con este correo usando otro método de acceso.                               |
| `auth/operation-not-allowed`                                            | Este método de inicio de sesión no está habilitado.                                              |
| `auth/user-disabled`                                                    | Esta cuenta está deshabilitada.                                                                  |
| `auth/network-request-failed`                                           | No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.                                    |
| fallback                                                                | No se pudo completar la operación. Inténtalo de nuevo.                                           |

- `auth/cancelled-popup-request` is treated as a no-op because the Google button prevents concurrent popups.
- Raw Firebase messages are never rendered.
- Login uses one generic credential message to avoid revealing whether the email exists.
- Reset uses the generic success message.
- `AuthError` is internal and carries `AuthErrorCode`; `getAuthErrorMessage` maps it to Spanish.

## 10. UI

- `AuthLayout`: centered card, brand link, skip link, `<main id="main">`, `<Suspense>`, footer link to `/`.
- `RootLayout`: brand left; right side shows a loading placeholder, a login link or `UserMenu`.
- `UserMenu`: initials avatar, display name or email, “Salir” button with `aria-label="Cerrar sesión"`.
- `HomePage`:
  - loading → session skeleton.
  - guest → “Inicia sesión para empezar” with login/register actions.
  - authenticated → greeting and a note that the library arrives in 003.
- Logout failure shows a Spanish toast; the user stays signed in.
- If `updateProfile` fails after account creation, registration still succeeds and a Spanish warning toast is shown.
- Mobile-first, keyboard accessible, visible focus, `aria-live` for status, no horizontal overflow at 320 px.
- No new icon dependency; Google mark and password eye are inline SVG.

## 11. Testing

### 11.1 Test types and commands

| Type            | What it proves                                             | Location                                                | Command           | Runtime                          |
| --------------- | ---------------------------------------------------------- | ------------------------------------------------------- | ----------------- | -------------------------------- |
| Application     | Pure functions, schemas, stores, hooks, components, routes | `tests/app`, `tests/shared`, `tests/features/<feature>` | `pnpm test`       | jsdom; all Firebase mocked       |
| Firestore rules | Who can read and write documents                           | `tests/firestore-rules`                                 | `pnpm test:rules` | Node + Firestore emulator + Java |
| Tooling         | The architecture checker still works                       | `scripts/check-architecture.test.mjs`                   | `pnpm test`       | Node + fixtures                  |

`pnpm verify` runs the application suite and the tooling test; it never needs an emulator.

### 11.2 Location and naming

```text
tests/
  setup.ts
  support/                                  # optional, shared helpers
  app/
    layouts/
      root-layout.test.tsx
    routes/
      home-page.test.tsx
      router.test.tsx
  shared/
    config/
      env.test.ts
    lib/
      firebase/
        index.test.ts
      utils.test.ts
  features/
    auth/
      api/
        auth-service.api.test.ts
      components/
        auth-alert.test.tsx
        auth-field.test.tsx
        auth-loading.test.tsx
        google-sign-in-button.test.tsx
        login-form.test.tsx
        password-input.test.tsx
        register-form.test.tsx
        require-auth.test.tsx
        reset-password-form.test.tsx
        user-menu.test.tsx
      hooks/
        use-auth.test.tsx
      layouts/
        auth.layout.test.tsx
      lib/
        auth-errors.test.ts
        auth-schemas.test.ts
        auth-user.test.ts
      routes/
        auth.router.test.tsx
      stores/
        auth.store.test.ts
      support/                              # optional, auth-local helpers
      index.test.ts
  firestore-rules/
    baseline.test.ts
    helpers.ts
```

Tooling:

```text
scripts/
  check-architecture.test.mjs
  fixtures/architecture/...
```

Rules:

- The test path mirrors the source path.
- `tests/app` mirrors `src/app`; `tests/shared` mirrors `src/shared`; `tests/features/<feature>` mirrors `src/features/<feature>`.
- One test file per source file where practical. Integration tests are named after the entry point they exercise.
- No `*.test.ts(x)` under `src/`.
- `tests/support/` and `tests/features/<feature>/support/` are optional. Create them only when a helper is shared; otherwise keep the helper local to the test file.
- Firestore rules tests are flat in `tests/firestore-rules/`. `baseline.test.ts` is cross-cutting; feature-specific files use `<feature>.rules.test.ts` as they grow.
- The tooling test stays next to the script, with its fixtures under `scripts/fixtures/`.
- `tests/setup.ts` is the only global setup file.

### 11.3 Import rules

- A feature test may import internals of the feature under test via `@/features/<feature>/...`.
- Cross-feature imports in tests use only `@/features/<other>` public API.
- App tests may import `src/app` and `@/shared/...` internals; they mock `@/features/<feature>` public API.
- Shared tests may import `@/shared/...` internals.
- `src` must never import from `tests`.
- Test helpers never live in `src`.
- Application tests mock `@/shared/lib/firebase`; no network or real Firebase.
- Firestore rules tests may import `@firebase/rules-unit-testing`; no other Firebase SDK imports.
- Tooling tests may import Node built-ins.

### 11.4 Auth test plan

Unit:

- `tests/features/auth/lib/auth-errors.test.ts`: every mapped code, unknown code, non-Error, fallback; `AuthError` code and message.
- `tests/features/auth/lib/auth-schemas.test.ts`: email trim/lowercase, login password required, registration minimum, confirmation mismatch, display name max 60, optional name.
- `tests/features/auth/lib/auth-user.test.ts`: mapping and null/empty fields.
- `tests/features/auth/api/auth-service.api.test.ts`: email/password, Google, sign-up with/without display name, `updateProfile` failure → `displayNameSaved: false`, reset swallowing `user-not-found`, reset rethrowing network and rate-limit errors, sign-out, subscription mapping, cancelled popup no-op.
- `tests/features/auth/stores/auth.store.test.ts`: initial state, actions, status transitions, `initializeAuth` idempotency and cleanup, error propagation, no global error field.
- `tests/features/auth/hooks/use-auth.test.tsx`: selectors and updates.
- `tests/features/auth/index.test.ts`: runtime public surface; no store, service, pages, schemas or error helpers.

Components and routes:

- `tests/features/auth/components/auth-alert.test.tsx`
- `tests/features/auth/components/auth-field.test.tsx`
- `tests/features/auth/components/auth-loading.test.tsx`
- `tests/features/auth/components/google-sign-in-button.test.tsx`
- `tests/features/auth/components/login-form.test.tsx`
- `tests/features/auth/components/password-input.test.tsx`
- `tests/features/auth/components/register-form.test.tsx`
- `tests/features/auth/components/require-auth.test.tsx`
- `tests/features/auth/components/reset-password-form.test.tsx`
- `tests/features/auth/components/user-menu.test.tsx`
- `tests/features/auth/layouts/auth.layout.test.tsx`: skip link, main landmark, brand/footer, loading, authenticated redirect.
- `tests/features/auth/routes/auth.router.test.tsx`: lazy pages render on `/login`, `/register` and `/reset-password`; authenticated users redirect.

App:

- `tests/app/layouts/root-layout.test.tsx`: loading placeholder, guest login link, authenticated `UserMenu`.
- `tests/app/routes/home-page.test.tsx`: loading, guest and authenticated states.
- `tests/app/routes/router.test.tsx`: `/`, `/login` composition and 404; mock `@/features/auth`.

Migration:

- Move `src/app/routes/router.test.tsx` → `tests/app/routes/router.test.tsx`.
- Move `src/shared/config/env.test.ts` → `tests/shared/config/env.test.ts`.
- Move `src/shared/lib/firebase/index.test.ts` → `tests/shared/lib/firebase/index.test.ts`.
- Move `src/shared/lib/utils.test.ts` → `tests/shared/lib/utils.test.ts`.
- Move `tests/rules/baseline.test.ts` → `tests/firestore-rules/baseline.test.ts`.
- Move `tests/rules/helpers.ts` → `tests/firestore-rules/helpers.ts`.

Rules and tooling:

- `tests/firestore-rules/baseline.test.ts` keeps its current behavior; no new Firestore rules tests in 002.
- `scripts/check-architecture.test.mjs` stays unchanged next to its script and fixtures.

### 11.5 Harness and migration

`vite.config.ts`:

```ts
test: {
  environment: 'jsdom',
  setupFiles: ['./tests/setup.ts'],
  include: ['tests/**/*.test.{ts,tsx}', 'scripts/**/*.test.mjs'],
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    'tests/firestore-rules/**',
    'scripts/fixtures/**',
  ],
}
```

`vitest.rules.config.ts`:

```ts
test: {
  environment: 'node',
  include: ['tests/firestore-rules/**/*.test.ts'],
}
```

`eslint.config.js`:

- The rules-test exception targets `tests/firestore-rules/**/*.ts`.
- No other ESLint boundary change: tests are outside `src`, so `eslint-plugin-boundaries` continues to cover `src` only.

`tsconfig.json`:

- `tests` remains included.
- The `@/*` alias remains mapped to `src/*`.
- No change is expected.

`package.json`:

- No new test scripts; `pnpm test` and `pnpm test:rules` keep their names.
- `pnpm test:rules` runs the renamed `vitest.rules.config.ts`.

`tests/setup.ts`:

- Stays at the same path and keeps the RTL cleanup.

Migration notes:

- `tests/firestore-rules/helpers.ts` keeps `../../firestore.rules`; the depth is unchanged.
- The four application test moves are behavior-preserving until auth composition updates `router.test.tsx`.
- `pnpm verify` must pass without emulators.
- `pnpm test:rules` is not required for 002 because no rules or indexes change. Run it once after the move if Java and the Firestore emulator are available.

### 11.6 Test constraints

- No coverage threshold. Critical behavior must have tests; a change with missing or failing critical tests is not done.
- Do not delete, skip or weaken a failing test to make a change pass.
- Test descriptions, helpers and fixtures are English. Assertions on UI text use Spanish.
- Prefer accessible queries (`getByRole`, `getByLabelText`) and behavior assertions over implementation details or broad snapshots.
- Use `userEvent` for interactions. Use `findBy*` or `waitFor` for async behavior; no arbitrary timeouts.
- Reset mocks and store state between tests.
- Firestore rules tests clear Firestore between cases.
- No `console.log`, `any` or `dangerouslySetInnerHTML`.

## 12. Documentation and skill deliverables

Implementation order: create the convention before the auth code.

1. `.opencode/skills/melodium-feature/SKILL.md` (new, English).
2. `.opencode/skills/melodium-testing/SKILL.md` (new, English).
3. `docs/decisions/feature-structure.md` (new, normative ADR).
4. `docs/constitution.md` v1.1:
   - §6: application tests under `tests/`, no tests in `src`, rules in `tests/firestore-rules/`, tooling next to scripts.
   - Version bump and updated date.
   - Amendment history.
5. `docs/specs/001-platform/deltas/001-test-layout.md` (new):
   - Supersedes the test placement and harness paths in 001.
   - Includes the `vite.config.ts`, `vitest.rules.config.ts` and ESLint changes.
   - Includes the migration list and acceptance criteria.
6. `docs/specs/001-platform/spec.md`:
   - Add a pointer to the delta at the header and §9.
   - Do not rewrite the shipped history.
   - Normalize the header status to `Shipped` if it still says `Approved`.
7. `docs/specs/README.md`:
   - Add the 002 row as `Proposed`.
   - Add a delta index and the `deltas/` layout.
   - Add the cross-cutting test-location rule.
8. `docs/specs/000-capability-map.md`:
   - Version bump and date.
   - Amend the `auth` contract: `initializeAuth`, `useAuth`, `authRoutes`, `RequireAuth`, `UserMenu`, `AuthUser`, `AuthState`, `AuthStatus`, `SignUpResult`.
   - Remove `AuthProvider`.
9. `AGENTS.md`:
   - Add `melodium-feature` and `melodium-testing` to Skills.
   - Update Testing and the hard rules for the new test layout.
10. `melodium-architecture`:
    - `SKILL.md`: tests under `tests/`, rules path, link to `melodium-testing`.
    - `references/feature-checklist.md`: canonical tree, no `providers/`/`schemas/`/colocated tests, app composes feature routes instead of importing pages, rules path.
    - `references/layers-and-imports.md`: public API rules (no pages), tests path, rules path.
    - `references/firebase-and-data.md`: `*.api.ts` naming, store location, rules path.
11. `melodium-react`:
    - `SKILL.md`: schemas in `lib/`, stores in `stores/*.store.ts`.
    - `references/forms-and-ui.md`: schemas in `lib/`.
    - `references/state-and-data.md`: auth example uses Zustand, `status` names match §5, no global `error`, tests path, compositions store path.
    - `references/review-checklist.md`: rules path.
12. `README.md`:
    - Test layout and commands.
    - Auth manual QA with emulators and the reset link printed by the Auth emulator.
13. `vite.config.ts`, `vitest.rules.config.ts` and `eslint.config.js` updates.
14. Test migration and auth tests.

No `skills-lock.json` change.

No change expected in `spec-driven-development`; its `tests/` guidance is compatible.

## 13. Capability map delta

The approved map says `auth` provides a public `AuthProvider`. With Zustand, the public contract becomes:

- `initializeAuth`
- `useAuth`
- `authRoutes`
- `RequireAuth`
- `UserMenu`
- `AuthUser`, `AuthState`, `AuthStatus`, `SignUpResult`

`AuthProvider` is removed. The rest of the `auth` row stands.

This delta requires owner approval.

## 14. Boundaries

Always:

- Import Firebase only through `@/shared/lib/firebase`, and only in `api/`.
- Keep `AuthUser` independent from Firebase types.
- Validate with Zod before calling Firebase.
- Show Spanish messages.
- Keep components inside the feature until promotion is approved.
- Keep one router file per feature and lazy-load pages.
- Keep the public API minimal.
- Keep application tests under `tests/`, mirroring `src/`.
- Let a feature test import that feature's internals; use only the public API for other features.
- Mock `@/shared/lib/firebase` in application tests.
- Keep Firestore rules tests in `tests/firestore-rules/` and tooling tests next to their script.

Ask first:

- Adding providers beyond Google and email/password.
- Moving an auth component to `shared`.
- Changing route paths, redirects or persistence.
- Adding profile fields beyond the minimum.
- Changing the feature graph or public API.
- Adding an effect.
- Adding a new top-level folder inside a feature.
- Changing the test layout or adding a test exception.

Never:

- Expose Firebase `User`, tokens or provider data.
- Add Firestore rules or indexes.
- Use React effects for auth state.
- Store credentials in local storage.
- Implement email verification in this module.
- Import feature internals from app or another feature.
- Put `*.test.ts(x)` files in `src`.
- Import cross-feature internals from tests.
- Put test helpers in `src`.
- Import tests from `src`.

## 15. Out of scope

- Email verification and verification gates.
- MFA and phone authentication.
- Account deletion and profile editing.
- Additional social providers or account linking.
- Custom reset page, `oobCode` handling or custom email templates.
- “Remember me” or custom session persistence.
- Protected composition or setlist routes beyond the tested `RequireAuth`.
- Firestore rules, indexes or user profile documents.
- Deploy, CI and Firebase console configuration.
- Automated enforcement of the feature tree or test placement (`ARCH010` or equivalent).
- Moving tooling tests under `tests/`.
- Coverage thresholds and E2E tests.

## 16. Acceptance criteria

1. The auth feature matches the canonical tree; there is one `auth.router.tsx`, one `auth.layout.tsx`, lazy pages, a Zustand store, separated interfaces/types and `.api.ts` naming.
2. The `melodium-feature` and `melodium-testing` skills and the `feature-structure` ADR exist; `AGENTS.md`, `melodium-architecture` and `melodium-react` no longer contradict the convention.
3. A visitor can register with email/password, optionally save a display name and land on `/`.
4. A visitor can sign in with email/password and with Google popup and land on `/`.
5. Invalid credentials show the generic Spanish message inline.
6. Reset always shows the generic confirmation for a valid email; network and rate-limit errors are shown.
7. The session survives a reload through Firebase persistence.
8. The header shows the user and logout; logout navigates to `/login`.
9. Authenticated users on auth routes redirect to `/`.
10. `RequireAuth` is tested for loading, redirect and authenticated states.
11. The public API does not expose Firebase `User`, the store, the service, pages, schemas or error helpers.
12. No React effect is added; `docs/decisions/effects.md` stays unchanged.
13. `pnpm verify` passes; `pnpm test:rules` is not required for 002.
14. Auth screens are usable with keyboard and at 320 px without overflow.
15. All application tests live under `tests/app`, `tests/shared` or `tests/features/<feature>`, mirroring `src/`; no `*.test.ts(x)` remains in `src/`.
16. `tests/firestore-rules/` contains the moved baseline and helpers; `scripts/check-architecture.test.mjs` remains next to its script.
17. `vite.config.ts` discovers `tests/**/*.test.{ts,tsx}` and `scripts/**/*.test.mjs`, and excludes `tests/firestore-rules/**`.
18. `vitest.rules.config.ts` discovers `tests/firestore-rules/**/*.test.ts`.
19. `docs/constitution.md` is v1.1 and the `001-test-layout` delta exists; no docs or skills still present colocated tests, `tests/rules/`, `providers/` or `schemas/` as the convention.
20. The existing tests were migrated without losing coverage.

## 17. Decisions pending

None. The test layout, skill/ADR, capability map amendment, error surface and folder rules are resolved in §2.

## 18. Change log

| Version | Date       | Change                                                                                                                                                                                          |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.2     | 2026-11-19 | Implemented and verified; status moved to `Shipped` after owner acceptance.                                                                                                                     |
| 1.1     | 2026-11-19 | Application tests move under `tests/`; rules tests move to `tests/firestore-rules/`; tooling tests stay with scripts; add `melodium-testing`; amend constitution, 001 delta and capability map. |
| 1.0     | 2026-11-19 | Initial auth spec.                                                                                                                                                                              |
