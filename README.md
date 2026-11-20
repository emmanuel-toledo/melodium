# Melodium

Melodium is a personal web library for musical compositions. The MVP focuses on guitar chord
sheets: ChordPro lyrics with chords, transposition, tags, search and ordered setlists.

It is a client-side single-page application built with Vite, React and TypeScript. There is no
custom backend: Firebase Authentication and Cloud Firestore provide identity and persistence, and
the browser talks to them directly.

## Stack

| Area            | Choice                                                       |
| --------------- | ------------------------------------------------------------ |
| Runtime         | Node 24 LTS (`.nvmrc`)                                       |
| Package manager | pnpm 10.19.0 through corepack                                |
| Build           | Vite 8                                                       |
| UI              | React 19, Tailwind CSS 4, shadcn/ui source components        |
| Language        | TypeScript 6, strict                                         |
| Routing         | React Router 8                                               |
| Validation      | Zod 4                                                        |
| Data            | Firebase 13 (Auth and Cloud Firestore)                       |
| Tests           | Vitest 5, React Testing Library, Firebase Emulator Suite     |
| Quality         | ESLint 10, Prettier 3, Husky 9, `eslint-plugin-boundaries` 7 |

TypeScript stays on 6 because `typescript-eslint` 8 does not support TypeScript 7 yet. Do not
upgrade a major version without an approved spec update.

## Requirements

- Node 24 LTS. `.nvmrc` contains `24`.
- pnpm 10.19.0 through corepack. The version is pinned in `package.json`.
- Java 11 or newer, only for Firestore rules tests and the emulators. Java is not needed for
  `pnpm install`, `pnpm dev`, `pnpm test` or `pnpm verify`.

### Corepack permissions

`corepack enable` writes shims next to the Node installation. If `/usr/local/bin` is not writable,
install the shims in a directory you own and make sure it is on `PATH`:

```bash
corepack enable --install-directory "$HOME/.local/bin"
pnpm --version
```

## Setup

```bash
corepack enable
pnpm install
pnpm dev
```

`pnpm install` runs `postinstall`, which copies `.env.example` to `.env.local` when the file is
missing. It never overwrites an existing `.env.local`. To recreate the file manually:

```bash
pnpm env:setup
```

`pnpm setup` is reserved by pnpm and must not be used.

Vite serves the application at <http://localhost:5173>.

## Environment

All variables are read once by `src/shared/config/env.ts` and validated with Zod. The application
fails fast with a list of offending variables when a value is missing or invalid.

| Variable                      | Purpose                                     | Demo value                      |
| ----------------------------- | ------------------------------------------- | ------------------------------- |
| `VITE_FIREBASE_API_KEY`       | Firebase Web API key                        | `demo-api-key`                  |
| `VITE_FIREBASE_AUTH_DOMAIN`   | Firebase Auth domain                        | `demo-melodium.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID`    | Firebase project ID                         | `demo-melodium`                 |
| `VITE_FIREBASE_APP_ID`        | Firebase Web App ID                         | `1:000000000000:web:demo`       |
| `VITE_USE_FIREBASE_EMULATORS` | Connect Auth and Firestore to the emulators | `true`                          |

`.env.example` is committed. `.env.local` is generated, git-ignored and may contain local
overrides. The demo values are public placeholders for local emulator use only; never commit
secrets or production credentials. Every `VITE_*` value is embedded in the browser bundle and is
therefore public by definition.

## Commands

| Command                           | Purpose                                                                       |
| --------------------------------- | ----------------------------------------------------------------------------- |
| `corepack enable && pnpm install` | Install the pinned toolchain. `postinstall` generates `.env.local` if needed. |
| `pnpm env:setup`                  | Recreate `.env.local` from `.env.example` when it is missing.                 |
| `pnpm dev`                        | Start Vite at `http://localhost:5173`.                                        |
| `pnpm emulators`                  | Start Auth (9099), Firestore (8080) and the Emulator UI (4000).               |
| `pnpm build`                      | Build the production bundle to `dist/`.                                       |
| `pnpm preview`                    | Serve the production build locally.                                           |
| `pnpm lint`                       | Run ESLint over the repository.                                               |
| `pnpm lint:fix`                   | Run ESLint with autofix.                                                      |
| `pnpm format`                     | Format with Prettier.                                                         |
| `pnpm format:check`               | Verify Prettier formatting.                                                   |
| `pnpm typecheck`                  | Run `tsc --noEmit`.                                                           |
| `pnpm test`                       | Run unit and component tests once.                                            |
| `pnpm test:watch`                 | Run Vitest in watch mode.                                                     |
| `pnpm test:rules`                 | Run Firestore rules tests inside `firebase emulators:exec`.                   |
| `pnpm check:arch`                 | Run the architecture checker.                                                 |
| `pnpm verify`                     | `format:check && lint && typecheck && test && check:arch && build`.           |

`pnpm verify` is the mandatory gate. It must not require emulators, network access or a real
Firebase project. `pnpm test:rules` is separate because it needs Java and a running Firestore
emulator.

## Local development with emulators

The emulator configuration uses the demo project `demo-melodium`, so no real Firebase project is
required:

```bash
pnpm emulators
pnpm dev
```

| Emulator       | Host and port    | UI                                |
| -------------- | ---------------- | --------------------------------- |
| Authentication | `127.0.0.1:9099` | <http://127.0.0.1:4000/auth>      |
| Firestore      | `127.0.0.1:8080` | <http://127.0.0.1:4000/firestore> |
| Emulator UI    | `127.0.0.1:4000` | <http://127.0.0.1:4000>           |

With `VITE_USE_FIREBASE_EMULATORS=true`, the Firebase facade connects both SDKs to these ports.
The emulator state is in memory and is discarded when the process stops.

## Authentication manual QA

Start the emulators and the dev server:

```bash
pnpm emulators
pnpm dev
```

Then exercise the auth flows at <http://localhost:5173>:

1. Register at `/register` with email, password and an optional display name. The session survives a
   reload and the header shows the user menu.
2. Sign in at `/login` with email/password and with the Google popup when Google is configured.
3. Request a password reset at `/reset-password`; the Auth emulator prints the reset link to the
   terminal. Open the link, choose a new password and sign in again.
4. Sign out from the header; the session clears and the app navigates to `/login`.
5. Visit `/login`, `/register` and `/reset-password` while authenticated; each redirects to `/`.
6. Check keyboard navigation and the 320 px layout for every auth screen; there must be no horizontal
   overflow.

`pnpm verify` does not require emulators or network access; only `pnpm test:rules` needs Java.

- Application tests live under `tests/`, mirroring `src/`: `tests/app`, `tests/shared` and
  `tests/features/<feature>`. They use Vitest, React Testing Library and jsdom. `tests/setup.ts`
  registers the DOM matchers and cleanup.
- `pnpm test` excludes `tests/firestore-rules/**` and never needs an emulator.
- Firestore rules tests live in `tests/firestore-rules/` and run with `pnpm test:rules`, which starts
  only the Firestore emulator through `firebase emulators:exec`.
- Tooling tests stay next to their script under `scripts/`.
- Critical behavior must be covered: ChordPro parsing, transposition, Zod schemas, composition and
  setlist CRUD, and ownership rules. A change is not finished while its critical tests are missing
  or failing.

## Architecture

The source tree follows one direction:

```text
app -> features -> shared
```

- `src/app` is the composition root: providers, router, layouts and pages. It may import features
  and shared code.
- `src/features` contains vertical domain slices. A feature may import `shared` and the public
  entry of an allowed feature. It must not import `app`.
- `src/shared` contains generic code only. It knows no domain and must not import `app` or
  `features`.

The approved feature graph is declared in `scripts/architecture.config.mjs`:

```text
auth         -> (none)
compositions -> auth
setlists     -> auth, compositions
```

Features are consumed only through their public entry point, `@/features/<feature>`. Deep imports,
internal barrels other than the feature root `index.ts`, and cycles are rejected.

Two hard boundaries protect infrastructure:

- The Firebase client SDK is imported only in `src/shared/lib/firebase`. UI and feature code use
  that facade; `src/app` must not import it directly.
- `import.meta.env` is read only in `src/shared/config/env.ts`.

React effects are disabled by default. An approved `useEffect`, `useLayoutEffect` or
`useInsertionEffect` needs a row in `docs/decisions/effects.md`, an inline
`// effect: EFF-NNN` marker and a test file.

`pnpm check:arch` enforces these rules with the TypeScript compiler API. ESLint and
`eslint-plugin-boundaries` apply complementary import and syntax checks. `pnpm verify` runs both.

| Code    | Check                                                     |
| ------- | --------------------------------------------------------- |
| ARCH001 | Layer direction (`app -> features -> shared`).            |
| ARCH002 | No feature deep imports; public entry points only.        |
| ARCH003 | Feature graph edges and unknown features.                 |
| ARCH004 | File and feature import cycles.                           |
| ARCH005 | Firebase SDK imports confined to the facade.              |
| ARCH006 | `import.meta.env` confined to `src/shared/config/env.ts`. |
| ARCH007 | Only a feature root `index.ts` may be a barrel.           |
| ARCH008 | Every effect has a matching approval row and test.        |
| ARCH009 | Every feature with source files has a root `index.ts`.    |

## Project structure

```text
.
├── docs/                    # constitution, specs and decision records
├── scripts/                 # environment setup and architecture checker
├── src/
│   ├── app/                 # router, layouts, pages, global styles
│   ├── features/            # domain features (auth, compositions, setlists)
│   └── shared/              # config, Firebase facade and UI primitives
├── tests/
│   ├── app/                 # application tests mirroring src/app
│   ├── shared/              # shared tests mirroring src/shared
│   ├── features/            # feature tests mirroring src/features
│   ├── firestore-rules/     # Firestore rules tests (emulator only)
│   └── setup.ts             # Vitest and Testing Library setup
├── firebase.json            # emulator ports and Firestore rules/indexes
├── firestore.rules          # deny-by-default baseline
├── public/                  # static assets such as favicon.svg
├── vitest.rules.config.ts   # Node environment for rules tests
└── vite.config.ts           # Vite, React, Tailwind and Vitest
```

## Troubleshooting

**`.env.local` is missing or invalid.** Run `pnpm env:setup` to generate it from `.env.example`.
If the file exists with local overrides, edit it instead of deleting it. The startup error lists
each invalid variable.

**A port is already in use.** Vite uses 5173, Auth 9099, Firestore 8080, the Emulator UI 4000 and
the emulator hub 4400. Find the process with `lsof -i :<port>` and stop it, then restart the
command.

**The Firestore emulator does not start.** Run `java -version`. Java 11 or newer is required for
`pnpm test:rules` and `pnpm emulators`. `pnpm verify` does not need Java.

**The rules test cannot connect.** Start from `pnpm test:rules` rather than running Vitest
directly: the command starts the emulator on port 8080 and then runs
`vitest.rules.config.ts` against it.

**`corepack enable` fails with `EACCES`.** Use
`corepack enable --install-directory "$HOME/.local/bin"` and ensure that directory is on `PATH`.

**`pnpm setup` does something unexpected.** pnpm reserves that command for its own bootstrap.
Use `pnpm env:setup`.

## Scope

Implemented in `001-platform`: scaffold, tooling, application shell, Firebase facade, emulator
configuration, architecture checker and test harnesses. Implemented in `002-auth`: Google and
email/password authentication, session state, route guards and the auth feature.

Deployment, CI, public sharing, tablature, audio, payments, offline/PWA, i18n and Cloud Functions
are out of scope for the MVP. Deployment projects are not configured in this repository.

## Documentation

- `docs/constitution.md`: non-negotiable project rules.
- `docs/specs/000-capability-map.md`: module map and dependency order.
- `docs/specs/001-platform/`: approved platform spec, plan and task checklist.
- `docs/specs/002-auth/`: approved auth spec, plan and task checklist.
- `docs/decisions/feature-structure.md`: canonical feature tree and public API rules.
- `AGENTS.md`: contributor and agent instructions.
