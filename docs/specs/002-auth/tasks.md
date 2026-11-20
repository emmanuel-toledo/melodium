# Tasks 002: Auth — V1

Status: Shipped
Version: 1.0
Last updated: 2026-11-19
Module id: `auth`
Spec: [spec.md](./spec.md) — Approved
Plan: [plan.md](./plan.md) — Approved

## How to use this list

- Work in order. `A03`–`A06` are independent after `A01`; `A09`, `A10` and `A11` are independent after `A08`; `A15` follows `A11`; `A18` follows `A14`.
- Complete one task at a time, update its checkbox, and run its verification before moving on.
- Run `pnpm verify` after every application-code task. It is the gate.
- Do not add work outside this list. If a task reveals a spec gap, stop and update the spec, plan and tasks first.
- Do not add, remove or upgrade a dependency outside `zustand`, `react-hook-form` and `@hookform/resolvers`.
- Do not write a React effect. `docs/decisions/effects.md` stays unchanged.
- Do not add Firestore rules or indexes.
- Do not commit, push, open a PR or deploy without explicit approval.
- Test descriptions are English; UI assertions use Spanish.

## Phase A — Convention and documentation

### A01 — Feature-structure ADR and feature/testing skills

- [x] **A01 — Feature-structure ADR and feature/testing skills**
  - Goal: The canonical feature tree and the test layout become documented rules before auth code exists.
  - Depends on: none.
  - Acceptance:
    - `docs/decisions/feature-structure.md` is a normative ADR: context, decision, canonical tree, folder responsibilities, naming suffixes, promotion gate, public API rule, no `providers/`, exhaustive tree, test mirroring and consequences.
    - `.opencode/skills/melodium-feature/SKILL.md` exists, in English, with YAML frontmatter (`name`, `description`), and describes when to use it, the canonical tree, naming, the public `index.ts`, the promotion gate, the app composition rule and the checklist.
    - `.opencode/skills/melodium-testing/SKILL.md` exists, in English, with YAML frontmatter, and describes the test types, the mirrored `tests/` layout, import rules, mocking rules, commands, constraints and migration rules.
    - `melodium-feature` references `melodium-testing` instead of repeating test placement.
    - Neither skill contradicts the constitution, `AGENTS.md` or spec §3, §11.
  - Verify:
    ```bash
    pnpm format:check
    ```
  - Files: `docs/decisions/feature-structure.md`, `.opencode/skills/melodium-feature/SKILL.md`, `.opencode/skills/melodium-testing/SKILL.md`.

### A02 — Constitution v1.1 and the `001-test-layout` delta

- [x] **A02 — Constitution v1.1 and the `001-test-layout` delta**
  - Goal: The test-location change is a formal amendment, not a doc drift.
  - Depends on: `A01`.
  - Acceptance:
    - `docs/constitution.md` is `Version: 1.1`, `Last updated: 2026-11-19`, with an amendment-history entry describing the test move.
    - §6 states: application tests under `tests/`, mirroring `src/`; no `*.test.ts(x)` under `src/`; Firestore rules tests under `tests/firestore-rules/`; tooling tests next to the script; `tests/setup.ts` global setup; critical tests still mandatory.
    - `docs/specs/001-platform/deltas/001-test-layout.md` exists with status `Approved`, objective, current behavior, new behavior, harness changes, migration list, success criteria and boundaries.
    - `docs/specs/001-platform/spec.md` header points to the delta and its status is `Shipped`; §9 points to the delta. No shipped requirement is rewritten.
    - `docs/specs/README.md` already lists the delta; adjust only if the text diverges.
  - Verify:
    ```bash
    pnpm format:check
    grep -n "Version: 1.1" docs/constitution.md
    test -f docs/specs/001-platform/deltas/001-test-layout.md
    ```
  - Files: `docs/constitution.md`, `docs/specs/001-platform/deltas/001-test-layout.md`, `docs/specs/001-platform/spec.md`, `docs/specs/README.md`.

### A03 — Capability map v1.1

- [x] **A03 — Capability map v1.1**
  - Goal: The approved map stops advertising `AuthProvider` and matches the Zustand contract.
  - Depends on: `A01`.
  - Acceptance:
    - `docs/specs/000-capability-map.md` is `Version: 1.1`, `Last updated: 2026-11-19`.
    - The `auth` contract lists `initializeAuth`, `useAuth`, `authRoutes`, `RequireAuth`, `UserMenu`, `AuthUser`, `AuthState`, `AuthStatus`, `SignUpResult`; `AuthProvider` is gone.
    - The rest of the map is unchanged.
  - Verify:
    ```bash
    grep -n "AuthProvider" docs/specs/000-capability-map.md || true
    pnpm format:check
    ```
  - Files: `docs/specs/000-capability-map.md`.

### A04 — Align `AGENTS.md`

- [x] **A04 — Align `AGENTS.md`**
  - Goal: The always-on instructions match the convention.
  - Depends on: `A01`.
  - Acceptance:
    - Skills section adds `melodium-feature` and `melodium-testing` with their triggers.
    - Hard rules add: tests under `tests/`, no tests in `src`, rules tests in `tests/firestore-rules/`, feature tree rules (`api/*.api.ts`, `stores/*.store.ts`, one `<feature>.router.tsx`, one layout, no `providers/`).
    - Testing section describes the mirrored layout and commands; it no longer says tests live next to the code.
    - Data, testing obligations and "Preguntar primero" stay consistent.
  - Verify:
    ```bash
    pnpm format:check
    grep -n "melodium-feature\|melodium-testing\|tests/firestore-rules" AGENTS.md
    ```
  - Files: `AGENTS.md`.

### A05 — Align `melodium-architecture`

- [x] **A05 — Align `melodium-architecture`**
  - Goal: The architecture skill describes the real tree, public API and test paths.
  - Depends on: `A01`.
  - Acceptance:
    - `SKILL.md`: feature tree summary, public API without pages, tests under `tests/`, rules path, reference to `melodium-testing`.
    - `references/feature-checklist.md`: canonical tree, no `providers/`/`schemas/`, app composes feature routes instead of importing pages, tests mirrored under `tests/`, rules path.
    - `references/layers-and-imports.md`: app imports only `@/features/<feature>`; public API excludes pages; test import rules and rules path.
    - `references/firebase-and-data.md`: `*.api.ts` naming, store location, rules path.
  - Verify:
    ```bash
    pnpm format:check
    grep -rn "tests/rules\|colocated\|next to the code" .opencode/skills/melodium-architecture || true
    ```
  - Files: `.opencode/skills/melodium-architecture/SKILL.md` and `references/*.md`.

### A06 — Align `melodium-react`

- [x] **A06 — Align `melodium-react`**
  - Goal: The React skill points at the real store, schema and test locations.
  - Depends on: `A01`.
  - Acceptance:
    - `SKILL.md`: schemas in `lib/`, stores in `stores/*.store.ts`, tests under `tests/`, auth example uses the Zustand store contract.
    - `references/forms-and-ui.md`: schemas in `lib/`.
    - `references/state-and-data.md`: auth example uses Zustand with `loading | authenticated | unauthenticated`, no global `error`, store not persisted, tests path, compositions store path.
    - `references/review-checklist.md`: tests path and rules path.
    - No `schemas/`, `providers/` or colocated-test guidance remains.
  - Verify:
    ```bash
    pnpm format:check
    grep -rn "src/features/auth/schemas\|providers/\|status: 'anonymous'" .opencode/skills/melodium-react || true
    ```
  - Files: `.opencode/skills/melodium-react/SKILL.md` and `references/*.md`.

## Phase B — Harness migration

### A07 — Move tests and switch the harness

- [x] **A07 — Move tests and switch the harness**
  - Goal: The suite runs from `tests/` with no test file under `src/`.
  - Depends on: `A02`.
  - Acceptance:
    - `vite.config.ts` includes `tests/**/*.test.{ts,tsx}` and `scripts/**/*.test.mjs`; excludes `tests/firestore-rules/**`, `scripts/fixtures/**`, `node_modules` and `dist`.
    - `vitest.rules.config.ts` includes `tests/firestore-rules/**/*.test.ts`.
    - `eslint.config.js` targets `tests/firestore-rules/**/*.ts` for the Node/rules exception; no other boundary change.
    - Moves: `src/app/routes/router.test.tsx`, `src/shared/config/env.test.ts`, `src/shared/lib/firebase/index.test.ts`, `src/shared/lib/utils.test.ts`, `tests/rules/baseline.test.ts`, `tests/rules/helpers.ts` to their mirrored destinations.
    - `tests/rules/` no longer exists; `tests/setup.ts` stays.
    - Import paths still resolve through `@/`; the rules helper keeps `../../firestore.rules`.
    - `pnpm verify` passes without emulators.
    - `pnpm test:rules` passes if Java and the emulator are available.
  - Verify:
    ```bash
    pnpm verify
    find src -name '*.test.ts' -o -name '*.test.tsx'
    ls tests/firestore-rules
    ```
  - Files: `vite.config.ts`, `vitest.rules.config.ts`, `eslint.config.js`, the six moved test files, deleted `tests/rules/`.

## Phase C — Shared infrastructure

### A08 — Install approved dependencies

- [x] **A08 — Install approved dependencies**
  - Goal: Only the three approved runtime dependencies are added.
  - Depends on: `A07`.
  - Acceptance:
    - `zustand@^5.1.0`, `react-hook-form@^7.92.0` and `@hookform/resolvers@^7.0.7` are in `dependencies`; versions resolve as documented.
    - `pnpm-lock.yaml` is generated by pnpm, not edited by hand.
    - No other dependency changes.
    - `pnpm verify` passes.
  - Verify:
    ```bash
    pnpm install
    git diff --stat package.json pnpm-lock.yaml
    pnpm verify
    ```
  - Files: `package.json`, `pnpm-lock.yaml`.

### A09 — Shared `Input` and `Label`

- [x] **A09 — Shared `Input` and `Label`**
  - Goal: Auth forms use project primitives without a new Radix dependency.
  - Depends on: `A08`.
  - Acceptance:
    - `src/shared/components/ui/input.tsx` exposes an `Input` matching the shadcn API and theme tokens.
    - `src/shared/components/ui/label.tsx` exposes a plain `<label>` with the shadcn styles; no Radix import.
    - Tests under `tests/shared/components/ui/` cover rendering, disabled state and class merging.
    - `pnpm verify` passes.
  - Verify:
    ```bash
    pnpm exec vitest run tests/shared/components/ui
    pnpm verify
    ```
  - Files: `src/shared/components/ui/input.tsx`, `src/shared/components/ui/label.tsx`, `tests/shared/components/ui/input.test.tsx`, `tests/shared/components/ui/label.test.tsx`.

### A10 — Firebase facade `updateProfile`

- [x] **A10 — Firebase facade `updateProfile`**
  - Goal: Registration can save a display name without importing the Firebase SDK.
  - Depends on: `A08`.
  - Acceptance:
    - `src/shared/lib/firebase/index.ts` re-exports `updateProfile`.
    - `tests/shared/lib/firebase/index.test.ts` mocks and asserts it.
    - No other facade surface changes.
    - `pnpm verify` passes.
  - Verify:
    ```bash
    pnpm exec vitest run tests/shared/lib/firebase
    pnpm verify
    ```
  - Files: `src/shared/lib/firebase/index.ts`, `tests/shared/lib/firebase/index.test.ts`.

## Phase D — Auth domain, data and state

### A11 — Auth types, interfaces and `lib/`

- [x] **A11 — Auth types, interfaces and `lib/`**
  - Goal: Pure contracts, error mapping, validation schemas and the user mapper, fully tested.
  - Depends on: `A08`.
  - Acceptance:
    - `types/auth-status.type.ts`, `types/auth-error-code.type.ts`, `types/auth-form.type.ts`.
    - `interfaces/auth-user.interface.ts`, `interfaces/auth-state.interface.ts`, `interfaces/auth-error.interface.ts`, `interfaces/sign-up-result.interface.ts`.
    - `lib/auth-errors.ts`: `AuthError` with `code`, `isAuthError`, `getAuthErrorMessage`, and the spec §9 map including the fallback.
    - `lib/auth-schemas.ts`: Zod schemas and inferred form types for login, register and reset; email trim/lowercase; registration minimum 8; optional display name max 60 and trimmed; confirmation match.
    - `lib/auth-user.ts`: maps a Firebase-shaped user to `AuthUser` without importing Firebase types.
    - Tests mirror the source under `tests/features/auth/`.
    - No `any`, no raw Firebase message rendered.
    - `pnpm verify` passes.
  - Verify:
    ```bash
    pnpm exec vitest run tests/features/auth/lib
    pnpm verify
    ```
  - Files: `src/features/auth/types/*`, `src/features/auth/interfaces/*`, `src/features/auth/lib/*`, mirrored tests.

### A12 — Auth service `api/`

- [x] **A12 — Auth service `api/`**
  - Goal: The only Firebase I/O for auth, tested without network.
  - Depends on: `A11`.
  - Acceptance:
    - `api/auth-service.api.ts` wraps `onAuthStateChanged`, email sign-in, Google popup, sign-up with optional `updateProfile`, password reset, sign-out.
    - Sign-up returns `SignUpResult`; `updateProfile` failure yields `displayNameSaved: false` and still succeeds.
    - Reset swallows `auth/user-not-found`; other errors propagate.
    - `auth/cancelled-popup-request` is a no-op.
    - The subscription maps the Firebase user to `AuthUser`.
    - Tests mock `@/shared/lib/firebase`; no network.
    - `pnpm verify` passes.
  - Verify:
    ```bash
    pnpm exec vitest run tests/features/auth/api
    pnpm verify
    ```
  - Files: `src/features/auth/api/auth-service.api.ts`, `tests/features/auth/api/auth-service.api.test.ts`.

### A13 — Auth store and `initializeAuth`

- [x] **A13 — Auth store and `initializeAuth`**
  - Goal: A non-persisted Zustand store with idempotent Firebase subscription and tested transitions.
  - Depends on: `A12`.
  - Acceptance:
    - `stores/auth.store.ts` exports `useAuthStore` (internal) and `initializeAuth`.
    - Initial state: `user: null`, `status: 'loading'`.
    - Actions call the service, update `user`/`status`, propagate typed errors and expose no global `error`.
    - `initializeAuth` subscribes once, returns the same cleanup on repeated calls, and cleanup unsubscribes without resetting state; tests reset state explicitly.
    - Store tests cover initial state, each action, loading → authenticated/unauthenticated, error propagation and idempotency.
    - `pnpm verify` passes.
  - Verify:
    ```bash
    pnpm exec vitest run tests/features/auth/stores
    pnpm verify
    ```
  - Files: `src/features/auth/stores/auth.store.ts`, `tests/features/auth/stores/auth.store.test.ts`.

### A14 — `useAuth`, `AuthLoading` and `RequireAuth`

- [x] **A14 — `useAuth`, `AuthLoading` and `RequireAuth`**
  - Goal: The public session hook and the reusable guard.
  - Depends on: `A13`.
  - Acceptance:
    - `hooks/use-auth.ts` selects `user`, `status` and each action atomically.
    - `components/auth-loading.tsx` renders an accessible Spanish loading state.
    - `components/require-auth.tsx` renders loading, redirects to `/login` when unauthenticated and renders `<Outlet />` when authenticated.
    - Tests cover selectors, updates and all three guard states.
    - `pnpm verify` passes.
  - Verify:
    ```bash
    pnpm exec vitest run tests/features/auth/hooks tests/features/auth/components/require-auth.test.tsx
    pnpm verify
    ```
  - Files: `src/features/auth/hooks/use-auth.ts`, `src/features/auth/components/auth-loading.tsx`, `src/features/auth/components/require-auth.tsx`, mirrored tests.

## Phase E — Auth UI

### A15 — Reusable auth components

- [x] **A15 — Reusable auth components**
  - Goal: The accessible building blocks the three forms share.
  - Depends on: `A11`.
  - Acceptance:
    - `AuthAlert` renders the message with `role="alert"`, receives focus through a callback ref and exposes no internal error state.
    - `AuthField` binds label, input, description and error with `aria-describedby`/`aria-invalid`.
    - `PasswordInput` adds the show/hide toggle with `aria-pressed` and an inline SVG, no icon dependency.
    - `GoogleSignInButton` renders the Google mark inline, disables while pending and prevents duplicate submits.
    - Tests cover rendering, accessibility attributes, interactions and pending states.
    - `pnpm verify` passes.
  - Verify:
    ```bash
    pnpm exec vitest run tests/features/auth/components
    pnpm verify
    ```
  - Files: `src/features/auth/components/auth-alert.tsx`, `auth-field.tsx`, `password-input.tsx`, `google-sign-in-button.tsx`, mirrored tests.

### A16 — Login, register and reset forms

- [x] **A16 — Login, register and reset forms**
  - Goal: Three validated forms with Spanish errors and pending states.
  - Depends on: `A14`, `A15`.
  - Acceptance:
    - Login: email + password, generic credential error, link to reset and register, Google button, navigation to `/` on success.
    - Register: optional name, email, password, confirmation; toast warning when `displayNameSaved` is false; navigation to `/` on success; Google button.
    - Reset: email form; generic confirmation for `user-not-found`; network and rate-limit errors shown; link back to login.
    - Forms use `noValidate`, React Hook Form + Zod, trim/lowercase email, never trim passwords, focus the first invalid field and the `AuthAlert` on form errors.
    - Submit buttons disable while pending with Spanish pending text.
    - Tests use accessible queries and `userEvent`, mock the store actions and assert navigation.
    - `pnpm verify` passes.
  - Verify:
    ```bash
    pnpm exec vitest run tests/features/auth/components
    pnpm verify
    ```
  - Files: `src/features/auth/components/login-form.tsx`, `register-form.tsx`, `reset-password-form.tsx`, mirrored tests.

### A17 — Pages, `AuthLayout` and `authRoutes`

- [x] **A17 — Pages, `AuthLayout` and `authRoutes`**
  - Goal: Standalone auth routes with lazy pages and redirects for authenticated users.
  - Depends on: `A16`.
  - Acceptance:
    - `pages/login-page.tsx`, `register-page.tsx`, `reset-password-page.tsx` compose the forms and redirect to `/` when authenticated.
    - `layouts/auth.layout.tsx` renders the skip link, brand link, `<main id="main">`, centered card, `<Suspense>` and footer link to `/`; it shows `AuthLoading` while the session resolves.
    - `routes/auth.router.tsx` exports `authRoutes` with `/login`, `/register`, `/reset-password`, lazy page imports and the layout.
    - Tests cover layout landmarks, loading, redirects and each route rendering.
    - `pnpm verify` passes.
  - Verify:
    ```bash
    pnpm exec vitest run tests/features/auth/layouts tests/features/auth/routes
    pnpm verify
    ```
  - Files: `src/features/auth/pages/*`, `src/features/auth/layouts/auth.layout.tsx`, `src/features/auth/routes/auth.router.tsx`, mirrored tests.

### A18 — `UserMenu` and the public `index.ts`

- [x] **A18 — `UserMenu` and the public `index.ts`**
  - Goal: The header menu and the exact public contract.
  - Depends on: `A14`.
  - Acceptance:
    - `components/user-menu.tsx` shows initials or a fallback, the display name or email, and “Salir” with `aria-label="Cerrar sesión"`; it navigates to `/login` on success and shows a Spanish toast on failure.
    - `index.ts` exports only spec §5 and types.
    - `tests/features/auth/components/user-menu.test.tsx` and `tests/features/auth/index.test.ts` prove behavior and the public surface (no store, service, pages, schemas or errors).
    - `pnpm verify` passes.
  - Verify:
    ```bash
    pnpm exec vitest run tests/features/auth/components/user-menu.test.tsx tests/features/auth/index.test.ts
    pnpm verify
    ```
  - Files: `src/features/auth/components/user-menu.tsx`, `src/features/auth/index.ts`, mirrored tests.

## Phase F — App composition and verification

### A19 — App composition

- [x] **A19 — App composition**
  - Goal: The shell reflects the session and the auth routes are live.
  - Depends on: `A17`, `A18`.
  - Acceptance:
    - `src/app/main.tsx` calls `initializeAuth()` before render and renders the global `<Toaster />`.
    - `RootLayout` removes its own `<Toaster />`, keeps the skip link and brand, and renders a loading placeholder, a login link or `UserMenu` from `@/features/auth`.
    - `HomePage` handles loading, guest and authenticated states in Spanish.
    - `src/app/routes/router.tsx` composes `authRoutes` outside `RootLayout`, keeps the error boundary around the auth branch, keeps `/` and `*`, and imports only `@/features/auth`.
    - App tests mock `@/features/auth`: `tests/app/layouts/root-layout.test.tsx`, `tests/app/routes/home-page.test.tsx`, `tests/app/routes/router.test.tsx`.
    - `pnpm verify` passes.
  - Verify:
    ```bash
    pnpm exec vitest run tests/app
    pnpm verify
    ```
  - Files: `src/app/main.tsx`, `src/app/layouts/root-layout.tsx`, `src/app/routes/home-page.tsx`, `src/app/routes/router.tsx`, `tests/app/**`.

### A20 — README, manual QA and final gate

- [x] **A20 — README, manual QA and final gate**
  - Goal: Prove spec §16 and leave the repository reviewable.
  - Depends on: `A19`.
  - Acceptance:
    - README documents the new test layout and commands, and auth manual QA with emulators: register, login, Google (if configured), reset link printed by the Auth emulator, session reload, logout.
    - `pnpm verify` passes without emulators.
    - Manual checks: `/`, `/login`, `/register`, `/reset-password`, unknown path; 320 px; keyboard; no console errors; no horizontal overflow.
    - No `*.test.ts(x)` under `src/`; no `tests/rules/`.
    - Spec, plan and tasks reflect reality; `docs/specs/README.md` marks 002 `Implementing` until owner acceptance.
    - Any spec change is recorded in the spec change log.
    - Final summary lists commands, results and remaining risks.
  - Verify:
    ```bash
    pnpm format
    pnpm verify
    pnpm dev
    git status --short
    ```
  - Files: `README.md`, `docs/specs/002-auth/tasks.md`, `docs/specs/README.md`, `docs/specs/002-auth/spec.md` (only if a contract changed).

## Checkpoints

| Checkpoint           | After | Gate                                                           |
| -------------------- | ----- | -------------------------------------------------------------- |
| `CA0` Preflight      | Start | Clean tree, Node 24, pnpm 10.19.0.                             |
| `CA1` Convention     | `A06` | `pnpm format:check`; no contradictory guidance remains.        |
| `CA2` Test migration | `A07` | `pnpm verify` green from `tests/`; no tests in `src/`.         |
| `CA3` Shared         | `A10` | `pnpm verify` with `Input`, `Label` and `updateProfile`.       |
| `CA4` Auth core      | `A13` | lib, api and store suites pass.                                |
| `CA5` Auth UI        | `A18` | components, forms, guard, layout, router and menu suites pass. |
| `CA6` App            | `A19` | `pnpm verify`; app tests mock `@/features/auth`.               |
| `CA7` Final          | `A20` | Spec §16 criteria 1–20; manual QA; docs updated.               |

## Definition of done

- [x] Every task `A01`–`A20` is checked.
- [x] `pnpm verify` passes.
- [x] Spec §16 criteria 1–20 are met.
- [x] No test file lives under `src/`; rules tests live in `tests/firestore-rules/`.
- [x] No React effect was added; `docs/decisions/effects.md` is unchanged.
- [x] No Firestore rule, index, data-model or dependency beyond the approved three.
- [x] `docs/specs/README.md` reflects the real state.
- [x] No commit, push, PR or deploy was performed.

## Stop conditions

Stop and ask before continuing when:

- A dependency outside the approved three is needed.
- Zustand, React Hook Form or the resolvers need a different major.
- An effect seems necessary.
- A type assertion would need `any` or a lint/TS rule would need disabling.
- The auth contract in spec §5 must change.
- A Firestore rule, index or data-model change appears necessary.
- The test layout needs an exception.
- A commit, push, PR or deploy is requested.
- The implementation needs a file or contract not covered by the spec, plan and these tasks.
