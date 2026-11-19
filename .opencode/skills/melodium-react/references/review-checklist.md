# React review checklist

Use this before declaring a component, hook, form or UI change complete.

## Architecture

- [ ] The code lives in the correct layer: `app`, a feature, or `shared`.
- [ ] Domain code is in its feature; generic code is in `shared`.
- [ ] No deep imports, internal barrels or cross-feature cycles were introduced.
- [ ] If a public API changed, `index.ts`, the spec and `tasks.md` were updated.
- [ ] No new cross-feature dependency was added without an approved spec.

## Components

- [ ] Function component with a named export.
- [ ] No business logic or Firebase access in the component.
- [ ] Data comes from a feature hook; UI state is local and minimal.
- [ ] The component is split when it has independent responsibilities.
- [ ] Props are typed; no `any`, unnecessary `as` or `!`.
- [ ] No `dangerouslySetInnerHTML`.
- [ ] No `console.log` in committed code.
- [ ] Stable keys are used for lists.

## State

- [ ] State has one owner.
- [ ] Derived values are computed during render, not stored or synchronized.
- [ ] URL state is used for search, filters and shareable view state.
- [ ] State resets use `key`, not an effect.
- [ ] `useMemo`/`useCallback` are used only for a measured need or required stable identity.
- [ ] Form state is owned by React Hook Form, not duplicated in `useState`.

## Effects

- [ ] No `useEffect`/`useLayoutEffect`/`useInsertionEffect` was added without explicit approval.
- [ ] The effect is recorded in `docs/decisions/effects.md`.
- [ ] The call site has `// effect: EFF-XXX`.
- [ ] The effect synchronizes with an external system, not with state.
- [ ] Cleanup is correct and idempotent under StrictMode.
- [ ] The effect has a test, including cleanup where possible.
- [ ] No `eslint-disable` was used to bypass the rule.

## Data

- [ ] Firestore access is in the feature's `api/`.
- [ ] The feature uses `@/shared/lib/firebase`, not the SDK directly.
- [ ] Subscriptions unsubscribe correctly.
- [ ] `getSnapshot` returns a cached, stable value.
- [ ] Loading, empty, error and ready states are handled.
- [ ] Errors are mapped to Spanish messages.
- [ ] Transposition is view-only and not persisted.

## Forms and UI

- [ ] RHF + Zod; the type is derived with `z.infer`.
- [ ] Labels, inline errors and accessible names are present.
- [ ] Submit is disabled while pending and duplicate submissions are prevented.
- [ ] Keyboard navigation, focus visibility and contrast were checked.
- [ ] Mobile-first layout was checked at narrow and wide widths.
- [ ] Empty, loading and error states were checked.
- [ ] UI text is Spanish; code and names are English.

## Tests

- [ ] Critical behavior has tests.
- [ ] Tests use roles, labels or visible Spanish text.
- [ ] Unit/component tests mock `@/shared/lib/firebase`.
- [ ] No test depends on the network or a real Firebase project.
- [ ] Firestore rules tests were updated if rules changed.

## Commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm check:arch
pnpm test:rules   # only if rules/indexes changed
pnpm verify
```

Do not declare the task done if any check fails or could not be run.
