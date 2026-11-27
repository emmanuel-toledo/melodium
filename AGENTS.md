# Melodium — AGENTS.md

## Project overview

Melodium is a web application to centralize musical compositions (chord sheets) for different instruments. The first stage focuses on guitar chords. It is built with React + Vite, uses Firebase Firestore as database, and Google-only authentication. It is containerized with Docker and deployed on Netlify.

## Stack

- **Frontend:** React 19 + Vite 8 + TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui (Radix-based)
- **State/Data:** Zustand, TanStack Query, React Hook Form + Zod
- **Auth/DB:** Firebase (Firestore + Google Auth)
- **Toasts:** Sonner
- **Routing:** React Router
- **Package manager:** pnpm
- **Containerization:** Docker + Docker Compose
- **Deploy:** Netlify

## Repository layout

```
melodium/
├── app/              # React application (Vite)
├── docker/           # Dockerfiles (app dev server, utility node)
├── docs/             # Constitution and project docs
├── specs/            # Feature specifications
├── .agents/skills/   # Agent skills (project-level)
├── compose.yml       # Run app via `docker compose up`
├── AGENTS.md         # This file
└── skills-lock.json  # Skills lock
```

Layers inside `app/src` (feature-based):
`app → features → shared` (see `react-architecture` skill).

## Development commands

Local (without Docker):
- `cd app && pnpm install`
- `cd app && pnpm dev` (http://localhost:5173)

With Docker:
- `docker compose up` (app available at http://localhost:80)
- `docker compose run --rm utility pnpm install` (install deps in container)
- `docker compose exec utility pnpm <cmd>` (run arbitrary node/pnpm commands)

Typecheck / lint:
- `cd app && pnpm tsc -b`
- `cd app && pnpm lint` (oxlint)

## Architecture and conventions

- Feature-based modules under `app/src/features/<feature>/`; only the root `index.ts` is public.
- Shared code under `app/src/shared`; promotion requires a gate (see `react-shared`).
- No cross-feature imports by default.
- Conventional Commits, Git Flow, branch naming, PR template (see `react-conventions` skill).
- Effects (`useEffect`) prohibited by default; require explicit approval (see `react-effects`).

## Agent skills to load

Before structural changes: `react-architecture`.
Before adding a feature: `react-feature`.
Before touching shared: `react-shared`.
Before adding a dependency: `react-stack`.
Before adding a route: `react-routing`.
Before adding a form: `react-forms`.
Before adding an API call/query: `react-data`.
Before UI changes: `react-a11y`, `apple-design`, `frontend-design`.
For performance: `react-performance`.
For tests: `react-testing`, `vitest`, `webapp-testing`.
For Firebase: `firebase-basics`, `firebase-auth-basics`, `firebase-security-rules-auditor`.
For Docker: `multi-stage-dockerfile` (external).
For code review: `code-review`.

## Notes

- Port binding: host port 80 -> container port 5173 (Vite dev server).
- Firebase config (VITE_FIREBASE_*) must be provided via environment; never commit secrets.
- `.env` is gitignored; provide your own.