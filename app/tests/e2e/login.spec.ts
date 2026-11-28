import { expect, test, type Page } from '@playwright/test'

const TEST_EMAIL = 'melodium.test@example.com'

/**
 * Completa el sign-in de Google en el widget falso del Auth Emulator:
 * "add account" → email → "Sign in".
 */
async function signInWithGoogle(page: Page): Promise<void> {
  const popupPromise = page.waitForEvent('popup')
  await page.getByRole('button', { name: 'Continuar con Google' }).click()
  const popup = await popupPromise
  await popup.waitForLoadState()
  await popup.locator('#add-account-button').click()
  await popup.locator('#email-input').fill(TEST_EMAIL)
  await popup.locator('#sign-in').click()
  await popup.waitForEvent('close')
}

test.describe('001 Login MVP (E2E + Firebase Auth Emulator)', () => {
  test('AC-1: sin sesión, / redirige a /login', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveURL(/\/login$/)
    await expect(
      page.getByRole('heading', { level: 1, name: 'Melodium' }),
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Continuar con Google' }),
    ).toBeVisible()
  })

  test('AC-2/AC-5: sign-in con Google llega a / y la sesión persiste', async ({
    page,
  }) => {
    await page.goto('/login')
    await signInWithGoogle(page)

    // AC-2: aterriza en /
    await expect(page).toHaveURL(/\/$/)
    await expect(
      page.getByRole('heading', { name: 'Hola mundo' }),
    ).toBeVisible()

    // FR-3: /login con sesión activa redirige a /
    await page.goto('/login')
    await expect(page).toHaveURL(/\/$/)

    // AC-5: la sesión sobrevive a la recarga
    await page.reload()
    await expect(
      page.getByRole('heading', { name: 'Hola mundo' }),
    ).toBeVisible()
  })

  test('AC-6: cerrar sesión vuelve a /login', async ({ page }) => {
    await page.goto('/login')
    await signInWithGoogle(page)
    await expect(
      page.getByRole('heading', { name: 'Hola mundo' }),
    ).toBeVisible()

    await page.getByRole('button', { name: 'Cerrar sesión' }).click()

    await expect(page).toHaveURL(/\/login$/)
    await expect(
      page.getByRole('heading', { level: 1, name: 'Melodium' }),
    ).toBeVisible()
  })

  test('AC-4: el tema se aplica y persiste tras recargar', async ({ page }) => {
    await page.goto('/login')
    const toggle = page.getByRole('button', { name: /cambiar tema/i })

    // sistema → claro → oscuro
    await toggle.click()
    await toggle.click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    await page.reload()
    await expect(page.locator('html')).toHaveClass(/dark/)

    // vuelve a sistema
    await toggle.click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })

  test('la página 404 muestra el mensaje en español', async ({ page }) => {
    await page.goto('/ruta-inexistente')

    await expect(
      page.getByRole('heading', { name: 'Página no encontrada' }),
    ).toBeVisible()
  })
})
