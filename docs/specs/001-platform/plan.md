# Plan 001: Platform — V1

Status: Approved
Version: 1.0
Last updated: 2026-11-18
Module id: `platform`
Spec: [spec.md](./spec.md) — Approved
Capability map: [000-capability-map.md](../000-capability-map.md) — Approved
Runtime feature edges: none

## 1. Summary

Build the platform as a walking skeleton, then harden it in layers:

1. Install and prove the pinned toolchain.
2. Add the quality gates: Vitest, ESLint, Prettier, Husky and lint-staged.
3. Build the architecture checker incrementally, one error-code group at a time, driven by fixtures.
4. Add shared infrastructure: shadcn/ui primitives, validated environment and the Firebase facade.
5. Add the application shell and the two routes that exist in this phase.
6. Add the local Firebase stack and the deny-all rules test.
7. Document the project and run the full verification gate.

No authentication, composition, setlist, domain type, music dependency or React effect is introduced.

## 2. Constraints

- Node 24, pnpm 10.19.0 through corepack, and the target majors in spec §3 are fixed for V1.
- Only the dependencies listed in spec §3 are installed. Adding, removing or upgrading one requires approval.
- `pnpm verify` is the mandatory gate. `pnpm test:rules` is separate because it needs Java and the Firebase emulator.
- `pnpm verify` must not need the emulators, a real Firebase project or network access.
- `import.meta.env` stays in `src/shared/config/env.ts`; Firebase SDK imports stay in `src/shared/lib/firebase`.
- No `useEffect`, `useLayoutEffect` or `useInsertionEffect` is written. The effects registry stays empty.
- No commit, push, deployment, CI configuration or real Firebase project is created.
- The existing repository docs and skills remain the source of truth. The specs are not rewritten by this plan.
- A tool incompatibility is a stop condition, not a reason to downgrade a major or disable a check.

## 3. Assumptions

1. The npm registry is reachable during `P01`; nothing after that requires network access.
2. Node 24, corepack and Java 11+ are available on the development machine. If Java is missing, the rules-test task stops and asks before installing system software.
3. The target majors in spec §3 exist in the registry. If one does not, implementation stops and asks.
4. The repository has an initial commit; Husky is verified without creating a new commit.
5. Prettier may normalize existing Markdown files. If that produces broad, unrelated churn, implementation stops and asks before adding documentation to `.prettierignore`.
6. The architecture fixtures are test data. They are excluded from TypeScript, ESLint and the default Vitest run; the checker reads them only when a test passes their root explicitly.
7. pnpm 10 may block dependency build scripts. Only the packages required by the approved toolchain (for example `esbuild`) are allowlisted through `pnpm.onlyBuiltDependencies`.

## 4. Implementation strategy

### 4.1 Walking skeleton first

`P02` produces a buildable Vite + React + TypeScript + Tailwind application before any abstraction exists. `P03` adds the test harness and a tiny shared utility so `pnpm test` has a real subject. This proves the runtime and test toolchain early, when a major-version incompatibility is cheapest to discover.

### 4.2 Quality gates before product code

`P04` and `P05` install ESLint, Prettier, Husky and lint-staged before the environment, Firebase or shell code is written. Every later task is linted and formatted from its first commit-sized change. The architecture checker follows the same principle: it exists before the code it must protect.

### 4.3 Architecture checker as an incremental tool

`P06` builds the parser, resolver, reporter and CLI. `P07` through `P10` add checks in small groups, each with its own fixture tree:

- `ARCH001`–`ARCH002`: layers and public entry points.
- `ARCH003`–`ARCH004`: feature graph and cycles.
- `ARCH005`–`ARCH007`: Firebase, environment and internal barrels.
- `ARCH008`–`ARCH009`: effects and feature roots.

Each check is test-driven from a fixture. The checker uses the TypeScript compiler API for source and imports, reports `file:line:column`, and never rewrites code. It is authoritative when it disagrees with `eslint-plugin-boundaries`; ESLint is adjusted, not the other way around.

### 4.4 Shared infrastructure in any order

`P11` (shadcn/ui), `P12` (environment) and `P13` (Firebase facade) touch separate files and can run in parallel after the quality gates. `P14` needs the shadcn primitives; it does not need the Firebase facade at runtime.

### 4.5 Local Firebase stack as an independent lane

`P15` and `P16` do not overlap the application shell. They can run in parallel with `P11`–`P14` when Java is available. Rules tests remain outside `pnpm verify`.

## 5. Work breakdown

| ID    | Phase          | Outcome                                                                    | Depends on   |
| ----- | -------------- | -------------------------------------------------------------------------- | ------------ |
| `P01` | Toolchain      | Repository metadata, env bootstrap, approved dependencies and lockfile     | —            |
| `P02` | Toolchain      | Buildable Vite + React + TypeScript + Tailwind skeleton                    | `P01`        |
| `P03` | Toolchain      | Vitest + RTL harness and shared `cn` utility                               | `P02`        |
| `P04` | Quality gates  | ESLint flat config and Prettier                                            | `P03`        |
| `P05` | Quality gates  | Husky pre-commit and lint-staged                                           | `P04`        |
| `P06` | Architecture   | Checker core: discovery, TS parsing, import resolution, reporting, CLI     | `P03`, `P04` |
| `P07` | Architecture   | `ARCH001` layer direction and `ARCH002` deep imports                       | `P06`        |
| `P08` | Architecture   | `ARCH003` feature graph and `ARCH004` cycles                               | `P07`        |
| `P09` | Architecture   | `ARCH005` Firebase, `ARCH006` env and `ARCH007` internal barrels           | `P08`        |
| `P10` | Architecture   | `ARCH008` effect approvals and `ARCH009` feature roots                     | `P09`        |
| `P11` | Shared         | shadcn/ui `button` and `card` primitives                                   | `P04`, `P10` |
| `P12` | Shared         | Validated environment module and tests                                     | `P04`, `P10` |
| `P13` | Shared         | Firebase client facade and tests                                           | `P04`, `P10` |
| `P14` | Application    | Root layout, router, placeholder home, 404, error boundary and shell tests | `P10`, `P11` |
| `P15` | Firebase local | Emulator configuration, demo project and deny-all rules                    | `P01`, `P04` |
| `P16` | Firebase local | Rules test harness and deny-all baseline test                              | `P15`        |
| `P17` | Documentation  | Developer README                                                           | `P14`, `P16` |
| `P18` | Verification   | Full gate, manual checks and spec status updates                           | `P17`        |

## 6. Dependency graph

```text
P01 -> P02 -> P03 -> P04 -> P05

P03 + P04 -> P06 -> P07 -> P08 -> P09 -> P10

P10 -> P11 -> P14
P10 -> P12
P10 -> P13

P01 + P04 -> P15 -> P16

P14 + P16 -> P17 -> P18
```

`P11`, `P12` and `P13` are independent of each other. `P15` and `P16` are independent of the shell lane. `P06`–`P10` must stay sequential because they edit the same checker and test files.

## 7. Verification checkpoints

| Checkpoint           | After        | Commands                                                                      | Expected                                                                                                                  |
| -------------------- | ------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `CP0` Preflight      | Before `P01` | `node -v`, `pnpm -v`, `java -version`                                         | Node 24.x, pnpm 10.19.0, Java 11+. Report and stop if missing.                                                            |
| `CP1` Skeleton       | `P03`        | `pnpm typecheck`, `pnpm build`, `pnpm test`, `pnpm dev`                       | Typecheck and build pass; the `cn` test passes; the Vite placeholder renders.                                             |
| `CP2` Gates          | `P05`        | `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` | All pass; the pre-commit hook is wired to lint-staged.                                                                    |
| `CP3` Architecture   | `P10`        | `pnpm verify`, `pnpm check:arch`                                              | Full gate passes; the checker reports zero violations on the real scaffold and each fixture produces its documented code. |
| `CP4` Shared         | `P13`        | `pnpm verify`                                                                 | Full gate passes with env and Firebase tests.                                                                             |
| `CP5` Shell          | `P14`        | `pnpm verify`, `pnpm dev`                                                     | Home and 404 render in Spanish; no console errors; 320 px and keyboard checks pass.                                       |
| `CP6` Firebase local | `P16`        | `pnpm verify`, `pnpm test:rules`, `pnpm emulators`                            | Rules tests pass; Auth 9099, Firestore 8080 and UI 4000 start.                                                            |
| `CP7` Final          | `P18`        | `pnpm verify`, `pnpm test:rules`, `pnpm preview`                              | Spec success criteria 1–10 are met; docs and statuses are updated.                                                        |

## 8. Risks and mitigations

| Risk                                                                                                    | Impact                                         | Mitigation                                                                                                                   |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| TypeScript, ESLint 10, Vite 8, Vitest 5 or another target major is incompatible with a required plugin. | The scaffold cannot typecheck, lint or test.   | Prove the toolchain in `CP1` and `CP2`. If blocked, stop and ask before downgrading or disabling a check.                    |
| pnpm 10 blocks a dependency build script, for example `esbuild`.                                        | Vite cannot start or build.                    | Approve only the required packages with `pnpm.onlyBuiltDependencies`; never blanket-allow scripts.                           |
| `eslint-plugin-boundaries` v7 API or alias resolution differs from the expected shape.                  | Layer linting is missing or noisy.             | Follow the v7 documentation, test with a deliberate violation, and let the architecture script remain authoritative.         |
| Architecture checker scope grows beyond one session.                                                    | The platform stalls on tooling.                | Build it in four small check groups with one fixture per code; do not add undocumented checks.                               |
| Checker fixtures are linted, typechecked or executed by the default test run.                           | `pnpm verify` fails on intentional violations. | Exclude `scripts/fixtures/**` in tsconfig, ESLint and the default Vitest config. The checker test reads fixtures explicitly. |
| Firebase emulator wiring runs twice under HMR or `StrictMode`.                                          | Duplicate connection warnings or errors.       | Guard initialization and emulator connection in the facade; reset modules and assert call counts in tests.                   |
| React Router 8 or sonner behaves differently in jsdom.                                                  | Shell tests fail for environment reasons.      | Use `createMemoryRouter` with exported route objects; mock `<Toaster />` only if sonner needs a missing browser API.         |
| Java is missing.                                                                                        | `pnpm test:rules` cannot run.                  | Check in `CP0`; document Java 11+ in the README; stop and ask before installing system software.                             |
| Husky cannot be verified without a commit.                                                              | The hook is unproven.                          | Dry-run lint-staged on a staged temporary file; do not commit.                                                               |
| Prettier normalizes existing docs.                                                                      | Broad unrelated diff.                          | Run it once, review, and stop to ask before ignoring documentation.                                                          |
| `.env.local` is missing in a fresh checkout.                                                            | Env validation fails at import time.           | `postinstall` and `pnpm env:setup` generate it; tests pass explicit raw values to `parseEnv`.                                |
| A README in Spanish conflicts with the English technical-docs rule.                                     | Documentation inconsistency.                   | Write the developer README in English; keep UI copy Spanish.                                                                 |

## 9. Parallelism

- Sequential: `P01`–`P05`, because each depends on the previous configuration.
- Sequential lane: `P06`–`P10`, because they share the checker and its test file.
- Parallel lane A: `P11`, `P12`, `P13` after `P10`.
- Parallel lane B: `P15` after `P04`, then `P16`, when Java is available.
- Final integration: `P14` after `P11`, then `P17` after `P14` and `P16`, then `P18`.

## 10. Traceability to the spec

| Spec success criterion                                                                  | Covered by                 |
| --------------------------------------------------------------------------------------- | -------------------------- |
| 1. Fresh clone installs, generates `.env.local` and starts `pnpm dev`                   | `P01`, `P02`, `P18`        |
| 2. `/` placeholder and `*` 404 in Spanish, no console errors                            | `P14`, `P18`               |
| 3. `pnpm build` and `pnpm preview` work with the demo environment                       | `P02`, `P14`, `P18`        |
| 4. Emulators start; `pnpm test:rules` passes                                            | `P15`, `P16`, `P18`        |
| 5. `pnpm verify` passes without emulators, network or a real project                    | `P18`                      |
| 6. Checker reports zero on scaffold and each documented code on fixtures                | `P06`–`P10`, `P18`         |
| 7. Firebase and env imports are confined and proven                                     | `P09`, `P12`, `P13`, `P18` |
| 8. ESLint rejects `any`, `console.log` and `dangerouslySetInnerHTML`; formatting passes | `P04`, `P18`               |
| 9. No feature code, domain type, music dependency or effect                             | `P10`, `P14`, `P18`        |
| 10. README documents setup, commands, emulators, env and architecture                   | `P17`                      |

## 11. Decisions to confirm during review

1. **README language.** The developer README is written in English because `AGENTS.md` and the constitution require technical documentation in English. UI strings remain Spanish.
2. **`ARCH008` scope.** The checker validates both directions described in `docs/decisions/effects.md`: an effect needs an approval row, and an approval row needs a matching effect. Stale rows, file/hook mismatches and missing test files are reported under `ARCH008`. The spec table phrases the call direction only; this plan honors the registry contract without adding a new error code.
3. **Effect fixture approval.** The `ARCH008` fixture includes one fixture-only approved effect and its test file to prove the approval path. It is not added to the real `docs/decisions/effects.md`.
4. **`src/app/config`.** The folder contains a single `app.ts` with `APP_NAME`, used by the shell. It imports neither features nor Firebase, so the constitution rule is exercised rather than leaving an empty directory.
5. **Vitest configuration.** The default unit/component configuration lives in `vite.config.ts`. Rules tests use the separate `vitest.rules.config.ts` required by the spec.
6. **pnpm build-script allowlist.** If pnpm 10 requires it, only the minimum packages needed by the approved toolchain are added to `pnpm.onlyBuiltDependencies`; the list is recorded in `package.json`.

## 12. Out of scope

Everything in spec §13 remains out of scope. In particular, this plan does not add auth, compositions, setlists, domain schemas, domain Firestore rules or indexes, music libraries, React effects, CI, deployment or a real Firebase project.
