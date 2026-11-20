---
name: melodium-architecture
description: Use when adding, moving, or reviewing modules, features, imports, Firebase access, environment configuration, tests placement, or public APIs in Melodium.
---

# Melodium Architecture

Owns **where code lives and who may import it**. Load this before structural changes or when reviewing a change that touches modules, features, layers, Firebase, environment configuration, or public APIs.

## Source of truth

1. `docs/constitution.md`
2. The active spec in `docs/specs/`
3. `AGENTS.md`
4. This skill
5. The executable checks (`pnpm lint`, `pnpm typecheck`, `pnpm check:arch`)

If two sources conflict, stop and report the conflict. Do not silently choose one.

## Layer model

```text
app → features → shared
```

- `src/app` is the composition root: app-level constants, routes, providers, layouts and styles. It imports features only through `@/features/<feature>` and may import `shared`. It never initializes Firebase, contains domain logic, or reaches into feature internals.
- `src/features/<feature>` is an isolated domain module. Only its root `index.ts` is public. It may import `shared` and the features allowed by the graph. It must not import `app`, another feature's internals, or create cycles.
- `src/shared` is generic infrastructure: UI primitives, composed shared components, generic hooks, utilities, types, validated environment and the Firebase client. It never imports `app` or `features` and never knows domain types such as `Composition`, `Setlist` or `User`.

## Current feature graph

```text
app/routes → auth, compositions, setlists
setlists → auth, compositions
compositions → auth
auth → no other feature
all layers → shared
```

A new cross-feature dependency requires an approved spec and an update to the graph. Do not add it just because an import compiles.

## Where does this code belong?

| If the code... | It belongs in... |
| --- | --- |
| Composes the application: routes, providers, layouts, app-level constants | `src/app` |
| Is specific to one domain | `src/features/<feature>` |
| Is generic and used by two features, or by app and a feature | `src/shared` |
| Initializes or configures Firebase | `src/shared/lib/firebase` |
| Reads `import.meta.env` | `src/shared/config/env.ts` only |
| Queries or writes a feature's Firestore collection | The owning feature's `api/` |

If the answer is ambiguous, stop and ask before moving code.

## Public API rules

1. Every feature has a root `index.ts`. It is the only public entry point.
2. Cross-feature and app imports use the exact path `@/features/<feature>`. Never use `@/features/<feature>/components/...`, `.../hooks/...`, `.../index` or a relative path that crosses a feature boundary.
3. The public API is minimal: export only the components, hooks, types and contracts another layer actually needs. Pages and route modules stay internal; the app composes `<feature>Routes`. Do not export internal API clients or implementation details.
4. If a consumer needs something that is not exported, first decide whether it is generic enough for `shared`; otherwise export it explicitly from the owning feature.
5. Only the feature root `index.ts` is a barrel. Do not add internal `index.ts` barrels: they hide cycles and create accidental public APIs.
6. No cycles between features. If two features need each other, extract the common part to `shared` or redesign the split.
7. Feature tests may import their own internals. Integration tests between features must use the public API.

## Firebase and environment

- The Firebase SDK is imported **only** inside `src/shared/lib/firebase`.
- `src/shared/lib/firebase` owns `initializeApp`, `auth`, `db`, emulator wiring, and the curated re-exports of Firebase functions and types that features need.
- A feature's `api/` imports `auth`, `db` and Firebase functions from `@/shared/lib/firebase`; it owns collection paths, queries and converters.
- UI components never import the Firebase SDK or the shared Firebase client directly. They consume feature hooks.
- `src/app` never imports the Firebase client and never initializes the SDK.
- `import.meta.env` is read only in `src/shared/config/env.ts`; the rest of the code imports the validated object.
- Never persist rendered HTML or the result of transposing.

See `references/firebase-and-data.md` for the data-access pattern and ownership rules.

## Tests and naming

- Application tests live under `tests/`, mirroring `src/`: `tests/app`, `tests/shared`, `tests/features/<feature>`.
- Firestore rules tests live in `tests/firestore-rules/`; tooling tests stay next to their script.
- Do not put `*.test.ts(x)` under `src/`.
- A feature test may import its own internals; integration tests between features use the public API.
- Read `melodium-testing` for the full layout and commands.
- Files are `kebab-case`; component exports are `PascalCase`; hooks are `useSomething`; types are `PascalCase` without an `I` prefix; constants are `UPPER_SNAKE_CASE`; Firestore collections are plural.
- Feature files use role suffixes: `.api.ts`, `.store.ts`, `.interface.ts`, `.type.ts`, `.layout.tsx`, `.router.tsx`.
- Use `import type` for types and the `@/` alias for cross-layer imports.

## New feature

Read `references/feature-checklist.md` before creating a feature, and `melodium-feature` for the canonical tree. At minimum:

1. Approve the feature and its public API in a spec.
2. Create `src/features/<feature>/index.ts`.
3. Add only the internal folders the feature actually needs; no `providers/` or `schemas/`.
4. Put Firestore access in `api/`, Zustand stores in `stores/`, orchestration in `hooks/`, domain logic in `lib/`, and UI in `components/` or `pages/`.
5. Add critical tests under `tests/features/<feature>/` and update the spec, `tasks.md` and the feature graph.
6. Run `pnpm lint`, `pnpm typecheck`, `pnpm check:arch` and `pnpm verify`.

## Validation

Until `001-platform` creates the scaffold and `pnpm check:arch`, use the manual checklist in `references/validation.md`.

Once available:

```bash
pnpm lint
pnpm typecheck
pnpm check:arch
pnpm verify
```

`pnpm check:arch` validates feature entry points, deep imports, layer direction, the feature graph and cycles, environment and Firebase boundaries, internal barrels, and approved effects. It reports errors with file and line; it never rewrites code.

## Stop and ask

Ask before:

- Adding or changing a cross-feature dependency.
- Changing a feature's public API.
- Moving code between `app`, a feature and `shared` when ownership is ambiguous.
- Changing the data model, Firestore rules or indexes.
- Adding a dependency.
- Changing the layer structure, boundary rules or the feature graph.
- Adding an effect, as described in `melodium-react`.

## References

| Situation | Read |
| --- | --- |
| Import examples, layers, cycles, barrels and naming | `references/layers-and-imports.md` |
| Firebase client, env, feature `api/`, ownership and data rules | `references/firebase-and-data.md` |
| Creating a new feature | `references/feature-checklist.md` |
| Validation commands, error codes and fixes | `references/validation.md` |
