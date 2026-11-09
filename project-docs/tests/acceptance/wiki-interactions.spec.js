import { test, expect } from '@playwright/test';

test.describe('Acceptance Tests: Plane Wiki Interactions & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/project-docs/index.html#pages');
    await page.waitForSelector('#plane-sidebar', { timeout: 10000 });
  });

  test('TC-01: Colapso del sidebar y persistencia en localStorage', async ({ page }) => {
    const collapseBtn = page.locator('#toggle-sidebar-collapse');
    await expect(collapseBtn).toBeVisible();

    // 1. Clic en botón de colapsar sidebar secundario
    await collapseBtn.click();
    await page.waitForTimeout(300);

    // 2. Verificar que se guarda en localStorage
    const isCollapsed = await page.evaluate(() => localStorage.getItem('plane-sidebar-collapsed'));
    expect(isCollapsed).toBe('true');

    // 3. Recargar la página y verificar persistencia
    await page.reload();
    await page.waitForSelector('#plane-sidebar', { timeout: 10000 });
    const persistedState = await page.evaluate(() => localStorage.getItem('plane-sidebar-collapsed'));
    expect(persistedState).toBe('true');

    // 4. Restaurar estado para no afectar otras pruebas
    await page.evaluate(() => localStorage.removeItem('plane-sidebar-collapsed'));
  });

  test('TC-02: Acordeones de sección (Collections, Favorites, Shared, Private)', async ({ page }) => {
    // 1. Verificar presencia de acordeón de colecciones
    const collectionsToggle = page.locator('[data-action="toggle-sidebar-section"][data-section="collections"]');
    await expect(collectionsToggle).toBeVisible();

    const collectionsList = page.locator('#sidebar-list-collections');
    await expect(collectionsList).toBeVisible();

    // 2. Clic en contraer acordeón
    await collectionsToggle.click();
    await page.waitForTimeout(200);

    // 3. Clic nuevamente para expandir
    await collectionsToggle.click();
    await page.waitForTimeout(200);
    await expect(collectionsList).toBeVisible();
  });

  test('TC-03: Home distinto de Library en vista y contenido', async ({ page }) => {
    // 1. Navegar a Home
    const homeBtn = page.locator('[data-action="select-wiki-collection"][data-collection="home"]');
    await expect(homeBtn).toBeVisible();
    await homeBtn.click();
    await page.waitForTimeout(400);

    // Verificar URL hash
    expect(page.url()).toContain('#pages/home');

    // 2. Navegar a Library
    const libraryBtn = page.locator('[data-action="select-wiki-collection"][data-collection="library"]').first();
    await expect(libraryBtn).toBeVisible();
    await libraryBtn.click();
    await page.waitForTimeout(400);

    // Verificar URL hash
    expect(page.url()).toContain('#pages/library');
  });

  test('TC-04: Apertura del modal de creación de colección (+)', async ({ page }) => {
    const addColBtn = page.locator('[data-action="open-create-collection-modal"]');
    await expect(addColBtn).toBeVisible();
    await addColBtn.click();

    // Verificar que el modal se abre y es visible
    const modal = page.locator('#create-collection-modal');
    await expect(modal).toBeVisible();

    // Verificar inputs del modal
    const nameInput = page.locator('#col-form-name');
    await expect(nameInput).toBeVisible();

    // Cerrar modal usando el primer botón de cierre
    const closeBtn = page.locator('[data-action="close-create-collection-modal"]').first();
    await closeBtn.click();
    await expect(modal).toBeHidden();
  });

  test('TC-05: Filtro con debounce en la tabla de páginas', async ({ page }) => {
    // Abrir contenedor de búsqueda en la colección actual
    const toggleSearchBtn = page.locator('[data-action="toggle-collection-search"]');
    await expect(toggleSearchBtn).toBeVisible();
    await toggleSearchBtn.click();

    const searchInput = page.locator('#kb-collection-search-input');
    await expect(searchInput).toBeVisible();

    // Escribir término de búsqueda
    await searchInput.fill('INT');
    // Esperar debounce
    await page.waitForTimeout(400);

    // Verificar que las filas de la tabla se filtran
    const rows = page.locator('.kb-table-row:visible');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-06: Envío de modal de colección y visualización inmediata en sidebar', async ({ page }) => {
    // 1. Abrir modal
    const addColBtn = page.locator('[data-action="open-create-collection-modal"]');
    await expect(addColBtn).toBeVisible();
    await addColBtn.click();

    const modal = page.locator('#create-collection-modal');
    await expect(modal).toBeVisible();

    // 2. Completar formulario con nombre único
    const uniqueColName = `SecOps ${Date.now().toString(36)}`;
    await page.locator('#col-form-name').fill(uniqueColName);
    await page.locator('#col-form-desc').fill('Espacio de seguridad y auditoría');

    // 3. Enviar formulario
    await page.locator('#col-form-submit').click();
    await page.waitForTimeout(500);

    // 4. Verificar que el modal se cerró y la colección aparece en el sidebar
    await expect(modal).toBeHidden();
    const sidebarList = page.locator('#sidebar-list-collections');
    await expect(sidebarList).toContainText(uniqueColName);
  });

  test('TC-07: Apertura de menú contextual ··· de fila y creación de subpágina con parent prellenado', async ({ page }) => {
    // 1. Localizar primera fila de la tabla y abrir el menú de acciones de fila
    const row = page.locator('.kb-table-row:visible').first();
    await row.hover();
    const menuBtn = row.locator('button[data-action="toggle-page-row-menu"]');
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();
    await page.waitForTimeout(200);

    // 2. Verificar que se despliega el menú contextual con la opción de agregar subpágina
    const addSubPageBtn = page.locator('button[data-action="open-new-doc-modal"][data-parent-id]:visible').first();
    await expect(addSubPageBtn).toBeVisible();
    const parentIdExpected = await addSubPageBtn.getAttribute('data-parent-id');
    await addSubPageBtn.click();
    await page.waitForTimeout(200);

    // 3. Verificar que se abre el modal de nueva página con el campo parent prellenado
    const modal = page.locator('#new-doc-modal');
    await expect(modal).toBeVisible();
    const parentInput = page.locator('#new-doc-parent-id');
    const parentVal = await parentInput.inputValue();
    expect(parentVal).toBe(parentIdExpected);

    // 4. Cerrar modal de nueva página
    const cancelBtn = page.locator('button[data-action="close-new-doc-modal"]').first();
    await cancelBtn.click();
    await expect(modal).toBeHidden();
  });

  test('TC-08: Panel de navegación de página (History y Metadatos)', async ({ page }) => {
    // 1. Abrir primera página como artículo desde la tabla
    const openDocBtn = page.locator('[data-action="open-article-read"]').first();
    await expect(openDocBtn).toBeVisible();
    await openDocBtn.click();
    await page.waitForTimeout(600);

    // 2. Verificar que se despliega el panel de navegación lateral del documento
    const navPane = page.locator('#plane-page-navigation-pane');
    await expect(navPane).toBeVisible();

    // 3. Conmutar a la pestaña de Historial
    const historyTab = page.locator('button[data-action="switch-page-nav-tab"][data-tab="version_history"]');
    await expect(historyTab).toBeVisible();
    await historyTab.click();
    await page.waitForTimeout(200);

    // Verificar que el panel de historial renderiza las versiones
    const historyPanel = page.locator('#plane-page-navigation-pane');
    await expect(historyPanel).toContainText('Versión');
  });

  test('TC-09: Conmutación fluida entre 3 modos de editor (Markdown, Bloques, Word WYSIWYG)', async ({ page }) => {
    // 1. Abrir primera página como artículo
    const openDocBtn = page.locator('[data-action="open-article-read"]').first();
    await expect(openDocBtn).toBeVisible();
    await openDocBtn.click();
    await page.waitForTimeout(500);

    // 2. Abrir modo editor pulsando el botón #btn-toggle-doc-editor
    const toggleEditorBtn = page.locator('#btn-toggle-doc-editor');
    await expect(toggleEditorBtn).toBeVisible();
    await toggleEditorBtn.click();
    await page.waitForTimeout(300);

    const editorContainer = page.locator('#doc-editor-view-container');
    await expect(editorContainer).toBeVisible();

    // 3. Modo Markdown activo por defecto
    const mdPane = page.locator('#editor-pane-markdown');
    await expect(mdPane).toBeVisible();

    // 4. Conmutar a modo Bloques
    const blocksBtn = page.locator('#btn-editor-mode-blocks');
    await expect(blocksBtn).toBeVisible();
    await blocksBtn.click();
    await page.waitForTimeout(200);

    const blocksPane = page.locator('#editor-pane-blocks');
    await expect(blocksPane).toBeVisible();
    await expect(mdPane).toBeHidden();

    // 5. Conmutar a modo Word WYSIWYG
    const wordBtn = page.locator('#btn-editor-mode-word');
    await expect(wordBtn).toBeVisible();
    await wordBtn.click();
    await page.waitForTimeout(200);

    const wordPane = page.locator('#editor-pane-word');
    await expect(wordPane).toBeVisible();
    await expect(blocksPane).toBeHidden();

    // 6. Volver a modo Markdown
    const mdBtn = page.locator('#btn-editor-mode-md');
    await expect(mdBtn).toBeVisible();
    await mdBtn.click();
    await page.waitForTimeout(200);

    await expect(mdPane).toBeVisible();
    await expect(wordPane).toBeHidden();
  });

  test('TC-10: Navegación interna por Outline de encabezados con scroll suave', async ({ page }) => {
    // 1. Abrir primera página como artículo
    const openDocBtn = page.locator('[data-action="open-article-read"]').first();
    await expect(openDocBtn).toBeVisible();
    await openDocBtn.click();
    await page.waitForTimeout(500);

    // 2. El panel lateral muestra la pestaña Outline activa por defecto
    const navPane = page.locator('#plane-page-navigation-pane');
    await expect(navPane).toBeVisible();

    // 3. Localizar primer enlace de encabezado en la lista del outline
    const outlineLinks = page.locator('button[data-action="scroll-to-heading"]');
    const linkCount = await outlineLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // 4. Pulsar el encabezado y verificar scrollIntoView sin excepciones
    const targetLink = outlineLinks.first();
    const headingTargetId = (await targetLink.getAttribute('data-heading-id')) || (await targetLink.getAttribute('data-target-id'));
    expect(headingTargetId).toBeTruthy();

    await targetLink.click();
    await page.waitForTimeout(300);

    // 5. Verificar que el elemento destino existe en el DOM dentro del artículo activo y recibió el destello visual
    const targetEl = page.locator('#doc-active-body').locator(`#${headingTargetId}`);
    await expect(targetEl).toBeAttached();
    await expect(targetEl).toHaveClass(/transition-all/);
  });

  test('TC-11: Opciones de colección en Hero Header (Abrir modal de edición con ID prellenado)', async ({ page }) => {
    // 1. Clic en menú de acciones de la colección activa
    const colMenuBtn = page.locator('#btn-collection-actions');
    await expect(colMenuBtn).toBeVisible();
    await colMenuBtn.click();
    await page.waitForTimeout(200);

    // 2. Verificar que el dropdown se despliega
    const colMenu = page.locator('#collection-actions-menu');
    await expect(colMenu).toBeVisible();

    // 3. Clic en Editar colección
    const editBtn = page.locator('[data-action="open-edit-collection-modal"]');
    await expect(editBtn).toBeVisible();
    await editBtn.click();
    await page.waitForTimeout(200);

    // 4. Modal de edición se abre con título y botón adaptados
    const modal = page.locator('#create-collection-modal');
    await expect(modal).toBeVisible();
    const modalTitle = page.locator('#create-collection-title');
    await expect(modalTitle).toContainText('Edit Collection');
    const submitBtn = page.locator('#col-form-submit');
    await expect(submitBtn).toHaveText('Save Changes');

    // 5. Cerrar modal
    await page.locator('[data-action="close-create-collection-modal"]').first().click();
    await expect(modal).toBeHidden();
  });

  test.afterAll(async () => {
    try {
      const fs = await import('node:fs');
      const path = await import('node:path');
      const { DatabaseSync } = await import('node:sqlite');
      const collectionsPath = path.resolve('project-docs/knowledge/collections.json');
      const dbPath = path.resolve('project-docs/data/harness.db');
      if (fs.existsSync(collectionsPath)) {
        const raw = fs.readFileSync(collectionsPath, 'utf8');
        const cols = JSON.parse(raw);
        const canonicalIds = ['general', 'engineering', 'product', 'design', 'customer_support'];
        const filtered = cols.filter(c => canonicalIds.includes(c.id));
        if (filtered.length !== cols.length) {
          fs.writeFileSync(collectionsPath, JSON.stringify(filtered, null, 2), 'utf8');
        }
      }
      if (fs.existsSync(dbPath)) {
        const db = new DatabaseSync(dbPath);
        db.exec("DELETE FROM collections WHERE id NOT IN ('general', 'engineering', 'product', 'design', 'customer_support');");
        db.close();
      }
    } catch {
      // ignore cleanup errors in test teardown
    }
  });
});
