/**
 * Firebase error code → Spanish message (FR-7).
 * `getAuthErrorMessage` returns `null` for cancellations: they are ignored
 * silently (EC-4), so the UI shows no error banner.
 */

const SILENT_CODES = new Set([
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
])

const MESSAGES: Record<string, string> = {
  'auth/popup-blocked':
    'Tu navegador bloqueó la ventana de Google. Permite las ventanas emergentes e inténtalo de nuevo.',
  'auth/network-request-failed':
    'Sin conexión a internet. Revisa tu red e inténtalo de nuevo.',
  'auth/too-many-requests':
    'Demasiados intentos. Espera un momento y vuelve a intentarlo.',
  'auth/unauthorized-domain':
    'Este dominio no está autorizado para iniciar sesión.',
  'auth/operation-not-allowed':
    'El inicio de sesión con Google no está disponible. Contacta al administrador.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada.',
}

export const DEFAULT_AUTH_ERROR =
  'No se pudo iniciar sesión con Google. Inténtalo de nuevo.'

/**
 * @param code Firebase error code (e.g. `auth/popup-blocked`).
 * @returns Spanish message, or `null` when the error must be ignored.
 */
export function getAuthErrorMessage(code?: string): string | null {
  if (!code) return DEFAULT_AUTH_ERROR
  if (SILENT_CODES.has(code)) return null
  return MESSAGES[code] ?? DEFAULT_AUTH_ERROR
}

/** Extracts the Firebase error code from an unknown thrown value. */
export function getAuthErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null) return undefined
  const code = (error as { code?: unknown }).code
  return typeof code === 'string' ? code : undefined
}
