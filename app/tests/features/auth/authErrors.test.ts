import { describe, expect, it } from 'vitest'
import {
  DEFAULT_AUTH_ERROR,
  getAuthErrorCode,
  getAuthErrorMessage,
} from '@/features/auth/utils/authErrors'

describe('authErrors', () => {
  it('FR-7: devuelve mensaje en español para códigos conocidos', () => {
    expect(getAuthErrorMessage('auth/popup-blocked')).toContain(
      'bloqueó la ventana',
    )
    expect(getAuthErrorMessage('auth/network-request-failed')).toContain(
      'conexión',
    )
    expect(getAuthErrorMessage('auth/too-many-requests')).toContain(
      'Demasiados intentos',
    )
    expect(getAuthErrorMessage('auth/unauthorized-domain')).toContain(
      'autorizado',
    )
    expect(getAuthErrorMessage('auth/operation-not-allowed')).toContain(
      'Google',
    )
    expect(getAuthErrorMessage('auth/user-disabled')).toContain('deshabilitada')
  })

  it('FR-7: usa un mensaje genérico para códigos desconocidos o ausentes', () => {
    expect(getAuthErrorMessage('auth/algototalmentenuevo')).toBe(
      DEFAULT_AUTH_ERROR,
    )
    expect(getAuthErrorMessage(undefined)).toBe(DEFAULT_AUTH_ERROR)
    expect(getAuthErrorMessage('')).toBe(DEFAULT_AUTH_ERROR)
  })

  it('EC-4: la cancelación del popup se ignora silenciosamente', () => {
    expect(getAuthErrorMessage('auth/popup-closed-by-user')).toBeNull()
    expect(getAuthErrorMessage('auth/cancelled-popup-request')).toBeNull()
  })

  it('getAuthErrorCode extrae el código de errores de Firebase', () => {
    expect(getAuthErrorCode({ code: 'auth/popup-blocked' })).toBe(
      'auth/popup-blocked',
    )
    expect(getAuthErrorCode(new Error('x'))).toBeUndefined()
    expect(getAuthErrorCode(null)).toBeUndefined()
    expect(getAuthErrorCode('texto')).toBeUndefined()
    expect(getAuthErrorCode({ code: 42 })).toBeUndefined()
  })
})
