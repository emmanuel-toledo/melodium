---
name: Melodium React
description: Use when writing or reviewing React components, hooks, state, effects, data subscriptions, forms, or UI in Melodium, especially before adding useEffect, useLayoutEffect or useInsertionEffect.
---

# Melodium React

Owns **how React code is written** in Melodium. Load this before writing or reviewing a component, hook, effect, form, subscription or UI state.

## Before you write

1. Read the active spec.
2. If the change may need `useEffect`, `useLayoutEffect` or `useInsertionEffect`, read `references/effects.md` before writing code.
3. Decide where the data comes from and who owns the state.
4. Check whether the problem is already solved by a feature hook or a pure function in `lib/`.

## Component rules

- Function components only. Named exports, no class components.
- Components render UI. They do not contain domain logic, Firestore queries or business rules.
- Data comes from feature hooks. Components never import the Firebase SDK or `@/shared/lib/firebase`.
- Keep components focused. Extract a hook when data/state orchestration grows; extract a component when rendering has independent responsibilities.
- Use semantic HTML, labels, visible focus and keyboard navigation.
- UI text is Spanish; code, names and comments are English.
- No `dangerouslySetInnerHTML`. Render the parsed ChordPro model as React nodes.
- No `any`; use `unknown` and narrow. Avoid `as` and `!` without justification.
- No `console.log` in committed code.
- No premature `useMemo` or `useCallback`. Use them only for a measured cost or when a stable identity is required by an API.
- Use stable IDs as list keys, not array indexes for dynamic lists.

## State rules

- Keep state as close as possible to where it is used. Lift it only when another component needs it.
- Derive values during render; do not mirror props or other state in `useState`.
- Reset state when an identity changes with a `key`, not with an effect.
- Use the URL as the source of truth for search, filters and shareable view state (`useSearchParams`).
- Use `useState` for local UI state. Use `useReducer` when transitions are complex. Use a feature hook for server/Firestore state.
- Use `useRef` for mutable values that do not trigger rendering. Do not use it as hidden state that the UI must react to.
- Do not duplicate the same data in multiple state atoms. Pick one owner.

## Effect policy

`useEffect`, `useLayoutEffect`, `useInsertionEffect` and other effect hooks are **prohibited by default**.

An effect is allowed only when all of these are true:

1. It synchronizes with an external system that React does not control.
2. The alternatives (render-time derivation, event handler, `key`, `useSyncExternalStore`, ref callback, route loader) do not solve the problem.
3. The project owner approved it before the code was written.
4. It is recorded in `docs/decisions/effects.md` with an ID, reason, cleanup and test.
5. The call site has an inline `// effect: EFF-XXX` comment.

Do not use an effect for:

- Deriving state from props or state.
- Synchronizing two state values.
- Fetching data.
- Responding to a user event.
- Resetting state when a prop changes.
- One-time initialization that can be done during render or with a ref callback.

For Firestore and Auth subscriptions, prefer `useSyncExternalStore` with a cached snapshot. See `references/state-and-data.md`.

If approval is missing, **stop and ask**. Do not add the effect, do not add a row to `docs/decisions/effects.md`, and do not bypass the rule.

## Data and subscriptions

- Auth state comes from the auth feature's public hook, not the Firebase client.
- Firestore subscriptions come from feature hooks. Hooks call the feature `api/`; `api/` uses `@/shared/lib/firebase`.
- A subscription hook must return a stable snapshot, expose loading/error state, and unsubscribe on teardown.
- Do not fetch in a component. Use a feature hook or a route loader.
- Search and filters run in the client over the user's library.
- Transposition is a pure view operation. Compute it during render from the original ChordPro content; never persist it.

## Forms and UI

- Forms use `react-hook-form` + Zod. Define the schema in the feature's `schemas/`.
- Derive the form type from the schema with `z.infer`; do not duplicate the shape.
- Show field errors inline in Spanish. Use sonner for transient success/error feedback.
- Disable the submit button while the operation is pending and prevent duplicate submissions.
- Cover empty, loading and error states for every data-driven screen.
- Mobile-first: test narrow widths, keyboard navigation, focus visibility and contrast.
- Use accessible names and labels; never rely on placeholder text as a label.

## ChordPro and music rendering

- Keep the original ChordPro `content` as the source of truth.
- Parse and transpose in `src/features/compositions/lib`.
- Render from the parsed model with React elements; never inject HTML.
- Do not persist rendered HTML or transposed content.
- Chord diagrams are rendered with the approved SVG library; keep the integration in `compositions/lib` or a focused component.

## Testing

- Test behavior, not implementation details.
- Use React Testing Library queries by role, label or visible Spanish text.
- Mock `@/shared/lib/firebase` in unit and component tests.
- Test loading, empty, error and success states.
- Test cleanup for any approved effect.
- Test keyboard interaction for interactive UI.

## Review checklist

- [ ] The component has no business logic or Firebase access.
- [ ] Data comes from a feature hook; UI state is local and minimal.
- [ ] No `useEffect`/`useLayoutEffect`/`useInsertionEffect` was added without approval and an inline ID.
- [ ] The state has a single owner; derived values are computed during render.
- [ ] Forms use RHF + Zod and show Spanish errors.
- [ ] Empty, loading and error states exist.
- [ ] The UI is keyboard-accessible and mobile-first.
- [ ] No `any`, `dangerouslySetInnerHTML` or `console.log`.
- [ ] Tests cover the critical behavior.
- [ ] `pnpm verify` passes.

## References

| Situation | Read |
| --- | --- |
| Deciding whether an effect is allowed, examples and approval template | `references/effects.md` |
| Firestore/Auth subscriptions, derived state, URL state and transposition | `references/state-and-data.md` |
| Forms, loading/empty/error states, accessibility and ChordPro rendering | `references/forms-and-ui.md` |
| Self-review before finishing | `references/review-checklist.md` |
