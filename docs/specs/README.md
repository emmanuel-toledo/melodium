# Specs

Specs are the source of truth for what Melodium builds and why. Read `docs/constitution.md` first, then the capability map, then the active module spec.

## Status

| Status       | Meaning                                              |
| ------------ | ---------------------------------------------------- |
| Proposed     | Written for review; not approved for implementation. |
| Approved     | Reviewed and approved by the project owner.          |
| Implementing | Approved and currently being implemented.            |
| Shipped      | Implemented and verified.                            |
| Superseded   | Replaced by a newer spec or delta spec.              |

Do not implement from a Proposed or Superseded spec.

## Index

| ID  | Document                                  | Status      | Scope                                                                                                |
| --- | ----------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| 000 | [Capability map](./000-capability-map.md) | Approved    | Module boundaries, dependencies and build order.                                                     |
| 001 | [Platform](./001-platform/spec.md)        | Shipped     | Vite, React, TypeScript, Tailwind/shadcn, tests, emulators, Firebase facade and architecture checks. |
| 002 | Auth                                      | Not started | Google and email/password authentication, session state and route guards.                            |
| 003 | Compositions                              | Not started | ChordPro composition CRUD, tags, search, transposition and chord rendering.                          |
| 004 | Setlists                                  | Not started | Ordered setlists, composition resolution and deletion cleanup.                                       |

## Workflow

1. Review and approve `000-capability-map.md`.
2. For each module in build order, write `spec.md` and request approval.
3. After approval, write `plan.md` and request approval.
4. After approval, write `tasks.md` and request approval.
5. Implement only the approved tasks.
6. Update the spec, `tasks.md` and the status in this index when the module ships.

No phase advances without human review. A new idea discovered mid-implementation goes to the spec's "Out of Scope (Deferred)" section or gets its own delta spec; it does not expand the current cycle silently.

## Layout

```text
docs/specs/
  000-capability-map.md
  NNN-<module-id>/
    spec.md
    plan.md
    tasks.md
```

Module IDs are stable kebab-case names from the capability map. A shipped module gets a delta spec for later changes instead of rewriting its history.

## Cross-cutting rules

- `docs/constitution.md` overrides every spec.
- `AGENTS.md` defines the always-on working rules.
- `docs/decisions/effects.md` is the only place where React effects are approved.
- `pnpm verify` is the mandatory gate; `pnpm test:rules` is required when rules or indexes change.
- Feature public APIs are contracts: changing one requires a spec update.
