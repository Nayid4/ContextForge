#!/usr/bin/env node
/**
 * Script de Captura Automatizada de Evidencias Visuales (Screenshots)
 * Ejecutable de forma independiente o en pipelines CI/CD.
 */
import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function runEvidenceCapture() {
  const targetTask = process.argv[2] || '009';
  const ROOT_DIR = fs.existsSync(path.resolve(process.cwd(), 'project-docs'))
    ? process.cwd()
    : path.resolve(process.cwd(), '..');
  
  const specsDir = fs.existsSync(path.resolve(ROOT_DIR, 'project-docs', 'specs'))
    ? path.resolve(ROOT_DIR, 'project-docs', 'specs')
    : path.resolve(ROOT_DIR, 'specs');
  let targetSpecFolder = fs.existsSync(specsDir) 
    ? fs.readdirSync(specsDir).find(f => f.startsWith(`${targetTask}_`))
    : null;
  if (!targetSpecFolder) {
    targetSpecFolder = `${targetTask}_evidence`;
  }
  const evidenceDir = path.resolve(specsDir, targetSpecFolder, 'evidence');
  
  if (!fs.existsSync(evidenceDir)) {
    fs.mkdirSync(evidenceDir, { recursive: true });
  }

  console.log(`[EVIDENCE] Iniciando captura de evidencias para tarea ${targetTask}...`);
  console.log(`[EVIDENCE] Directorio de salida: ${evidenceDir}`);

  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    const fileUrl = 'file:///' + path.resolve(ROOT_DIR, 'project-docs/index.html').replace(/\\/g, '/');
    await page.goto(fileUrl);
    await page.waitForTimeout(1000);

    // 1. Dashboard Table
    const tableShot = path.join(evidenceDir, '01-dashboard-scrum-table.png');
    await page.screenshot({ path: tableShot });
    console.log(`[OK] Captura 1 guardada: ${tableShot}`);

    // 2. Open Modal for target task
    const detailId = parseInt(targetTask, 10).toString();
    const detailBtn = page.locator(`button[data-action="view-detail"][data-id="${detailId}"]`).first();
    if (await detailBtn.count() > 0) {
      await detailBtn.click();
      await page.waitForTimeout(500);
      const modalShot = path.join(evidenceDir, '02-modal-scrum-subtasks.png');
      await page.screenshot({ path: modalShot });
      console.log(`[OK] Captura 2 guardada: ${modalShot}`);
      
      const closeBtn = page.locator('button[data-action="close-modal"]').first();
      await closeBtn.click();
      await page.waitForTimeout(300);
    }

    // 3. Knowledge Base
    const kbTab = page.locator('button[data-tab="knowledge"]');
    if (await kbTab.count() > 0) {
      await kbTab.click();
      await page.waitForTimeout(800);
      const kbShot = path.join(evidenceDir, '03-knowledge-base-deepwiki.png');
      await page.screenshot({ path: kbShot });
      console.log(`[OK] Captura 3 guardada: ${kbShot}`);
    }

    console.log('[SUCCESS] Todas las evidencias visuales fueron capturadas con éxito.');
  } catch (err) {
    console.error('[ERROR] Error durante la captura de evidencias:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runEvidenceCapture();
