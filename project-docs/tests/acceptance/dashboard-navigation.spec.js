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

    // AND: La biblioteca editorial contiene la cabecera de colección y botones de lectura
    const heroBtn = tabContent.locator('[data-action="open-article-read"]:visible').first();
    await expect(heroBtn).toBeVisible();
  });

  test('Escenario 4: Conmutación de sub-pestañas de diagramas C4 y visualización interactiva', async ({ page }) => {
    await page.goto('/project-docs/index.html');

    // Navegar a la pestaña de Arquitectura
    const archTab = page.locator('button[data-tab="architecture"]');
    await archTab.click();

    // Validar que el panel por defecto "layers" está activo
    const layersPanel = page.locator('#diagram-panel-layers');
    await expect(layersPanel).toBeVisible();

    // Conmutar a la sub-pestaña C1
    const c1TabBtn = page.locator('button[data-arch-tab="c1"]');
    await expect(c1TabBtn).toBeVisible();
    await c1TabBtn.click();

    // El panel layers debe ocultarse y el panel C1 debe mostrarse
    await expect(layersPanel).toBeHidden();
    const c1Panel = page.locator('#diagram-panel-c1');
    await expect(c1Panel).toBeVisible();

    // La tarjeta del visor Mermaid debe contener el título del diagrama y el código Mermaid
    const mermaidTarget = c1Panel.locator('.mermaid-render-target');
    await expect(mermaidTarget).toBeVisible();
    const codeAttr = await mermaidTarget.getAttribute('data-mermaid-code');
    expect(codeAttr).toContain('flowchart TD');
    expect(codeAttr).toContain('harnessSystem');

    // Conmutar a la sub-pestaña C2
    const c2TabBtn = page.locator('button[data-arch-tab="c2"]');
    await c2TabBtn.click();
    await expect(c1Panel).toBeHidden();
    const c2Panel = page.locator('#diagram-panel-c2');
    await expect(c2Panel).toBeVisible();
    const c2Target = c2Panel.locator('.mermaid-render-target');
    const c2Code = await c2Target.getAttribute('data-mermaid-code');
    expect(c2Code).toContain('HarnessContainers');
  });
});
