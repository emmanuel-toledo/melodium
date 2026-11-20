# Architecture validation

## Commands

Once `001-platform` exists:

```bash
pnpm lint        # ESLint + eslint-plugin-boundaries
pnpm typecheck   # TypeScript without emit
pnpm test        # Vitest unit/component tests
pnpm check:arch  # repository architecture invariants
pnpm test:rules  # Firestore rules with emulators
pnpm verify      # format:check + lint + typecheck + test + check:arch + build
```

`pnpm verify` is the required gate. `pnpm test:rules` is separate because it needs the Firebase emulators.

## What each command covers

| Command | Covers |
| --- | --- |
| `pnpm lint` | Import direction, public API access, `any`, `dangerouslySetInnerHTML`, `console.log` and other ESLint rules. |
| `pnpm typecheck` | Types, missing modules and TypeScript strictness. |
| `pnpm test` | Unit, component and pure domain behavior. |
| `pnpm check:arch` | Feature entry points, deep imports, cycles, the feature graph, env/Firebase source checks, internal barrels and effect approvals. |
| `pnpm test:rules` | Firestore ownership and deny-by-default rules against the emulators. |
| `pnpm verify` | The full gate; it must pass before a task is declared done. |

## Error codes

| Code | Meaning | Fix |
| --- | --- | --- |
| `FEATURE_INDEX` | A feature folder has no root `index.ts`. | Create the public API entry point. |
| `DEEP_IMPORT` | A cross-feature import reaches an internal file. | Export the symbol from the owner's `index.ts` and import `@/features/<feature>`. |
| `LAYER_IMPORT` | A layer imports in the wrong direction. | Move generic code to `shared`, remove the app dependency, or redesign the boundary. |
| `FEATURE_EDGE` | A feature imports a feature that the approved graph does not allow. | Update the spec and the graph with approval, or remove the dependency. |
| `FEATURE_CYCLE` | Two or more features depend on each other. | Extract the common concern to `shared` or redesign the split. |
| `INTERNAL_BARREL` | A feature has an `index.ts` below its root. | Import the concrete file inside the feature. |
| `ENV_ACCESS` | `import.meta.env` is read outside `src/shared/config/env.ts`. | Add the variable to the validated env module and import the object. |
| `FIREBASE_SDK` | The Firebase SDK is imported outside `src/shared/lib/firebase`. | Add the needed function to the shared facade and import from `@/shared/lib/firebase`. |
| `FIREBASE_IN_UI` | A component or `src/app` imports the shared Firebase client. | Move the access to a feature hook or `api/` function. |
| `APP_CONFIG` | `src/app/config` imports a feature or Firebase. | Keep it to app-wide constants; compose features in routes and providers. |
| `EFFECT_UNAPPROVED` | A `useEffect`/`useLayoutEffect`/`useInsertionEffect` has no approval row. | Request approval, record it, or use an alternative. |
| `EFFECT_STALE` | An approval row has no matching effect. | Remove the row or restore the approved effect. |
| `EFFECT_ID` | An effect is missing its inline approval ID. | Add `// effect: EFF-XXX`. |

## Manual checklist until `check:arch` exists

- [ ] Every `src/features/<feature>` has a root `index.ts`.
- [ ] Cross-feature imports use exactly `@/features/<feature>`.
- [ ] No feature imports `src/app`.
- [ ] No `shared` file imports `src/app` or `src/features`.
- [ ] No feature imports another feature's internals.
- [ ] No cycles in the feature graph.
- [ ] No internal barrels below a feature root.
- [ ] `import.meta.env` appears only in `src/shared/config/env.ts`.
- [ ] Firebase SDK imports appear only in `src/shared/lib/firebase`.
- [ ] Components and `src/app` do not import `@/shared/lib/firebase`.
- [ ] `src/app/config` imports neither features nor Firebase.
- [ ] Every `useEffect`/`useLayoutEffect`/`useInsertionEffect` has an approval row and an inline ID.
- [ ] `docs/decisions/effects.md` has no stale rows.
- [ ] Tests live under `tests/`, mirroring `src/`; no `*.test.ts(x)` under `src/`.
- [ ] Integration tests use public APIs; rules tests live in `tests/firestore-rules/`.
- [ ] `pnpm verify` passes.

## When a check fails

1. Read the error code and the file/line.
2. Decide whether the code or the architecture is wrong.
3. If the fix changes a public API, the feature graph, the data model or an approval, stop and update the spec first.
4. Do not disable the rule or add an `eslint-disable`.
5. Re-run the command and then `pnpm verify`.

The architecture script never rewrites files. A deep import or a cycle is a design decision, not an automatic fix.
