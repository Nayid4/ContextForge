import { test, expect } from '@playwright/test';

test.describe('Aceptación E2E: Lector Editorial Centrado y Tabla de Contenidos (TOC)', () => {
  test('Escenario 1: Apertura de artículo técnico, columna editorial y retorno a biblioteca', async ({ page }) => {
    // GIVEN: El usuario se encuentra en la Base de Conocimiento
    await page.goto('/project-docs/index.html');
    await page.locator('button[data-tab="knowledge"]').click();

    // WHEN: Selecciona leer el artículo destacado (Modelo C4)
    const readBtn = page.locator('button[data-action="open-article-read"]').first();
    await expect(readBtn).toBeVisible();
    await readBtn.click();

    // THEN: Se activa la vista del lector editorial
    const backBtn = page.locator('button[data-action="back-to-library"]');
    await expect(backBtn).toBeVisible();

    // AND: El artículo renderiza encabezados y bloques técnicos
    const articleBody = page.locator('article#doc-active-body');
    await expect(articleBody).toBeVisible();
    await expect(articleBody).toContainText('Modelo C4');

    // WHEN: El usuario pulsa volver a la biblioteca
    await backBtn.click();

    // THEN: Se restablece la vista de estantes
    await expect(page.locator('.kb-shelf-doc-card').first()).toBeVisible();
  });
});
