import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Aceptación E2E & Evidencias: Especificación Scrum y Subtareas Jira DEV/QA', () => {
  test.describe.configure({ mode: 'serial' });

  const rootDir = fs.existsSync(path.resolve(process.cwd(), 'specs')) ? process.cwd() : path.resolve(process.cwd(), '..');
  const evidenceDir = path.resolve(rootDir, 'specs/009_scrum_spec_subtasks_and_qa_evidence/evidence');

  test.beforeAll(() => {
    if (!fs.existsSync(evidenceDir)) {
      fs.mkdirSync(evidenceDir, { recursive: true });
    }
  });

  test('Escenario 1: Presencia de badges de subtareas DEV/QA en la tabla y captura de evidencia', async ({ page }) => {
    await page.goto('/project-docs/index.html');

    // Validar que la tabla de features cargue
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Validar que existan badges de subtareas DEV y QA
    const devBadges = page.locator('span:has-text("DEV")');
    await expect(devBadges.first()).toBeVisible();

    const qaBadges = page.locator('span:has-text("QA")');
    await expect(qaBadges.first()).toBeVisible();

    // Captura de evidencia 1: Tabla de features con subtareas Jira
    const screenshotPath = path.join(evidenceDir, '01-dashboard-scrum-table.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    expect(fs.existsSync(screenshotPath)).toBe(true);
  });

  test('Escenario 2: Apertura de modal con User Story Scrum, Subtareas Jira y DoD', async ({ page }) => {
    await page.goto('/project-docs/index.html');

    // Localizar la fila o botón de detalle de INT-009
    const detailBtn = page.locator('button[data-action="view-detail"][data-id="9"]').first();
    await expect(detailBtn).toBeVisible();
    await detailBtn.click();

    // Modal debe aparecer con animación
    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();

    // Validar tarjeta de User Story Scrum
    const userStoryCard = modal.locator('text=Historia de Usuario (Scrum)');
    await expect(userStoryCard).toBeVisible();

    const comoText = modal.locator('strong:has-text("Como")');
    await expect(comoText).toBeVisible();

    // Validar sección de Subtareas Jira (usar selector específico h4)
    const subtasksHeader = modal.locator('h4:has-text("Subtareas Jira")');
    await expect(subtasksHeader).toBeVisible();

    const devSubtask = modal.locator('text=INT-009-DEV');
    await expect(devSubtask).toBeVisible();

    const qaSubtask = modal.locator('text=INT-009-QA');
    await expect(qaSubtask).toBeVisible();

    // Validar checklist de Definition of Done (DoD)
    const dodHeader = modal.locator('h4:has-text("Definition of Done")');
    await expect(dodHeader).toBeVisible();

    // Captura de evidencia 2: Modal detallado con Scrum y Subtareas Jira
    const screenshotPath = path.join(evidenceDir, '02-modal-scrum-subtasks.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    expect(fs.existsSync(screenshotPath)).toBe(true);

    // Cerrar modal
    const closeBtn = modal.locator('button[data-action="close-modal"]').first();
    await closeBtn.click();
    await expect(modal).not.toBeVisible();
  });

  test('Escenario 3: Navegación a Base de Conocimiento y captura de evidencia de capacidades DeepWiki', async ({ page }) => {
    await page.goto('/project-docs/index.html');

    // Conmutar a la pestaña de Base de Conocimiento
    const kbTab = page.locator('button[data-tab="knowledge"]');
    await expect(kbTab).toBeVisible();
    await kbTab.click();

    const kbContainer = page.locator('#kb-view-library');
    await expect(kbContainer).toBeVisible();

    // Captura de evidencia 3: Biblioteca de conocimiento soberano v4.1
    const screenshotPath = path.join(evidenceDir, '03-knowledge-base-deepwiki.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    expect(fs.existsSync(screenshotPath)).toBe(true);
  });
});
