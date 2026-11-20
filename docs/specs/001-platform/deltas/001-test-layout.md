# Delta 001: Test layout

Status: Approved
Version: 1.0
Last updated: 2026-11-19
Applies to: [001-platform/spec.md](../spec.md) — Shipped
Approved with: [002-auth](../../002-auth/spec.md) v1.1

## 1. Objective

Move application tests out of `src/` into a `tests/` tree that mirrors the source, and rename the Firestore rules test directory. The goal is a predictable, reviewable layout that keeps test files out of production paths and keeps rules, tooling and application tests distinguishable by command and runtime.

This delta changes test placement and the harness paths only. It does not change behavior, coverage requirements or the mandatory gate.

## 2. Current behavior

`001-platform` shipped with:

- Unit and component tests next to the source as `*.test.ts(x)`.
- `tests/setup.ts` as global setup.
- `tests/rules/` for Firestore rules tests and helpers.
- `vite.config.ts` including `src/**/*.test.{ts,tsx}` and `scripts/**/*.test.mjs`, excluding `tests/rules/**`.
- `vitest.rules.config.ts` including `tests/rules/**/*.test.ts`.
- An ESLint exception for `tests/rules/**/*.ts`.

## 3. New behavior

- Application tests live under `tests/app`, `tests/shared` and `tests/features/<feature>`, mirroring the `src/` path.
- Firestore rules tests live under `tests/firestore-rules/`.
- The architecture checker test stays next to its script under `scripts/`.
- `tests/setup.ts` stays at the same path.
- No `*.test.ts(x)` file lives under `src/`.

The mirrored path is exact:

| Source                                   | Test                                            |
| ---------------------------------------- | ----------------------------------------------- |
| `src/app/routes/router.tsx`              | `tests/app/routes/router.test.tsx`              |
| `src/shared/config/env.ts`               | `tests/shared/config/env.test.ts`               |
| `src/shared/lib/firebase/index.ts`       | `tests/shared/lib/firebase/index.test.ts`       |
| `src/features/auth/stores/auth.store.ts` | `tests/features/auth/stores/auth.store.test.ts` |

## 4. Harness changes

`vite.config.ts`:

```ts
test: {
  environment: 'jsdom',
  setupFiles: ['./tests/setup.ts'],
  include: ['tests/**/*.test.{ts,tsx}', 'scripts/**/*.test.mjs'],
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    'tests/firestore-rules/**',
    'scripts/fixtures/**',
  ],
}
```

`vitest.rules.config.ts`:

```ts
test: {
  environment: 'node',
  include: ['tests/firestore-rules/**/*.test.ts'],
}
```

`eslint.config.js`:

- The Node/rules exception targets `tests/firestore-rules/**/*.ts`.
- No other boundary change: tests are outside `src`, so `eslint-plugin-boundaries` keeps covering `src` only.

`tsconfig.json`:

- `tests` remains included.
- The `@/*` alias remains mapped to `src/*`.
- No change expected.

`package.json`:

- `pnpm test` and `pnpm test:rules` keep their names.
- No new script.

`tests/setup.ts`:

- Stays at the same path and keeps the RTL cleanup.

## 5. Migration

| From                                    | To                                        |
| --------------------------------------- | ----------------------------------------- |
| `src/app/routes/router.test.tsx`        | `tests/app/routes/router.test.tsx`        |
| `src/shared/config/env.test.ts`         | `tests/shared/config/env.test.ts`         |
| `src/shared/lib/firebase/index.test.ts` | `tests/shared/lib/firebase/index.test.ts` |
| `src/shared/lib/utils.test.ts`          | `tests/shared/lib/utils.test.ts`          |
| `tests/rules/baseline.test.ts`          | `tests/firestore-rules/baseline.test.ts`  |
| `tests/rules/helpers.ts`                | `tests/firestore-rules/helpers.ts`        |

- Import paths use the `@/` alias, so the four application moves keep resolving without edits.
- `tests/firestore-rules/helpers.ts` keeps `../../firestore.rules`; the directory depth is unchanged.
- `scripts/check-architecture.test.mjs` and `scripts/fixtures/` do not move.

## 6. Success criteria

1. `vite.config.ts` discovers `tests/**/*.test.{ts,tsx}` and `scripts/**/*.test.mjs`, and excludes `tests/firestore-rules/**` and `scripts/fixtures/**`.
2. `vitest.rules.config.ts` discovers `tests/firestore-rules/**/*.test.ts`.
3. The ESLint exception targets `tests/firestore-rules/**/*.ts`.
4. No `*.test.ts(x)` file remains under `src/`.
5. The six files in §5 exist at their new paths and their old paths are gone.
6. `tests/setup.ts` remains the only global setup file.
7. `pnpm verify` passes without emulators.
8. `pnpm test:rules` passes against the Firestore emulator when Java is available.
9. Existing tests keep their behavior and coverage.

## 7. Boundaries

Always:

- Mirror the source path under `tests/`.
- Mock `@/shared/lib/firebase` in application tests.
- Keep tooling tests next to their script.
- Keep `tests/setup.ts` as the only global setup.

Ask first:

- Adding a test directory that does not mirror `src/`.
- Adding a test exception or a second setup file.
- Moving tooling tests under `tests/`.

Never:

- Put `*.test.ts(x)` under `src/`.
- Import from `tests` inside `src`.
- Put test helpers in `src`.
- Run rules tests as part of `pnpm verify`.

## 8. Out of scope

- Coverage thresholds.
- E2E tests.
- New test frameworks or reporters.
- Changes to the architecture checker.
- Renaming `pnpm test` or `pnpm test:rules`.
