# Spec 001: Platform — V1

Status: Shipped
Version: 1.1
Last updated: 2026-11-19
Module id: `platform`
Depends on: `000-capability-map` (Approved)
Runtime feature edges: none

> Test placement and harness paths are superseded by
> [delta 001-test-layout](./deltas/001-test-layout.md). This spec's history is otherwise unchanged.

## 1. Objective

Melodium needs a runnable, verified foundation before any domain feature exists. This spec defines the scaffold, tooling, environment, Firebase client boundary, application shell, test harness and architecture checks that `002-auth`, `003-compositions` and `004-setlists` will build on.

The module is done when a fresh clone can install, run, test, build and verify the application without a real Firebase project, and when the architecture checker rejects every boundary violation defined in this spec. The module must not contain authentication, composition or setlist behavior.

Success means:

- A developer on Node 24 runs `corepack enable && pnpm install`, then `pnpm dev`, and gets the Melodium shell.
- `pnpm verify` passes on a fresh checkout with the generated local demo environment.
- `pnpm test:rules` passes against the local Firestore emulator.
- `pnpm check:arch` fails, with a documented error code, for each fixture violation.
- No feature code, domain type or music dependency exists.

## 2. Scope

### In scope

- pnpm/Node/Vite scaffold with strict TypeScript and the `@/` alias.
- Tailwind CSS 4 and the shadcn/ui base used by the shell.
- Application shell: root layout, header, main landmark, skip link, toaster, error boundary and 404.
- Router shell with the final route map documented; only `/` and `*` are implemented in this phase.
- Validated environment in `src/shared/config/env.ts`.
- Firebase client and curated facade in `src/shared/lib/firebase`, wired to local emulators.
- Firebase emulator configuration and deny-all baseline rules.
- Vitest + React Testing Library + jsdom setup and sample tests.
- Firestore rules test harness with `@firebase/rules-unit-testing`.
- ESLint, Prettier, Husky, lint-staged and `eslint-plugin-boundaries`.
- `scripts/check-architecture.mjs`, its config and fixtures.
- `pnpm verify` and development documentation.

Everything not listed here is out of scope. The deferred backlog is in section 13.

## 3. Tech stack

### Runtime and tooling

| Area            | Choice                                                         | Notes                                                                                                 |
| --------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Runtime         | Node 24 LTS                                                    | `.nvmrc` with `24`; `engines.node` in `package.json`.                                                 |
| Package manager | pnpm 10.19.0 via corepack                                      | `packageManager` field; `pnpm-lock.yaml` committed.                                                   |
| Build           | Vite 8                                                         | `@vitejs/plugin-react`; no SSR.                                                                       |
| UI              | React 19 + React DOM 19                                        | Function components, named exports.                                                                   |
| Language        | TypeScript 6, strict                                           | No `any`; `@/` alias; `tsc --noEmit`. TypeScript 7 is deferred until `typescript-eslint` supports it. |
| Styling         | Tailwind CSS 4 + `@tailwindcss/vite`                           | CSS-first configuration in `src/app/styles/globals.css`.                                              |
| Components      | shadcn/ui (source files)                                       | Base primitives copied into `src/shared/components/ui`.                                               |
| Routing         | React Router 8                                                 | `createBrowserRouter`; final route map below.                                                         |
| Validation      | Zod 4                                                          | Environment validation; domain schemas arrive in `003`/`004`.                                         |
| Feedback        | sonner 2                                                       | Global `<Toaster />` in the root layout.                                                              |
| Firebase        | Firebase 13 client SDK                                         | Only `src/shared/lib/firebase` imports it.                                                            |
| Tests           | Vitest 5 + RTL 16 + jsdom                                      | Unit and component tests next to source.                                                              |
| Rules tests     | Firebase Emulator Suite + `@firebase/rules-unit-testing` 6     | Separate command; requires Java.                                                                      |
| Lint            | ESLint 10 + typescript-eslint 8 + `eslint-plugin-boundaries` 7 | Flat config; Prettier last.                                                                           |
| Format          | Prettier 3                                                     | `format` and `format:check`.                                                                          |
| Git hooks       | Husky 9 + lint-staged 17                                       | Pre-commit runs lint-staged only.                                                                     |
| Firebase CLI    | firebase-tools 15                                              | Dev dependency for emulators and rules tests.                                                         |

Version policy:

- The exact versions resolved at install are recorded in `pnpm-lock.yaml`. The target majors above are fixed for V1.
- TypeScript 7 is not compatible with the pinned `typescript-eslint` 8 peer range, so V1 uses TypeScript 6. Upgrading to 7 requires a typescript-eslint release that declares support.
- Do not upgrade a major without a spec update.
- If another target major is incompatible with a required tool, stop and ask before downgrading or disabling a check.

### Approved dependencies for this module

Runtime:

- `react`, `react-dom`
- `react-router`
- `firebase`
- `zod`
- `sonner`

UI and build:

- `tailwindcss`, `@tailwindcss/vite`
- `class-variance-authority`, `clsx`, `tailwind-merge`
- `@radix-ui/react-slot`

Development:

- `vite`, `@vitejs/plugin-react`, `typescript`
- `@types/react`, `@types/react-dom`, `@types/node`
- `vitest`, `jsdom`
- `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`, `@testing-library/jest-dom`
- `eslint`, `@eslint/js`, `globals`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-boundaries`, `eslint-import-resolver-typescript`, `eslint-config-prettier`
- `prettier`
- `husky`, `lint-staged`
- `firebase-tools`, `@firebase/rules-unit-testing`

This list is the approved install set for `001`. Adding, removing or upgrading a dependency requires approval. Later specs add their own dependencies: `react-hook-form` and `@hookform/resolvers` in `002`; `svguitar` and `@tombatossals/chords-db` in `003`. There is no `chordsheetjs`: the ChordPro parser and transposition are implemented in-house in `003`.

## 4. Commands

| Command                           | Purpose                                                                                                          |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `corepack enable && pnpm install` | Install the pinned toolchain and dependencies. The `postinstall` hook generates `.env.local` when it is missing. |
| `pnpm env:setup`                  | Recreate `.env.local` from `.env.example` when it is missing.                                                    |
| `pnpm setup`                      | Not available: reserved by pnpm. Use `pnpm env:setup`.                                                           |
| `pnpm dev`                        | Start Vite at `http://localhost:5173`.                                                                           |
| `pnpm emulators`                  | Start Auth (9099), Firestore (8080) and the Emulator UI (4000).                                                  |
| `pnpm build`                      | Build to `dist/`.                                                                                                |
| `pnpm preview`                    | Serve the production build.                                                                                      |
| `pnpm lint`                       | ESLint over the repository.                                                                                      |
| `pnpm lint:fix`                   | ESLint with autofix.                                                                                             |
| `pnpm format`                     | Prettier write.                                                                                                  |
| `pnpm format:check`               | Prettier check.                                                                                                  |
| `pnpm typecheck`                  | `tsc --noEmit`.                                                                                                  |
| `pnpm test`                       | Vitest once.                                                                                                     |
| `pnpm test:watch`                 | Vitest watch.                                                                                                    |
| `pnpm test:rules`                 | Firestore rules tests inside `firebase emulators:exec`.                                                          |
| `pnpm check:arch`                 | Architecture checker.                                                                                            |
| `pnpm verify`                     | `format:check && lint && typecheck && test && check:arch && build`.                                              |

Rules:

- `pnpm verify` must not require emulators, a real Firebase project or network access.
- `pnpm test:rules` requires Java and starts only the Firestore emulator through `firebase emulators:exec`.
- `pnpm build` must succeed with the generated local demo environment. Deployment is out of scope.
- `pnpm verify` is the mandatory gate defined in the constitution.

## 5. Project structure

```text
.
├── .env.example             # documented demo variables; committed
├── .env.local               # generated by postinstall; ignored
├── .gitignore
├── .nvmrc
├── .prettierignore
├── .prettierrc.json
├── components.json          # shadcn aliases
├── eslint.config.js
├── firebase.json
├── .firebaserc
├── firestore.indexes.json
├── firestore.rules
├── index.html
├── package.json
├── pnpm-lock.yaml
├── public/
│   └── favicon.svg
├── tsconfig.json
├── vite.config.ts           # Vite + Vitest config
├── vitest.rules.config.ts
├── docs/
├── scripts/
│   ├── architecture.config.mjs
│   ├── check-architecture.mjs
│   ├── check-architecture.test.mjs
│   ├── ensure-env.mjs
│   └── fixtures/
│       └── architecture/
├── src/
│   ├── app/
│   │   ├── config/
│   │   ├── layouts/
│   │   ├── routes/
│   │   ├── styles/
│   │   └── main.tsx
│   ├── features/           # empty until 002
│   │   └── .gitkeep
│   └── shared/
│       ├── components/
│       │   └── ui/
│       ├── config/
│       │   └── env.ts
│       └── lib/
│           ├── firebase/
│           └── utils.ts
└── tests/
    ├── setup.ts
    └── rules/
        ├── helpers.ts
        └── baseline.test.ts
```

`src/features` is created with a `.gitkeep` so the architecture checker and ESLint boundaries see the directory. It contains no code in this phase.

### Layer responsibilities

- `src/app`: composition root. Routes, layouts, app-level constants and global styles. It imports features only through `@/features/<feature>` and may import `shared`. It never initializes Firebase or reads `import.meta.env`.
- `src/features`: empty in this phase. Each feature will have a root `index.ts` as its only public entry point.
- `src/shared`: generic infrastructure. UI primitives, utilities, validated environment and the Firebase facade. It never imports `app` or a feature and never defines domain types.

`src/app/main.tsx` is the provider composition point: it wraps the router in `StrictMode`. The auth provider is added in `002`.

Create only the folders listed. Add shared hooks, shared types, feature folders or test factories when the first real use appears; do not add speculative barrels.

## 6. Code style

- Function components only, named exports. No default exports except where a tool requires one (for example, Vite and ESLint config files).
- Files are kebab-case; component exports are PascalCase; hooks are `useSomething`; types are PascalCase without an `I` prefix; constants are `UPPER_SNAKE_CASE`.
- Use `import type` for type-only imports and the `@/` alias for cross-layer imports.
- TypeScript strict; no `any`. Use `unknown` and narrow.
- No `dangerouslySetInnerHTML` and no `console.log`. `console.warn` and `console.error` are allowed only for operational errors.
- No React effects. Use render-time derivation, event handlers, `useSyncExternalStore` or a ref callback.
- UI text is Spanish. Code, comments, commits, specs and technical docs are English.
- Tailwind is mobile-first. Use semantic HTML, visible focus and accessible names.
- Do not disable lint or TypeScript rules to make a change pass.

Tooling:

- ESLint flat config uses `@eslint/js` recommended, `typescript-eslint` recommended type-checked rules, `eslint-plugin-react-hooks`, the boundaries policies and `eslint-config-prettier` last.
- Enable `@typescript-eslint/no-explicit-any`, `no-console` with `warn` and `error` allowed, and a `no-restricted-syntax` rule for `dangerouslySetInnerHTML`.
- Prettier uses single quotes, trailing commas, a 100-column print width and LF line endings. `.prettierignore` excludes generated and vendor paths.
- Husky's pre-commit hook runs lint-staged: ESLint `--fix` and Prettier on staged files. It does not run tests; `pnpm verify` remains the gate.

Example:

```tsx
// Example: presentational component
import type { ReactNode } from 'react';

type SectionProps = {
  title: string;
  children: ReactNode;
};

export function Section({ title, children }: SectionProps) {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}
```

## 7. Environment and Firebase

### Environment variables

| Variable                      | Required | Demo value                      | Purpose                                        |
| ----------------------------- | -------- | ------------------------------- | ---------------------------------------------- |
| `VITE_FIREBASE_API_KEY`       | Yes      | `demo-api-key`                  | Firebase web API key.                          |
| `VITE_FIREBASE_AUTH_DOMAIN`   | Yes      | `demo-melodium.firebaseapp.com` | Auth domain.                                   |
| `VITE_FIREBASE_PROJECT_ID`    | Yes      | `demo-melodium`                 | Project ID.                                    |
| `VITE_FIREBASE_APP_ID`        | Yes      | `1:000000000000:web:demo`       | Web app ID.                                    |
| `VITE_USE_FIREBASE_EMULATORS` | Yes      | `true`                          | Connect Auth and Firestore to local emulators. |

Implementation rules:

- `src/shared/config/env.ts` is the only module that reads `import.meta.env`.
- Export a pure `parseEnv(raw: Record<string, string | undefined>)` for tests and a validated `env` object.
- Validate with Zod. Fail with a clear, actionable error listing the missing or invalid variables. Do not silently fall back to empty strings.
- Define a local `FirebaseConfig` type in `env.ts`; do not import Firebase types there. `env.ts` exports `firebaseConfig` and `useEmulators`, not raw environment values.
- No other module may read `import.meta.env`; the architecture checker enforces this.

Local environment bootstrap:

- `.env.example` is committed and contains only the public demo values above, with emulators enabled.
- `.env.local` is generated by `scripts/ensure-env.mjs` during `postinstall` when it is missing. The script is idempotent and never overwrites an existing file.
- `.env.local` is ignored by Git. It can override the demo values for a real project.
- `pnpm env:setup` runs the same script for a manual recovery when install scripts were skipped. `pnpm setup` is reserved by pnpm and must not be used.
- If the environment is missing or invalid, `env.ts` fails fast with a message that points to `.env.example` and `pnpm env:setup`.
- The generated local environment is for local and emulator use only. Deployment is out of scope; a future deploy spec must define production values and the emulator flag.
- Never commit `.env.local`, service credentials or secrets.

### Firebase facade

`src/shared/lib/firebase` is the only place that imports `firebase/*` or `@firebase/*`:

```text
src/shared/lib/firebase/
  app.ts        # initializeApp guard and firebaseApp
  auth.ts       # getAuth, emulator connection
  firestore.ts  # getFirestore, emulator connection
  index.ts      # curated re-exports
```

Rules:

- Initialize the Firebase app once, even across Vite HMR.
- Connect the Auth emulator to `127.0.0.1:9099` and Firestore to `127.0.0.1:8080` when `useEmulators` is true, without duplicate connection warnings.
- Export `auth`, `db` and the curated functions/types that features need. The initial surface is:

```ts
// Auth
auth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup,
signInWithEmailAndPassword, createUserWithEmailAndPassword,
sendPasswordResetEmail, signOut, type FirebaseUser

// Firestore
db, collection, doc, query, where, orderBy, limit,
onSnapshot, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc,
serverTimestamp, Timestamp, writeBatch,
type DocumentData, type QueryDocumentSnapshot, type FirestoreError

// Local utility type
type Unsubscribe = () => void
```

- Export the Firebase `User` type as `FirebaseUser`; components must see the auth feature's `AuthUser`, never the Firebase type.
- A feature that needs a function not listed here requests it in its spec or plan. Do not bypass the facade.
- `src/app` and features never import the Firebase SDK or the facade's SDK internals; only feature `api/` modules import the curated facade.
- Unit tests may mock `firebase/*`; the boundary check applies to `src/`.

### Emulators and baseline rules

- `firebase.json` configures Firestore rules/indexes and the emulators:
  - Auth: `9099`
  - Firestore: `8080`
  - Emulator UI: `4000`, enabled
  - `singleProjectMode: true`
- `.firebaserc` uses the demo project `demo-melodium`.
- `firestore.rules` is deny-by-default:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

- `firestore.indexes.json` contains empty `indexes` and `fieldOverrides` arrays.
- Domain rules and indexes are added only by the owning feature spec. `002-auth` does not change Firestore rules.
- The baseline rules test verifies that anonymous and authenticated reads and writes are denied.

## 8. Application shell and routes

### Route map

The map is fixed for V1. Later specs add their routes without changing existing paths.

| Path                                | Guard                  | Phase | Behavior                                                                                                  |
| ----------------------------------- | ---------------------- | ----- | --------------------------------------------------------------------------------------------------------- |
| `/`                                 | session-aware redirect | 002   | Redirect to `/compositions` when authenticated, `/login` otherwise. In 001, renders the placeholder home. |
| `/login`                            | `GuestOnly`            | 002   | Sign in.                                                                                                  |
| `/register`                         | `GuestOnly`            | 002   | Create an email/password account.                                                                         |
| `/forgot-password`                  | `GuestOnly`            | 002   | Send a password reset email.                                                                              |
| `/compositions`                     | `RequireAuth`          | 003   | Library list.                                                                                             |
| `/compositions/new`                 | `RequireAuth`          | 003   | Create a composition.                                                                                     |
| `/compositions/:compositionId`      | `RequireAuth`          | 003   | Composition detail and chord sheet.                                                                       |
| `/compositions/:compositionId/edit` | `RequireAuth`          | 003   | Edit a composition.                                                                                       |
| `/setlists`                         | `RequireAuth`          | 004   | Setlist list.                                                                                             |
| `/setlists/new`                     | `RequireAuth`          | 004   | Create a setlist.                                                                                         |
| `/setlists/:setlistId`              | `RequireAuth`          | 004   | Setlist detail and ordering.                                                                              |
| `/setlists/:setlistId/edit`         | `RequireAuth`          | 004   | Edit setlist metadata.                                                                                    |
| `*`                                 | none                   | 001   | Not found.                                                                                                |

- Paths are English; UI text is Spanish.
- `RequireAuth` preserves the requested path and returns to it after sign-in. The exact mechanism is defined in `002-auth`.
- `GuestOnly` redirects authenticated users to `/compositions`. The exact mechanism is defined in `002-auth`.
- The final post-auth target is `/compositions`. Until `003` adds that route, `002` may land authenticated users on the placeholder home; `003` switches the target. No path changes.

### 001 shell

- `src/app/routes/router.tsx` creates the browser router with a root layout.
- 001 implements `/` as a Spanish placeholder and `*` as a Spanish not-found page.
- The shell has:
  - A skip link to `#main`.
  - A semantic `<header>` with the Melodium brand.
  - A `<main id="main">` containing the route outlet.
  - A `<Toaster />` from sonner.
  - A route-level error boundary with a Spanish message and a recovery action.
- Do not add navigation links to routes that do not exist yet. `002-auth`, `003-compositions` and `004-setlists` add their navigation entries when the routes exist.
- The shell is responsive at 320 px and up, keyboard navigable, and has visible focus.
- The document language is `es`; the title is `Melodium`.
- No dark-mode toggle in V1.

### Shadcn/ui

- `components.json` maps:
  - `components` → `@/shared/components`
  - `ui` → `@/shared/components/ui`
  - `utils` → `@/shared/lib/utils`
  - `lib` → `@/shared/lib`
  - `hooks` → `@/shared/hooks`
- Add only the primitives used in this phase: `button` and `card`. Add others in the spec that needs them.
- `cn` lives in `src/shared/lib/utils.ts` and combines `clsx` and `tailwind-merge`.
- Global CSS lives in `src/app/styles/globals.css` and imports Tailwind. Keep shadcn theme variables there.

## 9. Testing strategy

> Superseded by [delta 001-test-layout](./deltas/001-test-layout.md): application tests live under `tests/`, rules tests under `tests/firestore-rules/`.

- Unit and component tests live next to the source as `*.test.ts(x)`.
- `tests/setup.ts` imports `@testing-library/jest-dom/vitest` and registers RTL cleanup for the explicit-import style.
- `tests/` is for setup, factories and rules tests, not for feature unit tests.
- Vitest uses jsdom and shares the Vite alias configuration. The default config includes `src/**/*.test.{ts,tsx}` and `scripts/**/*.test.mjs`, and excludes `tests/rules/**` and `scripts/fixtures/**`.
- `tests/rules/` runs only through `pnpm test:rules`:
  `firebase emulators:exec --project demo-melodium --only firestore "pnpm exec vitest run --config vitest.rules.config.ts"`.
- No coverage threshold. Critical behavior must have tests; a change with missing or failing critical tests is not done.

Required tests for 001:

1. `parseEnv` accepts the demo values and rejects missing or invalid variables with a clear error.
2. The Firebase facade connects to the emulators only when `useEmulators` is true; mock the Firebase SDK.
3. The shell renders the placeholder home and the 404 page with Spanish text.
4. The architecture checker reports each documented error code for its fixture and accepts the valid fixture.
5. The deny-all baseline rules test passes for anonymous and authenticated users.

Test constraints:

- No network access and no real Firebase project.
- Mock `@/shared/lib/firebase` in feature tests. For the facade test, mock the Firebase SDK modules and the env module.
- Rules tests use the emulator through `@firebase/rules-unit-testing`.
- `pnpm verify` runs unit/component/checker tests, not rules tests.

## 10. Architecture enforcement

`scripts/check-architecture.mjs` is the executable source of truth for boundaries that ESLint cannot reliably enforce. `scripts/architecture.config.mjs` holds the layer paths, alias and feature graph.

Checks:

| Code                          | Rule                                                                                                                                                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ARCH001_LAYER_DIRECTION`     | `shared` must not import `app` or a feature; a feature must not import `app`.                                                                                                                                                  |
| `ARCH002_FEATURE_DEEP_IMPORT` | Cross-feature and app imports must be exactly `@/features/<feature>`. Reject subpaths, `/index`, relative paths crossing features and imports of internals.                                                                    |
| `ARCH003_FEATURE_GRAPH`       | A feature may import only the features allowed by the graph: `auth` → none; `compositions` → `auth`; `setlists` → `auth`, `compositions`.                                                                                      |
| `ARCH004_CYCLE`               | No import cycle between files or features, including type-only imports.                                                                                                                                                        |
| `ARCH005_FIREBASE_BOUNDARY`   | Only `src/shared/lib/firebase` may import `firebase`, `firebase/*` or `@firebase/*`.                                                                                                                                           |
| `ARCH006_ENV_BOUNDARY`        | Only `src/shared/config/env.ts` may read `import.meta.env`.                                                                                                                                                                    |
| `ARCH007_INTERNAL_BARREL`     | No `index.ts` under a feature subdirectory. Only `src/features/<feature>/index.ts` is allowed.                                                                                                                                 |
| `ARCH008_EFFECT_APPROVAL`     | A call to `useEffect`, `useLayoutEffect` or `useInsertionEffect` requires an inline `// effect: EFF-XXX` marker and a matching entry in `docs/decisions/effects.md`. No effects are approved in this phase, so any call fails. |
| `ARCH009_FEATURE_ROOT`        | Every directory directly under `src/features` has a root `index.ts`. No feature exists in this phase.                                                                                                                          |

Implementation requirements:

- Parse source with the TypeScript compiler API; do not use regular expressions to resolve imports.
- Resolve relative imports and the `@/` alias against `scripts/architecture.config.mjs`. Include type-only imports and dynamic imports.
- Report `file:line:column`, the error code and a short explanation. Exit with code 1 on violations and 0 when clean. Never rewrite code.
- Keep the checker independent of the Vite build so it can run before `build`.
- Complement, do not duplicate, `eslint-plugin-boundaries`: ESLint enforces layer direction and obvious import mistakes; the script enforces the graph, deep imports, cycles, Firebase/env boundaries, internal barrels and effect approvals. If they disagree, the script is authoritative and the ESLint config is corrected.
- Fixtures under `scripts/fixtures/architecture/` cover one valid tree and at least one tree per error code. The checker test imports the checker's `runChecks` function rather than spawning a process.
- The test file uses the Node environment (`// @vitest-environment node`).

ESLint boundaries configuration:

- Use the v7 `boundaries/dependencies` rules with `app`, `feature` and `shared` elements.
- Configure `eslint-import-resolver-typescript` through `settings['import/resolver']` so the `@/` alias resolves.
- Same-feature imports are allowed. Cross-feature imports are allowed only by the script's graph; ESLint must not permit a policy that contradicts it.

## 11. Boundaries

### Always

- Run `pnpm verify` before declaring the module done.
- Keep `import.meta.env` in `src/shared/config/env.ts`.
- Keep Firebase imports in `src/shared/lib/firebase`.
- Keep UI text Spanish and code/docs English.
- Use semantic HTML, labels, visible focus and mobile-first styles.
- Update the spec and `docs/specs/README.md` when a contract changes.
- Keep `pnpm-lock.yaml` and `.env.example` tracked; keep `.env.local` and secrets untracked.

### Ask first

- Adding, removing or upgrading a dependency outside the approved list.
- Changing the route map, feature graph, layer boundaries or public APIs.
- Changing Firestore rules or indexes, even the baseline.
- Configuring CI/CD, deployment, Firebase projects or hosting.
- Adding any React effect and its registry entry.
- Committing, pushing or opening a pull request.

### Never

- Add auth, composition or setlist behavior to this module.
- Import the Firebase SDK outside `src/shared/lib/firebase`.
- Read `import.meta.env` outside `src/shared/config/env.ts`.
- Commit `.env.local`, service credentials or secrets.
- Use `any`, `dangerouslySetInnerHTML` or `console.log`.
- Disable lint or TypeScript rules, delete failing tests or skip them.
- Edit `pnpm-lock.yaml` manually or commit `dist/`.
- Run `firebase deploy`.

## 12. Success criteria

1. A fresh clone on Node 24 runs `corepack enable && pnpm install`, generates `.env.local`, and starts `pnpm dev`.
2. `/` renders the Spanish placeholder shell and an unknown path renders the Spanish 404. The console has no errors.
3. `pnpm build` and `pnpm preview` work with the generated demo environment.
4. `pnpm emulators` starts Auth 9099, Firestore 8080 and UI 4000. `pnpm test:rules` passes against the Firestore emulator.
5. `pnpm verify` passes from a fresh checkout without emulators, network access or a real Firebase project.
6. `pnpm check:arch` reports zero violations on the scaffold and fails with the documented code for each fixture.
7. The only Firebase imports are under `src/shared/lib/firebase`; the only `import.meta.env` read is in `src/shared/config/env.ts`. The architecture checker proves both; ESLint covers layer direction.
8. ESLint rejects an intentional `any`, `console.log` and `dangerouslySetInnerHTML`; `pnpm format:check` passes.
9. No `src/features` implementation, domain type, music dependency or React effect exists.
10. `README.md` documents setup, commands, emulators, environment and the architecture gate well enough for a new developer to run the project.

## 13. Out of scope (deferred)

- `002-auth`: Google and email/password authentication, session store, guards, password reset and Spanish auth errors.
- `003-compositions`: ChordPro model, parser, transposition, chord diagrams, tags, search and composition CRUD.
- `004-setlists`: setlist CRUD, ordering, composition resolution and deletion reconciliation.
- Domain Firestore rules and indexes.
- Deployment, hosting, CI/CD and real Firebase projects.
- PWA/offline, i18n, dark mode, analytics and hosted error reporting.
- E2E tests, Storybook, visual regression and coverage thresholds.
- Data import/export, printing, PDF, public sharing and collaboration.
- Any React effect.

## 14. Risks and mitigations

| Risk                                                                       | Mitigation                                                                                                     |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| TypeScript or another target major is incompatible with a required tool.   | Prove the toolchain with `pnpm verify` early. If blocked, stop and ask before downgrading or disabling checks. |
| Emulator rules tests need Java and can fail on a machine without it.       | Document Java 11+ in `README.md`; keep `test:rules` out of `pnpm verify`.                                      |
| The generated `.env.local` is mistaken for a secret or used in production. | Mark it as public demo config in the spec and README; deployment is out of scope.                              |
| The architecture checker and ESLint boundaries drift.                      | The script is authoritative; fixtures cover every code; ESLint is adjusted to match.                           |
| The shadcn CLI adds unused components or dependencies.                     | Add only the primitives used in each phase; review the diff and dependency list.                               |

## 15. Open questions

None for V1.
