# Approved React effects

This file is the source of truth for `useEffect` / `useLayoutEffect` / `useInsertionEffect` approvals in Melodium.

An effect may exist only when the project owner has explicitly approved it **before** the code is written. The default is no effect.

## Policy

An effect is allowed only when it synchronizes with an external system that React does not control. It is not allowed for derived state, state synchronization, data fetching, user events, resetting state on prop changes, or one-time initialization that can be done during render or with a ref callback.

Prefer `useSyncExternalStore` for external subscriptions such as Firestore and Auth. See `.opencode/skills/melodium-react/references/effects.md` for the decision table and examples.

## Approval process

1. Stop before writing the effect.
2. Explain why the alternatives do not work.
3. Ask the project owner for explicit approval.
4. Add one row to the table below.
5. Add `// effect: EFF-XXX` at the call site.
6. Add a test that covers the effect and its cleanup.
7. Remove the row if the effect is removed.

## Approved effects

| ID  | File | Hook | Why / alternatives | Cleanup | Test | Approved |
| --- | ---- | ---- | ------------------ | ------- | ---- | -------- |

No effects are approved yet.

## Rules

- IDs use the format `EFF-NNN` and are unique.
- `File` is relative to the repository root and must exist.
- `Hook` is one of `useEffect`, `useLayoutEffect` or `useInsertionEffect`.
- One row per file and hook.
- The `Test` file must exist.
- The inline marker must match the row ID.
- Do not add example or placeholder rows.
- Do not use `eslint-disable` to bypass the policy.

Once `001-platform` is implemented, `pnpm check:arch` verifies that every effect has a row, every row has a matching effect, and every effect has its inline marker.
