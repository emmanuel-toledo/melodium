/** Domain view of the authenticated user (mapped from the Firebase user). */
export interface AuthUser {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
}

export interface AuthState {
  user: AuthUser | null
  /** true mientras un intento de sign-in está en curso (loading del botón). */
  loading: boolean
  /** Mensaje en español listo para mostrar; `null` si no hay error. */
  error: string | null
}
