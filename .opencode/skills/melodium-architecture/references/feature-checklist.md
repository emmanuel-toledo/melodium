# New feature checklist

Use this when creating a feature or promoting an existing module to a feature. A feature is a domain boundary, not a folder for random files.

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

## 2. Create the minimum structure

```text
src/features/<feature>/
  index.ts               # mandatory public API
  api/                   # only if it owns Firestore data
  components/            # UI used by the feature or exported publicly
  hooks/                 # orchestration and subscriptions
  lib/                   # pure domain logic
  pages/                 # route-level components
  providers/             # only if the domain needs a provider
  schemas/               # Zod input/output schemas
  types/                 # domain types derived from schemas
```

Do not create empty folders. Add a folder only when it has a real responsibility.

## 3. Define the public API first

`index.ts` is the feature contract. Start with the smallest API another layer needs:

```ts
// src/features/compositions/index.ts
export { CompositionsPage } from './pages/compositions-page';
export { CompositionCard } from './components/composition-card';
export { useCompositions } from './hooks/use-compositions';
export { compositionSchema } from './schemas/composition-schema';
export type { Composition } from './types/composition';
```

Rules:

- Export pages, components, hooks, types and schemas that consumers need.
- Do not export internal API clients, converters or helpers.
- Do not create internal barrels.
- If another feature needs something, export it explicitly or move it to `shared` if it is generic.

## 4. Put each responsibility in the right place

| Responsibility | Location |
| --- | --- |
| Firestore collection path, query, write, converter | `api/` |
| Subscription or orchestration hook | `hooks/` |
| Pure parsing, transposition or domain calculation | `lib/` |
| Zod schema and inferred type | `schemas/` |
| UI component | `components/` |
| Route-level screen | `pages/` |
| Feature-scoped provider | `providers/` |

A component must not import the Firebase SDK or the shared Firebase client. A component calls a hook; the hook calls `api/`; `api/` uses `@/shared/lib/firebase`.

## 5. Wire the app

The app owns routes and provider composition:

```tsx
// src/app/routes/router.tsx
import { CompositionsPage } from '@/features/compositions';
import { SetlistsPage } from '@/features/setlists';
```

Do not put feature pages or page-specific logic in `src/app`.

## 6. Add tests

- Pure domain logic: colocated `*.test.ts`.
- Hooks and components: colocated `*.test.tsx` with RTL.
- Firestore rules: `tests/rules/`.
- Integration between features: through the public API.
- Unit tests mock `@/shared/lib/firebase`.

The critical tests for the feature must exist before the task is considered done.

## 7. Update the graph and docs

- Update the spec and `tasks.md`.
- If the feature adds a cross-feature dependency, update the graph.
- Once `001-platform` exists, update `scripts/architecture.config.mjs` with the new feature and its allowed dependencies.
- Update `docs/specs/README.md` if the active spec or feature index changes.

## 8. Run the checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm check:arch
pnpm verify
```

Until `pnpm check:arch` exists, use the manual checklist in `references/validation.md`.

## Final checklist

- [ ] The spec approves the feature boundary.
- [ ] `src/features/<feature>/index.ts` exists.
- [ ] The public API is minimal and documented.
- [ ] No deep imports, internal barrels or cycles.
- [ ] Firestore access is in `api/` and uses `@/shared/lib/firebase`.
- [ ] Components do not import Firebase or the shared Firebase client.
- [ ] Domain logic is in `lib/`, not in components.
- [ ] Tests cover the critical behavior and rules.
- [ ] The graph and spec are updated.
- [ ] `pnpm verify` passes.
