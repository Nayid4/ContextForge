import { test, expect } from '@playwright/test';

test.describe('Aceptación E2E: Navegación y Vistas Principales del Dashboard', () => {
  test('Escenario 1: Carga inicial del tablero y presencia de métricas KPI', async ({ page }) => {
    // GIVEN: El usuario ingresa a la aplicación
    await page.goto('/project-docs/index.html');

    // THEN: El título del documento es correcto
    await expect(page).toHaveTitle(/Tablero de Seguimiento/i);

    // AND: El encabezado principal está visible
    const headerTitle = page.locator('header h1');
    await expect(headerTitle).toBeVisible();

    // AND: Las 7 pestañas de navegación existen
    const tabButtons = page.locator('nav button[data-tab]');
    await expect(tabButtons).toHaveCount(7);
  });

  test('Escenario 2: Conmutación fluida hacia la sección de Arquitectura y Stack', async ({ page }) => {
    await page.goto('/project-docs/index.html');

    // WHEN: Se pulsa la pestaña de Arquitectura y Stack
    const archTab = page.locator('button[data-tab="architecture"]');
    await archTab.click();

    // THEN: El contenido de la pestaña se actualiza
    const tabContent = page.locator('#tab-content');
    await expect(tabContent).toBeVisible();

    // AND: La tabla técnica del stack muestra capas y tecnologías reales
    const stackTable = tabContent.locator('table');
    await expect(stackTable).toBeVisible();
    await expect(stackTable).toContainText('Node.js');
  });

  test('Escenario 3: Acceso a la Base de Conocimiento y presencia de estantes editoriales', async ({ page }) => {
    await page.goto('/project-docs/index.html');

    // WHEN: Se pulsa la pestaña de Base de Conocimiento
    const kbTab = page.locator('button[data-tab="knowledge"]');
    await kbTab.click();

    // THEN: La vista de conocimiento se activa en el contenedor
    const tabContent = page.locator('#tab-content');
    await expect(tabContent).toBeVisible();

    // AND: La biblioteca editorial contiene el encabezado soberano y tarjetas de estantes
    await expect(tabContent).toContainText('Base de Conocimiento de Ingeniería Soberana');
    const heroBtn = tabContent.locator('button[data-action="open-article-read"]').first();
    await expect(heroBtn).toBeVisible();
    const docCards = tabContent.locator('.kb-shelf-doc-card');
    await expect(docCards.first()).toBeVisible();
  });
});
