# Plan — 001 Login MVP

## 1. Feature Graph
```
app/routes → features (auth, home)
features → shared
all layers → shared
(no cross-feature imports)
```

## 2. Modules & File Layout

```
app/src/
├── main.tsx
├── app/
│   ├── App.tsx                              # providers (QueryClient, Router) + theme init
│   └── layouts/
│       └── RootLayout.tsx                   # skip link, header+ThemeToggle, main, footer, Suspense
├── routes/
│   ├── app.router.tsx                       # composes feature routes
│   └── protected.router.tsx                 # centralizes guards
├── features/
│   ├── auth/
│   │   ├── index.ts                         # public API
│   │   ├── apis/services/
│   │   │   └── auth.service.ts              # signInWithGoogle, signOut, subscribeAuth
│   │   ├── pages/
│   │   │   └── LoginPage.tsx                # login UI
│   │   ├── hooks/
│   │   │   └── useAuth.ts                   # orchestration: service + store
│   │   ├── interfaces/
│   │   │   └── auth.interface.ts            # AuthState
│   │   ├── stores/
│   │   │   └── auth.store.ts                # Zustand: user, loading, error
│   │   ├── routes/
│   │   │   └── auth.routes.tsx              # /login (lazy)
│   │   └── utils/
│   │       └── authErrors.ts                # Firebase error code → Spanish message
│   └── home/
│       ├── index.ts                         # public API
│       ├── pages/
│       │   └── HomePage.tsx                 # "Hola mundo" + logout
│       └── routes/
│           └── home.routes.tsx              # / (lazy)
├── shared/
│   ├── config/
│   │   └── env.ts                           # only place reading import.meta.env
│   ├── apis/
│   │   └── firebase/
│   │       └── client.ts                    # Firebase app/auth/firestore singleton
│   ├── components/
│   │   ├── routes/
│   │   │   └── RequireAuth.tsx              # guard
│   │   └── ui/                              # shadcn primitives
│   └── stores/
│       ├── session.store.ts                  # { isAuthenticated, requestLogout }
│       └── theme.store.ts                   # { theme, resolved, persist }
└── (no tests under src/)

tests/
├── app/                                     # router/provider tests
├── features/
│   ├── auth/                                # LoginPage, store, service, guard tests
│   └── home/                                # HomePage tests
└── shared/                                  # theme store, session store, env, firebase client
```

Rules applied: no `providers/`, no `schemas/`, no empty folders, no internal barrels, only root `index.ts` per feature, tests under `tests/`, env only in `shared/config/env.ts`, Firebase client in `shared/apis/firebase/`, guards in `shared/components/routes/`, global stores in `shared/stores/`.

## 3. Data Model

- **Firebase Auth User** (SDK type): `uid`, `displayName`, `email`, `photoURL`. Not persisted to Firestore in this spec.
- **AuthState** (Zustand, feature): `{ user: User | null; loading: boolean; error: string | null }`.
- **SessionState** (Zustand, shared): `{ isAuthenticated: boolean; requestLogout: () => void }`.
- **ThemePreference** (localStorage key `theme`): `'light' | 'dark' | 'system'`.
- **ResolvedTheme**: `'light' | 'dark'` (derived from preference + `prefers-color-scheme`).

## 4. Decisions (with rejected alternative)

| # | Decision | Chosen | Rejected alternative | Rationale |
|---|----------|--------|----------------------|-----------|
| D1 | Auth state location | `features/auth/stores/auth.store.ts` | Shared session store | Auth user is domain-specific; shared must not know domain types. |
| D2 | Theme state location | `shared/stores/theme.store.ts` | Feature store | Theme is global UI state (react-shared). |
| D3 | Firebase client location | `shared/apis/firebase/client.ts` | Inside auth feature | Transport client is shared infra (react-data). |
| D4 | Env reading | Only `shared/config/env.ts` | Scattered `import.meta.env` | react-architecture rule. |
| D5 | Route guard location | `shared/components/routes/RequireAuth.tsx` | Inside auth feature | react-routing places guards in shared. |
| D6 | Routing files | `src/routes/app.router.tsx` + `protected.router.tsx` | Single `src/app/router.tsx` | Follows react-routing convention. |
| D7 | Google sign-in method | `signInWithPopup` | `signInWithRedirect` | Better desktop UX. |
| D8 | Error handling | Map Firebase error codes → Spanish messages | Show raw error | Better UX, no detail leakage (FR-7). |
| D9 | Test Firebase | Mocked SDK (Vitest) + Firebase Auth Emulator (E2E) | Real Firebase in CI | Faster, deterministic, no cost/flakiness. |
| D10 | Page placement | `features/<name>/pages/*` | `shared/pages` or `app` | Pages belong to owning feature. |
| D11 | Logout coupling | Shared `session.store.requestLogout()` invoked by home; auth subscribes | `home` imports `@/features/auth` | Avoids cross-feature dependency (react-architecture). |
| D12 | Auth service location | Stays in `features/auth` | Promote to `shared/apis/` | Domain-specific; fails promotion gate (react-shared). |
| D13 | Session store user data | Deferred to future promotion | Store user data now | Shared must not know domain types; promote when 2+ features need it. |
| D14 | Logout cache cleanup | `queryClient.clear()` on logout | Keep cache | Avoids data leakage between sessions (react-data). |
| D15 | Auth redirect impl | Declarative navigation (no `useEffect`) | `useEffect` redirect | `useEffect` prohibited by default (react-effects); declarative is safer. |

## 5. RF Coverage Matrix

| Requirement | Covered by |
|-------------|------------|
| FR-1 (public `/login`) | routes/app.router.tsx, RequireAuth |
| FR-2 (redirect unauth) | RequireAuth |
| FR-3 (redirect auth from /login) | LoginPage / router |
| FR-4 (brand + tagline) | features/auth/pages/LoginPage |
| FR-5 (Google button) | LoginPage + auth.service |
| FR-6 (redirect on success) | auth.service + router |
| FR-7 (error message ES) | auth.store + authErrors + LoginPage |
| FR-8 (theme toggle) | shared ThemeToggle + theme.store |
| FR-9 (persist theme) | theme.store (localStorage) |
| FR-10 (`/` + logout) | features/home/pages/HomePage + session.store |

## 6. Test Strategy

- **Unit (Vitest + RTL)** ≥ 90% coverage, under `tests/`:
  - `tests/features/auth/`: LoginPage renders brand/tagline/button; theme toggle toggles class and persists; auth.store transitions; protected route redirect.
  - `tests/features/home/`: HomePage renders "Hola mundo" and logout triggers session.requestLogout.
  - `tests/shared/`: theme.store, session.store, env validation, firebase client init.
  - `tests/app/`: router composition.
- **Integration**: auth.service with mocked Firebase SDK.
- **E2E (Playwright, Firebase Auth Emulator)**: full Google sign-in flow (emulator), redirect to `/`, logout (with `queryClient.clear()`), theme persistence across reload.
- **Gates**: typecheck + lint + tests pass before merge (Constitution §5).

## 7. Files to Create/Modify

- Create: `app/src/shared/config/env.ts`, `app/src/shared/apis/firebase/client.ts`, `app/src/shared/components/routes/RequireAuth.tsx`, `app/src/shared/stores/session.store.ts`, `app/src/shared/stores/theme.store.ts`, `app/src/features/auth/*`, `app/src/features/home/*`, `app/src/routes/app.router.tsx`, `app/src/routes/protected.router.tsx`, `app/src/app/App.tsx`, `app/src/app/layouts/RootLayout.tsx`.
- Modify: `app/src/main.tsx`.
- Config: `app/.env` (gitignored) and `app/.env.example` (placeholders `VITE_FIREBASE_*` + `VITE_USE_FIREBASE_EMULATOR`) with `VITE_FIREBASE_*`.