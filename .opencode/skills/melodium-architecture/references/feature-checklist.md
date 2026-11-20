# New feature checklist

Use this when creating a feature or promoting an existing module to a feature. A feature is a domain boundary, not a folder for random files. The canonical tree is defined in `docs/decisions/feature-structure.md` and described in `melodium-feature`.

## 1. Approve the boundary

Before creating files, the spec must define:

- The feature name and purpose.
- The public API it will expose.
- The Firestore collections it owns, if any.
- The features it depends on, if any.
- The features that will depend on it, if any.
- The pages and routes it contributes.
- The critical tests.

If the new feature adds a cross-feature dependency, update the graph in the spec and get approval. Do not add it silently.

## 2. Create the canonical structure

```text
src/features/<feature>/
  index.ts                 # mandatory public API
  api/                     # external I/O; files end in .api.ts
  components/              # UI used only by this feature
  pages/                   # route screens, <name>-page.tsx
  stores/                  # Zustand stores, <feature>.store.ts
  interfaces/              # shared/exported object contracts, .interface.ts
  types/                   # unions, aliases, inferred form values, .type.ts
  layouts/                 # exactly one <feature>.layout.tsx
  routes/                  # exactly one <feature>.router.tsx
  hooks/                   # use-<name>.ts
  lib/                     # pure helpers, Zod schemas and mappers
```

Do not create empty folders. Add a folder only when it has a real responsibility. No `providers/`; a feature-level React context needs a spec amendment. No `schemas/`; Zod schemas live in `lib/`.

## 3. Define the public API first

`index.ts` is the feature contract. Start with the smallest API another layer needs:

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

Rules:

- Export components, hooks, types and contracts that consumers need.
- Pages, forms, stores, services, schemas and error helpers stay internal unless the spec says otherwise.
- Do not export internal API clients, converters or helpers.
- Do not create internal barrels.
- If another feature needs something, export it explicitly or move it to `shared` through the promotion gate.

## 4. Put each responsibility in the right place

| Responsibility | Location |
| --- | --- |
| Firebase collection path, query, write, mapper | `api/` |
| Zustand store and session state | `stores/*.store.ts` |
| Subscription or orchestration hook | `hooks/` |
| Pure parsing, transposition, mapping or validation | `lib/` |
| Zod schema and inferred type | `lib/` |
| UI component | `components/` |
| Route-level screen | `pages/` |
| Feature layout and `<Suspense>` | `layouts/` |
| Route objects and lazy imports | `routes/<feature>.router.tsx` |
| Shared or exported object contract | `interfaces/` |
| Union, alias or inferred form value | `types/` |

A component must not import the Firebase SDK or the shared Firebase client. A component calls a hook; the hook calls `api/`; `api/` uses `@/shared/lib/firebase`.

## 5. Wire the app

The app owns route composition and imports only the public API:

```tsx
// src/app/routes/router.tsx
import { authRoutes } from '@/features/auth';
import { compositionRoutes } from '@/features/compositions';
```

Do not put feature pages or page-specific logic in `src/app`, and do not import feature pages directly.

## 6. Add tests

- Tests live under `tests/features/<feature>/`, mirroring the source path.
- Firestore rules tests live in `tests/firestore-rules/`.
- Integration between features goes through the public API.
- Application tests mock `@/shared/lib/firebase`.

Read `melodium-testing` for the layout, import rules and commands. The critical tests for the feature must exist before the task is considered done.

## 7. Update the graph and docs

- Update the spec and `tasks.md`.
- If the feature adds a cross-feature dependency, update the graph.
- Update `scripts/architecture.config.mjs` with the new feature and its allowed dependencies.
- Update `docs/specs/README.md` if the active spec or feature index changes.

## 8. Run the checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm check:arch
pnpm verify
```

## Final checklist

- [ ] The spec approves the feature boundary.
- [ ] `src/features/<feature>/index.ts` exists.
- [ ] The tree matches the canonical structure; no extra top-level folders.
- [ ] The public API is minimal and documented.
- [ ] No deep imports, internal barrels or cycles.
- [ ] Firebase access is in `api/` and uses `@/shared/lib/firebase`.
- [ ] Components do not import Firebase or the shared Firebase client.
- [ ] Domain logic is in `lib/`, not in components.
- [ ] Tests live under `tests/features/<feature>/`; rules tests live in `tests/firestore-rules/`.
- [ ] The graph and spec are updated.
- [ ] `pnpm verify` passes.
