# Approved effects

## Policy

`useEffect`, `useLayoutEffect` and `useInsertionEffect` are prohibited by default.

An effect is allowed only when it synchronizes with an external system that React does not control, after explicit approval from the project owner. The approval must exist **before** the effect is written.

Do not use an effect for:

| Case | Allowed? | Prefer |
| --- | --- | --- |
| Derive state from props or state | No | Compute during render |
| Synchronize two state values | No | One source of truth or an event handler |
| Fetch data | No | Feature hook, subscription or route loader |
| React to a user event | No | Event handler |
| Reset state when a prop changes | No | `key` |
| One-time initialization from props/state | No | Render-time initialization or a ref callback |
| External subscription (Firestore/Auth) | Only with approval | `useSyncExternalStore` first |
| Imperative DOM library (svguitar) | Only with approval | Ref callback; localized effect if unavoidable |
| Browser API or timer | Only with approval | Event handler/ref; effect if no other option |

Effects belong in feature hooks, not directly in components. A component that needs an effect is usually missing a hook.

## Approval process

1. Stop before writing the effect.
2. Explain why the alternatives do not work.
3. Request approval from the project owner with this template:

```text
Effect approval request
- File/hook:
- External system:
- Why alternatives fail:
- Cleanup:
- Test:
- Proposed ID: EFF-XXX
```

4. After explicit approval, add a row to `docs/decisions/effects.md`.
5. Add the inline marker at the call site: `// effect: EFF-001`.
6. Add a test that covers the behavior and, where possible, the cleanup.
7. Remove the row if the effect is removed.

An agent must not approve its own effect, add a row without the owner's approval, or use `eslint-disable` to bypass the rule.

## Approval record

`docs/decisions/effects.md` is the source of truth. Format example only; this row is not an approval:

| ID | File | Hook | Why / alternatives | Cleanup | Test | Approved |
| --- | --- | --- | --- | --- | --- | --- |
| `EFF-001` | `<file>` | `useLayoutEffect` | `<reason>` | `<cleanup>` | `<test>` | `<date>` |

Rules:

- IDs are `EFF-NNN` and unique.
- The file path is relative to the repository root.
- The hook is `useEffect`, `useLayoutEffect` or `useInsertionEffect`.
- One row per file and hook.
- The test file must exist.
- The inline marker must match the row ID.
- The table stays empty until an effect is approved. Do not add example rows.

Once `001-platform` is implemented, `pnpm check:arch` validates that every effect has a row, every row has a matching effect, and every effect has its inline ID.

## Examples

### Derived state

```tsx
// ❌ Incorrect: an effect to derive a value
const [fullName, setFullName] = useState('');
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// ✅ Correct: derive during render
const fullName = `${firstName} ${lastName}`;
```

### Synchronizing state

```tsx
// ❌ Incorrect: two sources of truth
useEffect(() => {
  setFiltered(items.filter((item) => item.active));
}, [items]);

// ✅ Correct: compute the visible list during render
const filtered = items.filter((item) => item.active);
```

### Fetching data

```tsx
// ❌ Incorrect: fetch in an effect
useEffect(() => {
  fetch('/api/compositions').then(setCompositions);
}, []);

// ✅ Correct: use a feature hook or route loader
const { compositions, status } = useCompositions();
```

### User events

```tsx
// ❌ Incorrect: an effect reacting to a click
useEffect(() => {
  if (clicked) save();
}, [clicked]);

// ✅ Correct: act in the handler
function handleClick() {
  save();
}
```

### Reset on identity change

```tsx
// ❌ Incorrect: reset state when the composition changes
useEffect(() => {
  setDraft(initialDraft);
}, [compositionId]);

// ✅ Correct: remount with a key
<CompositionEditor key={compositionId} composition={composition} />
```

### External subscription with `useSyncExternalStore`

```ts
// ✅ Preferred: no effect in our code
const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
```

The store owns the `onSnapshot`/`onAuthStateChanged` subscription and returns a cached snapshot. Add `getServerSnapshot` only if server rendering is introduced. See `state-and-data.md`.

### Approved imperative library integration

```ts
// src/features/compositions/hooks/use-chord-diagram.ts
// ✅ Only after approval: localized useLayoutEffect
// effect: EFF-001
useLayoutEffect(() => {
  const diagram = renderChordDiagram(node, options);
  return () => diagram.destroy();
}, [options]);
```

`renderChordDiagram` is a local adapter in `src/features/compositions/lib`; its concrete API is defined by the compositions spec and must match the installed svguitar version. This example is illustrative. It is not approved until it appears in `docs/decisions/effects.md`. Keep `options` stable; an unstable object recreates the diagram on every render.

## Cleanup and StrictMode

- Every subscription, timer, listener or imperative instance must be cleaned up.
- Cleanup must be idempotent: React StrictMode can run setup and cleanup twice in development.
- Do not rely on a mutable module variable that survives cleanup.
- Test unmount behavior when the effect owns an external resource.

## Third-party hooks

A third-party hook may use effects internally. The policy applies to effects written in this repository, not to a dependency's implementation. Do not wrap a third-party hook in an effect just to avoid its API.

## Validation

Until `pnpm check:arch` exists, review `docs/decisions/effects.md` manually against the code. Once it exists, run:

```bash
pnpm check:arch
pnpm verify
```

If the check reports `EFFECT_UNAPPROVED`, request approval or use an alternative. If it reports `EFFECT_STALE`, remove the row or restore the effect. Do not disable the check.
