# Plan 002: Auth — V1

Status: Approved
Version: 1.0
Last updated: 2026-11-19
Module id: `auth`
Spec: [spec.md](./spec.md) — Approved
Capability map: [000-capability-map.md](../000-capability-map.md) — Approved (amended with this module)
Runtime feature edges: none

## 1. Summary

Auth is the reference implementation of the feature convention, so the convention and the test layout ship before the feature:

1. Write the convention: ADR, `melodium-feature`, `melodium-testing`, constitution v1.1, the `001-test-layout` delta and the capability-map amendment.
2. Align `AGENTS.md` and both Melodium skills with the new tree and test paths.
3. Move the existing tests and switch the harness to `tests/**` and `tests/firestore-rules/**`.
4. Add the three approved dependencies and the two shared primitives.
5. Extend the Firebase facade with `updateProfile`.
6. Build auth bottom-up: lib → `api/` → store → hook → components → pages → layout → router → app composition.
7. Verify, update docs and hand off.

No Firestore rules, indexes, data model, effect or deployment change is introduced.

## 2. Constraints

- Only `zustand@^5.1.0`, `react-hook-form@^7.92.0` and `@hookform/resolvers@^7.0.7` are added. `Input` and `Label` are local shadcn-style primitives; no `@radix-ui/react-label`.
- The canonical feature tree in spec §3 is exhaustive. No `providers/` folder.
- Application tests live under `tests/` and never under `src/`. Firestore rules tests live under `tests/firestore-rules/`; the tooling test stays in `scripts/`.
- Firebase imports stay in `src/shared/lib/firebase` and `src/features/auth/api/`.
- Firebase `User` never leaves the auth feature.
- No React effect. `docs/decisions/effects.md` is not edited.
- The public API is exactly spec §5; every other export stays internal.
- `pnpm verify` must pass without emulators, network or a real Firebase project.
- `pnpm test:rules` is not required for 002; run it once after the move only if Java and the emulator are available.
- No commit, push, PR or deploy.

## 3. Assumptions

1. The registry is reachable during `A08`; nothing else needs network access.
2. `eslint-plugin-boundaries` keeps covering `src` only, so the test move needs no boundary rewiring.
3. `tests/setup.ts` stays valid at the same path.
4. `tests/firestore-rules/helpers.ts` keeps `../../firestore.rules` because the directory depth does not change.
5. The architecture checker does not scan `tests`, so moved tests stay outside `ARCH002`/`ARCH007` and no checker rule is added in 002.
6. React Router 8 lazy routes and `<Suspense>` behave in jsdom as they do in the current shell tests; if not, the test renders the lazy page module directly and the route test waits with `findBy*`.
7. sonner toasts work in jsdom as they already do for the shell; auth tests assert toast calls through a spy when needed.
8. Firebase Auth errors are plain `Error` objects with a `code` string; non-`Error` rejections fall back to the generic message.

## 4. Implementation strategy

### 4.1 Convention first

`A01`–`A06` write and align the convention before any auth file exists. This is deliberate: the feature must not become a precedent that contradicts the skills, and the capability map must stop advertising `AuthProvider` before code depends on it.

### 4.2 Test layout migration in isolation

`A07` moves the four application tests and the rules test, then switches `vite.config.ts`, `vitest.rules.config.ts` and the ESLint exception. Running `pnpm verify` after this task proves the migration before auth composition changes `router.test.tsx`.

### 4.3 Bottom-up feature build

`A11`–`A18` build the feature in dependency order:

- `lib/`: pure errors, schemas and the user mapper.
- `api/`: the only Firebase I/O.
- `stores/`: Zustand, actions and `initializeAuth`.
- `hooks/` and guards.
- Reusable form components.
- Forms, pages, layout and router.
- `UserMenu`, which the app header consumes.

Each layer is tested under the mirrored `tests/features/auth/` path as it is written.

### 4.4 App composition last

`A19` wires `initializeAuth()` and the global `<Toaster />` in `main.tsx`, composes `authRoutes` outside `RootLayout`, updates the header and the home, and updates the app tests. The app imports only `@/features/auth`.

### 4.5 Final gate

`A20` runs `pnpm verify`, checks the manual flows, updates the README and closes the spec/tasks state.

## 5. Work breakdown

| ID    | Phase        | Outcome                                                                                  | Depends on   |
| ----- | ------------ | ---------------------------------------------------------------------------------------- | ------------ |
| `A01` | Convention   | `feature-structure` ADR and the `melodium-feature` / `melodium-testing` skills           | —            |
| `A02` | Convention   | Constitution v1.1 and the `001-test-layout` delta; 001 header normalized                 | `A01`        |
| `A03` | Convention   | Capability map v1.1 with the new auth contract                                           | `A01`        |
| `A04` | Convention   | `AGENTS.md` aligned with the new tree, tests and skills                                  | `A01`        |
| `A05` | Convention   | `melodium-architecture` skill and references aligned                                     | `A01`        |
| `A06` | Convention   | `melodium-react` skill and references aligned                                            | `A01`        |
| `A07` | Harness      | Harness paths switched; existing tests moved; full gate green                            | `A02`        |
| `A08` | Dependencies | Zustand, React Hook Form and resolvers installed and locked                              | `A07`        |
| `A09` | Shared       | `Input` and `Label` primitives and tests                                                 | `A08`        |
| `A10` | Shared       | `updateProfile` in the Firebase facade and facade test                                   | `A08`        |
| `A11` | Auth domain  | `types/`, `interfaces/` and `lib/` for errors, schemas and users                         | `A08`        |
| `A12` | Auth data    | `api/auth-service.api.ts` and its tests                                                  | `A11`        |
| `A13` | Auth state   | `stores/auth.store.ts`, `initializeAuth` and store tests                                 | `A12`        |
| `A14` | Auth state   | `hooks/use-auth.ts`, `AuthLoading` and `RequireAuth` with tests                          | `A13`        |
| `A15` | Auth UI      | `AuthAlert`, `AuthField`, `PasswordInput` and `GoogleSignInButton` with tests            | `A11`        |
| `A16` | Auth UI      | Login, register and reset forms with tests                                               | `A14`, `A15` |
| `A17` | Auth routes  | Pages, `AuthLayout`, lazy `authRoutes` and tests                                         | `A16`        |
| `A18` | Auth UI      | `UserMenu` and tests                                                                     | `A14`        |
| `A19` | App          | `main.tsx`, global `Toaster`, `RootLayout`, `HomePage`, router composition and app tests | `A17`, `A18` |
| `A20` | Verification | README, manual QA, `pnpm verify`, spec/tasks status                                      | `A19`        |

## 6. Dependency graph

```text
A01 -> A02 -> A07 -> A08 -> A09
A01 -> A03
A01 -> A04
A01 -> A05
A01 -> A06
A08 -> A10
A08 -> A11 -> A12 -> A13 -> A14 -> A16 -> A17 -> A19 -> A20
A11 -> A15 -> A16
A14 -> A18 -> A19
```

`A03`–`A06` are independent documents after `A01` and can run in parallel. `A09` and `A10` are independent shared lanes. `A18` can run as soon as `A14` exists.

## 7. Verification checkpoints

| Checkpoint           | After | Commands                                   | Expected                                                                |
| -------------------- | ----- | ------------------------------------------ | ----------------------------------------------------------------------- |
| `CA0` Preflight      | Start | `git status --short`, `pnpm -v`, `node -v` | Clean tree on `development`; Node 24 and pnpm 10.19.0.                  |
| `CA1` Convention     | `A06` | `pnpm format:check`                        | Docs and skills formatted; no contradiction remains.                    |
| `CA2` Test migration | `A07` | `pnpm verify`                              | Green with tests under `tests/`; no `*.test.ts(x)` in `src/`.           |
| `CA3` Shared         | `A10` | `pnpm verify`                              | Green with `Input`, `Label` and `updateProfile` covered.                |
| `CA4` Auth core      | `A13` | `pnpm exec vitest run tests/features/auth` | lib, api and store tests pass; no network.                              |
| `CA5` Auth UI        | `A18` | `pnpm exec vitest run tests/features/auth` | Components, forms, guards, layout, router and menu tests pass.          |
| `CA6` App            | `A19` | `pnpm verify`                              | Full gate passes; app tests mock `@/features/auth`.                     |
| `CA7` Final          | `A20` | `pnpm verify`, `pnpm dev`                  | Spec §16 criteria 1–20 met; manual auth QA with emulators if available. |

## 8. Risks and mitigations

| Risk                                                                                       | Impact                                           | Mitigation                                                                                                                           |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Zustand 5 import or selector semantics differ from the expected API.                       | Store tests fail or `useAuth` re-renders poorly. | Use `create` from `zustand` and atomic selectors; prove with `use-auth.test.tsx`.                                                    |
| React Hook Form 7 + resolvers 7 + Zod 4 typing mismatch.                                   | Typecheck fails on form generics.                | Follow resolver docs; keep schemas in `lib/auth-schemas.ts` and infer types from them; do not cast with `any`.                       |
| Firebase `updateProfile` is missing from the facade.                                       | Registration cannot save the name.               | `A10` adds it before any auth code; facade test asserts it.                                                                          |
| Lazy pages break jsdom rendering.                                                          | Route tests fail.                                | Wrap the route test in `findBy*`; if needed, render the page module directly in component tests and keep one integration route test. |
| Sonner rendering inside `AuthLayout` tests requires browser APIs.                          | Component tests fail.                            | Mock `sonner` when a test only asserts a toast call; do not polyfill globally.                                                       |
| Moving tests changes relative imports.                                                     | Tests fail after the move.                       | Use the `@/` alias for application imports; only `helpers.ts` keeps a relative rules path, and its depth is unchanged.               |
| Prettier reformats the large docs diff.                                                    | Noisy review.                                    | Run `pnpm format` once and review the docs diff; do not add docs to `.prettierignore`.                                               |
| The auth redirect tests loop because authenticated users redirect from auth routes to `/`. | Tests hang.                                      | Mock `useAuth` per test; never render the real store in route tests.                                                                 |
| `initializeAuth` subscribes twice under `StrictMode`/HMR.                                  | Duplicate listeners.                             | Module-level guard returns the same cleanup; store test asserts one subscription per module instance.                                |
| An effect seems necessary for focus or redirect.                                           | Violates the constitution.                       | Use callback refs for focus and `<Navigate>` for redirects; no effect.                                                               |

## 9. Parallelism

- Sequential: `A01` → `A02` → `A07` → `A08`, because the convention and harness must exist before the feature.
- Parallel after `A01`: `A03`, `A04`, `A05`, `A06`.
- Parallel after `A08`: `A09`, `A10`, `A11`.
- Sequential auth lane: `A11` → `A12` → `A13` → `A14` → `A16` → `A17` → `A19`.
- Parallel: `A15` after `A11`, `A18` after `A14`.
- Final: `A20` after `A19`.

## 10. Traceability to the spec

| Spec acceptance criterion                                                                      | Covered by                                  |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 1. Canonical auth tree, one router, one layout, lazy pages, store, interfaces/types, `.api.ts` | `A11`–`A18`                                 |
| 2. Skills and ADR exist; AGENTS and Melodium skills aligned                                    | `A01`–`A06`                                 |
| 3. Email/password registration with optional display name lands on `/`                         | `A13`, `A16`, `A17`, `A19`                  |
| 4. Email/password and Google popup sign-in lands on `/`                                        | `A12`, `A16`, `A19`                         |
| 5. Invalid credentials show the generic Spanish message                                        | `A11`, `A16`                                |
| 6. Reset shows the generic confirmation; network and rate-limit errors are shown               | `A11`, `A12`, `A16`                         |
| 7. Session survives a reload through Firebase persistence                                      | `A13`, `A19`                                |
| 8. Header shows the user and logout navigates to `/login`                                      | `A18`, `A19`                                |
| 9. Authenticated users on auth routes redirect to `/`                                          | `A14`, `A17`                                |
| 10. `RequireAuth` covers loading, redirect and authenticated                                   | `A14`                                       |
| 11. Public API exposes nothing internal                                                        | `A18` + `tests/features/auth/index.test.ts` |
| 12. No effect; effects registry unchanged                                                      | All tasks                                   |
| 13. `pnpm verify` passes                                                                       | `A20`                                       |
| 14. Keyboard and 320 px                                                                        | `A15`–`A18`, `A20`                          |
| 15. All application tests under `tests/`, none in `src/`                                       | `A07` + every auth test task                |
| 16. Rules baseline moved; tooling test stays                                                   | `A07`                                       |
| 17. `vite.config.ts` discovery                                                                 | `A07`                                       |
| 18. `vitest.rules.config.ts` discovery                                                         | `A07`                                       |
| 19. Constitution v1.1, delta, no stale convention docs                                         | `A02`–`A06`                                 |
| 20. Existing tests migrated without coverage loss                                              | `A07`                                       |

## 11. Decisions to confirm during review

1. **`002-auth` status.** The spec is approved; the index moves to `Implementing` while tasks run and to `Shipped` only after owner acceptance, matching how 001 was handled.
2. **`A07` verification.** `pnpm test:rules` is run only if Java is available; it is not part of the gate because 002 changes no rules or indexes.
3. **App test mocking.** `tests/app/**` mocks the whole `@/features/auth` public API instead of importing the real store, keeping app tests independent from auth internals.
4. **Auth route test strategy.** One integration test renders `authRoutes` in a memory router; component tests render forms directly with mocked actions, avoiding store coupling.
5. **`AuthAlert` focus.** Focus is moved with a callback ref in the component that owns the alert, not with an effect.
6. **Zone of `initializeAuth`.** It lives in `stores/auth.store.ts` because it initializes the store; `main.tsx` calls it once and discards the cleanup because the app lives for the page lifetime.

## 12. Out of scope

Everything in spec §15 remains out of scope. In particular: email verification, MFA, account deletion, extra providers, custom reset pages, protected composition routes, Firestore rules/indexes, deploy/CI, automated feature-tree enforcement, coverage thresholds and E2E tests.
