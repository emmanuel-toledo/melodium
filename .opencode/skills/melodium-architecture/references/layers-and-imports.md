# Layers and imports

## Dependency direction

```text
src/app → src/features/<feature> → src/shared
```

There are no platform exceptions. A feature must not import `src/app`; `src/shared` must not import `src/app` or `src/features`.

## Layer responsibilities

### `src/app`

The composition root:

- App-level constants and configuration in `src/app/config`, which imports neither features nor Firebase.
- Router and route composition, including feature `<feature>Routes`.
- App-level layouts and global styles.
- `main.tsx` and the application bootstrap.

It imports features only through their public API. It does not initialize Firebase, query Firestore, or hold domain logic. Feature composition happens in routes and providers, not in `src/app/config`.

### `src/features/<feature>`

An isolated domain module. A feature owns:

- Its pages, components and one layout.
- Its route module, hooks, stores and domain logic.
- Its Zod schemas, types and interfaces.
- Its Firestore collection paths, queries, converters and writes in `api/`.

Only the root `index.ts` is public. A feature may import `shared` and the features allowed by the graph; it must not import `app`, another feature's internals, or create a cycle.

### `src/shared`

Generic infrastructure with no domain knowledge:

- `ui/`: shadcn/ui primitives.
- `components/`: composed shared components.
- `hooks/`: generic hooks.
- `lib/`: generic utilities and the Firebase client.
- `config/env.ts`: the only place that reads `import.meta.env`.
- `types/`: generic types only.

If a file mentions `Composition`, `Setlist`, `User` or another domain concept, it does not belong in `shared`.

## Current feature graph

```text
app/routes, app/providers → auth, compositions, setlists
setlists → auth, compositions
compositions → auth
auth → no other feature
all layers → shared
```

`app` may import any feature. A feature may import `shared` and only the features listed for it. A new cross-feature dependency requires an approved spec and an update to the graph.

## Import examples

### Cross-feature imports

```ts
// ✅ Correct
import { CompositionCard } from '@/features/compositions';
import { useAuth } from '@/features/auth';

// ❌ Incorrect: deep import
import { CompositionCard } from '@/features/compositions/components/composition-card';

// ❌ Incorrect: bypasses the canonical public entry point
import { CompositionCard } from '@/features/compositions/index';

// ❌ Incorrect: relative path crossing a feature boundary
import { CompositionCard } from '../compositions/components/composition-card';
```

The exact specifier for a feature is `@/features/<feature>`. Do not add `/index`, a trailing file path, or a relative path that crosses the boundary.

### Imports inside the same feature

Relative imports are allowed inside a feature:

```ts
import { parseChordPro } from '../lib/parse-chord-pro';
import { useComposition } from './use-composition';
```

A feature may also import its own public API through `@/features/<feature>`, but it is usually clearer to use a relative path inside the feature.

### App imports

```ts
// ✅ Correct
import { authRoutes, UserMenu } from '@/features/auth';
import { compositionRoutes } from '@/features/compositions';
import { Button } from '@/shared/components/ui/button';

// ❌ Incorrect
import { auth } from '@/shared/lib/firebase';
import { useCompositions } from '@/features/compositions/hooks/use-compositions';
import { LoginPage } from '@/features/auth/pages/login-page';
```

`src/app` composes features; it does not access Firebase or feature internals.

### Shared imports

```ts
// ✅ Correct: shared code imports external libraries or other shared modules
import { clsx } from 'clsx';
import { Button } from '@/shared/components/ui/button';

// ❌ Incorrect: shared knows a feature or the app
import { useAuth } from '@/features/auth';
import { ROUTES } from '@/app/routes';
```

## Public API rules

1. The root `index.ts` is mandatory for every feature.
2. Export only what another layer needs: components, hooks, types and public contracts. Pages and route modules stay internal; the app composes `<feature>Routes`.
3. Do not export internal API clients, converters or implementation helpers unless another feature genuinely needs them.
4. If a consumer needs a missing export, decide:
   - Generic and domain-agnostic → move it to `shared`.
   - Domain-specific → export it explicitly from the owning feature.
5. Never use a deep import to avoid making that decision.
6. A public API change is a contract change: update the spec, `tasks.md` and the feature's `index.ts`.

## Internal barrels

Only the feature root `index.ts` is a barrel.

```text
src/features/compositions/
  index.ts                 # ✅ public
  components/
    index.ts               # ❌ internal barrel
    composition-card.tsx
  hooks/
    index.ts               # ❌ internal barrel
```

Internal barrels hide dependency cycles and create accidental public APIs. Import the concrete file inside the feature instead.

## Cycles

A cycle is any path that returns to the same feature:

```text
auth → compositions → auth
```

Do not fix a cycle by merging features without a spec. Options:

- Extract the shared concern to `shared`.
- Move the dependent type or hook to the feature that actually owns it.
- Redesign the feature boundary.

Type-only imports count as dependencies. If a type creates a cycle, move the shared type to `shared` or to the owning feature.

## Naming and files

- Files: `kebab-case`.
- Components: `PascalCase` exports in `kebab-case` files.
- Hooks: `useSomething`.
- Types: `PascalCase`, no `I` prefix.
- Constants: `UPPER_SNAKE_CASE`.
- Firestore collections: plural.
- One feature per folder under `src/features`.

## Tests

- Application tests live under `tests/`, mirroring `src/`: `tests/app`, `tests/shared`, `tests/features/<feature>`.
- A feature test may import that feature's internals; cross-feature imports in tests use the public API only.
- Firestore rules tests live in `tests/firestore-rules/` and use the emulators.
- Tooling tests stay next to the script.
- Tests never depend on the network or a real Firebase project. Application tests mock `@/shared/lib/firebase`.
- Do not put `*.test.ts(x)` under `src/`.

## Common mistakes

| Mistake | Why it is wrong | Fix |
| --- | --- | --- |
| Importing a feature component by file path | Bypasses the public API | Export it from `index.ts` and import `@/features/<feature>` |
| Putting domain types in `shared` | Shared becomes coupled to a feature | Keep the type in its feature or move the domain concept |
| Creating `components/index.ts` | Hidden cycle and accidental API | Import the concrete file inside the feature |
| Using `app` as a utility layer | Reverses the dependency direction | Move generic code to `shared` |
| Adding a cross-feature import without a spec | Couples features silently | Update the spec and graph with approval |
| Importing `auth` or `db` in a component | UI knows infrastructure | Use a feature hook or API function |
