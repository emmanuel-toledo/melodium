# Tasks 001: Platform — V1

Status: Approved
Version: 1.0
Last updated: 2026-11-18
Module id: `platform`
Spec: [spec.md](./spec.md) — Approved
Plan: [plan.md](./plan.md) — Approved

## How to use this list

- Do not start implementation until this plan and this task list are approved.
- Work in order. `P11`–`P13` are independent of each other; `P15`–`P16` are an independent lane.
- Complete one task at a time, update its checkbox, and run its verification before moving on.
- Once `pnpm check:arch` exists, run `pnpm verify` after every task. It is the gate.
- Do not add work outside this list. If a task reveals a spec gap, stop and update the spec, plan and tasks first.
- Do not add, remove or upgrade a dependency outside the approved list.
- Do not write a React effect. `docs/decisions/effects.md` stays empty.
- Do not commit, push, deploy or create a Firebase project without explicit approval.
- If a target major is incompatible, stop and ask. Do not downgrade or disable a check.
- Fixture files under `scripts/fixtures/architecture/` are test data. They are excluded from tsconfig, ESLint and the default Vitest run.

## Phase A — Toolchain and quality gates

### P01 — Bootstrap repository and install approved dependencies

- [x] **P01 — Bootstrap repository and install approved dependencies**
  - Goal: A new checkout can install the pinned toolchain, generate its local demo environment and expose every command in spec §4.
  - Depends on: none.
  - Acceptance:
    - Preflight reports Node 24.x, pnpm 10.19.0 and Java 11+ (Java may be reported for later rules tests).
    - `package.json` is ESM, declares `engines.node`, `packageManager: pnpm@10.19.0`, `postinstall`, `setup` and every script in spec §4.
    - Only the dependencies listed in spec §3 are installed. No `chordsheetjs`, `react-hook-form`, `svguitar` or chords database.
    - `.env.example` contains exactly the documented demo values and `VITE_USE_FIREBASE_EMULATORS=true`.
    - `scripts/ensure-env.mjs` creates `.env.local` only when missing, is idempotent, never overwrites and does not print with `console.log`.
    - `.env.local` is ignored; `.env.example` is not ignored.
    - `pnpm install --frozen-lockfile` succeeds. If pnpm blocks dependency build scripts, only the required packages (for example `esbuild`) are approved through `pnpm.onlyBuiltDependencies`.
    - `docs/specs/README.md` moves `001` to `Implementing` when work starts.
  - Verify:
    ```bash
    node -v
    corepack enable
    pnpm -v
    java -version
    pnpm install
    test -f .env.local
    rm .env.local
    pnpm env:setup
    test -f .env.local
    pnpm env:setup
    git check-ignore -v .env.local
    pnpm install --frozen-lockfile
    ```
    `rm .env.local` is acceptable only before any local override exists. The second `pnpm env:setup` proves idempotency.
  - Files: `.nvmrc`, `.gitignore`, `.env.example`, `scripts/ensure-env.mjs`, `package.json`, `pnpm-lock.yaml` (generated), `docs/specs/README.md`.
  - Notes: Do not run `pnpm dev` or `pnpm verify` yet; their configs do not exist.

### P02 — Vite, React, strict TypeScript and Tailwind skeleton

- [x] **P02 — Vite, React, strict TypeScript and Tailwind skeleton**
  - Goal: A buildable, typechecked, styled walking skeleton with the `@/` alias.
  - Depends on: `P01`.
  - Acceptance:
    - `tsconfig.json` is strict, defines the `@/*` alias, includes `src`, `tests` and the Vite/Vitest configs, and excludes `dist`, `node_modules` and `scripts/fixtures/**`.
    - `vite.config.ts` registers React and Tailwind, resolves `@` to `src`, and serves on port 5173.
    - `index.html` has `lang="es"`, the title `Melodium` and the root element.
    - `src/app/main.tsx` mounts React in `StrictMode`, imports the global stylesheet and renders a temporary placeholder.
    - `src/app/styles/globals.css` imports Tailwind.
    - `src/features/.gitkeep` exists so the empty feature directory is visible to tools.
    - `pnpm typecheck` and `pnpm build` pass; `pnpm dev` renders the placeholder.
  - Verify:
    ```bash
    pnpm typecheck
    pnpm build
    pnpm dev
    ```
    Open `http://localhost:5173`, confirm the placeholder and stop the server.
  - Files: `tsconfig.json`, `vite.config.ts`, `index.html`, `src/app/main.tsx`, `src/app/styles/globals.css`, `src/features/.gitkeep`.
  - Notes: The temporary placeholder is replaced by the shell in `P14`.

### P03 — Vitest + React Testing Library harness and shared `cn`

- [x] **P03 — Vitest + React Testing Library harness and shared `cn`**
  - Goal: A working jsdom test harness and the first shared utility, with a real test.
  - Depends on: `P02`.
  - Acceptance:
    - Vitest uses jsdom, `tests/setup.ts`, and the shared Vite alias.
    - The default config includes `src/**/*.test.{ts,tsx}` and `scripts/**/*.test.mjs`, and excludes `tests/rules/**`, `scripts/fixtures/**`, `node_modules` and `dist`.
    - `tests/setup.ts` imports `@testing-library/jest-dom/vitest` and registers RTL cleanup.
    - `src/shared/lib/utils.ts` exports `cn` using `clsx` and `tailwind-merge`.
    - `src/shared/lib/utils.test.ts` proves class merging and that the jsdom environment is present.
    - `pnpm test` passes; `pnpm test:watch` starts and can be stopped.
  - Verify:
    ```bash
    pnpm test
    pnpm test:watch
    ```
  - Files: `vite.config.ts` (test block), `tests/setup.ts`, `src/shared/lib/utils.ts`, `src/shared/lib/utils.test.ts`.

### P04 — ESLint, Prettier and import boundaries

- [x] **P04 — ESLint, Prettier and import boundaries**
  - Goal: Enforce style, safety and layer rules before product code is written.
  - Depends on: `P03`.
  - Acceptance:
    - ESLint flat config uses `@eslint/js` recommended, type-checked `typescript-eslint`, React hooks, `eslint-plugin-boundaries` and `eslint-config-prettier` last.
    - `eslint-import-resolver-typescript` resolves the `@/` alias through `settings['import/resolver']`.
    - Boundaries use the v7 `boundaries/dependencies` rule and model `app`, `feature` and `shared`: `shared` cannot import `app` or features; a feature cannot import `app`; same-feature imports are allowed.
    - ESLint enforces layer direction, not the feature graph; the architecture checker owns the graph.
    - Scoped restrictions keep `@/shared/lib/firebase` out of `src/app` and non-`api/` feature files, and keep `src/app/config` free of features and Firebase.
    - `@typescript-eslint/no-explicit-any` is an error; `no-console` allows only `warn` and `error`; `dangerouslySetInnerHTML` is rejected.
    - The config ignores `dist`, `node_modules`, `.husky/_`, `coverage`, `.firebase` and `scripts/fixtures/**`.
    - Prettier uses single quotes, trailing commas, 100 columns and LF. `.prettierignore` excludes generated and vendor paths, including `pnpm-lock.yaml`.
    - `pnpm lint` and `pnpm format:check` pass.
    - Temporary probes with `any`, `console.log` and `dangerouslySetInnerHTML` fail lint and are removed.
  - Verify:
    ```bash
    pnpm lint
    pnpm format:check

    printf '%s\n' 'export function Probe() {' '  const value: any = 1;' '  console.log(value);' '  return <div dangerouslySetInnerHTML={{ __html: "x" }} />;' '}' > src/shared/lib/lint-probe.tsx
    pnpm lint   # must fail
    rm src/shared/lib/lint-probe.tsx
    pnpm lint   # must pass again
    ```
  - Files: `eslint.config.js`, `.prettierrc.json`, `.prettierignore`.
  - Notes: Do not disable a rule or add an `eslint-disable` to make a step pass.

### P05 — Husky and lint-staged

- [x] **P05 — Husky and lint-staged**
  - Goal: A pre-commit hook that formats and fixes staged files, with `pnpm verify` still the real gate.
  - Depends on: `P04`.
  - Acceptance:
    - `package.json` has `"prepare": "husky"` and the lint-staged configuration.
    - Lint-staged runs ESLint `--fix` and Prettier on staged code, and Prettier on staged data/docs.
    - `.husky/pre-commit` is executable and runs only `pnpm exec lint-staged`; it does not run tests.
    - A staged temporary file is formatted/fixed by lint-staged; the file is removed and unstaged afterward.
    - No commit is created.
  - Verify:
    ```bash
    pnpm exec husky
    test -x .husky/pre-commit
    grep -q 'lint-staged' .husky/pre-commit

    printf '%s\n' 'export const probe = {a:1,b:2}' > src/shared/lib/lint-staged-probe.ts
    git add src/shared/lib/lint-staged-probe.ts
    pnpm exec lint-staged
    git rm --cached src/shared/lib/lint-staged-probe.ts
    rm src/shared/lib/lint-staged-probe.ts
    ```
  - Files: `package.json`, `.husky/pre-commit`.

## Phase B — Architecture enforcement

### P06 — Architecture checker core and CLI

- [x] **P06 — Architecture checker core and CLI**
  - Goal: A standalone checker that discovers source, parses imports with the TypeScript compiler API, reports violations and exits correctly.
  - Depends on: `P03`, `P04`.
  - Acceptance:
    - `scripts/architecture.config.mjs` defines layers (`app`, `features`, `shared`), the `@` alias, the feature graph, the effects registry, the env file and the Firebase directory.
    - `scripts/check-architecture.mjs` discovers `.ts` and `.tsx` under `src`, parses static imports, re-exports, type-only imports and static dynamic imports, and resolves relative paths plus the `@/` alias.
    - `runChecks({ rootDir, config })` is exported, read-only, and importing the module does not run the CLI.
    - The CLI prints `file:line:column`, an error code and a short explanation; exits 1 on violations and 0 when clean; never rewrites code.
    - The valid fixture produces zero violations through `runChecks`.
    - `scripts/check-architecture.test.mjs` uses the Node environment and imports `runChecks` instead of spawning a process.
    - `pnpm check:arch` returns 0 on the current scaffold.
  - Verify:
    ```bash
    pnpm exec vitest run scripts/check-architecture.test.mjs
    pnpm check:arch
    pnpm verify
    ```
  - Files: `scripts/architecture.config.mjs`, `scripts/check-architecture.mjs`, `scripts/check-architecture.test.mjs`, `scripts/fixtures/architecture/valid/**`.
  - Notes: No regular expressions for import discovery or resolution. No checks are added yet; `P07`–`P10` add them.

### P07 — Architecture checks `ARCH001` and `ARCH002`

- [x] **P07 — Architecture checks `ARCH001` and `ARCH002`**
  - Goal: Enforce layer direction and the single public entry point for each feature.
  - Depends on: `P06`.
  - Acceptance:
    - `ARCH001_LAYER_DIRECTION` reports `shared -> app`, `shared -> feature` and `feature -> app`.
    - `ARCH002_FEATURE_DEEP_IMPORT` reports cross-feature or app imports that are not exactly `@/features/<feature>`, including subpaths, `/index`, relative paths crossing features and internal imports.
    - Same-feature relative imports are allowed. The exact public alias is allowed.
    - Fixtures cover both codes, including a feature deep import and a relative cross-feature import.
    - Tests assert code, relative file and at least one line/column.
    - `pnpm check:arch` stays clean on the real scaffold.
  - Verify:
    ```bash
    pnpm exec vitest run scripts/check-architecture.test.mjs
    pnpm check:arch
    pnpm verify
    ```
  - Files: `scripts/check-architecture.mjs`, `scripts/check-architecture.test.mjs`, `scripts/fixtures/architecture/arch001/**`, `scripts/fixtures/architecture/arch002/**`.

### P08 — Architecture checks `ARCH003` and `ARCH004`

- [x] **P08 — Architecture checks `ARCH003` and `ARCH004`**
  - Goal: Enforce the approved feature graph and reject import cycles, including type-only edges.
  - Depends on: `P07`.
  - Acceptance:
    - `ARCH003_FEATURE_GRAPH` allows only `auth -> none`, `compositions -> auth`, `setlists -> auth, compositions`; app may import any feature.
    - A feature missing from the configured graph fails closed under `ARCH003`.
    - `ARCH004_CYCLE` detects file cycles and feature cycles, includes type-only and dynamic imports, and reports a cycle once with its chain.
    - Fixtures cover a disallowed feature edge, a type-only file cycle and a feature cycle.
    - The valid fixture gains an allowed `compositions -> auth` edge and still passes.
    - `pnpm check:arch` stays clean on the real scaffold.
  - Verify:
    ```bash
    pnpm exec vitest run scripts/check-architecture.test.mjs
    pnpm check:arch
    pnpm verify
    ```
  - Files: `scripts/check-architecture.mjs`, `scripts/check-architecture.test.mjs`, `scripts/fixtures/architecture/valid/**`, `scripts/fixtures/architecture/arch003/**`, `scripts/fixtures/architecture/arch004/**`.

### P09 — Architecture checks `ARCH005`–`ARCH007`

- [x] **P09 — Architecture checks `ARCH005`, `ARCH006` and `ARCH007`**
  - Goal: Confine the Firebase SDK, confine `import.meta.env`, and forbid internal feature barrels.
  - Depends on: `P08`.
  - Acceptance:
    - `ARCH005_FIREBASE_BOUNDARY` allows `firebase`, `firebase/*` and `@firebase/*` only under `src/shared/lib/firebase`.
    - `ARCH006_ENV_BOUNDARY` allows `import.meta.env` only in `src/shared/config/env.ts`, including property and string element access.
    - `ARCH007_INTERNAL_BARREL` rejects `index.ts` below a feature root and allows only `src/features/<feature>/index.ts`.
    - Fixtures cover each code; the valid fixture proves the allowed facade and env locations.
    - `pnpm check:arch` stays clean on the real scaffold.
  - Verify:
    ```bash
    pnpm exec vitest run scripts/check-architecture.test.mjs
    pnpm check:arch
    pnpm verify
    ```
  - Files: `scripts/check-architecture.mjs`, `scripts/check-architecture.test.mjs`, `scripts/fixtures/architecture/valid/**`, `scripts/fixtures/architecture/arch005/**`, `scripts/fixtures/architecture/arch006/**`, `scripts/fixtures/architecture/arch007/**`.

### P10 — Architecture checks `ARCH008` and `ARCH009`

- [x] **P10 — Architecture checks `ARCH008` and `ARCH009`**
  - Goal: Enforce the effect approval policy and require a public root for every feature.
  - Depends on: `P09`.
  - Acceptance:
    - `ARCH008_EFFECT_APPROVAL` detects direct, aliased and `React`-namespace calls to `useEffect`, `useLayoutEffect` and `useInsertionEffect`.
    - An effect call requires an inline `// effect: EFF-XXX` marker and a matching row in `docs/decisions/effects.md`.
    - The checker also reports a stale row (no matching effect), an unknown ID, a file/hook mismatch and a missing test file under `ARCH008`, as required by `docs/decisions/effects.md`.
    - `ARCH009_FEATURE_ROOT` requires a root `index.ts` for every non-dot directory under `src/features`; `.gitkeep` is ignored and an empty directory passes.
    - Fixtures cover an unapproved effect, a marked effect without a row, a fixture-only approved effect with its test file, a stale row and a feature without a root index.
    - The real `docs/decisions/effects.md` remains empty and `pnpm check:arch` stays clean.
  - Verify:
    ```bash
    pnpm exec vitest run scripts/check-architecture.test.mjs
    pnpm check:arch
    pnpm verify
    ```
  - Files: `scripts/check-architecture.mjs`, `scripts/check-architecture.test.mjs`, `scripts/fixtures/architecture/arch008/**`, `scripts/fixtures/architecture/arch009/**`.

## Phase C — Shared infrastructure

### P11 — shadcn/ui `button` and `card`

- [x] **P11 — shadcn/ui `button` and `card`**
  - Goal: The two UI primitives the shell uses, with the project aliases and theme tokens.
  - Depends on: `P04`, `P10`.
  - Acceptance:
    - `components.json` maps components, UI, utils, lib and hooks to the paths in spec §8.
    - `src/shared/components/ui/button.tsx` supports variants and `asChild` through `@radix-ui/react-slot`.
    - `src/shared/components/ui/card.tsx` provides the compound card primitives used by the shell.
    - Both use `cn` from `@/shared/lib/utils` and the theme variables in `src/app/styles/globals.css`.
    - No other primitive, dependency, dark-mode toggle or speculative barrel is added.
    - `pnpm verify` passes.
  - Verify:
    ```bash
    pnpm verify
    ```
  - Files: `components.json`, `src/shared/components/ui/button.tsx`, `src/shared/components/ui/card.tsx`, `src/app/styles/globals.css`.
  - Notes: Review any shadcn CLI diff; do not let it add packages outside the approved list.

### P12 — Validated environment module

- [x] **P12 — Validated environment module**
  - Goal: One fail-fast, tested source of Firebase configuration and the emulator flag.
  - Depends on: `P04`, `P10`.
  - Acceptance:
    - `src/shared/config/env.ts` is the only module that reads `import.meta.env`.
    - It exports a pure `parseEnv(raw)`, a validated `env`, `firebaseConfig` and `useEmulators`.
    - Zod rejects missing, empty or invalid values. The error lists the offending variables and points to `.env.example` and `pnpm env:setup`.
    - `VITE_USE_FIREBASE_EMULATORS` accepts only `true` or `false`.
    - The local `FirebaseConfig` type does not import Firebase types.
    - Tests pass explicit raw objects and never read `import.meta.env` themselves.
    - `pnpm verify` passes.
  - Verify:
    ```bash
    pnpm exec vitest run src/shared/config/env.test.ts
    pnpm verify
    ```
  - Files: `src/shared/config/env.ts`, `src/shared/config/env.test.ts`.

### P13 — Firebase client facade

- [x] **P13 — Firebase client facade**
  - Goal: The only Firebase SDK entry point, with emulator wiring that is safe across HMR and testable without network.
  - Depends on: `P04`, `P10`.
  - Acceptance:
    - `src/shared/lib/firebase` contains `app.ts`, `auth.ts`, `firestore.ts` and `index.ts`.
    - The app initializes once; a second import or HMR reload reuses the existing app.
    - Auth connects to `127.0.0.1:9099` and Firestore to `127.0.0.1:8080` only when `useEmulators` is true, without duplicate connection warnings.
    - The curated exports and type aliases match spec §7 exactly, including `FirebaseUser` and `Unsubscribe`.
    - No feature or app module imports the SDK directly.
    - Tests mock `firebase/*` and `@/shared/config/env`, assert connection and non-connection, and assert the initialize guard.
    - `pnpm verify` passes.
  - Verify:
    ```bash
    pnpm exec vitest run src/shared/lib/firebase
    pnpm verify
    ```
  - Files: `src/shared/lib/firebase/app.ts`, `src/shared/lib/firebase/auth.ts`, `src/shared/lib/firebase/firestore.ts`, `src/shared/lib/firebase/index.ts`, `src/shared/lib/firebase/index.test.ts`.

## Phase D — Application shell and Firebase local stack

### P14 — Application shell, router and shell tests

- [x] **P14 — Application shell, router and shell tests**
  - Goal: The Spanish shell, the `/` placeholder, the `*` 404 and a route-level error boundary.
  - Depends on: `P10`, `P11`.
  - Acceptance:
    - `src/app/config/app.ts` exports `APP_NAME`; it imports neither features nor Firebase.
    - The root layout has a skip link to `#main`, a semantic header with the Melodium brand, `<main id="main">` with the outlet, and `<Toaster />` from sonner.
    - `src/app/routes/router.tsx` exports the route objects and the browser router. Only `/` and `*` are implemented.
    - The home placeholder and the 404 page are in Spanish and use the shadcn primitives.
    - The root route has an error boundary with a Spanish message and a recovery action.
    - `src/app/main.tsx` renders the router inside `StrictMode`.
    - There are no navigation links to routes that do not exist yet and no React effects.
    - Tests render the route objects with `createMemoryRouter` and assert the Spanish home and 404 content.
    - `pnpm verify` passes. Manual check at 320 px, keyboard tab to the skip link, visible focus, no console errors.
  - Verify:
    ```bash
    pnpm verify
    pnpm dev
    ```
    Visit `/` and an unknown path; check both viewports and the keyboard path; stop the server.
  - Files: `src/app/config/app.ts`, `src/app/layouts/root-layout.tsx`, `src/app/routes/router.tsx`, `src/app/routes/home-page.tsx`, `src/app/routes/not-found-page.tsx`, `src/app/routes/router.test.tsx`, `src/app/main.tsx`, `public/favicon.svg`.
  - Notes: If sonner needs a browser API missing in jsdom, mock `<Toaster />` in the shell test; do not add a global polyfill.

### P15 — Firebase emulators and deny-all baseline rules

- [x] **P15 — Firebase emulators and deny-all baseline rules**
  - Goal: A local-only Firebase project configuration with the final baseline security posture.
  - Depends on: `P01`, `P04`.
  - Acceptance:
    - `firebase.json` configures Firestore rules/indexes and the emulators: Auth 9099, Firestore 8080, UI 4000 enabled, `singleProjectMode: true`.
    - `.firebaserc` uses `demo-melodium`.
    - `firestore.rules` is the deny-all rule from spec §7.
    - `firestore.indexes.json` has empty `indexes` and `fieldOverrides` arrays.
    - No domain rules, indexes or real project are added.
    - `pnpm emulators` starts all three emulators and the UI.
  - Verify:
    ```bash
    pnpm exec firebase --version
    pnpm exec firebase emulators:exec --only firestore --project demo-melodium "node -e \"process.exit(0)\""
    pnpm emulators
    ```
    Open the Emulator UI on port 4000, confirm Auth 9099 and Firestore 8080, then stop.
  - Files: `firebase.json`, `.firebaserc`, `firestore.rules`, `firestore.indexes.json`.

### P16 — Firestore rules test harness and baseline test

- [x] **P16 — Firestore rules test harness and baseline test**
  - Goal: Prove the deny-all baseline for anonymous and authenticated users without a real project.
  - Depends on: `P15`.
  - Acceptance:
    - `vitest.rules.config.ts` uses the Node environment and includes only `tests/rules/**/*.test.ts`.
    - `tests/rules/helpers.ts` starts a test environment with the local rules and the emulator host/port, and cleans up.
    - The baseline test asserts that anonymous and authenticated reads and writes are denied for both compositions and setlists paths.
    - `pnpm test:rules` passes against the Firestore emulator.
    - The default `pnpm test` still excludes `tests/rules/**`.
    - `pnpm verify` passes without emulators.
  - Verify:
    ```bash
    pnpm test:rules
    pnpm verify
    ```
  - Files: `vitest.rules.config.ts`, `tests/rules/helpers.ts`, `tests/rules/baseline.test.ts`.
  - Notes: Requires Java 11+. The rules test is not part of `pnpm verify`.

## Phase E — Documentation and final verification

### P17 — Developer README

- [x] **P17 — Developer README**
  - Goal: A new developer can set up, run, test and understand the architecture gate without reading the specs.
  - Depends on: `P14`, `P16`.
  - Acceptance:
    - The README is technical documentation in English; UI copy remains Spanish.
    - It documents Node 24, corepack/pnpm, Java 11+ for rules tests, installation, `pnpm env:setup`, the command table from spec §4, `pnpm dev`, build/preview, lint/typecheck/tests, rules tests, `pnpm verify` and `pnpm emulators`.
    - It documents the environment table, `.env.example`, generated `.env.local` and the fact that the demo values are public and local-only.
    - It documents emulator ports 9099, 8080 and 4000.
    - It explains the `app -> features -> shared` direction, the feature graph, the Firebase/env boundaries and `pnpm check:arch`.
    - It includes troubleshooting for a missing `.env.local`, port conflicts and missing Java.
    - It contains no secrets and no deployment instructions.
    - `pnpm format:check` passes.
  - Verify:
    ```bash
    pnpm format:check
    ```
  - Files: `README.md`.

### P18 — Full verification, documentation status and handoff

- [x] **P18 — Full verification, documentation status and handoff**
  - Goal: Prove the module against spec §12 and leave the documentation in a reviewable state.
  - Depends on: `P17`.
  - Acceptance:
    - `pnpm verify` passes from the current checkout without emulators, network access or a real Firebase project.
    - `pnpm test:rules` passes against the local Firestore emulator.
    - `/` and an unknown path render in Spanish with no console errors; 320 px, keyboard and focus checks pass.
    - `pnpm preview` serves the production build.
    - `pnpm emulators` still starts Auth 9099, Firestore 8080 and UI 4000.
    - The repository has no feature implementation, domain type, music dependency or React effect.
    - `.env.local`, `dist/`, coverage and emulator artifacts are untracked.
    - `tasks.md` checkboxes are updated. `docs/specs/README.md` reflects the real state: `Implementing` until the owner accepts the result; `Shipped` only after explicit owner acceptance (implemented and verified, not deployed).
    - Any contract change is reflected in `spec.md`; any new deferred work is recorded in spec §13.
    - No commit, push, PR or deploy is performed.
    - The final summary lists commands run, results and any remaining risk.
  - Verify:
    ```bash
    pnpm format
    pnpm verify
    pnpm test:rules
    pnpm build
    pnpm preview
    pnpm dev
    pnpm emulators
    git status --short --ignored
    ```
    Stop `preview`, `dev` and the emulators after the checks.
  - Files: `docs/specs/001-platform/tasks.md`, `docs/specs/README.md`, `docs/specs/001-platform/spec.md` (only if a contract changed).

## Checkpoints

| Checkpoint           | After        | Gate                                                                       |
| -------------------- | ------------ | -------------------------------------------------------------------------- |
| `CP0` Preflight      | Before `P01` | Node 24.x, pnpm 10.19.0, Java 11+. Stop and report if missing.             |
| `CP1` Skeleton       | `P03`        | `pnpm typecheck`, `pnpm build`, `pnpm test`, `pnpm dev`.                   |
| `CP2` Gates          | `P05`        | `format:check`, `lint`, `typecheck`, `test`, `build`; hook dry-run.        |
| `CP3` Architecture   | `P10`        | `pnpm verify`; zero violations; every fixture code asserted.               |
| `CP4` Shared         | `P13`        | `pnpm verify`; env and facade tests pass.                                  |
| `CP5` Shell          | `P14`        | `pnpm verify`; Spanish home/404; 320 px and keyboard checks.               |
| `CP6` Firebase local | `P16`        | `pnpm test:rules`; emulator ports; `pnpm verify` still clean.              |
| `CP7` Final          | `P18`        | Spec success criteria 1–10; README; statuses; clean worktree expectations. |

## Definition of done

- [x] Every task `P01`–`P18` is checked.
- [x] `pnpm verify` passes.
- [x] `pnpm test:rules` passes.
- [x] Manual `/`, `*`, 320 px, keyboard and console checks pass.
- [x] Spec §12 success criteria 1–10 are met.
- [x] No auth, composition, setlist, domain type, music dependency or React effect exists in application code.
- [x] The README documents setup, commands, emulators, environment and the architecture gate.
- [x] `docs/specs/README.md` is updated.
- [x] No commit, push, PR or deploy was performed.

## Stop conditions

Stop and ask before continuing when:

- Node 24, pnpm 10.19.0 or Java 11+ is unavailable.
- A target major is incompatible with a required tool.
- A dependency outside spec §3 is needed.
- An effect seems necessary.
- A rule or TypeScript check would need to be disabled.
- A Firestore rule, index or data-model change outside the approved spec is needed.
- A commit, push, PR, deploy or real Firebase project is requested.
- The implementation needs a file or contract not covered by the spec, plan and these tasks.
