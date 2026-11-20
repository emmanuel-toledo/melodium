# Capability Map: Melodium MVP

Status: Approved
Version: 1.1
Last updated: 2026-11-19

This map defines the modules of the Melodium MVP, their boundaries and the order in which they are specified and built. It is deliberately small. Each module gets its own spec after this map is approved.

## Modules

| Module id      | Responsibility                                                                                                         | Spec depends on                    | Runtime feature edges  |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ---------------------- |
| `platform`     | Scaffold, tooling, app shell, Firebase facade, environments, tests, emulators and architecture checks. No domain.      | -                                  | None                   |
| `auth`         | Google and email/password authentication, session state, sign-out and route guards.                                    | `platform`                         | None                   |
| `compositions` | Guitar chord sheets: ChordPro CRUD, tags, search, transposition and chord rendering. Owns the compositions collection. | `platform`, `auth`                 | `auth`                 |
| `setlists`     | Ordered setlists of compositions. Owns the setlists collection and resolves composition data through the public API.   | `platform`, `auth`, `compositions` | `auth`, `compositions` |

"Spec depends on" is the build order. "Runtime feature edges" is the import graph enforced in `src/features`.

## Build order

```text
platform -> auth -> compositions -> setlists
```

`platform` must ship first because every later module depends on its scaffold, test harness, Firebase facade and checks. `auth` is next because both domain features need the current user. `setlists` is last because it consumes the compositions public API.

## Module contracts

### `platform`

Provides:

- Vite + React + strict TypeScript application shell.
- Tailwind CSS, shadcn/ui primitives and the `@/` alias.
- Router shell, providers, layouts and global styles.
- Validated environment in `src/shared/config/env.ts`.
- Firebase client and curated facade in `src/shared/lib/firebase`.
- Vitest + React Testing Library setup and Firebase emulator configuration.
- ESLint, Prettier, Husky/lint-staged and `eslint-plugin-boundaries`.
- `scripts/check-architecture.mjs`, `scripts/architecture.config.mjs` and `pnpm check:arch`.
- `pnpm verify` including format, lint, typecheck, tests, architecture and build.

Does not provide:

- Auth screens or session logic.
- Composition, setlist or other domain types.
- Firestore collections or rules for a domain feature.
- Deployment or CI.

### `auth`

Provides:

- Google and email/password sign-in, registration, password reset and sign-out.
- A non-persisted Zustand session store reconciled with Firebase Auth.
- Public `initializeAuth`, `useAuth`, `authRoutes`, `RequireAuth`, `UserMenu` and the `AuthUser`, `AuthState`, `AuthStatus` and `SignUpResult` types.
- Spanish error mapping and route-guard integration points for the app router.

Owns the session only. It does not write compositions or setlists.

### `compositions`

Provides:

- Composition list, detail, create, edit and delete flows.
- ChordPro parsing and rendering with chords above lyrics.
- View-only transposition and return to the original key.
- Tags, client-side search and filtering.
- Guitar-only instrument UI and the `instrument` field.
- Zod schemas and inferred domain types.
- Public hooks, pages and types needed by the app and by `setlists`.
- Public read access for setlists to resolve composition IDs into display data.

Owns `users/{uid}/compositions/{id}`. It does not write setlists.

### `setlists`

Provides:

- Setlist list, detail, create, edit and delete flows.
- Ordered `compositionIds` with add, remove and reorder operations.
- Composition resolution through the public API of `compositions`.
- Empty, loading and error states, including deleted or unavailable compositions.

Owns `users/{uid}/setlists/{id}`. It stores IDs only and never duplicates composition data.

## Cross-module rules

- `app -> features -> shared`; no exceptions.
- Features are imported only through `@/features/<feature>`.
- No feature imports `src/app`; `shared` imports neither `app` nor features.
- No cycles, including type-only imports.
- A feature writes only its own Firestore collection.
- `setlists -> compositions` is allowed. `compositions -> setlists` is forbidden.
- The app may compose features, but it does not own Firestore access or domain rules.
- UI components consume feature hooks; only feature `api/` modules use `@/shared/lib/firebase`.
- Rendered HTML and transposed content are never persisted.

## Open decisions

These decisions affect module contracts and are resolved in the referenced spec, not in this map:

1. **Deletion cleanup.** When a composition is deleted, its ID must not remain in setlists. The setlists spec chooses between `setlists` reconciling its IDs through the compositions public API and a thin app-level workflow. Neither option may add a `compositions -> setlists` dependency.
2. **Composition data for setlists.** The compositions spec defines the smallest public read API that setlists needs to resolve IDs without importing internals.
3. **Routes and guards.** The auth and platform specs define the route map and the unauthenticated redirect behavior.
4. **ChordPro and transposition.** The compositions spec fixes the parser, transposition rules and chord-diagram scope. No new dependency is added without approval.
5. **Setlist ordering UI.** The setlists spec chooses an accessible ordering interaction. Drag-and-drop requires an approved dependency.
6. **Firestore indexes and rules.** The platform spec sets the baseline; each domain spec adds only the rules and indexes it needs.

## Success criteria for this map

- The project owner confirms the four module boundaries and their responsibilities.
- The build order is accepted: `platform -> auth -> compositions -> setlists`.
- The runtime feature graph is accepted: `auth` has no feature dependency; `compositions` depends on `auth`; `setlists` depends on `auth` and `compositions`.
- The open decisions are acknowledged and assigned to the module that will resolve them.

Approval of this map authorizes writing the `001-platform` spec. It does not authorize implementation.
