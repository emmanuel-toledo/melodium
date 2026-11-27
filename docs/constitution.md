# Melodium Constitution

**Version:** 1.0.0
**Last amended:** 2026-11-26

## 1. Purpose
This constitution defines the non-negotiable principles governing Melodium. It applies to all code, specs, and decisions. Amendments require explicit user approval.

## 2. Product Principles
- Musician-first: attractive, responsive, creative UI tailored to musicians.
- Theme: dual (light/dark) with system preference as default; user can override.
- Color palette: creative/vibrant, chosen by design (no fixed brand hex yet).
- Typography: modern sans for UI + a creative display face for headings; monospace for chord sheets.
- Accessibility is not optional (WCAG 2.2 baseline).
- Mobile-first responsive design.
- User-facing text is in Spanish.

## 3. Engineering Principles
- Feature-based architecture: `app → features → shared`; no cross-feature imports without an approved spec.
- Effects (`useEffect`) prohibited by default; require explicit approval.
- TypeScript strict; no `any` without justification.
- Dependencies follow the `react-stack` skill (most stable; shadcn/ui first).
- No secrets in repo; Firebase config via environment variables.

## 4. Spec Governance
- Specs live in `specs/` and are the source of intent.
- Any design or code that alters a spec must update the spec (with user approval) to stay aligned.
- A spec is "done" only when:
  1. All unit (Vitest) and E2E (Playwright) tests pass.
  2. Coverage ≥ 90%.
  3. Explicit user sign-off.
- Specs are amended, never silently ignored.

## 5. Quality Gates
- Typecheck and lint must pass before merge.
- Tests must pass before a spec is marked done.
- Code review per `react-conventions` skill.

## 6. Performance
- Target Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1.
- Bundle budgets enforced per `react-performance` skill.

## 7. Security
- No secrets committed; use env vars.
- Firestore/Storage security rules must be audited (`firebase-security-rules-auditor`) before release.
- Google-only authentication in v1.

## 8. Language Policy
- User-facing text: Spanish.
- Code, comments, commit messages, logs, docs: English.

## 9. Versioning & Amendments
- Constitution uses semver. Amendments bump the version and are recorded in the changelog.
- Only the user can approve amendments.

## Changelog
- 1.0.0 — Initial constitution.