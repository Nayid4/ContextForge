/**
 * PagesController (Controller for Plane Pages & Library Domain)
 * Encapsula la lógica de eventos, filtrado, ordenamiento, navegación editorial
 * y persistencia bidireccional (SQLite + .md) para la vista Library / Pages.
 * Cumple estrictamente con los principios SOLID (Single Responsibility Principle).
 */
import { store } from '../../../core/store.js';
import { router } from '../../../core/router.js';
import { api } from '../../../core/api.js';
import { Icons } from '../../../shared/Icons.js';
import { renderMarkdown, stripFrontmatter, extractTableOfContents, parseMarkdownToBlocks, htmlToMarkdown, blocksToMarkdown } from '../../../shared/MarkdownViewer.js';
import { renderPageHeaderActions } from '../pages/PagesPage.js';
import { PageNavigationPane, renderFloatingOutlineBars } from '../components/PageNavigationPane.js';
import { enrichMarkdownWithSmartChips } from '../components/PageReader.js';
import { formatTimeAgo } from '../../../shared/utils/dates.js';

function escapeHtml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(text = '') {
  return String(text).replace(/"/g, '&quot;');
}

function getBlockTypeLabel(type) {
  switch (type) {
    case 'header': return 'Encabezado';
    case 'paragraph': return 'Párrafo';
    case 'callout': return 'Alerta';
    case 'business_rule': return 'Invariante BR';
    case 'code': return 'Código / Diagrama';
    case 'table': return 'Tabla';
    default: return 'Bloque';
  }
}

function renderTocHtml(toc = []) {
  if (!toc || toc.length === 0) {
    return `<div class="text-[11px] text-gray-400 dark:text-zinc-500 italic py-2">Sin encabezados.</div>`;
  }

  return `
    <nav class="space-y-1 text-xs font-mono">
      ${toc.map(item => `
        <a href="#${item.id}"
           data-action="scroll-to-heading"
           data-heading-id="${item.id}"
           class="block py-1 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate text-gray-600 dark:text-zinc-400 ${item.level === 1 ? 'font-bold text-gray-900 dark:text-zinc-100' : item.level === 2 ? 'pl-3' : 'pl-5 text-[11px]'}"
           title="${escapeAttr(item.text)}">
          ${escapeHtml(item.text)}
        </a>
      `).join('')}
    </nav>
  `;
}

export class PagesController {
  constructor(app) {
    this.app = app;
    this.activeCollection = 'product';
    this.kbStateTab = 'all';
    this.kbAccessTab = 'public';
    this.kbActiveShelfFilter = '';
    this.kbSearchQuery = '';
    this.kbFilterFavorites = false;
    this.kbFilterLocked = false;
    this.kbFilterOwner = '';
    this.kbSortBy = 'updated_at';
    this.kbSortDir = 'desc';
    this.kbViewLayout = 'list';
    this.activeKbPerspective = 'global';
    this.currentActiveDocKey = 'c4-model.md';
    this.isArticleOpen = false;
    this.expandedParentIds = new Set(['prod-1', 'prod-2', 'prod-5', 'eng-1', 'eng-2', 'gen-1']);
    this.editorMode = 'markdown';
    this.currentBlocks = [];
    this.exportTargetDocKey = null;
    this.pageSearchDebounceTimer = null;
    this.isScrollingFromEditor = false;
    this.isScrollingFromPreview = false;
    this.scrollResetTimer = null;
  }

  /**
   * Manejador de eventos click delegados para Pages y Library
   */
  async handleClick(e) {
    // 0. Navegación en documento: Scroll interactivo a Encabezados H1-H4 (TOC & Inspector)
    const scrollHeadingBtn = e.target.closest('[data-action="scroll-to-heading"], #doc-active-toc a, #plane-page-navigation-pane nav a');
    if (scrollHeadingBtn) {
      e.preventDefault();
      e.stopPropagation();
      const headingId = scrollHeadingBtn.getAttribute('data-heading-id') || (scrollHeadingBtn.getAttribute('href') || '').replace(/^#/, '');
      if (headingId) {
        this.scrollToHeading(headingId);
      }
      return true;
    }

    // 0.0 Alternar filas anidadas (Expand/Collapse Nested Pages en Plane Wiki)
    const toggleNestedBtn = e.target.closest('[data-action="toggle-nested-rows"]');
    if (toggleNestedBtn) {
      e.stopPropagation();
      const parentId = toggleNestedBtn.getAttribute('data-parent-id');
      if (parentId) {
        if (this.expandedParentIds.has(parentId)) {
          this.expandedParentIds.delete(parentId);
        } else {
          this.expandedParentIds.add(parentId);
        }
        this.app.render();
      }
      return true;
    }

    // 0.1 Toggle Buscador de la Colección Activa
    const toggleSearchBtn = e.target.closest('[data-action="toggle-collection-search"]');
    if (toggleSearchBtn) {
      const searchBox = document.getElementById('kb-search-container');
      if (searchBox) {
        searchBox.classList.toggle('hidden');
        searchBox.classList.toggle('flex');
        const input = document.getElementById('kb-collection-search-input');
        if (input && !searchBox.classList.contains('hidden')) {
          input.focus();
        }
      }
      return true;
    }

    // 0.2 Menú de Opciones de Nueva Página (Split Button v)
    const newDocMenuBtn = e.target.closest('[data-action="open-new-doc-menu"]');
    if (newDocMenuBtn) {
      const menu = document.getElementById('new-doc-options-menu');
      if (menu) menu.classList.toggle('hidden');
      return true;
    }

    // 0.3 Abrir Modal de Creación de Página
    const openNewDocBtn = e.target.closest('[data-action="open-new-doc-modal"]');
    if (openNewDocBtn) {
      const template = openNewDocBtn.getAttribute('data-template') || 'blank';
      const parentId = openNewDocBtn.getAttribute('data-parent-id') || '';
      const modal = document.getElementById('new-doc-modal');
      const moduleInput = document.getElementById('new-doc-module');
      const filenameInput = document.getElementById('new-doc-filename');
      const contentInput = document.getElementById('new-doc-content');
      const parentInput = document.getElementById('new-doc-parent-id');
      document.getElementById('new-doc-options-menu')?.classList.add('hidden');

      if (moduleInput) moduleInput.value = this.activeCollection || 'general';
      if (filenameInput) filenameInput.value = '';
      if (parentInput) parentInput.value = parentId;

      let templateContent = '# New Document\n\nWrite your specification here...';
      if (template === 'prd') {
        templateContent = '# Product Requirements Document (PRD)\n\n## 1. Problem Statement\n\n## 2. Target Audience\n\n## 3. Key Capabilities & Scope\n\n## 4. Acceptance Criteria';
      } else if (template === 'architecture') {
        templateContent = '# Architecture Specification\n\n## 1. Context & Topology\n\n## 2. Components & Boundaries\n\n## 3. Data Dictionary & Storage\n\n## 4. Resilience & SLAs';
      } else if (template === 'adr') {
        templateContent = '# ADR: Title\n\n## Status\nAccepted\n\n## Context\n\n## Decision\n\n## Consequences';
      } else if (template === 'rule') {
        templateContent = '# Business Rule Specification\n\n## Invariant: BR-CORE-001\n\n## Rule Statement\n\n## Validation & Error Handling';
      }

      if (contentInput) contentInput.value = templateContent;
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
      return true;
    }

    // 0.4 Cerrar Modal de Nueva Página
    if (e.target.closest('[data-action="close-new-doc-modal"]')) {
      const modal = document.getElementById('new-doc-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
      return true;
    }

    // 0.5 Selección de Colección de Wiki (Plane Wiki Collections: Product, Engineering, General, Design, Customer support, Home, Library)
    const collectionBtn = e.target.closest('[data-action="select-wiki-collection"]');
    if (collectionBtn) {
      const colId = collectionBtn.getAttribute('data-collection') || 'product';
      this.activeCollection = colId;
      this.isArticleOpen = false;
      window.location.hash = `#pages/${colId}`;
      this.app.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return true;
    }

    // 1. Volver a la Biblioteca de Conocimiento
    const backToLibBtn = e.target.closest('[data-action="back-to-library"]');
    if (backToLibBtn) {
      this.isArticleOpen = false;
      this.app.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return true;
    }

    // 1b. Acciones de Encabezado: Icono y Portada Plane
    const addIconBtn = e.target.closest('[data-action="add-page-icon"]');
    if (addIconBtn) {
      this.app.showToast?.('Selector de icono de documento activado', 'info');
      return true;
    }
    const addCoverBtn = e.target.closest('[data-action="add-page-cover"]');
    if (addCoverBtn) {
      this.app.showToast?.('Selector de portada de documento activado', 'info');
      return true;
    }

    // 2. Abrir Documento en Modo Lectura (Fila o botón con data-doc-key)
    const explicitOpenBtn = e.target.closest('[data-action="open-article-read"]');
    if (explicitOpenBtn) {
      const docKey = explicitOpenBtn.getAttribute('data-doc-key');
      if (docKey) this.openArticleView(docKey, false);
      return true;
    }
    const openTableRow = e.target.closest('.kb-table-row[data-doc-key]');
    if (openTableRow && !e.target.closest('button') && !e.target.closest('.plane-row-actions-menu') && !e.target.closest('a')) {
      const docKey = openTableRow.getAttribute('data-doc-key');
      if (docKey) this.openArticleView(docKey, false);
      return true;
    }

    // 3. Abrir Documento en Modo Edición
    const openEditBtn = e.target.closest('[data-action="open-article-edit"]');
    if (openEditBtn) {
      const docKey = openEditBtn.getAttribute('data-doc-key');
      if (docKey) this.openArticleView(docKey, true);
      return true;
    }

    // 4. Alternar Modo Editor / Lectura en Artículo
    const toggleEditorBtn = e.target.closest('#btn-toggle-doc-editor');
    if (toggleEditorBtn) {
      const readerContainer = document.getElementById('doc-reader-view-container');
      const editorContainer = document.getElementById('doc-editor-view-container');
      const btnText = document.getElementById('btn-toggle-doc-text');
      const btnIcon = document.getElementById('btn-toggle-doc-icon');
      const textarea = document.getElementById('doc-editor-textarea');
      const preview = document.getElementById('doc-editor-live-preview');
      const pathEl = document.getElementById('doc-active-path');

      if (readerContainer && editorContainer) {
        const isEditorHidden = editorContainer.classList.contains('hidden');
        if (isEditorHidden) {
          const docKey = pathEl ? pathEl.textContent.trim() : '';
          const docs = store.getState().knowledgeIndex?.docs || {};
          const content = docs[docKey] || '';
          if (textarea) textarea.value = content;
          if (preview) preview.innerHTML = renderMarkdown(content);
          editorContainer.classList.remove('hidden');
          readerContainer.classList.add('hidden');
          if (btnText) btnText.textContent = 'Modo Lectura';
          if (btnIcon) btnIcon.innerHTML = Icons.eye('w-3.5 h-3.5');
          this.setupSynchronizedScroll();
        } else {
          editorContainer.classList.add('hidden');
          readerContainer.classList.remove('hidden');
          if (btnText) btnText.textContent = 'Modo Editor';
          if (btnIcon) btnIcon.innerHTML = Icons.edit('w-3.5 h-3.5');
        }
      }
      return true;
    }

    // 5. Conmutador del Editor: Modo 1 - Markdown
    const btnModeMd = e.target.closest('#btn-editor-mode-md');
    if (btnModeMd) {
      if (this.editorMode === 'word') {
        const wordCanvas = document.getElementById('doc-editor-word-canvas');
        const textarea = document.getElementById('doc-editor-textarea');
        if (wordCanvas && textarea) {
          const md = htmlToMarkdown(wordCanvas.innerHTML);
          textarea.value = md;
          const livePreview = document.getElementById('doc-editor-live-preview');
          if (livePreview) livePreview.innerHTML = renderMarkdown(md);
        }
      }
      this.editorMode = 'markdown';
      this.updateEditorModeButtons('markdown');

      document.getElementById('editor-pane-markdown')?.classList.remove('hidden');
      document.getElementById('editor-pane-blocks')?.classList.add('hidden');
      document.getElementById('editor-pane-word')?.classList.add('hidden');
      document.getElementById('editor-pane-word')?.classList.remove('flex');
      this.setupSynchronizedScroll();
      return true;
    }

    // 6. Conmutador del Editor: Modo 2 - Bloques Visuales (ContextForge)
    const btnModeBlocks = e.target.closest('#btn-editor-mode-blocks');
    if (btnModeBlocks) {
      if (this.editorMode === 'word') {
        const wordCanvas = document.getElementById('doc-editor-word-canvas');
        const textarea = document.getElementById('doc-editor-textarea');
        if (wordCanvas && textarea) {
          textarea.value = htmlToMarkdown(wordCanvas.innerHTML);
        }
      }
      this.editorMode = 'blocks';
      this.updateEditorModeButtons('blocks');

      document.getElementById('editor-pane-markdown')?.classList.add('hidden');
      document.getElementById('editor-pane-blocks')?.classList.remove('hidden');
      document.getElementById('editor-pane-word')?.classList.add('hidden');
      document.getElementById('editor-pane-word')?.classList.remove('flex');

      const textarea = document.getElementById('doc-editor-textarea');
      const currentMd = textarea ? textarea.value : '';
      this.currentBlocks = parseMarkdownToBlocks(currentMd);
      this.renderVisualBlocks(this.currentBlocks);
      return true;
    }

    // 6.1 Conmutador del Editor: Modo 3 - Word / Rich-Text WYSIWYG (Matching Image 3)
    const btnModeWord = e.target.closest('#btn-editor-mode-word');
    if (btnModeWord) {
      const textarea = document.getElementById('doc-editor-textarea');
      const currentMd = textarea ? textarea.value : '';
      const wordCanvas = document.getElementById('doc-editor-word-canvas');
      if (wordCanvas) {
        wordCanvas.innerHTML = renderMarkdown(currentMd);
      }
      this.editorMode = 'word';
      this.updateEditorModeButtons('word');

      document.getElementById('editor-pane-markdown')?.classList.add('hidden');
      document.getElementById('editor-pane-blocks')?.classList.add('hidden');
      document.getElementById('editor-pane-word')?.classList.remove('hidden');
      document.getElementById('editor-pane-word')?.classList.add('flex');
      return true;
    }

    // 6.2 Comandos de Formato de la Barra de Herramientas Word
    const wordCmdBtn = e.target.closest('[data-word-cmd]');
    if (wordCmdBtn) {
      e.preventDefault();
      const cmd = wordCmdBtn.getAttribute('data-word-cmd');
      const val = wordCmdBtn.getAttribute('data-value') || null;
      const wordCanvas = document.getElementById('doc-editor-word-canvas');
      if (wordCanvas) wordCanvas.focus();

      if (cmd === 'insertTable') {
        const tableHtml = `
          <table class="my-4 w-full border-collapse border border-gray-200 dark:border-zinc-800 text-xs">
            <thead>
              <tr class="bg-gray-100 dark:bg-zinc-800">
                <th class="border border-gray-200 dark:border-zinc-800 px-3 py-2 text-left font-semibold">Field</th>
                <th class="border border-gray-200 dark:border-zinc-800 px-3 py-2 text-left font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border border-gray-200 dark:border-zinc-800 px-3 py-2 font-medium">Project Name</td>
                <td class="border border-gray-200 dark:border-zinc-800 px-3 py-2">Add your project name</td>
              </tr>
              <tr>
                <td class="border border-gray-200 dark:border-zinc-800 px-3 py-2 font-medium">Status</td>
                <td class="border border-gray-200 dark:border-zinc-800 px-3 py-2">Active / In Progress</td>
              </tr>
            </tbody>
          </table>
          <p><br></p>
        `;
        document.execCommand('insertHTML', false, tableHtml);
      } else if (cmd === 'formatBlock') {
        document.execCommand('formatBlock', false, val || 'p');
      } else {
        document.execCommand(cmd, false, val);
      }
      return true;
    }

    // 7. Cancelar edición de documento
    const cancelEditBtn = e.target.closest('#btn-cancel-doc-edit');
    if (cancelEditBtn) {
      document.getElementById('doc-editor-view-container')?.classList.add('hidden');
      document.getElementById('doc-reader-view-container')?.classList.remove('hidden');
      const btnText = document.getElementById('btn-toggle-doc-text');
      const btnIcon = document.getElementById('btn-toggle-doc-icon');
      if (btnText) btnText.textContent = 'Modo Editor';
      if (btnIcon) btnIcon.innerHTML = Icons.edit('w-3.5 h-3.5');
      return true;
    }

    // 8. Guardar cambios del documento (Soporte Multimodo: Markdown, Bloques, Word)
    const saveEditBtn = e.target.closest('#btn-save-doc-edit');
    if (saveEditBtn) {
      const pathEl = document.getElementById('doc-active-path');
      const docKey = pathEl ? pathEl.textContent.trim() : '';
      let newContent = '';

      if (this.editorMode === 'word') {
        const wordCanvas = document.getElementById('doc-editor-word-canvas');
        newContent = htmlToMarkdown(wordCanvas ? wordCanvas.innerHTML : '');
        const textarea = document.getElementById('doc-editor-textarea');
        if (textarea) textarea.value = newContent;
      } else if (this.editorMode === 'blocks') {
        newContent = blocksToMarkdown(this.currentBlocks);
        const textarea = document.getElementById('doc-editor-textarea');
        if (textarea) textarea.value = newContent;
      } else {
        const textarea = document.getElementById('doc-editor-textarea');
        newContent = textarea ? textarea.value : '';
      }

      if (docKey) {
        store.saveDoc(docKey, newContent);
        const bodyEl = document.getElementById('doc-active-body');
        if (bodyEl) bodyEl.innerHTML = renderMarkdown(stripFrontmatter(newContent));
        const tocEl = document.getElementById('doc-active-toc');
        if (tocEl) tocEl.innerHTML = renderTocHtml(extractTableOfContents(newContent));

        document.getElementById('doc-editor-view-container')?.classList.add('hidden');
        document.getElementById('doc-reader-view-container')?.classList.remove('hidden');
        const btnText = document.getElementById('btn-toggle-doc-text');
        const btnIcon = document.getElementById('btn-toggle-doc-icon');
        if (btnText) btnText.textContent = 'Modo Editor';
        if (btnIcon) btnIcon.innerHTML = Icons.edit('w-3.5 h-3.5');

        this.app.initMermaidDiagrams();
      }
      return true;
    }

    // 9. Filtrar estantes por píldora en la Biblioteca
    const shelfPill = e.target.closest('.kb-shelf-pill');
    if (shelfPill) {
      const targetShelf = shelfPill.getAttribute('data-shelf-filter') || '';
      this.kbActiveShelfFilter = targetShelf;
      document.querySelectorAll('.kb-shelf-pill').forEach(p => {
        p.classList.remove('active', 'bg-indigo-600', 'text-white', 'font-semibold');
        p.classList.add('bg-zinc-900', 'text-zinc-400');
      });
      shelfPill.classList.add('active', 'bg-indigo-600', 'text-white', 'font-semibold');
      shelfPill.classList.remove('bg-zinc-900', 'text-zinc-400');
      this.applyLibraryFiltersAndSort();
      return true;
    }

    // 10. Conmutar entre pestañas de Módulos DDD en Library
    const modTabBtn = e.target.closest('[data-module-tab]');
    if (modTabBtn) {
      const targetMod = modTabBtn.getAttribute('data-module-tab');
      document.querySelectorAll('.kb-module-tab-btn').forEach(b => {
        const isMatch = b.getAttribute('data-module-tab') === targetMod;
        b.classList.toggle('active', isMatch);
        b.classList.toggle('bg-indigo-600', isMatch);
        b.classList.toggle('text-white', isMatch);
        b.classList.toggle('font-semibold', isMatch);
        b.classList.toggle('bg-zinc-900', !isMatch);
        b.classList.toggle('text-zinc-400', !isMatch);
      });
      document.querySelectorAll('.kb-module-content-panel').forEach(panel => {
        panel.classList.toggle('hidden', panel.id !== `kb-module-content-${targetMod}`);
      });
      return true;
    }

    // 11. Abrir página favorita directamente desde el Sidebar
    const favSidebarBtn = e.target.closest('[data-action="sidebar-open-favorite-page"]');
    if (favSidebarBtn) {
      const docKey = favSidebarBtn.getAttribute('data-doc-key') || 'c4-model.md';
      this.currentActiveDocKey = docKey;
      this.isArticleOpen = true;
      if (store.getState().planeView !== 'pages') {
        router.navigate('pages');
      } else {
        this.openArticleView(docKey, false);
      }
      return true;
    }

    // 12. Alternar Selector de Vista de Plane Library (List View vs Card / Gallery View)
    const viewLayoutBtn = e.target.closest('[data-action="set-library-view-layout"]');
    if (viewLayoutBtn) {
      const layout = viewLayoutBtn.getAttribute('data-view-layout') || 'list';
      this.kbViewLayout = layout;
      const listContainer = document.getElementById('kb-pages-list-container');
      const gridContainer = document.getElementById('kb-pages-grid-container');
      const btnList = document.getElementById('btn-view-layout-list');
      const btnCard = document.getElementById('btn-view-layout-card');

      if (layout === 'card') {
        listContainer?.classList.add('hidden');
        gridContainer?.classList.remove('hidden');
        btnCard?.classList.add('bg-zinc-800', 'text-zinc-100');
        btnCard?.classList.remove('text-zinc-400');
        btnList?.classList.remove('bg-zinc-800', 'text-zinc-100');
        btnList?.classList.add('text-zinc-400');
      } else {
        gridContainer?.classList.add('hidden');
        listContainer?.classList.remove('hidden');
        btnList?.classList.add('bg-zinc-800', 'text-zinc-100');
        btnList?.classList.remove('text-zinc-400');
        btnCard?.classList.remove('bg-zinc-800', 'text-zinc-100');
        btnCard?.classList.add('text-zinc-400');
      }
      return true;
    }

    // 13. Dropdown de New Page
    const toggleNewPageDropdownBtn = e.target.closest('[data-action="toggle-new-page-dropdown"]');
    if (toggleNewPageDropdownBtn) {
      e.stopPropagation();
      const menu = document.getElementById('new-page-dropdown-menu');
      if (menu) menu.classList.toggle('hidden');
      return true;
    }
    if (!e.target.closest('#new-page-dropdown-menu')) {
      document.getElementById('new-page-dropdown-menu')?.classList.add('hidden');
    }

    // 14. Acciones de Dropdown New Page: Blank page y From template
    const openBlankBtn = e.target.closest('[data-action="open-new-blank-page"]');
    if (openBlankBtn) {
      document.getElementById('new-page-dropdown-menu')?.classList.add('hidden');
      const modal = document.getElementById('new-doc-modal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        const filenameInp = document.getElementById('new-doc-filename');
        const contentInp = document.getElementById('new-doc-content');
        if (filenameInp) filenameInp.value = '';
        if (contentInp) contentInp.value = '';
      }
      return true;
    }

    const openTemplateBtn = e.target.closest('[data-action="open-new-template-page"]');
    if (openTemplateBtn) {
      document.getElementById('new-page-dropdown-menu')?.classList.add('hidden');
      const modal = document.getElementById('new-doc-modal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        const filenameInp = document.getElementById('new-doc-filename');
        const contentInp = document.getElementById('new-doc-content');
        if (filenameInp) filenameInp.value = 'module-spec.md';
        if (contentInp) contentInp.value = `# Especificación Técnica de Módulo\n\n## 1. Visión & Arquitectura\nDescribe el propósito y contexto de la funcionalidad...\n\n## 2. Invariantes de Negocio (BR-*)\n- BR-101: Invariante principal...\n\n## 3. Requisitos Funcionales (RF-*)\n- RF-101: Requisito funcional...\n`;
      }
      return true;
    }

    // 15. Conmutar entre Pestañas de Estado de Plane (All Pages, Created by me, Favorited, Archived)
    const pageStateTabBtn = e.target.closest('[data-page-tab]');
    if (pageStateTabBtn) {
      const stateTab = pageStateTabBtn.getAttribute('data-page-tab') || 'all';
      this.kbStateTab = stateTab;
      if (stateTab === 'archived') {
        this.kbAccessTab = 'archived';
      } else if (this.kbAccessTab === 'archived') {
        this.kbAccessTab = 'public';
      }
      document.querySelectorAll('.kb-page-state-tab').forEach(b => {
        const isMatch = b.getAttribute('data-page-tab') === stateTab;
        b.classList.toggle('active', isMatch);
        b.classList.toggle('border-indigo-500', isMatch);
        b.classList.toggle('text-zinc-100', isMatch);
        b.classList.toggle('font-semibold', isMatch);
        b.classList.toggle('border-transparent', !isMatch);
        b.classList.toggle('text-zinc-400', !isMatch);
        b.classList.toggle('font-medium', !isMatch);
      });

      // Asegurar que el panel de perspectiva global esté activo
      document.querySelectorAll('.kb-perspective-panel').forEach(panel => {
        panel.classList.toggle('hidden', panel.id !== 'kb-perspective-panel-global');
      });
      document.querySelectorAll('.kb-perspective-btn').forEach(btn => {
        if (!btn.hasAttribute('data-page-tab')) {
          btn.classList.remove('active', 'border-indigo-500', 'text-zinc-100', 'font-semibold');
          btn.classList.add('border-transparent', 'text-zinc-400', 'font-medium');
        }
      });

      this.applyLibraryFiltersAndSort();
      return true;
    }

    // 16. Conmutar sub-píldoras de Acceso Plane (Public / Private)
    const accessTabBtn = e.target.closest('.kb-access-tab-btn[data-page-access-tab]');
    if (accessTabBtn) {
      const accessTab = accessTabBtn.getAttribute('data-page-access-tab') || 'public';
      this.kbAccessTab = accessTab;
      document.querySelectorAll('.kb-access-tab-btn[data-page-access-tab]').forEach(b => {
        const isMatch = b.getAttribute('data-page-access-tab') === accessTab;
        b.classList.toggle('active', isMatch);
        b.classList.toggle('bg-zinc-800', isMatch);
        b.classList.toggle('text-zinc-200', isMatch);
        b.classList.toggle('font-semibold', isMatch);
        b.classList.toggle('bg-zinc-900', !isMatch);
        b.classList.toggle('text-zinc-400', !isMatch);
        b.classList.toggle('font-medium', !isMatch);
      });
      this.applyLibraryFiltersAndSort();
      return true;
    }

    // 17. Conmutar entre Niveles de Perspectiva y Pestañas Plane
    const perspectiveBtn = e.target.closest('[data-kb-perspective]');
    if (perspectiveBtn) {
      const targetPersp = perspectiveBtn.getAttribute('data-kb-perspective');
      const accessTab = perspectiveBtn.getAttribute('data-page-access-tab');
      this.activeKbPerspective = targetPersp || 'global';
      if (accessTab) {
        this.kbAccessTab = accessTab;
      }
      document.querySelectorAll('.kb-perspective-btn').forEach(btn => {
        btn.classList.remove('active', 'border-indigo-500', 'text-zinc-100', 'font-semibold');
        btn.classList.add('border-transparent', 'text-zinc-400', 'font-medium');
      });
      perspectiveBtn.classList.add('active', 'border-indigo-500', 'text-zinc-100', 'font-semibold');
      perspectiveBtn.classList.remove('border-transparent', 'text-zinc-400', 'font-medium');

      document.querySelectorAll('.kb-perspective-panel').forEach(panel => {
        panel.classList.add('hidden');
      });
      const targetPanel = document.getElementById(`kb-perspective-panel-${targetPersp}`);
      if (targetPanel) {
        targetPanel.classList.remove('hidden');
      }
      if (targetPersp === 'global') {
        this.applyLibraryFiltersAndSort();
      }
      this.app.initMermaidDiagrams();
      return true;
    }

    // 18. Alternar dirección de ordenamiento Ascendente / Descendente
    const sortDirBtn = e.target.closest('[data-action="toggle-kb-sort-dir"]');
    if (sortDirBtn) {
      const curr = sortDirBtn.getAttribute('data-sort-dir') || 'desc';
      const next = curr === 'desc' ? 'asc' : 'desc';
      sortDirBtn.setAttribute('data-sort-dir', next);
      const textEl = document.getElementById('kb-sort-dir-text');
      if (textEl) textEl.textContent = next.toUpperCase();
      const iconEl = document.getElementById('kb-sort-dir-icon');
      if (iconEl) iconEl.innerHTML = next === 'asc' ? Icons.sortAsc('w-3 h-3') : Icons.sortDesc('w-3 h-3');
      this.kbSortDir = next;
      this.applyLibraryFiltersAndSort();
      return true;
    }

    // 19. Mostrar / Ocultar Popover de Filtros
    const toggleFiltersPopoverBtn = e.target.closest('[data-action="toggle-kb-filters-popover"]');
    if (toggleFiltersPopoverBtn) {
      const pop = document.getElementById('kb-filters-popover');
      if (pop) pop.classList.toggle('hidden');
      return true;
    }

    // 20. Limpiar todos los filtros de Library
    const clearKbFiltersBtn = e.target.closest('[data-action="clear-kb-filters"]');
    if (clearKbFiltersBtn) {
      this.kbAccessTab = 'public';
      this.kbActiveShelfFilter = '';
      this.kbSearchQuery = '';
      this.kbFilterFavorites = false;
      this.kbFilterLocked = false;
      this.kbFilterOwner = '';
      const searchInput = document.getElementById('kb-library-search-input');
      if (searchInput) searchInput.value = '';
      const favChk = document.getElementById('kb-filter-favorites-chk');
      if (favChk) favChk.checked = false;
      const lockChk = document.getElementById('kb-filter-locked-chk');
      if (lockChk) lockChk.checked = false;
      const ownerSel = document.getElementById('kb-filter-owner-select');
      if (ownerSel) ownerSel.value = '';
      document.querySelectorAll('.kb-shelf-pill').forEach((p, idx) => {
        p.classList.toggle('active', idx === 0);
        p.classList.toggle('bg-indigo-600', idx === 0);
        p.classList.toggle('text-white', idx === 0);
        p.classList.toggle('font-semibold', idx === 0);
        p.classList.toggle('bg-zinc-900', idx !== 0);
        p.classList.toggle('text-zinc-400', idx !== 0);
      });
      document.querySelectorAll('.kb-access-tab-btn').forEach(btn => {
        const isPub = btn.getAttribute('data-page-access-tab') === 'public';
        btn.classList.toggle('active', isPub);
        btn.classList.toggle('border-indigo-500', isPub);
        btn.classList.toggle('text-zinc-100', isPub);
        btn.classList.toggle('font-semibold', isPub);
        btn.classList.toggle('border-transparent', !isPub);
        btn.classList.toggle('text-zinc-400', !isPub);
      });
      document.getElementById('kb-filters-popover')?.classList.add('hidden');
      this.applyLibraryFiltersAndSort();
      return true;
    }

    // 21. Mostrar / Ocultar menú contextual (...)
    const rowMenuBtn = e.target.closest('[data-action="toggle-page-row-menu"]');
    if (rowMenuBtn) {
      e.stopPropagation();
      const pageId = rowMenuBtn.getAttribute('data-page-id');
      const targetMenu = document.getElementById(`page-row-menu-${pageId}`);
      document.querySelectorAll('.plane-row-actions-menu').forEach(m => {
        if (m !== targetMenu) m.classList.add('hidden');
      });
      if (targetMenu) targetMenu.classList.toggle('hidden');
      return true;
    }

    if (!e.target.closest('.plane-row-actions-menu') && !e.target.closest('#kb-filters-popover')) {
      document.querySelectorAll('.plane-row-actions-menu').forEach(m => m.classList.add('hidden'));
    }

    // 22. Alternar Visibilidad de Página Plane: Public (0) <-> Private (1) según BR-PAGE-01 y BR-PAGE-04
    const accessPageBtn = e.target.closest('[data-action="toggle-page-access"]');
    if (accessPageBtn) {
      const pageId = accessPageBtn.getAttribute('data-page-id');
      const pd = store.getState().planeData || {};
      const pages = pd.pages || [];
      const target = pages.find(p => p.id === pageId);
      if (target && target.archived_at) return true;
      const nextAccess = target ? (Number(target.access || 0) === 1 ? 0 : 1) : 1;
      if (target) target.access = nextAccess;
      await api.updatePlanePage(pageId, { access: nextAccess });
      store.setState({ planeData: { ...pd, pages: [...pages] } });
      return true;
    }

    // 23. Archivar / Restaurar Página Plane según BR-PAGE-03
    const archivePageBtn = e.target.closest('[data-action="toggle-page-archive"]');
    if (archivePageBtn) {
      const pageId = archivePageBtn.getAttribute('data-page-id');
      const pd = store.getState().planeData || {};
      const pages = pd.pages || [];
      const target = pages.find(p => p.id === pageId);
      const willArchive = !(target && target.archived_at);
      if (target) {
        target.archived_at = willArchive ? new Date().toISOString() : null;
        if (willArchive) target.is_favorite = 0;
      }
      await api.updatePlanePage(pageId, { archived: willArchive });
      store.setState({ planeData: { ...pd, pages: [...pages] } });
      return true;
    }

    // 24. Duplicar Página Plane según BR-PAGE-05
    const dupPageBtn = e.target.closest('[data-action="duplicate-page"]');
    if (dupPageBtn) {
      const pageId = dupPageBtn.getAttribute('data-page-id');
      if (pageId) {
        await api.updatePlanePage(pageId, { duplicate: true });
        await this.app.refreshData();
      }
      return true;
    }

    // 25. Copiar Enlace Directo
    const copyLinkBtn = e.target.closest('[data-action="copy-page-link"]');
    if (copyLinkBtn) {
      const docKey = copyLinkBtn.getAttribute('data-doc-key') || this.currentActiveDocKey || 'c4-model.md';
      const url = `${window.location.origin}${window.location.pathname}#pages?doc=${encodeURIComponent(docKey)}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).catch(() => {});
      }
      document.querySelectorAll('.plane-row-actions-menu').forEach(m => m.classList.add('hidden'));
      return true;
    }

    // 26. Modal de Exportación de Página
    const openExportModalBtn = e.target.closest('[data-action="open-export-page-modal"]');
    if (openExportModalBtn) {
      this.exportTargetDocKey = openExportModalBtn.getAttribute('data-doc-key') || this.currentActiveDocKey || 'c4-model.md';
      const modal = document.getElementById('export-page-modal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
      document.querySelectorAll('.plane-row-actions-menu').forEach(m => m.classList.add('hidden'));
      return true;
    }
    if (e.target.closest('[data-action="close-export-page-modal"]')) {
      const modal = document.getElementById('export-page-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
      return true;
    }
    if (e.target.closest('[data-action="confirm-export-page"]')) {
      const scope = document.getElementById('export-page-scope')?.value || 'active';
      const format = document.getElementById('export-page-format')?.value || 'md';
      const includeAssets = document.getElementById('export-page-include-assets')?.checked !== false;
      const docs = store.getState().knowledgeIndex?.docs || {};
      const docKey = scope === 'all' ? 'MASTER-PROJECT-KNOWLEDGE.md' : (this.exportTargetDocKey || this.currentActiveDocKey || 'c4-model.md');
      let rawMd = docs[docKey] || Object.values(docs).join('\n\n---\n\n') || '# Exported Page';
      if (!includeAssets) {
        rawMd = rawMd.replace(/```mermaid[\s\S]*?```/gi, '_[Diagram omitted in text-only export]_');
      }
      const blobContent = format === 'html'
        ? `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>${docKey}</title><style>body{font-family:system-ui,sans-serif;max-width:820px;margin:2rem auto;padding:0 1rem;background:#09090b;color:#f4f4f5;line-height:1.6}pre,code{background:#18181b;padding:0.2rem 0.4rem;border-radius:4px}</style></head><body>${renderMarkdown(rawMd)}</body></html>`
        : rawMd;
      const mime = format === 'html' ? 'text/html;charset=utf-8' : 'text/markdown;charset=utf-8';
      const ext = format === 'html' ? '.html' : '.md';
      const blob = new Blob([blobContent], { type: mime });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = docKey.replace(/\.md$/i, '') + ext;
      link.click();
      const modal = document.getElementById('export-page-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
      return true;
    }

    // 27. Filtro rápido de árbol de páginas Plane
    const pageFilterBtn = e.target.closest('[data-action="set-page-tree-filter"]');
    if (pageFilterBtn) {
      const filter = pageFilterBtn.getAttribute('data-filter') || 'all';
      store.setState({ planePageFilterTab: filter });
      return true;
    }

    // 28. Cambiar pestaña del Panel de Inspección Derecho
    const navTabBtn = e.target.closest('[data-action="switch-page-nav-tab"]');
    if (navTabBtn) {
      const tab = navTabBtn.getAttribute('data-tab') || 'outline';
      store.setState({ planePageNavTab: tab, planePageShowNavPane: true, planePageShowAiMenu: false });
      return true;
    }

    // 29. Mostrar / Ocultar Panel de Inspección Derecho
    const toggleNavPaneBtn = e.target.closest('[data-action="toggle-page-nav-pane"]');
    if (toggleNavPaneBtn) {
      const curr = store.getState().planePageShowNavPane !== false;
      store.setState({ planePageShowNavPane: !curr });
      return true;
    }

    // 30. Alternar Favorito en página Plane
    const favPageBtn = e.target.closest('[data-action="toggle-page-favorite"]');
    if (favPageBtn) {
      const pageId = favPageBtn.getAttribute('data-page-id');
      const pd = store.getState().planeData || {};
      const pages = pd.pages || [];
      const target = pages.find(p => p.id === pageId);
      const nextFav = target ? (target.is_favorite ? 0 : 1) : 1;
      if (target) target.is_favorite = nextFav;
      await api.updatePlanePage(pageId, { is_favorite: Boolean(nextFav) });
      store.setState({ planeData: { ...pd, pages: [...pages] } });
      return true;
    }

    // 31. Alternar Bloqueo Normativo
    const lockPageBtn = e.target.closest('[data-action="toggle-page-lock"]');
    if (lockPageBtn) {
      const pageId = lockPageBtn.getAttribute('data-page-id');
      const pd = store.getState().planeData || {};
      const pages = pd.pages || [];
      const target = pages.find(p => p.id === pageId);
      const nextLock = target ? (target.is_locked ? 0 : 1) : 0;
      if (target) target.is_locked = nextLock;
      await api.updatePlanePage(pageId, { is_locked: Boolean(nextLock) });
      store.setState({ planeData: { ...pd, pages: [...pages] } });
      return true;
    }

    // 32. Alternar Ancho Completo
    const fullWidthBtn = e.target.closest('[data-action="toggle-page-fullwidth"]');
    if (fullWidthBtn) {
      const pageId = fullWidthBtn.getAttribute('data-page-id');
      const nextFw = !store.getState().planePageFullWidth;
      if (pageId) await api.updatePlanePage(pageId, { full_width: nextFw });
      store.setState({ planePageFullWidth: nextFw });
      return true;
    }

    // 33. Alternar Menú Ask Harness AI
    const aiMenuBtn = e.target.closest('[data-action="toggle-page-ai-menu"]');
    if (aiMenuBtn) {
      const curr = Boolean(store.getState().planePageShowAiMenu);
      store.setState({ planePageShowAiMenu: !curr });
      return true;
    }

    // 34. Copiar Markdown de la página activa
    const copyPageMdBtn = e.target.closest('[data-action="copy-page-markdown"]');
    if (copyPageMdBtn) {
      const pageId = copyPageMdBtn.getAttribute('data-page-id');
      const page = (store.getState().planeData?.pages || []).find(p => p.id === pageId);
      const md = page?.content_markdown || store.getState().planeActivePageContent || '';
      if (navigator.clipboard && md) {
        navigator.clipboard.writeText(md).catch(() => {});
      }
      return true;
    }

    // 35. Restaurar versión histórica
    const restoreVerBtn = e.target.closest('[data-action="restore-page-version"]');
    if (restoreVerBtn) {
      const pageId = restoreVerBtn.getAttribute('data-page-id');
      const versionId = restoreVerBtn.getAttribute('data-version-id');
      if (pageId && versionId) {
        await api.updatePlanePage(pageId, { restore_version_id: versionId });
        await this.app.refreshData();
      }
      return true;
    }

    // 36. Saltar a diagrama o asset
    const scrollAssetBtn = e.target.closest('[data-action="scroll-to-asset"]');
    if (scrollAssetBtn) {
      const idx = Math.max(0, Number(scrollAssetBtn.getAttribute('data-asset-index') || 1) - 1);
      const diagrams = document.querySelectorAll('.mermaid, article pre, article img');
      if (diagrams[idx]) {
        diagrams[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return true;
    }

    // 37. Conmutar modo Lector / Editor Dual en PagesPage
    const setPageModeBtn = e.target.closest('[data-action="set-page-mode"]');
    if (setPageModeBtn) {
      const mode = setPageModeBtn.getAttribute('data-mode') || 'reader';
      store.setState({ planePageEditorMode: mode });
      return true;
    }

    // 38. Selección de página en la base de conocimiento
    const pageBtn = e.target.closest('button[data-page-id]');
    if (pageBtn && !pageBtn.hasAttribute('data-action')) {
      const pageId = pageBtn.getAttribute('data-page-id');
      const page = (store.getState().planeData?.pages || []).find(p => p.id === pageId);
      store.setState({
        planeActivePageId: pageId,
        planeActivePageContent: page?.content_markdown || '',
        planePageEditorMode: 'reader'
      });
      return true;
    }

    // 39. Seleccionar página vinculada desde Backlinks / Forward Links
    const selectLinkedPageBtn = e.target.closest('[data-action="select-page"]');
    if (selectLinkedPageBtn) {
      const pageId = selectLinkedPageBtn.getAttribute('data-page-id');
      const page = (store.getState().planeData?.pages || []).find(p => p.id === pageId);
      if (page) {
        if (this.isArticleOpen && page.file_path) {
          const cleanKey = page.file_path.replace(/^knowledge\//, '');
          this.openArticleView(cleanKey, false);
        } else {
          store.setState({
            planeActivePageId: pageId,
            planeActivePageContent: page.content_markdown || '',
            planePageEditorMode: 'reader'
          });
        }
      }
      return true;
    }

    // 40. Alternar modo editor/lector de página
    if (e.target.closest('#plane-page-toggle-mode')) {
      const curr = store.getState().planePageEditorMode || 'reader';
      store.setState({ planePageEditorMode: curr === 'reader' ? 'editor' : 'reader' });
      return true;
    }

    // 41. Guardar página desde editor en SQLite y disco
    const savePageBtn = e.target.closest('#plane-page-save-btn');
    if (savePageBtn) {
      const pageId = savePageBtn.getAttribute('data-page-id');
      const editorInput = document.getElementById('plane-page-editor-input');
      const content = editorInput ? editorInput.value : '';
      if (pageId && content) {
        savePageBtn.textContent = 'Guardando...';
        await api.updatePlanePage(pageId, content);
        await this.app.refreshData();
        store.setState({ planeActivePageContent: content, planePageEditorMode: 'reader' });
      }
      return true;
    }

    // 42. Modales de Library (New Page & AI Context)
    if (e.target.closest('[data-action="open-new-doc-modal"]')) {
      const modal = document.getElementById('new-doc-modal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
      return true;
    }
    if (e.target.closest('[data-action="close-new-doc-modal"]')) {
      const modal = document.getElementById('new-doc-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
      return true;
    }
    if (e.target.closest('[data-action="open-ai-context-modal"]')) {
      const modal = document.getElementById('ai-context-modal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
      return true;
    }
    if (e.target.closest('[data-action="close-ai-context-modal"]')) {
      const modal = document.getElementById('ai-context-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
      return true;
    }

    // 43. Modal de Colección (Create / Edit Collection)
    if (e.target.closest('[data-action="open-create-collection-modal"]')) {
      const modal = document.getElementById('create-collection-modal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.getElementById('col-form-name')?.focus();
      }
      return true;
    }
    if (e.target.closest('[data-action="close-create-collection-modal"]')) {
      const modal = document.getElementById('create-collection-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
      return true;
    }

    return false;
  }

  /**
   * Manejador de eventos input delegados
   */
  handleInput(e) {
    if (e.target.id === 'kb-collection-search-input') {
      const q = (e.target.value || '').trim().toLowerCase();
      const rows = document.querySelectorAll('.kb-table-row');
      rows.forEach(r => {
        const text = (r.textContent || '').toLowerCase();
        if (!q || text.includes(q)) {
          r.classList.remove('hidden');
        } else {
          r.classList.add('hidden');
        }
      });
      return true;
    }

    if (e.target.id === 'kb-library-search-input') {
      this.kbSearchQuery = (e.target.value || '').trim().toLowerCase();
      this.applyLibraryFiltersAndSort();
      return true;
    }

    if (e.target.id === 'plane-page-search' || e.target.id === 'plane-pages-search') {
      clearTimeout(this.pageSearchDebounceTimer);
      this.pageSearchDebounceTimer = setTimeout(() => {
        store.setState({ planePageSearchQuery: e.target.value });
      }, 150);
      return true;
    }

    if (e.target.id === 'doc-editor-textarea') {
      const preview = document.getElementById('doc-editor-live-preview');
      if (preview) {
        preview.innerHTML = renderMarkdown(e.target.value);
      }
      return true;
    }

    return false;
  }

  /**
   * Manejador de eventos change delegados
   */
  async handleChange(e) {
    if (e.target.id === 'kb-sort-by-select') {
      this.kbSortBy = e.target.value || 'updated_at';
      this.applyLibraryFiltersAndSort();
      return true;
    }
    if (e.target.id === 'kb-filter-favorites-chk') {
      this.kbFilterFavorites = Boolean(e.target.checked);
      this.applyLibraryFiltersAndSort();
      return true;
    }
    if (e.target.id === 'kb-filter-locked-chk') {
      this.kbFilterLocked = Boolean(e.target.checked);
      this.applyLibraryFiltersAndSort();
      return true;
    }
    if (e.target.id === 'kb-filter-owner-select') {
      this.kbFilterOwner = e.target.value || '';
      this.applyLibraryFiltersAndSort();
      return true;
    }
    if (e.target.id === 'kb-rules-module-filter') {
      const mod = (e.target.value || '').trim();
      document.querySelectorAll('#kb-rules-list [data-rule-module]').forEach(row => {
        const rMod = row.getAttribute('data-rule-module') || '';
        row.classList.toggle('hidden', Boolean(mod && rMod !== mod));
      });
      return true;
    }

    if (e.target.id === 'word-style-select') {
      const tag = e.target.value || 'p';
      const wordCanvas = document.getElementById('doc-editor-word-canvas');
      if (wordCanvas) wordCanvas.focus();
      document.execCommand('formatBlock', false, tag);
      return true;
    }
    if (e.target.id === 'word-color-select') {
      const color = e.target.value || '#0f172a';
      const wordCanvas = document.getElementById('doc-editor-word-canvas');
      if (wordCanvas) wordCanvas.focus();
      document.execCommand('foreColor', false, color);
      return true;
    }

    // Edición en vivo del título H1 de página estilo Plane
    if (e.target.id === 'article-editable-title') {
      const newTitle = (e.target.value || '').trim() || 'Untitled';
      const docKey = this.currentActiveDocKey;
      if (!docKey) return true;
      const state = store.getState();
      const planeData = state.planeData || {};
      const pages = planeData.pages || [];
      const target = pages.find(p => (p.file_path || '').endsWith(docKey) || p.file_path === `knowledge/${docKey}`);
      if (target && !target.is_locked && !target.archived_at) {
        target.title = newTitle;
        await api.updatePlanePage(target.id, { title: newTitle });
        store.setState({ planeData: { ...planeData, pages: [...pages] } });
      }
      return true;
    }

    return false;
  }

  /**
   * Manejador de eventos submit delegados
   */
  async handleSubmit(e) {
    if (e.target.id === 'new-doc-form') {
      e.preventDefault();
      const filenameInput = document.getElementById('new-doc-filename');
      const moduleInput = document.getElementById('new-doc-module');
      const accessSelect = document.getElementById('new-doc-access');
      const contentInput = document.getElementById('new-doc-content');

      const rawFilename = (filenameInput?.value || '').trim() || 'untitled.md';
      const cleanDocKey = rawFilename.endsWith('.md') ? rawFilename : `${rawFilename}.md`;
      const moduleName = (moduleInput?.value || '').trim() || 'general';
      const access = Number(accessSelect?.value || 0);
      const safeTitle = cleanDocKey.replace(/\.md$/, '').replace(/[-_]/g, ' ');
      const content = (contentInput?.value || '').trim() || `# ${safeTitle}\n\n> [!NOTE] Nueva página creada en Plane Library.\n`;

      store.saveDoc(cleanDocKey, content);
      await api.createPlanePage({
        title: safeTitle,
        shelf: moduleName,
        access,
        file_path: `knowledge/${cleanDocKey}`,
        content_markdown: content
      });

      const modal = document.getElementById('new-doc-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
      await this.app.refreshData();
      this.openArticleView(cleanDocKey, false);
      return true;
    }

    if (e.target.id === 'create-collection-form') {
      e.preventDefault();
      const name = document.getElementById('col-form-name')?.value.trim();
      const description = document.getElementById('col-form-desc')?.value.trim() || '';
      const icon = document.getElementById('col-form-icon')?.value || 'folder';
      const color = document.getElementById('col-form-color')?.value || '#6366f1';
      const is_private = document.getElementById('col-form-private')?.checked ? 1 : 0;
      if (!name) return true;

      try {
        const res = await fetch('/api/plane/collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, icon, color, is_private })
        });
        if (res.ok) {
          const modal = document.getElementById('create-collection-modal');
          if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
          }
          if (this.app?.refreshData) await this.app.refreshData();
        }
      } catch (err) {
        console.warn('[COLLECTION] Error creando coleccion:', err);
      }
      return true;
    }
    return false;
  }

  /**
   * Motor de Filtrado y Ordenamiento de Páginas al estilo Plane (BR-PAGE-06)
   */
  applyLibraryFiltersAndSort() {
    const stateTab = this.kbStateTab || 'all';
    const accessTab = this.kbAccessTab || 'public';
    const shelfFilter = this.kbActiveShelfFilter || '';
    const query = (this.kbSearchQuery || '').trim().toLowerCase();
    const filterFav = Boolean(this.kbFilterFavorites);
    const filterLocked = Boolean(this.kbFilterLocked);
    const filterOwner = this.kbFilterOwner || '';
    const sortBy = this.kbSortBy || 'updated_at';
    const sortDir = this.kbSortDir || 'desc';

    let totalVisible = 0;

    // 1. Filtrar y ordenar filas de lista en #kb-shelves-container
    document.querySelectorAll('#kb-shelves-container .kb-shelf-section').forEach(section => {
      const shelfId = section.getAttribute('data-shelf-id') || '';
      const rowsContainer = section.querySelector('.kb-shelf-rows-list');
      const cards = Array.from(section.querySelectorAll('.kb-shelf-doc-card'));

      cards.sort((a, b) => {
        if (sortBy === 'name') {
          const nameA = (a.getAttribute('data-doc-title') || '').toLowerCase();
          const nameB = (b.getAttribute('data-doc-title') || '').toLowerCase();
          return sortDir === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        }
        if (sortBy === 'created_at') {
          const cA = new Date(a.getAttribute('data-page-created') || 0).getTime();
          const cB = new Date(b.getAttribute('data-page-created') || 0).getTime();
          return sortDir === 'asc' ? cA - cB : cB - cA;
        }
        const uA = new Date(a.getAttribute('data-page-updated') || 0).getTime();
        const uB = new Date(b.getAttribute('data-page-updated') || 0).getTime();
        return sortDir === 'asc' ? uA - uB : uB - uA;
      });

      if (rowsContainer) {
        cards.forEach(card => rowsContainer.appendChild(card));
      }

      let shelfVisible = 0;
      cards.forEach(card => {
        const isArchived = card.getAttribute('data-page-archived') === '1';
        const isPrivate = card.getAttribute('data-page-access') === '1';
        const isFav = card.getAttribute('data-page-favorite') === '1';
        const isLock = card.getAttribute('data-page-locked') === '1';
        const owner = card.getAttribute('data-page-owner') || '';
        const title = (card.getAttribute('data-doc-title') || '').toLowerCase();
        const key = (card.getAttribute('data-doc-key') || '').toLowerCase();
        const mod = (card.getAttribute('data-doc-module') || '').toLowerCase();

        let visible = true;
        if (stateTab === 'archived') {
          if (!isArchived) visible = false;
        } else if (stateTab === 'favorited') {
          if (isArchived || !isFav) visible = false;
        } else if (stateTab === 'created_by_me') {
          if (isArchived || (owner !== 'spec-author' && owner !== 'leader' && owner !== 'user-spec-author')) visible = false;
        } else {
          if (isArchived) visible = false;
        }

        if (visible && accessTab === 'private' && !isPrivate) visible = false;
        if (visible && accessTab === 'public' && isPrivate) visible = false;

        if (visible && shelfFilter && shelfId !== shelfFilter) {
          visible = false;
        }

        if (visible && filterFav && !isFav) visible = false;
        if (visible && filterLocked && !isLock) visible = false;
        if (visible && filterOwner && owner !== filterOwner) visible = false;

        if (visible && query) {
          if (!title.includes(query) && !key.includes(query) && !mod.includes(query) && !shelfId.toLowerCase().includes(query)) {
            visible = false;
          }
        }

        card.classList.toggle('hidden', !visible);
        if (visible) {
          shelfVisible++;
          totalVisible++;
        }
      });

      const countBadge = section.querySelector('.kb-shelf-visible-count');
      if (countBadge) countBadge.textContent = String(shelfVisible);
      section.classList.toggle('hidden', shelfVisible === 0);
    });

    // 2. Filtrar y ordenar tarjetas en #kb-pages-grid-container (Card / Gallery View)
    const gridContainer = document.getElementById('kb-pages-grid-container');
    if (gridContainer) {
      const gridCards = Array.from(gridContainer.querySelectorAll('.plane-page-card'));
      gridCards.sort((a, b) => {
        if (sortBy === 'name') {
          const nameA = (a.getAttribute('data-doc-title') || '').toLowerCase();
          const nameB = (b.getAttribute('data-doc-title') || '').toLowerCase();
          return sortDir === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        }
        if (sortBy === 'created_at') {
          const cA = new Date(a.getAttribute('data-page-created') || 0).getTime();
          const cB = new Date(b.getAttribute('data-page-created') || 0).getTime();
          return sortDir === 'asc' ? cA - cB : cB - cA;
        }
        const uA = new Date(a.getAttribute('data-page-updated') || 0).getTime();
        const uB = new Date(b.getAttribute('data-page-updated') || 0).getTime();
        return sortDir === 'asc' ? uA - uB : uB - uA;
      });

      gridCards.forEach(card => {
        gridContainer.appendChild(card);
        const isArchived = card.getAttribute('data-page-archived') === '1';
        const isPrivate = card.getAttribute('data-page-access') === '1';
        const isFav = card.getAttribute('data-page-favorite') === '1';
        const isLock = card.getAttribute('data-page-locked') === '1';
        const owner = card.getAttribute('data-page-owner') || '';
        const title = (card.getAttribute('data-doc-title') || '').toLowerCase();
        const key = (card.getAttribute('data-doc-key') || '').toLowerCase();
        const mod = (card.getAttribute('data-doc-module') || '').toLowerCase();
        const shelfId = card.getAttribute('data-doc-shelf') || '';

        let visible = true;
        if (stateTab === 'archived') {
          if (!isArchived) visible = false;
        } else if (stateTab === 'favorited') {
          if (isArchived || !isFav) visible = false;
        } else if (stateTab === 'created_by_me') {
          if (isArchived || (owner !== 'spec-author' && owner !== 'leader' && owner !== 'user-spec-author')) visible = false;
        } else {
          if (isArchived) visible = false;
        }

        if (visible && accessTab === 'private' && !isPrivate) visible = false;
        if (visible && accessTab === 'public' && isPrivate) visible = false;

        if (visible && shelfFilter && shelfId !== shelfFilter) visible = false;
        if (visible && filterFav && !isFav) visible = false;
        if (visible && filterLocked && !isLock) visible = false;
        if (visible && filterOwner && owner !== filterOwner) visible = false;

        if (visible && query) {
          if (!title.includes(query) && !key.includes(query) && !mod.includes(query) && !shelfId.toLowerCase().includes(query)) {
            visible = false;
          }
        }

        card.classList.toggle('hidden', !visible);
      });
    }

    const pinnedStrip = document.getElementById('kb-pinned-featured-strip');
    if (pinnedStrip) {
      pinnedStrip.classList.toggle('hidden', stateTab !== 'all' || accessTab !== 'public' || Boolean(query) || Boolean(shelfFilter));
    }

    const emptyState = document.getElementById('kb-empty-filter-state');
    if (emptyState) {
      emptyState.classList.toggle('hidden', totalVisible > 0);
      emptyState.classList.toggle('flex', totalVisible === 0);
    }

    const appliedBar = document.getElementById('kb-applied-filters-bar');
    const chipsContainer = document.getElementById('kb-applied-filters-chips');
    const activeChips = [];
    if (stateTab !== 'all') activeChips.push(`Tab: ${stateTab.toUpperCase()}`);
    if (accessTab !== 'public') activeChips.push(`Access: ${accessTab.toUpperCase()}`);
    if (shelfFilter) activeChips.push(`Shelf: ${shelfFilter}`);
    if (filterFav) activeChips.push('Favorite: Yes');
    if (filterLocked) activeChips.push('Locked: Yes');
    if (filterOwner) activeChips.push(`Created by: ${filterOwner}`);
    if (query) activeChips.push(`Query: "${query}"`);

    if (appliedBar && chipsContainer) {
      if (activeChips.length > 0) {
        appliedBar.classList.remove('hidden');
        appliedBar.classList.add('flex');
        chipsContainer.innerHTML = activeChips.map(c => `
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-mono text-[10px]">
            ${escapeHtml(c)}
          </span>
        `).join('');
      } else {
        appliedBar.classList.add('hidden');
        appliedBar.classList.remove('flex');
        chipsContainer.innerHTML = '';
      }
    }
  }

  /**
   * Actualiza el aspecto visual activo de los botones de modo de editor (Markdown / Bloques / Word)
   */
  updateEditorModeButtons(mode) {
    const mdBtn = document.getElementById('btn-editor-mode-md');
    const blocksBtn = document.getElementById('btn-editor-mode-blocks');
    const wordBtn = document.getElementById('btn-editor-mode-word');

    [mdBtn, blocksBtn, wordBtn].forEach(b => {
      b?.classList.remove('bg-indigo-600', 'text-white', 'shadow-2xs');
      b?.classList.add('text-gray-600', 'dark:text-zinc-400');
    });

    if (mode === 'word') {
      wordBtn?.classList.add('bg-indigo-600', 'text-white', 'shadow-2xs');
      wordBtn?.classList.remove('text-gray-600', 'dark:text-zinc-400');
    } else if (mode === 'blocks') {
      blocksBtn?.classList.add('bg-indigo-600', 'text-white', 'shadow-2xs');
      blocksBtn?.classList.remove('text-gray-600', 'dark:text-zinc-400');
    } else {
      mdBtn?.classList.add('bg-indigo-600', 'text-white', 'shadow-2xs');
      mdBtn?.classList.remove('text-gray-600', 'dark:text-zinc-400');
    }
  }

  /**
   * Navegación en documento: Desplazamiento interactivo suave a cualquier encabezado H1-H4
   */
  scrollToHeading(headingId) {
    if (!headingId) return;
    const cleanId = String(headingId).replace(/^#/, '').trim();
    const scrollContainer = document.getElementById('doc-reader-main-col');
    const bodyEl = document.getElementById('doc-active-body');
    if (!bodyEl) return;

    let targetEl = document.getElementById(cleanId);
    if (!targetEl) {
      const headings = Array.from(bodyEl.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      targetEl = headings.find(h => {
        const hId = h.id || h.getAttribute('id') || '';
        return hId === cleanId || hId.toLowerCase() === cleanId.toLowerCase() ||
          h.textContent.trim().toLowerCase().includes(cleanId.toLowerCase().replace(/-/g, ' '));
      });
    }

    if (targetEl) {
      if (scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        const scrollOffset = scrollContainer.scrollTop + (targetRect.top - containerRect.top) - 24;
        scrollContainer.scrollTo({ top: Math.max(0, scrollOffset), behavior: 'smooth' });
      } else {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Destello visual de localización
      targetEl.classList.add('bg-indigo-500/15', 'rounded', 'transition-all', 'duration-500');
      setTimeout(() => {
        targetEl.classList.remove('bg-indigo-500/15');
      }, 1500);

      // Resaltado de pestaña de Outline
      document.querySelectorAll('[data-action="scroll-to-heading"]').forEach(link => {
        const isMatch = (link.getAttribute('data-heading-id') || (link.getAttribute('href') || '').replace(/^#/, '')) === cleanId;
        link.classList.toggle('text-indigo-600', isMatch);
        link.classList.toggle('dark:text-indigo-400', isMatch);
        link.classList.toggle('font-bold', isMatch);
      });
    }
  }

  /**
   * Abre la vista editorial de un documento
   */
  openArticleView(docKey, openInEditor = false, skipScroll = false) {
    this.currentActiveDocKey = docKey;
    this.isArticleOpen = true;
    const state = store.getState();
    const planeData = state.planeData || {};
    const planePages = planeData.pages || [];
    const issues = (planeData.issues && planeData.issues.length > 0) ? planeData.issues : (state.features || []);
    const docs = state.knowledgeIndex?.docs || {};
    const meta = state.knowledgeIndex?.docMetadata?.[docKey] || {
      title: docKey,
      shelf: 'general',
      readingTime: 3,
      wordCount: 400
    };
    const matchedPlanePage = planePages.find(p => (p.file_path || '').endsWith(docKey) || p.file_path === `knowledge/${docKey}`) || {
      id: `page-kb-${docKey.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
      title: meta.title || docKey,
      file_path: `knowledge/${docKey}`,
      word_count: meta.wordCount || 400,
      reading_time_min: meta.readingTime || 3,
      is_locked: 1,
      is_favorite: docKey === 'c4-model.md' ? 1 : 0,
      access: 0,
      archived_at: null
    };
    const content = docs[docKey] || matchedPlanePage.content_markdown || '# Documento no disponible';

    const libView = document.getElementById('kb-view-library');
    const artView = document.getElementById('kb-view-article');
    const pathEl = document.getElementById('doc-active-path');
    const shelfBadge = document.getElementById('article-shelf-badge');
    const readingTimeBadge = document.getElementById('article-reading-time-badge');
    const bodyEl = document.getElementById('doc-active-body');
    const tocEl = document.getElementById('doc-active-toc');
    const wordsEl = document.getElementById('article-meta-words');
    const brEl = document.getElementById('article-meta-br');
    const rfEl = document.getElementById('article-meta-rf');
    const headerActionsEl = document.getElementById('article-plane-header-actions');
    const inspectorEl = document.getElementById('article-plane-inspector-container');
    const statusBannerEl = document.getElementById('article-status-banner');
    const floatingOutlineEl = document.getElementById('article-floating-outline-wrapper');

    const readerContainer = document.getElementById('doc-reader-view-container');
    const editorContainer = document.getElementById('doc-editor-view-container');
    const btnText = document.getElementById('btn-toggle-doc-text');
    const btnIcon = document.getElementById('btn-toggle-doc-icon');
    const textarea = document.getElementById('doc-editor-textarea');
    const livePreview = document.getElementById('doc-editor-live-preview');

    if (pathEl) pathEl.textContent = docKey;
    if (shelfBadge) shelfBadge.textContent = meta.shelf || 'Canónico';
    if (readingTimeBadge) readingTimeBadge.innerHTML = `<span class="inline-flex items-center gap-1">${Icons.clock('w-3 h-3')} <span>${meta.readingTime || 3} min</span></span>`;
    if (wordsEl) wordsEl.textContent = meta.wordCount || 0;
    if (brEl) brEl.textContent = meta.ruleCount || 0;
    if (rfEl) rfEl.textContent = meta.reqCount || 0;

    const titleInput = document.getElementById('article-editable-title');
    if (titleInput) {
      titleInput.value = meta.title || matchedPlanePage.title || docKey;
    }
    const updatedRel = document.getElementById('article-updated-relative');
    if (updatedRel) {
      updatedRel.textContent = formatTimeAgo(matchedPlanePage.updated_at || matchedPlanePage.created_at);
    }
    const visLabel = document.getElementById('article-visibility-label');
    if (visLabel) {
      visLabel.textContent = Number(matchedPlanePage.access || 0) === 1 ? 'Private' : 'Public';
    }
    const lockLabel = document.getElementById('article-lock-label');
    if (lockLabel) {
      lockLabel.textContent = matchedPlanePage.is_locked ? 'Locked' : 'Unlocked';
    }

    const toc = extractTableOfContents(content);
    if (bodyEl) bodyEl.innerHTML = enrichMarkdownWithSmartChips(renderMarkdown(stripFrontmatter(content)), issues);
    if (tocEl) {
      tocEl.innerHTML = renderTocHtml(toc);
    }
    if (headerActionsEl) {
      headerActionsEl.innerHTML = renderPageHeaderActions({
        activePage: matchedPlanePage,
        isFullWidth: Boolean(state.planePageFullWidth),
        showNavigationPane: state.planePageShowNavPane !== false,
        showAiMenu: Boolean(state.planePageShowAiMenu)
      });
    }
    if (statusBannerEl) {
      const isLocked = Boolean(matchedPlanePage.is_locked);
      const isArchived = Boolean(matchedPlanePage.archived_at);
      statusBannerEl.classList.toggle('hidden', !isLocked && !isArchived);
      statusBannerEl.classList.toggle('flex', isLocked || isArchived);
    }
    if (floatingOutlineEl) {
      floatingOutlineEl.innerHTML = state.planePageShowNavPane === false ? renderFloatingOutlineBars(toc) : '';
    }
    if (inspectorEl) {
      inspectorEl.innerHTML = PageNavigationPane({
        page: matchedPlanePage,
        content,
        toc,
        activeTab: state.planePageNavTab || 'outline',
        issues,
        pages: planePages
      });
    }

    if (textarea) textarea.value = content;
    if (livePreview) livePreview.innerHTML = renderMarkdown(content);
    const wordCanvas = document.getElementById('doc-editor-word-canvas');
    if (wordCanvas) wordCanvas.innerHTML = renderMarkdown(content);

    if (openInEditor) {
      readerContainer?.classList.add('hidden');
      editorContainer?.classList.remove('hidden');
      if (btnText) btnText.textContent = 'Modo Lectura';
      if (btnIcon) btnIcon.innerHTML = Icons.eye('w-3.5 h-3.5');
      this.setupSynchronizedScroll();
    } else {
      editorContainer?.classList.add('hidden');
      readerContainer?.classList.remove('hidden');
      if (btnText) btnText.textContent = 'Modo Editor';
      if (btnIcon) btnIcon.innerHTML = Icons.edit('w-3.5 h-3.5');
    }

    libView?.classList.add('hidden');
    artView?.classList.remove('hidden');

    this.app.initMermaidDiagrams();
    if (!skipScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Sincronización de scroll entre textarea y live preview
   */
  setupSynchronizedScroll() {
    const textarea = document.getElementById('doc-editor-textarea');
    const preview = document.getElementById('doc-editor-live-preview');
    if (!textarea || !preview) return;

    textarea.onscroll = () => {
      if (this.isScrollingFromPreview) return;
      this.isScrollingFromEditor = true;
      const scrollMaxTextarea = textarea.scrollHeight - textarea.clientHeight;
      const scrollMaxPreview = preview.scrollHeight - preview.clientHeight;
      if (scrollMaxTextarea > 0 && scrollMaxPreview > 0) {
        const ratio = textarea.scrollTop / scrollMaxTextarea;
        preview.scrollTop = ratio * scrollMaxPreview;
      }
      clearTimeout(this.scrollResetTimer);
      this.scrollResetTimer = setTimeout(() => { this.isScrollingFromEditor = false; }, 60);
    };

    preview.onscroll = () => {
      if (this.isScrollingFromEditor) return;
      this.isScrollingFromPreview = true;
      const scrollMaxTextarea = textarea.scrollHeight - textarea.clientHeight;
      const scrollMaxPreview = preview.scrollHeight - preview.clientHeight;
      if (scrollMaxTextarea > 0 && scrollMaxPreview > 0) {
        const ratio = preview.scrollTop / scrollMaxPreview;
        textarea.scrollTop = ratio * scrollMaxTextarea;
      }
      clearTimeout(this.scrollResetTimer);
      this.scrollResetTimer = setTimeout(() => { this.isScrollingFromPreview = false; }, 60);
    };
  }

  /**
   * Renderizado de bloques visuales para ContextForge
   */
  renderVisualBlocks(blocks = []) {
    const container = document.getElementById('doc-editor-blocks-container');
    if (!container) return;

    if (!blocks || blocks.length === 0) {
      container.innerHTML = `
        <div class="p-8 rounded-2xl border border-dashed border-zinc-800 text-center text-zinc-500 text-xs">
          Sin bloques de contenido aún. Añade uno con la barra superior de acciones.
        </div>
      `;
      return;
    }

    container.innerHTML = blocks.map((b, idx) => {
      const typeLabel = getBlockTypeLabel(b.type);
      return `
        <div class="visual-block-card rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-xs space-y-3"
             data-block-id="${b.id}"
             data-block-index="${idx}">
          <div class="flex items-center justify-between text-xs font-mono pb-2 border-b border-zinc-800">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-md bg-indigo-950/60 text-indigo-400 font-bold text-[10px]">
                ${typeLabel}
              </span>
              <span class="text-zinc-500 text-[10px]">Bloque #${idx + 1}</span>
            </div>
            <div class="flex items-center gap-1">
              <button type="button" data-block-action="move-up" class="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200" title="Subir">
                ${Icons.chevronUp('w-3.5 h-3.5')}
              </button>
              <button type="button" data-block-action="move-down" class="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200" title="Bajar">
                ${Icons.chevronDown('w-3.5 h-3.5')}
              </button>
              <button type="button" data-block-action="delete" class="p-1 rounded hover:bg-rose-950/50 text-zinc-400 hover:text-rose-400" title="Eliminar">
                ${Icons.trash('w-3.5 h-3.5')}
              </button>
            </div>
          </div>
          <div class="space-y-2">
            ${b.type === 'header' ? `
              <input type="text" class="w-full text-base font-bold bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white" value="${escapeAttr(b.text)}" placeholder="Título..." />
            ` : `
              <textarea rows="3" class="w-full text-xs bg-zinc-950 border border-zinc-800 rounded-xl p-3 font-mono text-white">${escapeHtml(Array.isArray(b.lines) ? b.lines.join('\n') : (b.text || (Array.isArray(b.content) ? b.content.join('\n') : '')))}</textarea>
            `}
          </div>
        </div>
      `;
    }).join('');
  }
}
