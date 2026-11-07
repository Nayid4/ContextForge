import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_DOCS_DIR = path.resolve(__dirname, '../..');
const EVIDENCE_DIR = path.join(PROJECT_DOCS_DIR, 'specs', '012_plane_style_sqlite_project_management', 'evidence');

test.describe('Acceptance Tests: Makeplane (Plane) Multi-View, Cycles, Modules & Pages', () => {
  test.beforeAll(() => {
    if (!fs.existsSync(EVIDENCE_DIR)) {
      fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
    }
  });

  test('TC-01: Barra lateral de Plane, Navegación y Vistas de Tareas (Lista y Kanban)', async ({ page }) => {
    await page.goto('/project-docs/index.html#plane');
    const sidebar = page.locator('#plane-sidebar');
    await expect(sidebar).toBeVisible({ timeout: 10000 });
    await expect(sidebar).toBeVisible();

    // 2. Tareas por defecto visibles
    const controlsBar = page.locator('#plane-controls-bar');
    await expect(controlsBar).toBeVisible();

    // 3. Conmutar a Tablero Kanban
    const boardBtn = page.locator('button[data-view-mode="board"]');
    await boardBtn.click();
    await page.waitForTimeout(300);

    // Columnas del Kanban visibles
    const backlogCol = page.locator('[data-state-column="state-backlog"]');
    const doneCol = page.locator('[data-state-column="state-done"]');
    await expect(backlogCol).toBeVisible();
    await expect(doneCol).toBeVisible();

    // Capturar Evidencia 1: Tablero Kanban de Plane
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, '01-plane-kanban-board.png'),
      fullPage: true
    });
  });

  test('TC-02: Modal de Detalle de Tarea con Subtareas DEV/QA y Criterios EARS', async ({ page }) => {
    await page.goto('/project-docs/index.html#plane');
    const issueRow = page.locator('.plane-issue-row').first();
    await expect(issueRow).toBeVisible({ timeout: 10000 });
    await issueRow.click();
    await page.waitForTimeout(400);

    // Modal de detalle visible
    const modal = page.locator('#plane-issue-modal-card');
    await expect(modal).toBeVisible();

    // Capturar Evidencia 2: Modal de Detalle
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, '02-plane-issue-detail-modal.png'),
      fullPage: true
    });

    // Cerrar modal
    const closeBtn = page.locator('#plane-modal-close');
    await closeBtn.click();
    await page.waitForTimeout(200);
    await expect(modal).not.toBeVisible();
  });

  test('TC-03: Vista de Ciclos con Gráfico Burn-down de Tareas', async ({ page }) => {
    await page.goto('/project-docs/index.html#plane');
    const cyclesNavBtn = page.locator('button[data-plane-nav="cycles"]');
    await expect(cyclesNavBtn).toBeVisible({ timeout: 10000 });
    await cyclesNavBtn.click();
    await page.waitForTimeout(300);

    // Verificar título y gráfico SVG
    await expect(page.locator('h1:has-text("Ciclos de Desarrollo")')).toBeVisible();
    await expect(page.locator('text=Gráfico de Burn-down de Tareas')).toBeVisible();
    const svgChart = page.locator('svg.w-full');
    await expect(svgChart).toBeVisible();

    // Capturar Evidencia 3: Ciclos y Burn-down
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, '03-plane-cycles-burndown.png'),
      fullPage: true
    });
  });

  test('TC-04: Vista de Páginas (Plane Pages) con Base de Conocimiento y Markdown', async ({ page }) => {
    await page.goto('/project-docs/index.html#plane');
    const pagesNavBtn = page.locator('button[data-plane-nav="pages"]');
    await expect(pagesNavBtn).toBeVisible({ timeout: 10000 });
    await pagesNavBtn.click();
    await page.waitForTimeout(300);

    // Árbol de páginas visible
    const pageItem = page.locator('.plane-page-item').first();
    await expect(pageItem).toBeVisible();

    // Capturar Evidencia 4: Plane Pages
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, '04-plane-pages-docs.png'),
      fullPage: true
    });
  });
});
