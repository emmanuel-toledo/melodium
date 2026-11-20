# Decision: Feature structure

Status: Accepted
Date: 2026-11-19
Owners: Project owner
Related: `docs/constitution.md` v1.1, spec `002-auth`, `.opencode/skills/melodium-feature`, `.opencode/skills/melodium-testing`

## Context

The first feature in Melodium (`auth`) establishes the pattern every later feature copies. Without a normative tree, each feature invents its own folders, mixing pages, providers, schemas and stores until the public API and the architecture checks become ambiguous.

The previous guidance described `providers/`, `schemas/` and colocated tests. Auth uses a Zustand store, Zod schemas in `lib/` and tests under `tests/`; keeping the old guidance would make the reference implementation contradict the skills from day one.

## Decision

Every feature under `src/features/<feature>/` uses this exhaustive tree:

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

### Responsibilities

| Folder        | Responsibility                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------- |
| `api/`        | External I/O boundary. Firebase access and mapped results. Files end in `.api.ts`.             |
| `components/` | UI used only by this feature. Local props stay with the component.                             |
| `pages/`      | Route-level screens named `<name>-page.tsx`. No data access of their own.                      |
| `stores/`     | Zustand stores. Files end in `.store.ts`. Not persisted unless a spec says otherwise.          |
| `interfaces/` | Object contracts shared across the feature or exported publicly. Files end in `.interface.ts`. |
| `types/`      | Unions, aliases, inferred form values and utility types. Files end in `.type.ts`.              |
| `layouts/`    | Exactly one feature layout. Files end in `.layout.tsx`.                                        |
| `routes/`     | Exactly one route module named `<feature>.router.tsx`; pages are lazy-loaded.                  |
| `hooks/`      | Real hooks only. Files are `use-*.ts`.                                                         |
| `lib/`        | Pure helpers, Zod schemas and mappers.                                                         |
| `index.ts`    | The only public entry point and the only barrel.                                               |

### Rules

1. The tree is exhaustive. Adding a top-level folder requires a spec or an amendment to this ADR.
2. There is no `providers/` folder. App-level providers live in `src/app`; a feature-level React context requires a spec amendment.
3. There is no `schemas/` folder. Zod schemas live in `lib/` next to the pure logic they validate.
4. No empty folders. Create a folder only when it has content and a responsibility.
5. App imports only `@/features/<feature>`. It never imports pages or internals.
6. The public API is minimal. Pages and route modules stay internal; the app composes `<feature>Routes`.
7. A component used by two features moves to `src/shared` only with owner approval and written justification: consumers, why it is domain-agnostic, the proposed API and confirmation that it imports no feature type.
8. Local component props stay next to the component. Exported or cross-feature contracts go to `interfaces/` or `types/`.
9. Tests are not part of the feature tree. Application tests live under `tests/features/<feature>/` mirroring the source path; Firestore rules tests live in `tests/firestore-rules/`.

## Consequences

- Every feature looks the same; review and architecture checks can rely on paths.
- The public surface is one file, so cross-feature changes are visible in review.
- Moving a component to `shared` becomes an explicit, documented decision instead of an incidental import.
- A new folder is a deliberate act that needs a spec update, not a local convenience.
- The rule is documented and checked by review; automated enforcement (`ARCH010` or equivalent) is deferred to a later spec.
- `AGENTS.md`, `melodium-feature`, `melodium-testing`, `melodium-architecture` and `melodium-react` must reference this decision instead of restating a different tree.
