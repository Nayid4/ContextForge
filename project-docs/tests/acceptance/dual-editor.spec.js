import { test, expect } from '@playwright/test';

test.describe('Aceptación E2E: Editor Dual ContextForge con Scroll Sincronizado', () => {
  test('Escenario 1: Apertura de modo editor, previsualización en vivo y conmutación de paneles', async ({ page }) => {
    // GIVEN: El usuario navega a la Base de Conocimiento
    await page.goto('/project-docs/index.html');
    await page.locator('button[data-tab="knowledge"]').click();

    // WHEN: Pulsa editar en vivo sobre el documento destacado
    const editBtn = page.locator('button[data-action="open-article-edit"]').first();
    await expect(editBtn).toBeVisible();
    await editBtn.click();

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
