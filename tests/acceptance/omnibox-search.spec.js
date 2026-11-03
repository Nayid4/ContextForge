import { test, expect } from '@playwright/test';

test.describe('Aceptación E2E: Búsqueda Global Omnibox Modal (Ctrl+K)', () => {
  test('Escenario 1: Apertura modal, búsqueda reactiva de documentos y cierre con Escape', async ({ page }) => {
    // GIVEN: El usuario está en la página principal
    await page.goto('/project-docs/index.html');

    // WHEN: Pulsa el disparador del Omnibox en el header
    const omniboxBtn = page.locator('button[data-action="open-omnibox"]');
    await expect(omniboxBtn).toBeVisible();
    await omniboxBtn.click();

    // THEN: El modal se abre y el input recibe el foco
    const modal = page.locator('#omnibox-modal');
    await expect(modal).toBeVisible();

    const input = page.locator('#omnibox-input');
    await expect(input).toBeFocused();

    // WHEN: Escribe término de búsqueda "C4"
    await input.fill('C4');

    // THEN: Se presentan resultados dinámicos
    const results = page.locator('#omnibox-results');
    await expect(results).toContainText('c4-model.md');

    // WHEN: Pulsa tecla Escape
    await page.keyboard.press('Escape');

    // THEN: El modal se oculta
    await expect(modal).toBeHidden();
  });
});
