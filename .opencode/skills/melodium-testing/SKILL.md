---
name: melodium-testing
description: Use when adding, moving or reviewing tests in Melodium, when deciding between application, Firestore rules and tooling tests, or when setting up mocks and fixtures. Covers the mirrored tests/ layout, import rules and commands.
---

# Melodium Testing

Owns **where tests live and how they are written** in Melodium. Load this before adding a test, migrating a test or reviewing a test change.

The normative sources are `docs/constitution.md` and `docs/decisions/feature-structure.md`. If this skill contradicts them, stop and report the conflict.

## Test types

| Type            | Proves                                                       | Location                                       | Command           | Runtime                          |
| --------------- | ------------------------------------------------------------ | ---------------------------------------------- | ----------------- | -------------------------------- |
| Application     | Pure functions, schemas, stores, hooks, components, routes   | `tests/app`, `tests/shared`, `tests/features/` | `pnpm test`       | jsdom; Firebase mocked           |
| Firestore rules | Who can read and write documents                             | `tests/firestore-rules/`                       | `pnpm test:rules` | Node + emulator + Java           |
| Tooling         | The architecture checker keeps working                       | `scripts/` next to the script                  | `pnpm test`       | Node + fixtures                  |

`pnpm verify` runs application and tooling tests. It never needs an emulator, network or a real Firebase project. `pnpm test:rules` is required when rules or indexes change.

## Mirrored layout

```text
tests/
  setup.ts
  support/                       # optional shared helpers
  app/
    layouts/
      root-layout.test.tsx
    routes/
      router.test.tsx
  shared/
    config/
      env.test.ts
  features/
    auth/
      api/auth-service.api.test.ts
      components/login-form.test.tsx
      hooks/use-auth.test.tsx
      layouts/auth.layout.test.tsx
      lib/auth-schemas.test.ts
      routes/auth.router.test.tsx
      stores/auth.store.test.ts
      index.test.ts
  firestore-rules/
    baseline.test.ts
    helpers.ts

scripts/
  check-architecture.test.mjs
  fixtures/architecture/...
```

Rules:

1. The test path mirrors the source path: `src/features/auth/stores/auth.store.ts` → `tests/features/auth/stores/auth.store.test.ts`.
2. One test file per source file where practical. Integration tests are named after the entry point they exercise.
3. No `*.test.ts(x)` under `src/`.
4. Tooling tests stay next to their script, not under `tests/`.
5. `tests/setup.ts` is the only global setup file.
6. `tests/support/` and `tests/features/<feature>/support/` are optional; create them only when a helper is shared. Otherwise keep the helper local.
7. Firestore rules tests are flat in `tests/firestore-rules/`. `baseline.test.ts` is cross-cutting; feature-specific files use `<feature>.rules.test.ts`.

## Import rules

- A feature test may import that feature's internals via `@/features/<feature>/...`.
- Cross-feature imports in tests use only `@/features/<other>` public API.
- App tests may import `src/app` and `@/shared/...` internals; they mock `@/features/<feature>`.
- Shared tests may import `@/shared/...` internals.
- `src` never imports from `tests`; test helpers never live in `src`.
- Application tests mock `@/shared/lib/firebase`; no real Firebase or network.
- Firestore rules tests may import `@firebase/rules-unit-testing`; no other Firebase SDK imports.
- Tooling tests may import Node built-ins.

## Writing a test

- Test behavior, not implementation. Query by role, label or visible Spanish text; avoid broad snapshots and CSS selectors.
- Use `userEvent` for interactions, not `fireEvent`.
- Use `findBy*` or `waitFor` for async behavior. No arbitrary timeouts.
- Assert Spanish UI copy; keep descriptions, helpers and fixtures in English.
- Cover loading, empty, error and ready states where the screen has them.
- Cover keyboard interaction for interactive UI.
- Mock at the boundary: `@/shared/lib/firebase` for application tests, the public feature API for app tests, `sonner` when only the toast call matters.
- Reset mocks and store state between tests. Reset Zustand state explicitly; do not rely on module reloads.
- No `console.log`, `any` or `dangerouslySetInnerHTML`.
- Do not delete, skip or weaken a failing test to make a change pass. Fix the cause or stop and ask.

## Firestore rules tests

- Use `@firebase/rules-unit-testing`.
- Start from `firestore.rules` via the helper; keep the relative path correct.
- Clear Firestore and clean up environments between cases.
- Test anonymous and authenticated access separately, per collection and per operation.
- Rules tests do not run in `pnpm verify`.

## Commands

```bash
pnpm test                     # application + tooling tests
pnpm test:watch               # watch mode
pnpm test:rules               # Firestore emulator + rules tests
pnpm exec vitest run tests/features/auth     # one feature
pnpm exec vitest run tests/features/auth/stores/auth.store.test.ts
pnpm verify                   # format, lint, typecheck, test, arch, build
```

## Checklist

- [ ] The test lives under `tests/`, mirroring `src/`, or next to its script when it tests tooling.
- [ ] No test file lives under `src/`.
- [ ] Imports follow the feature public-API rule.
- [ ] Firebase is mocked; the test needs no network or real project.
- [ ] The critical behavior and the failure paths are covered.
- [ ] Assertions use accessible queries and Spanish UI text.
- [ ] Mocks and store state are reset between tests.
- [ ] `pnpm verify` passes; `pnpm test:rules` passes when rules or indexes changed.
