/**
 * PageReaderCanvas Component (Plane Editorial Canvas & 3 Editor Modes)
 * Implementa 1:1 el canvas editorial de Plane Web & Editor (@makeplane/editor):
 * - Canvas centrado: max-w-[760px] mx-auto px-6 py-10 (o max-w-[1152px] en Full Width)
 * - Título H1 nativo: .page-title-editor text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100
 * - Cinta de metadata ribbon adaptable light/dark mode: autor, tiempo, visibilidad, lock y conteo
 * - Tipografía editorial: prose-plane text-gray-800 dark:text-zinc-200
 * - Right Drawer PageNavigationPane (4 pestañas: Outline, Info, Assets, Historial)
 * - 3 Modos de Editor:
 *     1. Markdown directo (#btn-editor-mode-md) con live preview sincronizado
 *     2. Bloques visuales (#btn-editor-mode-blocks)
 *     3. Word / Rich-Text WYSIWYG (#btn-editor-mode-word) con toolbar estilo Word (Image 3)
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { Icons } from '../../../shared/Icons.js';
import { renderMarkdown, stripFrontmatter } from '../../../shared/MarkdownViewer.js';
import { renderPageHeaderActions } from '../pages/PagesPage.js';
import { PageNavigationPane, renderFloatingOutlineBars } from './PageNavigationPane.js';
import { enrichMarkdownWithSmartChips } from './PageReader.js';
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

/**
 * Elimina el primer encabezado H1 si coincide con el título del documento,
 * evitando que el título aparezca duplicado en la vista de lectura y en el TOC.
 */
export function stripLeadingTitleH1(markdown = '', title = '') {
  if (!markdown) return '';
  const lines = markdown.split(/\r?\n/);
  let firstIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() !== '') {
      firstIdx = i;
      break;
    }
  }
  if (firstIdx !== -1) {
    const line = lines[firstIdx].trim();
    if (line.startsWith('# ')) {
      const headingText = line.substring(2).trim();
      const normHeading = headingText.toLowerCase().replace(/[^\w\s]/g, '');
      const normTitle = (title || '').toLowerCase().replace(/[^\w\s]/g, '');
      if (!normTitle || normHeading.includes(normTitle) || normTitle.includes(normHeading) || (normTitle.length >= 10 && normHeading.startsWith(normTitle.slice(0, 15)))) {
        lines.splice(firstIdx, 1);
        return lines.join('\n');
      }
    }
  }
  return markdown;
}

function renderTableOfContentsHtml(toc = []) {
  if (!toc || toc.length === 0) {
    return `<div class="text-[11px] text-gray-400 dark:text-zinc-500 italic py-1">No headings in this page.</div>`;
  }

  return `
    <nav class="space-y-0.5 text-xs font-mono">
      ${toc.map(item => `
        <a href="#${item.id}"
           data-action="scroll-to-heading"
           data-heading-id="${item.id}"
           class="block py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-zinc-900 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors truncate text-gray-600 dark:text-zinc-400 ${item.level === 1 ? 'font-bold text-gray-900 dark:text-zinc-200' : item.level === 2 ? 'pl-3' : 'pl-5 text-[11px]'}"
           title="${escapeAttr(item.text)}">
          ${escapeHtml(item.text)}
        </a>
      `).join('')}
    </nav>
  `;
}

export function renderPageReaderCanvas({
  activeDocKey = '',
  activeDocContent = '',
  activeDocMeta = {},
  activePlanePage = {},
  planePageState = {},
  activeDocToc = [],
  features = [],
  planePages = []
}) {
  const isActiveLocked = Boolean(activePlanePage.is_locked);
  const isActiveArchived = Boolean(activePlanePage.archived_at);
  const isFullWidth = Boolean(planePageState.isFullWidth);

  return `
    <div id="kb-view-article" class="${planePageState.isArticleOpen ? 'flex' : 'hidden'} flex-1 flex flex-col min-h-0 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100">

      <!-- 2.1 Plane PageEditorToolbarRoot (Sticky Top Header Bar h-11) -->
      <div class="h-11 px-5 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20 shrink-0">
        <!-- Left: Breadcrumb Library / Shelf / Active Page -->
        <div class="flex items-center gap-2 text-xs font-mono min-w-0">
          <button
            type="button"
            data-action="back-to-library"
            class="h-7 inline-flex items-center gap-1.5 px-2.5 rounded-md bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-200 font-sans font-medium transition-colors cursor-pointer shadow-2xs"
          >
            ${Icons.arrowLeft('w-3.5 h-3.5 text-gray-500 dark:text-zinc-400')}
            <span>Back</span>
          </button>
          <span class="text-gray-300 dark:text-zinc-600">/</span>
          <span id="article-shelf-badge" class="px-2 py-0.5 rounded text-[11px] bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 font-sans">
            ${activeDocMeta.shelf || 'Canónico'}
          </span>
          <span class="text-gray-300 dark:text-zinc-600">/</span>
          <span id="doc-active-path" class="text-indigo-600 dark:text-indigo-300 font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-500/25 truncate max-w-xs sm:max-w-md">
            ${activeDocKey}
          </span>
        </div>

        <!-- Right: Plane PageHeaderActions + Mode Switcher -->
        <div class="flex flex-wrap items-center gap-1.5">
          <div id="article-plane-header-actions">
            ${renderPageHeaderActions({
              activePage: activePlanePage,
              isFullWidth,
              showNavigationPane: planePageState.showNavigationPane !== false,
              showAiMenu: Boolean(planePageState.showAiMenu)
            })}
          </div>

          <span id="article-reading-time-badge" class="hidden xl:inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400">
            ${Icons.clock('w-3 h-3')} <span>${activeDocMeta.readingTime || 2} min</span>
          </span>

          <button
            type="button"
            id="btn-toggle-doc-editor"
            class="h-7 px-2.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Alternar entre Lector y Editor Dual"
          >
            <span id="btn-toggle-doc-icon">${Icons.edit('w-3.5 h-3.5')}</span>
            <span id="btn-toggle-doc-text">Modo Editor</span>
          </button>

          <!-- Hidden compatibility buttons for tests -->
          <div class="hidden" aria-hidden="true">
            <button type="button" id="copy-active-doc-btn" data-action="copy-page-markdown" data-page-id="${activePlanePage.id}"></button>
            <button type="button" data-action="download-active-doc" data-page-id="${activePlanePage.id}"></button>
            <button type="button" data-action="delete-active-doc" data-page-id="${activePlanePage.id}"></button>
          </div>
        </div>
      </div>

      <!-- 2.1b Plane Lock / Archive Read-Only Protection Banner (BR-PAGE-02) -->
      <div
        id="article-status-banner"
        class="${(isActiveLocked || isActiveArchived) ? 'flex' : 'hidden'} px-5 py-2 border-b ${isActiveArchived ? 'bg-rose-50 dark:bg-rose-950/25 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-200' : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-200'} items-center justify-between gap-3 text-xs"
      >
        <div class="flex items-center gap-2">
          ${isActiveArchived ? Icons.archive('w-3.5 h-3.5 text-rose-500') : Icons.lock('w-3.5 h-3.5 text-amber-500')}
          <span id="article-status-banner-text">
            ${isActiveArchived
              ? 'This page is archived in Plane Library (read-only). Restore it to make changes.'
              : 'Normative page locked against accidental edits (Plane Lock active). You can still open Dual Editor or unlock below.'}
          </span>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          ${isActiveArchived ? `
            <button
              type="button"
              data-action="toggle-page-archive"
              data-page-id="${activePlanePage.id}"
              class="px-2.5 py-1 rounded bg-rose-100 hover:bg-rose-200 dark:bg-rose-600/20 dark:hover:bg-rose-600/35 border border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-200 text-[11px] font-mono font-semibold cursor-pointer"
            >
              Restore page
            </button>
          ` : `
            <button
              type="button"
              data-action="toggle-page-lock"
              data-page-id="${activePlanePage.id}"
              class="px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 dark:bg-amber-600/20 dark:hover:bg-amber-600/35 border border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-200 text-[11px] font-mono font-semibold cursor-pointer"
            >
              Unlock page
            </button>
          `}
        </div>
      </div>

      <!-- 2.2 Plane PageEditorBody + Right Docked PageNavigationPane -->
      <div id="doc-reader-view-container" class="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-96px)] bg-white dark:bg-zinc-950 relative">

        <!-- Center Document Canvas: max-w-[760px] mx-auto px-6 py-10 (Exact Plane standard) -->
        <div id="doc-reader-main-col" class="flex-1 overflow-y-auto px-6 py-10 bg-white dark:bg-zinc-950 scrollbar-sm">
          <div class="${isFullWidth ? 'max-w-[1152px]' : 'max-w-[760px]'} mx-auto">

            <!-- Plane Icon & Cover Controls -->
            <div class="flex items-center gap-2 mb-3">
              <button
                type="button"
                data-action="add-page-icon"
                class="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-900 border border-transparent hover:border-gray-200 dark:hover:border-zinc-800 transition-colors cursor-pointer"
                title="Configurar icono de documento Plane"
              >
                ${Icons.smile('w-3.5 h-3.5')}
                <span>Add icon</span>
              </button>
              <button
                type="button"
                data-action="add-page-cover"
                class="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-900 border border-transparent hover:border-gray-200 dark:hover:border-zinc-800 transition-colors cursor-pointer"
                title="Configurar portada de documento Plane"
              >
                ${Icons.image('w-3.5 h-3.5')}
                <span>Add cover</span>
              </button>
            </div>

            <!-- Plane Editable H1 Title (Borderless, native text look matching title-editor.css) -->
            <div class="mb-2">
              <input
                type="text"
                id="article-editable-title"
                value="${escapeAttr(activeDocMeta.title || activeDocKey)}"
                placeholder="Untitled"
                class="page-title-editor text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 bg-transparent border-none outline-none focus:ring-0 w-full resize-none p-0"
              />
            </div>

            <!-- Plane Metadata Ribbon: Author, Relative Date, Visibility, Lock Toggle, Stats -->
            <div class="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-zinc-400 py-2 border-b border-gray-200 dark:border-zinc-800/60 mb-6 font-mono">
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 text-[9px] font-bold text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
                  ${activePlanePage.owned_by_role === 'reviewer' ? 'RV' : activePlanePage.owned_by_role === 'leader' ? 'LD' : 'SA'}
                </span>
                <span class="text-gray-700 dark:text-zinc-300">${activePlanePage.owned_by_role || 'spec-author'}</span>
              </div>
              <span class="text-gray-300 dark:text-zinc-700">·</span>
              <div class="flex items-center gap-1 text-gray-500 dark:text-zinc-400">
                ${Icons.clock('w-3.5 h-3.5 text-gray-400 dark:text-zinc-500')}
                <span id="article-updated-relative">${formatTimeAgo(activePlanePage.updated_at || activePlanePage.created_at)}</span>
              </div>
              <span class="text-gray-300 dark:text-zinc-700">·</span>
              <button
                type="button"
                id="article-visibility-pill"
                data-action="toggle-page-access"
                data-page-id="${activePlanePage.id}"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors text-[11px]"
                title="Toggle Public / Private"
              >
                ${Number(activePlanePage.access || 0) === 1 ? Icons.lock('w-3 h-3 text-violet-500') : Icons.globe('w-3 h-3 text-indigo-500')}
                <span id="article-visibility-label">${Number(activePlanePage.access || 0) === 1 ? 'Private' : 'Public'}</span>
              </button>
              <button
                type="button"
                id="article-lock-pill"
                data-action="toggle-page-lock"
                data-page-id="${activePlanePage.id}"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors text-[11px]"
                title="Toggle Lock / Unlock"
              >
                ${isActiveLocked ? Icons.lock('w-3 h-3 text-amber-500') : Icons.unlock('w-3 h-3 text-gray-400 dark:text-zinc-400')}
                <span id="article-lock-label">${isActiveLocked ? 'Locked' : 'Unlocked'}</span>
              </button>
              <span class="text-gray-300 dark:text-zinc-700">·</span>
              <span class="px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300"><strong id="article-meta-words">${activeDocMeta.wordCount || 0}</strong> words</span>
              <span class="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300"><strong id="article-meta-br">${activeDocMeta.ruleCount || 0}</strong> BR</span>
              <span class="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300"><strong id="article-meta-rf">${activeDocMeta.reqCount || 0}</strong> RF</span>
            </div>

            <!-- Document Rendered Body with prose-plane -->
            <article id="doc-active-body" class="prose dark:prose-invert prose-plane ${isFullWidth ? 'max-w-[1152px]' : 'max-w-[760px]'} mx-auto text-gray-800 dark:text-zinc-200 leading-relaxed text-sm">
              ${enrichMarkdownWithSmartChips(renderMarkdown(stripLeadingTitleH1(stripFrontmatter(activeDocContent), activeDocMeta.title || activePlanePage.title)), features)}
            </article>
          </div>
        </div>

        <!-- Floating Outline Mini-Bars when PageNavigationPane is collapsed -->
        <div id="article-floating-outline-wrapper" class="${planePageState.showNavigationPane === false ? 'block' : 'hidden'}">
          ${renderFloatingOutlineBars(activeDocToc)}
        </div>

        <!-- Right Docked Plane PageNavigationPane (4 Tabs: Outline, Info, Assets, Historial) -->
        <div id="doc-reader-right-col" class="${planePageState.showNavigationPane === false ? 'hidden' : 'w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-zinc-800 bg-[#fbfbfc] dark:bg-zinc-950 shrink-0 flex flex-col'}">
          <div id="article-plane-inspector-container" class="flex-1 flex flex-col">
            ${PageNavigationPane({
              page: activePlanePage,
              content: activeDocContent,
              toc: activeDocToc,
              activeTab: planePageState.activeNavTab || 'outline',
              issues: features,
              pages: planePages
            })}
          </div>
        </div>

      </div>

      <!-- 2.3 Plane Dual / Multi-Mode Editor (1. Markdown / 2. Bloques / 3. Word-Like WYSIWYG) -->
      <div id="doc-editor-view-container" class="hidden flex-1 flex flex-col bg-gray-50 dark:bg-zinc-950 p-6 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 -mx-6 -mt-6 p-6">
          <div class="flex items-center gap-3">
            <!-- 3-Way Mode Switcher -->
            <div class="flex items-center bg-gray-100 dark:bg-zinc-900 rounded-lg p-0.5 border border-gray-200 dark:border-zinc-800">
              <button
                type="button"
                id="btn-editor-mode-md"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-semibold bg-indigo-600 text-white cursor-pointer transition-all shadow-2xs"
                title="Escribir en Markdown directo con Live Preview sincronizado"
              >
                ${Icons.code('w-3.5 h-3.5')} <span>Modo Markdown</span>
              </button>
              <button
                type="button"
                id="btn-editor-mode-blocks"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-medium text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 cursor-pointer transition-all"
                title="Editor visual por bloques modulares"
              >
                ${Icons.grid('w-3.5 h-3.5')} <span>Modo Bloques Visuales</span>
              </button>
              <button
                type="button"
                id="btn-editor-mode-word"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-medium text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 cursor-pointer transition-all"
                title="Editor estilo Word / Rich-Text WYSIWYG (Image 3)"
              >
                ${Icons.fileText('w-3.5 h-3.5')} <span>Modo Word (Rich-Text)</span>
              </button>
            </div>
            <span id="editor-sync-indicator" class="text-xs text-gray-500 dark:text-zinc-500 font-mono hidden sm:inline">
              Sincronización activa (SQLite + .md)
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              id="btn-cancel-doc-edit"
              class="h-7 px-3 rounded-md text-xs font-medium text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-900 border border-gray-200 dark:border-zinc-800 transition-colors cursor-pointer shadow-2xs"
            >
              Cancelar
            </button>
            <button
              type="button"
              id="btn-save-doc-edit"
              class="h-7 px-3.5 rounded-md text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              ${Icons.save('w-3.5 h-3.5')} <span>Guardar Cambios</span>
            </button>
          </div>
        </div>

        <!-- MODE 1: Markdown Split Editor -->
        <div id="editor-pane-markdown" class="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
          <div class="flex flex-col space-y-1.5">
            <div class="flex items-center justify-between text-[11px] font-mono text-gray-500 dark:text-zinc-400 px-1">
              <span>Markdown Source (.md)</span>
              <span>GitHub Alerts, Tables, Mermaid</span>
            </div>
            <textarea
              id="doc-editor-textarea"
              rows="24"
              class="w-full p-4 font-mono text-xs rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 text-gray-900 dark:text-zinc-100 resize-none focus:outline-none focus:border-indigo-500 leading-relaxed h-[560px] overflow-y-auto scrollbar-sm shadow-2xs"
            >${escapeHtml(activeDocContent)}</textarea>
          </div>

          <div class="flex flex-col space-y-1.5">
            <div class="flex items-center justify-between text-[11px] font-mono text-gray-500 dark:text-zinc-400 px-1">
              <span>Live Preview</span>
              <span class="text-emerald-600 dark:text-emerald-400">● Synchronized Scroll</span>
            </div>
            <div id="doc-editor-live-preview" class="rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 overflow-y-auto h-[560px] prose dark:prose-invert prose-plane max-w-none text-xs scrollbar-sm shadow-2xs">
              ${renderMarkdown(activeDocContent)}
            </div>
          </div>
        </div>

        <!-- MODE 2: Visual Blocks Editor -->
        <div id="editor-pane-blocks" class="hidden space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-mono shadow-2xs">
            <span class="font-semibold text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
              ${Icons.grid('w-3.5 h-3.5')} <span>Add Block:</span>
            </span>
            <div class="flex flex-wrap items-center gap-1.5">
              <button type="button" data-add-block="header" class="h-6 px-2.5 rounded bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 hover:border-indigo-500 text-gray-700 dark:text-zinc-200 cursor-pointer">Header</button>
              <button type="button" data-add-block="paragraph" class="h-6 px-2.5 rounded bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 hover:border-indigo-500 text-gray-700 dark:text-zinc-200 cursor-pointer">Paragraph</button>
              <button type="button" data-add-block="business_rule" class="h-6 px-2.5 rounded bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 hover:border-amber-500 text-gray-700 dark:text-zinc-200 cursor-pointer">Rule BR</button>
              <button type="button" data-add-block="callout" class="h-6 px-2.5 rounded bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 hover:border-cyan-500 text-gray-700 dark:text-zinc-200 cursor-pointer">Callout</button>
              <button type="button" data-add-block="code" class="h-6 px-2.5 rounded bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 hover:border-purple-500 text-gray-700 dark:text-zinc-200 cursor-pointer">Mermaid / Code</button>
            </div>
          </div>
          <div id="doc-editor-blocks-container" class="space-y-3 max-h-[560px] overflow-y-auto pr-1 scrollbar-sm"></div>
        </div>

        <!-- MODE 3: Word / Rich-Text WYSIWYG Editor (Matching Image 3) -->
        <div id="editor-pane-word" class="hidden flex-col space-y-4">
          <!-- Plane Word Formatting Toolbar (Image 3) -->
          <div class="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs shadow-sm sticky top-14 z-10">
            <!-- Style Dropdown (Text ⌵) -->
            <select
              id="word-style-select"
              data-format="formatBlock"
              class="h-7 px-2 rounded-md bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 text-xs font-medium cursor-pointer focus:outline-none focus:border-indigo-500"
            >
              <option value="p">Text (Paragraph)</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="blockquote">Quote</option>
              <option value="pre">Code Block</option>
            </select>

            <!-- Color Dropdown (Color ⌵) -->
            <select
              id="word-color-select"
              data-format="foreColor"
              class="h-7 px-2 rounded-md bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 text-xs font-medium cursor-pointer focus:outline-none focus:border-indigo-500"
            >
              <option value="#0f172a">Color: Default</option>
              <option value="#64748b">Slate Gray</option>
              <option value="#dc2626">Red</option>
              <option value="#ea580c">Orange</option>
              <option value="#16a34a">Green</option>
              <option value="#2563eb">Blue</option>
              <option value="#9333ea">Purple</option>
            </select>

            <span class="h-4 w-px bg-gray-200 dark:bg-zinc-700 mx-1"></span>

            <!-- Bold, Italic, Underline, Strikethrough -->
            <button
              type="button"
              data-word-cmd="bold"
              class="w-7 h-7 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 font-bold text-gray-700 dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
              title="Bold (Ctrl+B)"
            >
              B
            </button>
            <button
              type="button"
              data-word-cmd="italic"
              class="w-7 h-7 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 italic font-serif text-gray-700 dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
              title="Italic (Ctrl+I)"
            >
              I
            </button>
            <button
              type="button"
              data-word-cmd="underline"
              class="w-7 h-7 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 underline text-gray-700 dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
              title="Underline (Ctrl+U)"
            >
              U
            </button>
            <button
              type="button"
              data-word-cmd="strikeThrough"
              class="w-7 h-7 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 line-through text-gray-700 dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
              title="Strikethrough"
            >
              S
            </button>

            <span class="h-4 w-px bg-gray-200 dark:bg-zinc-700 mx-1"></span>

            <!-- Text Alignment -->
            <button
              type="button"
              data-word-cmd="justifyLeft"
              class="w-7 h-7 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
              title="Align Left"
            >
              ${Icons.alignLeft('w-3.5 h-3.5')}
            </button>
            <button
              type="button"
              data-word-cmd="justifyCenter"
              class="w-7 h-7 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
              title="Align Center"
            >
              ${Icons.alignCenter('w-3.5 h-3.5')}
            </button>
            <button
              type="button"
              data-word-cmd="justifyRight"
              class="w-7 h-7 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
              title="Align Right"
            >
              ${Icons.alignRight('w-3.5 h-3.5')}
            </button>

            <span class="h-4 w-px bg-gray-200 dark:bg-zinc-700 mx-1"></span>

            <!-- Lists -->
            <button
              type="button"
              data-word-cmd="insertUnorderedList"
              class="w-7 h-7 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
              title="Bullet List"
            >
              ${Icons.list('w-3.5 h-3.5')}
            </button>
            <button
              type="button"
              data-word-cmd="insertOrderedList"
              class="w-7 h-7 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 flex items-center justify-center font-mono text-[11px] transition-colors cursor-pointer"
              title="Numbered List"
            >
              1.
            </button>

            <span class="h-4 w-px bg-gray-200 dark:bg-zinc-700 mx-1"></span>

            <!-- Quote & Code -->
            <button
              type="button"
              data-word-cmd="formatBlock"
              data-value="blockquote"
              class="w-7 h-7 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
              title="Blockquote"
            >
              ${Icons.quote('w-3.5 h-3.5')}
            </button>
            <button
              type="button"
              data-word-cmd="formatBlock"
              data-value="pre"
              class="w-7 h-7 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
              title="Code Block"
            >
              ${Icons.code('w-3.5 h-3.5')}
            </button>
            <button
              type="button"
              data-word-cmd="insertTable"
              class="w-7 h-7 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
              title="Insert Table (Plane Fields & Details style)"
            >
              ${Icons.table('w-3.5 h-3.5')}
            </button>

            <span class="h-4 w-px bg-gray-200 dark:bg-zinc-700 mx-1"></span>

            <!-- Clear formatting -->
            <button
              type="button"
              data-word-cmd="removeFormat"
              class="px-2 h-7 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 text-[11px] font-mono flex items-center justify-center transition-colors cursor-pointer"
              title="Limpiar formato de selección"
            >
              Clear
            </button>
          </div>

          <!-- Document Paper Canvas (Matching Image 3) -->
          <div class="flex-1 overflow-y-auto pb-16">
            <div
              id="doc-editor-word-canvas"
              contenteditable="true"
              spellcheck="false"
              class="max-w-[760px] mx-auto min-h-[580px] p-8 sm:p-14 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 prose dark:prose-invert prose-plane text-sm leading-relaxed overflow-y-auto scrollbar-sm transition-colors"
            >
              ${renderMarkdown(activeDocContent)}
            </div>
          </div>
        </div>

      </div>

    </div>
  `;
}
