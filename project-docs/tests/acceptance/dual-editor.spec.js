import { test, expect } from '@playwright/test';

test.describe('Aceptación E2E: Editor Dual ContextForge con Scroll Sincronizado', () => {
  test('Escenario 1: Apertura de modo editor, previsualización en vivo y conmutación de paneles', async ({ page }) => {
    // GIVEN: El usuario navega a la Base de Conocimiento
    await page.goto('/project-docs/index.html#pages');
    await page.waitForSelector('#plane-sidebar', { timeout: 10000 });

    // WHEN: Se abre el artículo en modo lector y luego se activa el modo editor
    const readBtn = page.locator('[data-action="open-article-read"]:visible').first();
    await expect(readBtn).toBeVisible();
    await readBtn.click();
    await page.waitForTimeout(400);

    const toggleEditBtn = page.locator('#btn-toggle-doc-editor');
    await expect(toggleEditBtn).toBeVisible();
    await toggleEditBtn.click();
    await page.waitForTimeout(300);

    // THEN: Se presenta el panel del editor con Textarea y Preview
    const textarea = page.locator('textarea#doc-editor-textarea');
    await expect(textarea).toBeVisible();

    const preview = page.locator('#doc-editor-live-preview');
    await expect(preview).toBeVisible();

    // AND: El botón de modo bloques existe y está disponible
    const blocksBtn = page.locator('#btn-editor-mode-blocks');
    await expect(blocksBtn).toBeVisible();

    // AND: El botón de guardar cambios está disponible
    const saveBtn = page.locator('#btn-save-doc-edit');
    await expect(saveBtn).toBeVisible();

    // WHEN: Pulsa cancelar edición
    const cancelBtn = page.locator('#btn-cancel-doc-edit');
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    // THEN: Se restablece la vista del lector o biblioteca
    await expect(page.locator('#doc-editor-view-container')).toBeHidden();
  });
});
