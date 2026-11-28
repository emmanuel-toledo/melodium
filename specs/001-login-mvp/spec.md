# Spec 001 — Login

**Status:** Draft
**Version:** 1.0.0

## 1. Overview & Goal
Implement Google-only authentication via Firebase. Unauthenticated users see a
login screen; authenticated users are redirected to `/` which shows a placeholder.
The login screen supports light/dark theme toggle (system default, persisted).

## 2. User Stories
- As a visitor, I see the login screen with the Melodium brand and a short
  description, so I understand what the app offers.
- As a visitor, I can sign in with my Google account.
- As a signed-in user, I am redirected to `/`.
- As a user, I can toggle light/dark theme from the login screen.

## 3. Functional Requirements
- FR-1: Route `/login` is public; all other routes require authentication.
- FR-2: Unauthenticated access to a protected route redirects to `/login`.
- FR-3: Authenticated access to `/login` redirects to `/`.
- FR-4: Login screen displays the app name "Melodium" and a creative tagline
  (Spanish): "Tu cuaderno de acordes, siempre contigo."
- FR-5: A "Continuar con Google" button triggers Firebase Google sign-in.
- FR-6: On successful sign-in, redirect to `/`.
- FR-7: On sign-in failure, show an error message (Spanish) without leaking
  details. Canceling the popup is ignored silently (no error banner).
- FR-8: A theme toggle (light/dark/system) is available globally (RootLayout).
- FR-9: Theme preference persists in `localStorage` and defaults to system.
- FR-10: Route `/` (protected) renders "Hola mundo" and a basic logout button.

## 4. Non-Functional Requirements
- Performance: login screen LCP < 2.5s.
- Accessibility: keyboard-navigable, focus-visible, ARIA labels, contrast AA,
  focus returns to trigger after popup closes.
- i18n: all user-facing text in Spanish.

## 5. UI/UX
- Split-panel card centrada, responsive (mobile-first):
  - **Panel izquierdo** (gradiente violeta, constante en ambos temas): lockup de
    marca (ícono + "Melodium" + eyebrow "CUADERNO DE ACORDES"), titular display
    ("Tu música, en un solo lugar."), subcopy, checklist de 3 beneficios con
    checks circulares y tagline FR-4 al pie.
  - **Panel derecho** (superficie neutra según tema): eyebrow "• INICIA SESIÓN",
    heading "Bienvenido a Melodium", descripción, banner de error (español),
    botón Google outlined ancho con ícono y nota de privacidad con candado.
  - Bajo `lg` los paneles se apilan (marca arriba, acceso abajo); en `lg+` se
    dividen en dos columnas (`1.05fr / 1fr`).
- Brand name prominent; tagline beneath.
- Google button with Google icon (outlined, ancho).
- Theme toggle in top-right corner (RootLayout, global).
- Loading state on the button during sign-in (button disabled).
- Error banner (Spanish) on failure.
- Decoración sutil: glow violeta detrás de la tarjeta y acordes tenues
  (`Am7`, `Fmaj7`) en el panel de marca (decorativa, `aria-hidden`).
- Design skills to apply: apple-design, frontend-design, shadcn, tailwind-design-system, break-ui, review-animations, mobile-native, ask-sonner.

## 6. Firebase Setup Checklist
- [ ] Project: `melodium-development` (already created).
- [ ] Enable Authentication → Sign-in method → Google.
- [x] Create Firestore database (test mode initially).
- [ ] Register a Web App and obtain `firebaseConfig`.
- [ ] Add `VITE_FIREBASE_*` to `app/.env` (gitignored).
- [ ] Create `app/.env.example` with placeholders `VITE_FIREBASE_*` and `VITE_USE_FIREBASE_EMULATOR`.
- [ ] Initialize Firebase in repo: `firebase init` (Firestore rules only).
- [ ] Set up Firebase Auth Emulator for E2E (local/CI).

## 7. Routing & Guards
- `/login` (public).
- `/` (protected) → "Hola mundo" + logout.
- Auth state via Firebase `onAuthStateChanged`.
- Protected route wrapper redirects unauthenticated users to `/login`.
- Redirects are declarative (no `useEffect`).

## 8. Theme Toggle
- Store preference in `localStorage` key `theme`.
- Default: `system` (respect `prefers-color-scheme`).
- Apply class on `<html>` (`light`/`dark`).
- Tailwind dark mode via `class` strategy.
- Fallback to `system` if stored value is invalid.

## 9. Acceptance Criteria
- AC-1: Visiting `/` while unauthenticated redirects to `/login`.
- AC-2: Clicking "Continuar con Google" opens Google popup and, on success,
  lands on `/`.
- AC-3: On auth error (except cancellation), an error message in Spanish is
  shown.
- AC-4: Theme toggle switches light/dark and persists after reload.
- AC-5: On reload while authenticated, `/` renders without re-login.
- AC-6: Logout button signs out, clears React Query cache, and redirects to
  `/login`.

## 10. Test Plan
- Unit (Vitest + RTL, mocked Firebase SDK): login screen renders
  brand/tagline/button; theme toggle toggles class and persists; protected route
  redirects when unauthenticated.
- E2E (Playwright, Firebase Auth Emulator): full Google sign-in flow, redirect,
  logout, theme persistence.
- Coverage ≥ 90%.

## 11. Out of Scope
- User profile, settings, chord data (future specs).
- Email/password or other providers.
- Firestore usage (this spec uses Auth only).

## 12. Implementation Notes
- Route `/` belongs to feature `home` (`features/home`), not `auth`.
- `home` does not import `auth`; logout is requested via shared
  `session.store.requestLogout()`.
- `session.store` is domain-agnostic (`isAuthenticated` + `requestLogout`);
  user data stays in `auth.store`. Promotion to shared deferred until 2+
  features need it.
- Redirects are declarative (no `useEffect`).

## 13. Edge Cases
- EC-1: Popup blocked by browser → show generic Spanish error message.
- EC-2: Network failure during sign-in → show generic Spanish error message.
- EC-3: `localStorage` theme value invalid/corrupt → fallback to `system`.
- EC-4: Sign-in cancelled by user → ignored silently (no error banner).
- EC-5: Focus returns to the "Continue with Google" button after popup closes.