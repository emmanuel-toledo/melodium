# Melodium Constitution

Status: Approved
Version: 1.0
Last updated: 2026-11-18

This document defines the non-negotiable principles for Melodium. Specs, skills, reviews and implementation must comply with it. If two sources conflict, stop and resolve the conflict before writing code.

## 1. Purpose

Melodium is a personal web library for musical compositions. The MVP focuses on guitar chord sheets: lyrics with chords in ChordPro, transposition, tags, search and setlists.

Success means a single user can sign in, keep a private library of guitar compositions, find them quickly, transpose a sheet for viewing and organize them into ordered setlists, on a phone or a desktop browser.

## 2. Product scope

### MVP

- Google and email/password authentication.
- Private composition library with create, read, update and delete.
- ChordPro content with a rendered chord sheet.
- View-only transposition.
- Tags, client-side search and filtering.
- Setlists with an ordered list of compositions.
- Instrument field with a guitar-only UI in this version.

### Out of scope

- Public sharing or collaboration.
- Tablature, sheet music, audio playback or recording.
- Payments, subscriptions or advertising.
- PWA, offline mode or background sync.
- Internationalization; the UI is Spanish.
- Cloud Functions, Cloud Storage or any custom backend.
- Deployment and CI until a spec defines the projects and the pipeline.

New scope requires an approved spec. It must not be added to an existing implementation because it is convenient.

## 3. Architecture

### Layers

```text
src/app -> src/features/<feature> -> src/shared
```

- `src/app` is the composition root: routes, providers, layouts, app-level constants and global styles. It does not contain domain logic, query Firestore or initialize Firebase. App-wide constants live in `src/app/config`, which imports neither features nor Firebase; features are composed in routes and providers.
- `src/features/<feature>` is an isolated domain module. It owns its pages, components, hooks, schemas, types, domain logic and Firestore access.
- `src/shared` is generic infrastructure: UI primitives, composed shared components, generic hooks, utilities, validated environment and the Firebase client. It never knows domain types.

The dependency direction never reverses. A feature must not import `src/app`; `src/shared` must not import `src/app` or any feature.

### Feature graph

```text
app -> auth, compositions, setlists
setlists -> auth, compositions
compositions -> auth
auth -> no other feature
all layers -> shared
```

- `app` may import any feature through its public API.
- A feature may import only the features listed in the graph.
- No cycles, including type-only imports.
- A new cross-feature dependency requires an approved spec and an update to the graph.

### Public APIs

- Every feature has a root `index.ts`.
- Cross-feature and app imports use exactly `@/features/<feature>`.
- Deep imports, internal barrels, relative paths across feature boundaries and direct imports of another feature's internals are forbidden.
- The public API is minimal. Internal API clients, converters and helpers are not exported.
- Feature tests may import their own internals; integration tests between features use public APIs.

### Firebase and environment

- The Firebase SDK is imported only inside `src/shared/lib/firebase`.
- `src/shared/lib/firebase` owns `initializeApp`, `auth`, `db`, emulator wiring and the curated re-exports consumed by features.
- Feature `api/` modules import Firebase functions and instances from `@/shared/lib/firebase`.
- UI components never import the Firebase SDK or the shared Firebase client; they consume feature hooks.
- `import.meta.env` is read only in `src/shared/config/env.ts`; the rest of the code imports the validated configuration object.

### React

- Function components only, with named exports.
- Components render UI. Domain rules, Firestore queries and data orchestration belong in hooks and `lib/`.
- `useEffect`, `useLayoutEffect` and `useInsertionEffect` are prohibited by default.
- An effect is allowed only for synchronization with an external system that React does not control, after explicit project-owner approval and a record in `docs/decisions/effects.md`.
- Approved effects need an inline `// effect: EFF-XXX` marker and a test.
- Prefer `useSyncExternalStore` for Firestore and Auth subscriptions.
- No `any`, `dangerouslySetInnerHTML` or `console.log` in committed code.

## 4. Data and security

### Firestore model

```text
users/{uid}/compositions/{compositionId}
users/{uid}/setlists/{setlistId}
```

A composition stores its title, optional metadata, tags, `instrument`, ChordPro `content` and timestamps. A setlist stores its name, ordered `compositionIds` and timestamps.

### Ownership

- Firestore rules are deny-by-default.
- Only the authenticated owner may read or write their own documents.
- A feature owns its collection. No feature writes another feature's collection.
- `setlists` references compositions by ID and resolves their data through the public API of `compositions`. It does not duplicate composition data.
- Deleting a composition must not leave a stale ID in the user's setlists. The setlists spec chooses the coordination mechanism without introducing a `compositions -> setlists` dependency.
- Auth manages the session and never writes compositions or setlists.

### Source of truth

- The spec and Zod schemas define the data model.
- The original ChordPro `content` is the source of truth for a sheet.
- Rendered HTML and transposed content are views. They are never persisted.
- Tags are trimmed, lowercased and deduplicated.
- Timestamps use server timestamps for writes and are converted to `Date` for display.

## 5. User experience

- UI text is Spanish. Code, comments, commits, specs and technical documentation are English.
- Every data-driven screen covers loading, empty, error and ready states.
- The layout is mobile-first and keyboard-accessible, with visible focus and adequate contrast.
- Chord sheets keep chords above lyrics and preserve line and section structure.
- Transposition is view-only. The UI shows the original key and the current view key when they differ, and offers a way back to the original.
- Forms use React Hook Form and Zod, show inline Spanish errors and prevent duplicate submissions.
- Toasts are for transient feedback; validation errors stay inline.

## 6. Engineering standards

- TypeScript strict mode. No `any`; use `unknown` and narrow.
- ESLint and Prettier are mandatory; rules are not disabled to make a change pass.
- Tests use Vitest and React Testing Library. Firestore rules use the emulators and `@firebase/rules-unit-testing`.
- Unit and component tests live next to the code. Rules tests live in `tests/rules/`.
- Tests never depend on the network or a real Firebase project. Unit tests mock `@/shared/lib/firebase`.
- Critical behavior must have tests: ChordPro parsing, transposition, Zod schemas, composition CRUD, setlists and ownership rules.
- A change is not done while its critical tests are missing or failing.
- Do not delete, skip or weaken a failing test to make a change pass.
- Do not add, remove or update a dependency without approval.
- Do not change the data model, Firestore rules or indexes without approval.
- Do not commit secrets, `.env.local`, service credentials or generated build output.

## 7. Delivery process

Melodium uses spec-driven development:

```text
Specify -> Plan -> Tasks -> Implement
```

- A human reviews and approves each phase before the next one starts.
- The capability map defines module boundaries and build order before module specs are written.
- Implementation follows an approved `tasks.md`; new work is added to the spec or discussed before it is implemented.
- At the end of a change, update the spec and `tasks.md`, record deferred work under "Out of Scope" and update the feature's `index.ts` if its public API changed.
- `pnpm verify` is the mandatory gate. `pnpm test:rules` is required when rules or indexes change.
- If the constitution or the active spec does not exist, stop and ask for it before implementing.

## 8. Decision records

- Specs live in `docs/specs/`.
- Effect approvals live in `docs/decisions/effects.md`.
- Other long-lived decisions may be recorded in `docs/decisions/` when they affect architecture, data or public contracts.
- A decision record states the context, the decision and the consequences. It does not replace the spec that authorized the change.

## 9. Governance

- The project owner approves the constitution, the capability map, specs, plans, tasks, dependencies, data-model changes, architecture changes and effect exceptions.
- An agent must not approve its own effect or add an approval row without the owner's explicit approval.
- Amendments to this constitution require explicit owner approval, a version bump and an updated date.
- When a rule becomes obsolete, remove it through an approved amendment instead of ignoring it.
