---
name: melodium-feature
description: Use when creating, restructuring or reviewing a feature in Melodium, when deciding where a file belongs inside a feature, or when changing a feature public API. Covers the canonical feature tree, naming, lazy routes and the shared promotion gate.
---

# Melodium Feature

Owns **the anatomy of a feature** in Melodium. Load this before creating a feature, adding a folder, moving a component or changing a feature's `index.ts`.

The normative decision is `docs/decisions/feature-structure.md`. If this skill and that record disagree, the record wins; update the skill.

## When to use

- Adding a new feature under `src/features/`.
- Adding a page, layout, router, store, interface, type, hook or API module to a feature.
- Deciding whether a component belongs to a feature or to `src/shared`.
- Changing what `@/features/<feature>` exports.
- Reviewing a change that crosses a feature boundary.

For tests, read `melodium-testing`; this skill only states where tests do **not** go.

## Canonical tree

```text
src/features/<feature>/
  index.ts
  api/
    <feature>-service.api.ts
  components/
  pages/
    <name>-page.tsx
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

The tree is exhaustive. A new top-level folder requires a spec or an ADR amendment. No empty folders: create one when it has a responsibility.

## Folder rules

| Folder        | Put here                                                                                       | Not here                                    |
| ------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `api/`        | Firebase calls, collection paths, queries, mappers; files end in `.api.ts`                     | UI, React, component state                  |
| `components/` | Feature-only UI; local props in the same file                                                  | Firestore access, cross-feature contracts   |
| `pages/`      | Route screens named `<name>-page.tsx`; compose components and hooks                            | Business logic, direct Firebase access      |
| `stores/`     | Zustand stores; files end in `.store.ts`; not persisted unless the spec says so               | Server state duplicated from Firebase       |
| `interfaces/` | Object contracts shared inside the feature or exported publicly; `.interface.ts`              | Local component props                       |
| `types/`      | Unions, aliases, inferred form values, utility types; `.type.ts`                               | Runtime values                              |
| `layouts/`    | Exactly one feature layout; `.layout.tsx`; owns the feature's `<Suspense>`                    | Extra layouts without a spec amendment      |
| `routes/`     | Exactly one `<feature>.router.tsx`; lazy pages; exports `<feature>Routes`                      | Route components defined inline             |
| `hooks/`      | Real hooks named `use-*.ts`; orchestration and selectors                                       | Domain calculations that belong in `lib/`   |
| `lib/`        | Pure functions, Zod schemas, mappers, presenters                                               | Firebase imports                            |
| `index.ts`    | The only public entry point and the only barrel                                                | Internal helpers                            |

No `providers/`. App-level providers live in `src/app`. A feature-level React context needs a spec amendment.

No `schemas/`. Zod schemas live in `lib/` and form types are inferred with `z.infer`.

## Public API

1. `index.ts` is the contract. Export only what the app or another feature actually needs.
2. App imports only `@/features/<feature>`. Never `@/features/<feature>/pages/...`.
3. Pages, forms, stores, services, schemas and error helpers stay internal unless the spec says otherwise.
4. Only the feature root is a barrel. No internal `index.ts`.
5. No cycles. A shared need is extracted to `src/shared` or moved to the owning feature with approval.
6. Changing the public API is a contract change: update the spec first.

```ts
// src/features/auth/index.ts
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

## Routes

- One router file per feature: `routes/<feature>.router.tsx`.
- Lazy-load pages with `lazy(() => import('../pages/<name>-page').then(...))`.
- Export `<feature>Routes` as `RouteObject[]`.
- The feature layout provides `<Suspense>` and the landmark structure.
- The app composes the feature routes; it does not import pages.
- A feature layout is standalone unless the spec places it inside `RootLayout`.

## Shared promotion gate

Before moving anything to `src/shared`, ask the project owner and write down:

- The component and its current consumers.
- Why it is domain-agnostic.
- Which features will use it.
- The proposed public API.
- Confirmation that it imports no feature or domain type.

Without that approval, the component stays in the feature.

## Naming

- Files: `kebab-case` with a role suffix (`.api.ts`, `.store.ts`, `.interface.ts`, `.type.ts`, `.layout.tsx`, `.router.tsx`).
- Components: `PascalCase` named exports.
- Hooks: `useSomething`, file `use-something.ts`.
- Types and interfaces: `PascalCase`, no `I` prefix.
- Constants: `UPPER_SNAKE_CASE`.
- Firestore collections: plural.
- Code, comments and docs in English; UI copy in Spanish.

## Checklist

- [ ] The feature boundary and public API are approved in the spec.
- [ ] The tree matches the canonical layout; no extra top-level folders.
- [ ] `index.ts` exports the minimal contract and nothing internal.
- [ ] No `providers/`, no `schemas/`, no empty folders.
- [ ] Pages are lazy-loaded from the single router file.
- [ ] One layout owns `<Suspense>`.
- [ ] Firebase access is only in `api/`; components consume hooks.
- [ ] Shared needs went through the promotion gate.
- [ ] Tests live under `tests/features/<feature>/`, not next to the source.
- [ ] `pnpm verify` passes.
