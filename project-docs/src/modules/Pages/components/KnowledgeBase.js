import { Icons } from '../../../shared/Icons.js';
import { renderBadge } from '../../../shared/Badge.js';
import { renderMarkdown, extractTableOfContents, parseMarkdownToBlocks, blocksToMarkdown } from '../../../shared/MarkdownViewer.js';
import { PagesPage, renderPageHeaderActions } from '../pages/PagesPage.js';
import { PageNavigationPane, renderFloatingOutlineBars } from './PageNavigationPane.js';
import { enrichMarkdownWithSmartChips } from './PageReader.js';

/**
 * KnowledgeBaseComponent (Plane Library / PagesListView & PageRoot)
 * Implementa 1:1 la arquitectura, flujos, reglas de negocio y UI/UX de Plane Library (@makeplane/propel):
 *  - PagesListHeaderRoot:
 *      * Pestañas de ciclo de vida y visibilidad de Plane: Public (access=0), Private (access=1), Archived (archived_at!=null)
 *      * Perspectivas de ingeniería soberana: Modules (DDD), Master Bundle, Split Workspace, Rules & Contracts
 *      * Buscador reactivo, selector de ordenamiento Plane (OrderBy: Updated / Created / Name + Asc/Desc),
 *        popover de Filtros (Favorites, Locked, Owner Bot) y acciones rápidas (Add page, Import, Export, AI Context).
 *  - PageAppliedFiltersList: Barra de filtros aplicados con chips removibles y botón Clear all.
 *  - PageListBlock & BlockItemAction: Filas de alta densidad con icono vectorial, título (fallback Untitled),
 *    ruta .md, chips semánticos (BR, RF, ADR, Diagramas), Access toggle (Public/Private), Lock toggle,
 *    Owner Bot Avatar, estrella de Favorito y menú contextual (...) con las reglas de negocio de Plane:
 *      * BR-PAGE-01: Fallback "Untitled" para páginas sin título.
 *      * BR-PAGE-02: Bloqueo de edición cuando is_locked=1 o archived_at!=null con banner informativo.
 *      * BR-PAGE-03: Archivar una página desmarca automáticamente is_favorite=0.
 *      * BR-PAGE-04: Cambio de acceso (Public/Private) solo permitido cuando la página no está archivada;
 *                    eliminación habilitada al archivar o mediante confirmación explícita.
 *      * BR-PAGE-05: Duplicación (Make a copy) en SQLite + espejo .md.
 *  - PageRoot (#kb-view-article): Lienzo editorial centrado (max-w-[720px] o Full-Width max-w-[1152px]),
 *    PageEditorToolbarRoot sticky, banner de estado Lock/Archive, Smart Entity Chips (INT-XXX, BR-XXX, RF-XXX),
 *    PageNavigationPane de 4 pestañas acoplado a la derecha y Floating Outline Bars cuando el panel se oculta.
 *
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */

export function getPageName(title = '') {
  return (!title || !String(title).trim()) ? 'Untitled' : String(title).trim();
}

export function renderKnowledgeBase({ knowledgeIndex, projectSpec, features = [], planePages = [], planePageState = {} }) {
  const kData = knowledgeIndex || getFallbackKnowledge();
  const rules = kData.business_rules || [];
  const services = kData.external_services || [];
  const standards = kData.coding_standards || {};
  const guardrails = standards.guardrails || [];
  const naming = standards.naming_conventions || {};
  const docs = kData.docs || getDefaultDocs();
  const docMetadata = kData.docMetadata || buildDocMetadataFallback(docs);
  const shelvesData = kData.shelves || buildShelvesFallback(docMetadata);
  const modulesData = kData.modulesData || buildModulesDataFallback(docMetadata);

  const docKeys = Object.keys(docs);
  const activeDocKey = docKeys.includes('c4-model.md')
    ? 'c4-model.md'
    : (docKeys.includes('coding-standards.md') ? 'coding-standards.md' : (docKeys[0] || ''));
  const activeDocContent = docs[activeDocKey] || '# Documento no disponible';
  const activeDocMeta = docMetadata[activeDocKey] || {
    title: activeDocKey,
    shelf: 'general',
    readingTime: 3,
    wordCount: 450,
    ruleCount: 0,
    reqCount: 0,
    adrCount: 0
  };

  const moduleNames = Array.from(new Set([
    ...(projectSpec?.modules?.map(m => m.name) || []),
    ...Object.keys(modulesData),
    ...Object.values(docMetadata).filter(d => d.moduleName).map(d => d.moduleName),
    ...rules.map(r => r.module)
  ])).filter(Boolean);

  const heroDocKey = docKeys.includes('c4-model.md')
    ? 'c4-model.md'
    : (docKeys.includes('coding-standards.md') ? 'coding-standards.md' : (docKeys[0] || ''));
  const heroDocMeta = docMetadata[heroDocKey] || activeDocMeta;

  const masterDocKey = 'MASTER-PROJECT-KNOWLEDGE.md';
  const masterDocMeta = docMetadata[masterDocKey] || {
    title: 'Megadocumento Maestro Consolidado (Single-File Context Bundle)',
    wordCount: 8200,
    readingTime: 35
  };

  const activeDocToc = extractTableOfContents(activeDocContent);
  const dynamicAiPrompt = buildAiSystemPrompt({ projectSpec, kData, rules, services, guardrails, naming });

  const findPlanePage = (docKey, meta = {}) => {
    return planePages.find(p => (p.file_path || '').endsWith(docKey) || p.file_path === `knowledge/${docKey}`) || {
      id: `page-kb-${String(docKey).replace(/[^a-zA-Z0-9_-]/g, '_')}`,
      title: getPageName(meta.title || docKey),
      file_path: `knowledge/${docKey}`,
      word_count: meta.wordCount || 450,
      reading_time_min: meta.readingTime || 3,
      diagrams_count: meta.diagramsCount || 0,
      owned_by_role: 'spec-author',
      access: 0,
      is_locked: 1,
      is_favorite: docKey === 'c4-model.md' ? 1 : 0,
      archived_at: null,
      created_at: '2026-11-01T10:00:00Z',
      updated_at: '2026-11-07T15:00:00Z'
    };
  };

  // Compute Plane Access & Lifecycle Tab counts across all indexed pages
  const resolvedRows = docKeys.map(k => findPlanePage(k, docMetadata[k] || {}));
  const publicCount = resolvedRows.filter(p => !p.archived_at && Number(p.access || 0) === 0).length;
  const privateCount = resolvedRows.filter(p => !p.archived_at && Number(p.access || 0) === 1).length;
  const archivedCount = resolvedRows.filter(p => Boolean(p.archived_at)).length;

  const activePlanePage = findPlanePage(activeDocKey, activeDocMeta);
  const isActiveLocked = Boolean(activePlanePage.is_locked);
  const isActiveArchived = Boolean(activePlanePage.archived_at);

  return `
    <div class="flex flex-col flex-1 min-h-0 bg-zinc-950 text-zinc-100 select-none" id="kb-container">

      <!-- ============================================================== -->
      <!-- VISTA 1: PLANE LIBRARY LIST VIEW (PagesListView)               -->
      <!-- ============================================================== -->
      <div id="kb-view-library" class="flex flex-col flex-1 min-h-0">

        <!-- 1.1 Plane PagesListHeaderRoot: Access/Lifecycle Tabs + Perspectives + Search/Sort/Filter + Actions -->
        <div class="min-h-11 px-5 border-b border-zinc-800/80 bg-zinc-950 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
          <!-- Left: Plane PageTabNavigation (Public, Private, Archived | Modules, Master, Split, Governance) -->
          <div class="flex items-center gap-1 overflow-x-auto" id="kb-perspective-nav">
            <!-- Plane Primary Access Tabs (TPageNavigationTabs) -->
            <button
              type="button"
              data-kb-perspective="global"
              data-page-access-tab="public"
              class="kb-perspective-btn kb-access-tab-btn active h-11 px-3 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-100 border-b-2 border-indigo-500 transition-all cursor-pointer shrink-0"
            >
              ${Icons.globe('w-3.5 h-3.5 text-indigo-400')}
              <span>Public</span>
              <span id="kb-tab-count-public" class="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300">${publicCount}</span>
            </button>

            <button
              type="button"
              data-kb-perspective="global"
              data-page-access-tab="private"
              class="kb-perspective-btn kb-access-tab-btn h-11 px-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 border-b-2 border-transparent transition-all cursor-pointer shrink-0"
            >
              ${Icons.lock('w-3.5 h-3.5')}
              <span>Private</span>
              <span id="kb-tab-count-private" class="px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">${privateCount}</span>
            </button>

            <button
              type="button"
              data-kb-perspective="global"
              data-page-access-tab="archived"
              class="kb-perspective-btn kb-access-tab-btn h-11 px-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 border-b-2 border-transparent transition-all cursor-pointer shrink-0"
            >
              ${Icons.archive('w-3.5 h-3.5')}
              <span>Archived</span>
              <span id="kb-tab-count-archived" class="px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">${archivedCount}</span>
            </button>

            <span class="h-4 w-px bg-zinc-800 mx-1 shrink-0" aria-hidden="true"></span>

            <!-- Harness Domain Perspectives -->
            <button
              type="button"
              data-kb-perspective="modules"
              class="kb-perspective-btn h-11 px-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 border-b-2 border-transparent transition-all cursor-pointer shrink-0"
            >
              ${Icons.folder('w-3.5 h-3.5')}
              <span>Modules (DDD)</span>
              <span class="px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">${moduleNames.length}</span>
            </button>

            <button
              type="button"
              data-kb-perspective="master"
              class="kb-perspective-btn h-11 px-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 border-b-2 border-transparent transition-all cursor-pointer shrink-0"
            >
              ${Icons.fileText('w-3.5 h-3.5')}
              <span>Master Bundle</span>
              <span class="px-1.5 py-0.2 rounded bg-purple-950/80 border border-purple-500/30 text-[10px] font-mono text-purple-300">MASTER</span>
            </button>

            <button
              type="button"
              data-kb-perspective="plane-workspace"
              class="kb-perspective-btn h-11 px-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 border-b-2 border-transparent transition-all cursor-pointer shrink-0"
            >
              ${Icons.bookOpen('w-3.5 h-3.5')}
              <span>Split Workspace</span>
              <span class="px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-500/30 text-[10px] font-mono text-emerald-300">Graph</span>
            </button>

            <button
              type="button"
              data-kb-perspective="governance"
              class="kb-perspective-btn h-11 px-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 border-b-2 border-transparent transition-all cursor-pointer shrink-0"
            >
              ${Icons.scale('w-3.5 h-3.5')}
              <span>Rules & Contracts</span>
              <span class="px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-500/30 text-[10px] font-mono text-amber-300">${rules.length} BR</span>
            </button>
          </div>

          <!-- Right: Plane PageHeaderFilters (Search, OrderBy, Filters) & Actions -->
          <div class="flex flex-wrap items-center gap-1.5 py-1.5">
            <!-- 1. Plane Search Input -->
            <div class="relative">
              <input
                type="text"
                id="kb-library-search-input"
                placeholder="Search pages (title, module, BR-*)..."
                class="h-7 w-44 sm:w-56 pl-7 pr-2.5 rounded-md text-xs bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
              />
              <span class="absolute left-2 top-1.5 text-zinc-500 pointer-events-none">
                ${Icons.search('w-3.5 h-3.5')}
              </span>
            </div>

            <!-- 2. Plane PageOrderByDropdown (Sort by Name / Updated / Created + Asc/Desc) -->
            <div class="inline-flex items-center rounded-md bg-zinc-900 border border-zinc-800 h-7 px-1.5 gap-1">
              <span class="text-zinc-500">${Icons.arrowUpDown('w-3 h-3')}</span>
              <select
                id="kb-sort-by-select"
                aria-label="Ordenar páginas por"
                class="bg-transparent text-zinc-300 text-[11px] font-mono focus:outline-none cursor-pointer pr-1"
              >
                <option value="updated_at" class="bg-zinc-900 text-zinc-200">Date modified</option>
                <option value="created_at" class="bg-zinc-900 text-zinc-200">Date created</option>
                <option value="name" class="bg-zinc-900 text-zinc-200">Name (A-Z)</option>
              </select>
              <button
                type="button"
                id="kb-sort-dir-btn"
                data-action="toggle-kb-sort-dir"
                data-sort-dir="desc"
                class="px-1 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-mono text-indigo-300 cursor-pointer"
                title="Alternar orden Ascendente / Descendente"
              >
                DESC
              </button>
            </div>

            <!-- 3. Plane PageFiltersSelection Popover -->
            <div class="relative">
              <button
                type="button"
                data-action="toggle-kb-filters-popover"
                class="h-7 inline-flex items-center gap-1.5 px-2.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
                title="Filtrar páginas por Favoritas, Normativas (Locked) o Agente Creador"
              >
                ${Icons.filter('w-3 h-3 text-zinc-400')}
                <span>Filters</span>
              </button>

              <div
                id="kb-filters-popover"
                class="hidden absolute right-0 top-8 z-40 w-64 p-3 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-3 text-xs"
              >
                <div class="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                  <span class="font-semibold text-zinc-200">Plane Page Filters</span>
                  <button
                    type="button"
                    data-action="clear-kb-filters"
                    class="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    Reset
                  </button>
                </div>

                <label class="flex items-center justify-between gap-2 py-1 px-1.5 rounded hover:bg-zinc-800/60 cursor-pointer">
                  <span class="flex items-center gap-2 text-zinc-300">
                    ${Icons.star('w-3.5 h-3.5 text-amber-400')}
                    <span>Favorites only</span>
                  </span>
                  <input type="checkbox" id="kb-filter-favorites-chk" class="accent-indigo-500 rounded cursor-pointer" />
                </label>

                <label class="flex items-center justify-between gap-2 py-1 px-1.5 rounded hover:bg-zinc-800/60 cursor-pointer">
                  <span class="flex items-center gap-2 text-zinc-300">
                    ${Icons.lock('w-3.5 h-3.5 text-amber-400')}
                    <span>Locked (Normative)</span>
                  </span>
                  <input type="checkbox" id="kb-filter-locked-chk" class="accent-indigo-500 rounded cursor-pointer" />
                </label>

                <div class="space-y-1 pt-1 border-t border-zinc-800/80">
                  <span class="text-[10px] font-mono uppercase text-zinc-400">Created by (Bot Agent)</span>
                  <select
                    id="kb-filter-owner-select"
                    class="w-full h-7 px-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs font-mono focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">All Agents</option>
                    <option value="spec-author">spec-author (BOT)</option>
                    <option value="leader">leader (BOT)</option>
                    <option value="reviewer">reviewer (BOT)</option>
                    <option value="implementer">implementer (BOT)</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 4. Ask AI Context -->
            <button
              type="button"
              data-action="open-ai-context-modal"
              class="h-7 inline-flex items-center gap-1.5 px-2.5 rounded-md bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors cursor-pointer"
              title="Generar System Prompt Anti-Sesgo para IA"
            >
              ${Icons.sparkles('w-3.5 h-3.5')}
              <span class="hidden xl:inline">AI Context</span>
            </button>

            <!-- 5. Import & Export -->
            <button
              type="button"
              data-action="trigger-import-doc"
              class="h-7 inline-flex items-center gap-1.5 px-2 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
              title="Importar archivo Markdown (.md)"
            >
              ${Icons.upload('w-3.5 h-3.5')}
              <span class="hidden xl:inline">Import</span>
            </button>
            <input type="file" id="import-doc-file-input" accept=".md,.markdown" class="hidden" />

            <button
              type="button"
              data-action="open-export-page-modal"
              class="h-7 inline-flex items-center gap-1.5 px-2 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
              title="Exportar páginas (Plane Export Modal: Markdown / Reporte)"
            >
              ${Icons.download('w-3.5 h-3.5')}
              <span class="hidden xl:inline">Export</span>
            </button>

            <!-- 6. Add Page -->
            <button
              type="button"
              data-action="open-new-doc-modal"
              class="h-7 inline-flex items-center gap-1.5 px-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-2xs transition-colors cursor-pointer"
            >
              ${Icons.plus('w-3.5 h-3.5')}
              <span>Add page</span>
            </button>
          </div>
        </div>

        <!-- 1.2 Plane Secondary Shelf Filter Pills & Sovereign Telemetry Bar -->
        <div class="px-5 py-2 border-b border-zinc-800/60 bg-zinc-900/25 flex flex-wrap items-center justify-between gap-3 text-xs">
          <!-- Shelf Filter Pills -->
          <div class="flex items-center gap-1 overflow-x-auto font-mono" id="kb-shelf-filter-pills">
            <button
              type="button"
              data-shelf-filter=""
              class="kb-shelf-pill active h-6 px-2.5 rounded-md bg-indigo-600 text-white text-[11px] font-semibold transition-colors cursor-pointer shrink-0"
            >
              All (${docKeys.length})
            </button>
            ${Object.values(shelvesData).map(sh => `
              <button
                type="button"
                data-shelf-filter="${sh.id}"
                class="kb-shelf-pill h-6 px-2.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 text-[11px] font-medium transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1.5"
              >
                ${getShelfIconSvg(sh.id, 'w-3 h-3')}
                <span>${sh.title.split(' ')[0]}</span>
                <span class="text-[10px] text-zinc-500">${sh.docs.length}</span>
              </button>
            `).join('')}
          </div>

          <!-- Compact Sovereign Knowledge Telemetry -->
          <div class="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
            <span class="hidden lg:inline text-zinc-300 font-sans font-medium">Library · Base de Conocimiento de Ingeniería Soberana</span>
            <span class="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-indigo-300">${docKeys.length} pages</span>
            <span class="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-purple-300">${moduleNames.length} modules</span>
            <span class="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-amber-300">${rules.length} BR-*</span>
            <span class="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-cyan-300">${services.length} services</span>
          </div>
        </div>

        <!-- 1.2b Plane PageAppliedFiltersList (Active Filter Chips + Clear All) -->
        <div
          id="kb-applied-filters-bar"
          class="hidden px-5 py-1.5 border-b border-zinc-800/60 bg-indigo-950/15 flex-wrap items-center justify-between gap-2 text-[11px] font-mono"
        >
          <div class="flex flex-wrap items-center gap-1.5" id="kb-applied-filters-chips"></div>
          <button
            type="button"
            data-action="clear-kb-filters"
            class="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[10px] cursor-pointer"
          >
            Clear all filters
          </button>
        </div>

        <!-- ============================================================== -->
        <!-- PANEL TIER 1: PLANE PAGES LIST (Public / Private / Archived)   -->
        <!-- ============================================================== -->
        <div id="kb-perspective-panel-global" class="kb-perspective-panel flex-1 flex flex-col">

          <!-- Pinned Featured Row (c4-model.md) + IEEE 830 / DeepWiki Quick Rows -->
          ${heroDocKey ? `
            <div id="kb-pinned-featured-strip" class="border-b border-zinc-800/80 bg-indigo-950/10">
              <div class="px-5 py-1.5 border-b border-zinc-800/60 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-indigo-300/90">
                <span class="flex items-center gap-1.5">
                  ${Icons.star('w-3 h-3 fill-amber-400 text-amber-400')}
                  <span>Pinned Canonical Architecture & Quick Access</span>
                </span>
                <span>SQLite + .md Synced</span>
              </div>

              <!-- Featured C4 Model Row (First open-article-read & open-article-edit in DOM for E2E contracts) -->
              <div class="group flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 hover:bg-zinc-900/75 border-b border-zinc-800/40 transition-colors">
                <div class="flex items-center gap-3 min-w-0 flex-1">
                  <span class="w-6 h-6 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                    ${Icons.page('w-3.5 h-3.5')}
                  </span>
                  <span class="text-xs font-semibold text-zinc-100 truncate">${escapeHtml(getPageName(heroDocMeta.title || heroDocKey))}</span>
                  <code class="text-[11px] font-mono text-indigo-400 bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-500/20 hidden sm:inline">${heroDocKey}</code>
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-500/30">Pinned</span>
                </div>
                <div class="flex items-center gap-2 shrink-0 text-[11px] font-mono text-zinc-400">
                  <span class="hidden md:inline">${heroDocMeta.wordCount} words · ${heroDocMeta.readingTime}m</span>
                  <button
                    type="button"
                    data-action="open-article-read"
                    data-doc-key="${escapeAttr(heroDocKey)}"
                    class="h-6 px-2.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-sans font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    ${Icons.bookOpen('w-3 h-3')}
                    <span>Open</span>
                  </button>
                  <button
                    type="button"
                    data-action="open-article-edit"
                    data-doc-key="${escapeAttr(heroDocKey)}"
                    class="h-6 px-2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[11px] font-sans font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    ${Icons.edit('w-3 h-3')}
                    <span>Edit</span>
                  </button>
                </div>
              </div>

              <!-- Quick Access Row: IEEE 830 & DeepWiki Capabilities -->
              <div class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800/50 bg-zinc-950/60">
                <div class="flex items-center justify-between gap-3 px-5 py-2 hover:bg-zinc-900/60 transition-colors">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <span class="text-indigo-400 shrink-0">${Icons.info('w-3.5 h-3.5')}</span>
                    <span class="text-xs text-zinc-200 font-medium truncate">Business Problem & Scope (IEEE 830)</span>
                    <code class="text-[10px] font-mono text-zinc-500 hidden xl:inline">01-project-overview-and-business.md</code>
                  </div>
                  <button
                    type="button"
                    data-action="open-article-read"
                    data-doc-key="01-project-overview-and-business.md"
                    class="h-6 px-2 rounded bg-zinc-900 hover:bg-indigo-600 text-zinc-300 hover:text-white border border-zinc-800 text-[11px] font-medium shrink-0 transition-colors cursor-pointer"
                  >
                    Open IEEE 830
                  </button>
                </div>
                <div class="flex items-center justify-between gap-3 px-5 py-2 hover:bg-zinc-900/60 transition-colors">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <span class="text-purple-400 shrink-0">${Icons.grid('w-3.5 h-3.5')}</span>
                    <span class="text-xs text-zinc-200 font-medium truncate">Capabilities Catalog & DeepWiki Mindmap</span>
                    <code class="text-[10px] font-mono text-zinc-500 hidden xl:inline">03-capabilities-and-features.md</code>
                  </div>
                  <button
                    type="button"
                    data-action="open-article-read"
                    data-doc-key="03-capabilities-and-features.md"
                    class="h-6 px-2 rounded bg-zinc-900 hover:bg-purple-600 text-zinc-300 hover:text-white border border-zinc-800 text-[11px] font-medium shrink-0 transition-colors cursor-pointer"
                  >
                    Open DeepWiki
                  </button>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Empty State for Filtered / Private / Archived Views -->
          <div id="kb-empty-filter-state" class="hidden p-12 text-center space-y-3">
            <div class="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
              ${Icons.page('w-5 h-5')}
            </div>
            <div class="text-sm font-semibold text-zinc-200">No pages match the selected Library view or filter</div>
            <p class="text-xs text-zinc-500 max-w-md mx-auto">
              You can switch back to the Public tab, clear active filters, or toggle any page's visibility (Public / Private) or Archive status from its row actions.
            </p>
            <button
              type="button"
              data-action="clear-kb-filters"
              class="h-7 px-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer"
            >
              Show all Public pages
            </button>
          </div>

          <!-- 1.3 Plane Pages List Groups (#kb-shelves-container) -->
          <div class="divide-y divide-zinc-800/70" id="kb-shelves-container">
            ${Object.values(shelvesData).map(sh => {
              if (!sh.docs || sh.docs.length === 0) return '';
              return `
                <section class="kb-shelf-section" data-shelf-id="${sh.id}">
                  <!-- Plane Group Header -->
                  <div class="px-5 py-2 bg-zinc-900/45 border-b border-zinc-800/70 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-indigo-400">
                        ${getShelfIconSvg(sh.id, 'w-3.5 h-3.5')}
                      </span>
                      <h3 class="text-xs font-semibold text-zinc-200 tracking-tight">
                        ${escapeHtml(sh.title)}
                      </h3>
                      <span class="kb-shelf-visible-count text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                        ${sh.docs.length}
                      </span>
                    </div>
                    <span class="text-[10px] font-mono text-zinc-500 hidden sm:inline">Plane Library · Docs-as-Code</span>
                  </div>

                  <!-- Plane PageListBlock Rows -->
                  <div class="kb-shelf-rows-list divide-y divide-zinc-800/50">
                    ${sh.docs.map(key => {
                      const meta = docMetadata[key] || {
                        title: key,
                        summary: 'Documento técnico.',
                        readingTime: 2,
                        wordCount: 300,
                        ruleCount: 0,
                        reqCount: 0,
                        adrCount: 0
                      };
                      const matchedPage = findPlanePage(key, meta);
                      const isFav = Boolean(matchedPage.is_favorite);
                      const isLocked = Boolean(matchedPage.is_locked);
                      const isArchived = Boolean(matchedPage.archived_at);
                      const isPrivate = Number(matchedPage.access || 0) === 1;
                      const ownerRole = matchedPage.owned_by_role || 'spec-author';
                      const avatarInitials = ownerRole === 'reviewer' ? 'RV' : ownerRole === 'leader' ? 'LD' : ownerRole === 'implementer' ? 'IM' : 'SA';
                      const displayTitle = getPageName(meta.title || matchedPage.title);
                      const updatedDateShort = String(matchedPage.updated_at || '2026-11-07').slice(0, 10);

                      return `
                        <div
                          class="kb-shelf-doc-card plane-page-item group relative flex items-center justify-between gap-3 px-5 py-2.5 bg-zinc-950 hover:bg-zinc-900/75 transition-colors"
                          data-page-id="${matchedPage.id}"
                          data-doc-key="${escapeAttr(key)}"
                          data-doc-shelf="${escapeAttr(sh.id)}"
                          data-doc-title="${escapeAttr(displayTitle)}"
                          data-doc-module="${escapeAttr(meta.moduleName || '')}"
                          data-page-access="${isPrivate ? '1' : '0'}"
                          data-page-archived="${isArchived ? '1' : '0'}"
                          data-page-favorite="${isFav ? '1' : '0'}"
                          data-page-locked="${isLocked ? '1' : '0'}"
                          data-page-owner="${escapeAttr(ownerRole)}"
                          data-page-words="${meta.wordCount || 300}"
                          data-page-updated="${escapeAttr(matchedPage.updated_at || '2026-11-07T15:00:00Z')}"
                          data-page-created="${escapeAttr(matchedPage.created_at || '2026-11-01T10:00:00Z')}"
                        >
                          <!-- Left: Page Icon Box + Clickable Title + Path + Telemetry Chips -->
                          <div class="flex items-center gap-3 min-w-0 flex-1">
                            <span class="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800/90 group-hover:border-indigo-500/30 flex items-center justify-center text-zinc-400 group-hover:text-indigo-400 transition-colors shrink-0">
                              ${Icons.page('w-3.5 h-3.5')}
                            </span>

                            <div class="flex items-center gap-2.5 min-w-0 flex-1">
                              <button
                                type="button"
                                data-action="open-article-read"
                                data-doc-key="${escapeAttr(key)}"
                                class="text-xs font-medium text-zinc-100 group-hover:text-indigo-300 truncate text-left cursor-pointer transition-colors"
                              >
                                ${escapeHtml(displayTitle)}
                              </button>
                              <span class="text-[11px] font-mono text-zinc-500 truncate hidden lg:inline">
                                ${escapeHtml(key)}
                              </span>
                            </div>

                            <!-- Plane Row Badges (Access, Archived, Module, BR, RF, ADR) -->
                            <div class="hidden sm:flex items-center gap-1.5 shrink-0">
                              ${isArchived ? `
                                <span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-950/70 text-rose-300 border border-rose-500/30">
                                  Archived
                                </span>
                              ` : ''}
                              ${isPrivate ? `
                                <span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-violet-950/70 text-violet-300 border border-violet-500/30">
                                  Private
                                </span>
                              ` : ''}
                              ${meta.moduleName ? `
                                <span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-950/60 text-purple-300 border border-purple-500/30">
                                  ${escapeHtml(meta.moduleName)}
                                </span>
                              ` : ''}
                              ${meta.ruleCount ? `
                                <span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-500/30" title="${meta.ruleCount} Reglas BR">
                                  ${meta.ruleCount} BR
                                </span>
                              ` : ''}
                              ${meta.reqCount ? `
                                <span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-500/30" title="${meta.reqCount} Requisitos RF">
                                  ${meta.reqCount} RF
                                </span>
                              ` : ''}
                              ${meta.adrCount ? `
                                <span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30" title="${meta.adrCount} ADRs">
                                  ${meta.adrCount} ADR
                                </span>
                              ` : ''}
                            </div>
                          </div>

                          <!-- Right: Plane BlockItemAction (Access, Lock, Owner Avatar, Info Tooltip, Favorite Star, Open/Edit, ... Menu) -->
                          <div class="flex items-center gap-1.5 shrink-0">
                            <!-- 1. Access Indicator & Toggle (Public Globe vs Private Lock per BR-PAGE-01 & BR-PAGE-04) -->
                            <button
                              type="button"
                              data-action="toggle-page-access"
                              data-page-id="${matchedPage.id}"
                              ${isArchived ? 'disabled' : ''}
                              class="w-6 h-6 rounded flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                              title="${isArchived ? 'Archived page (restore to change access)' : isPrivate ? 'Private page (click to make Public)' : 'Public page (click to make Private)'}"
                            >
                              ${isPrivate ? Icons.lock('w-3.5 h-3.5 text-violet-400') : Icons.globe('w-3.5 h-3.5 text-zinc-500 group-hover:text-indigo-400')}
                            </button>

                            <!-- 2. Lock / Normative Protection Toggle -->
                            <button
                              type="button"
                              data-action="toggle-page-lock"
                              data-page-id="${matchedPage.id}"
                              class="w-6 h-6 rounded flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                              title="${isLocked ? 'Locked normative page (click to unlock)' : 'Unlocked page (click to lock)'}"
                            >
                              ${isLocked ? Icons.lock('w-3.5 h-3.5 text-amber-400/85') : Icons.unlock('w-3.5 h-3.5')}
                            </button>

                            <!-- 3. Owner Bot Avatar -->
                            <div
                              class="w-5 h-5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-[9px] font-mono font-bold text-indigo-300 flex items-center justify-center"
                              title="Owned by: ${ownerRole} (BOT) · Updated ${updatedDateShort}"
                            >
                              ${avatarInitials}
                            </div>

                            <!-- 4. Info & Reading time -->
                            <span
                              class="text-[11px] font-mono text-zinc-500 w-10 text-right hidden md:inline"
                              title="Updated ${updatedDateShort} · ${meta.wordCount || 300} words · ${meta.readingTime} min read"
                            >
                              ${meta.readingTime}m
                            </span>

                            <!-- 5. Favorite Star (Hidden when archived per Plane BR-PAGE-03) -->
                            ${!isArchived ? `
                              <button
                                type="button"
                                data-action="toggle-page-favorite"
                                data-page-id="${matchedPage.id}"
                                class="w-6 h-6 rounded flex items-center justify-center transition-colors cursor-pointer ${
                                  isFav ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
                                }"
                                title="${isFav ? 'Remove from favorites' : 'Add to favorites'}"
                              >
                                ${Icons.star(`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`)}
                              </button>
                            ` : ''}

                            <!-- 6. Open & Edit Buttons -->
                            <button
                              type="button"
                              data-action="open-article-read"
                              data-doc-key="${escapeAttr(key)}"
                              class="h-6 px-2.5 rounded bg-zinc-900 hover:bg-indigo-600 text-zinc-200 hover:text-white border border-zinc-800 hover:border-indigo-500 text-[11px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              ${Icons.bookOpen('w-3 h-3')}
                              <span>Leer</span>
                            </button>

                            <button
                              type="button"
                              data-action="open-article-edit"
                              data-doc-key="${escapeAttr(key)}"
                              class="h-6 w-6 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                              title="Editar documento"
                            >
                              ${Icons.edit('w-3 h-3')}
                            </button>

                            <!-- 7. Plane Row Quick Actions Dropdown (...) -->
                            <div class="relative">
                              <button
                                type="button"
                                data-action="toggle-page-row-menu"
                                data-page-id="${matchedPage.id}"
                                class="h-6 w-6 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                                title="More page actions (Plane PageActions)"
                              >
                                ${Icons.dotsHorizontal('w-3.5 h-3.5')}
                              </button>

                              <div
                                id="page-row-menu-${matchedPage.id}"
                                class="plane-row-actions-menu hidden absolute right-0 top-7 z-40 w-48 py-1 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl text-xs font-sans"
                              >
                                <button
                                  type="button"
                                  data-action="open-article-read"
                                  data-doc-key="${escapeAttr(key)}"
                                  class="w-full px-3 py-1.5 flex items-center gap-2 text-zinc-200 hover:bg-zinc-800 text-left cursor-pointer"
                                >
                                  ${Icons.bookOpen('w-3.5 h-3.5 text-indigo-400')}
                                  <span>Open page</span>
                                </button>
                                <button
                                  type="button"
                                  data-action="copy-page-markdown"
                                  data-page-id="${matchedPage.id}"
                                  class="w-full px-3 py-1.5 flex items-center gap-2 text-zinc-200 hover:bg-zinc-800 text-left cursor-pointer"
                                >
                                  ${Icons.copy('w-3.5 h-3.5 text-zinc-400')}
                                  <span>Copy markdown</span>
                                </button>
                                <button
                                  type="button"
                                  data-action="copy-page-link"
                                  data-doc-key="${escapeAttr(key)}"
                                  class="w-full px-3 py-1.5 flex items-center gap-2 text-zinc-200 hover:bg-zinc-800 text-left cursor-pointer"
                                >
                                  ${Icons.link('w-3.5 h-3.5 text-zinc-400')}
                                  <span>Copy page link</span>
                                </button>
                                <button
                                  type="button"
                                  data-action="duplicate-page"
                                  data-page-id="${matchedPage.id}"
                                  class="w-full px-3 py-1.5 flex items-center gap-2 text-zinc-200 hover:bg-zinc-800 text-left cursor-pointer"
                                >
                                  ${Icons.plus('w-3.5 h-3.5 text-emerald-400')}
                                  <span>Make a copy</span>
                                </button>

                                <div class="my-1 border-t border-zinc-800"></div>

                                ${!isArchived ? `
                                  <button
                                    type="button"
                                    data-action="toggle-page-lock"
                                    data-page-id="${matchedPage.id}"
                                    class="w-full px-3 py-1.5 flex items-center gap-2 text-zinc-200 hover:bg-zinc-800 text-left cursor-pointer"
                                  >
                                    ${isLocked ? Icons.unlock('w-3.5 h-3.5 text-amber-400') : Icons.lock('w-3.5 h-3.5 text-amber-400')}
                                    <span>${isLocked ? 'Unlock page' : 'Lock page'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    data-action="toggle-page-access"
                                    data-page-id="${matchedPage.id}"
                                    class="w-full px-3 py-1.5 flex items-center gap-2 text-zinc-200 hover:bg-zinc-800 text-left cursor-pointer"
                                  >
                                    ${isPrivate ? Icons.globe('w-3.5 h-3.5 text-indigo-400') : Icons.lock('w-3.5 h-3.5 text-violet-400')}
                                    <span>${isPrivate ? 'Make public' : 'Make private'}</span>
                                  </button>
                                ` : ''}

                                <button
                                  type="button"
                                  data-action="open-export-page-modal"
                                  data-page-id="${matchedPage.id}"
                                  data-doc-key="${escapeAttr(key)}"
                                  class="w-full px-3 py-1.5 flex items-center gap-2 text-zinc-200 hover:bg-zinc-800 text-left cursor-pointer"
                                >
                                  ${Icons.download('w-3.5 h-3.5 text-cyan-400')}
                                  <span>Export page</span>
                                </button>

                                <div class="my-1 border-t border-zinc-800"></div>

                                <button
                                  type="button"
                                  data-action="toggle-page-archive"
                                  data-page-id="${matchedPage.id}"
                                  class="w-full px-3 py-1.5 flex items-center gap-2 ${isArchived ? 'text-emerald-400' : 'text-rose-400'} hover:bg-zinc-800 text-left cursor-pointer"
                                >
                                  ${isArchived ? Icons.archiveRestore('w-3.5 h-3.5') : Icons.archive('w-3.5 h-3.5')}
                                  <span>${isArchived ? 'Restore page' : 'Archive page'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </section>
              `;
            }).join('')}
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- PANEL TIER 2: MÓDULOS & BOUNDED CONTEXTS (Plane List Format)   -->
        <!-- ============================================================== -->
        <div id="kb-perspective-panel-modules" class="kb-perspective-panel hidden flex-1 flex flex-col">
          <!-- Module Selector Sub-bar -->
          <div class="px-5 py-2.5 border-b border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between gap-4 overflow-x-auto" id="kb-module-tab-bar">
            <div class="flex items-center gap-1.5">
              ${Object.keys(modulesData).map((modId, index) => {
                const mod = modulesData[modId];
                const isActive = index === 0;
                return `
                  <button
                    type="button"
                    data-module-tab="${escapeAttr(modId)}"
                    class="kb-module-tab-btn ${
                      isActive
                        ? 'active bg-indigo-600 text-white font-semibold'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    } h-7 px-3 rounded-md text-xs font-mono transition-colors cursor-pointer shrink-0 inline-flex items-center gap-2"
                  >
                    ${Icons.folder('w-3.5 h-3.5')}
                    <span>${escapeHtml(mod.title || modId)}</span>
                    <span class="text-[10px] px-1.5 rounded ${isActive ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'}">${mod.docs?.length || 5}</span>
                  </button>
                `;
              }).join('')}
            </div>
            <span class="text-[11px] font-mono text-zinc-500 shrink-0 hidden md:inline">5 Artefactos DDD por Bounded Context</span>
          </div>

          <!-- Module Pages List -->
          <div id="kb-module-contents-container" class="flex-1">
            ${Object.keys(modulesData).map((modId, index) => {
              const mod = modulesData[modId];
              const isHidden = index !== 0;
              const modMetaMap = mod.docMetadata || {};

              const specializedSpecs = [
                {
                  filename: 'module-spec.md',
                  title: 'Especificación de Alcance & Tarjetas CRC',
                  desc: 'Delimitación del bounded context, lenguaje ubicuo de dominio y matriz de tarjetas CRC.',
                  badge: 'bg-purple-950/70 text-purple-300 border-purple-500/30',
                  icon: Icons.shield
                },
                {
                  filename: 'requirements-and-rules.md',
                  title: 'Requerimientos & Invariantes de Negocio',
                  desc: 'Matriz exhaustiva de requerimientos funcionales (RF-*), reglas BR-* e historias HU-*.',
                  badge: 'bg-amber-950/70 text-amber-300 border-amber-500/30',
                  icon: Icons.scale
                },
                {
                  filename: 'data-and-transactions.md',
                  title: 'Persistencia, Entidades & Transacciones',
                  desc: 'Estructura de persistencia, entidades, concurrencia e invariantes ACID.',
                  badge: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30',
                  icon: Icons.database
                },
                {
                  filename: 'diagrams.md',
                  title: 'Suite de 6 Diagramas Dedicados (Mermaid)',
                  desc: 'Contexto C4, Contenedores, Componentes, Secuencia, Estado y Modelo ERD.',
                  badge: 'bg-indigo-950/70 text-indigo-300 border-indigo-500/30',
                  icon: Icons.architecture
                },
                {
                  filename: 'technical-debt-refactoring.md',
                  title: 'Deuda Técnica & Plan de Refactorización',
                  desc: 'Diagnóstico forense de deuda técnica, brechas de pruebas y hoja de ruta.',
                  badge: 'bg-rose-950/70 text-rose-300 border-rose-500/30',
                  icon: Icons.alertTriangle
                }
              ];

              return `
                <div id="kb-module-content-${escapeAttr(modId)}" class="kb-module-content-panel ${isHidden ? 'hidden' : ''}">
                  <div class="px-5 py-2.5 bg-zinc-900/30 border-b border-zinc-800/70 flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-2.5">
                      <span class="text-purple-400">${Icons.folder('w-4 h-4')}</span>
                      <span class="text-xs font-semibold text-zinc-100">${escapeHtml(mod.title || modId)}</span>
                      <code class="text-[11px] font-mono text-zinc-500">project-docs/knowledge/modules/${modId}/</code>
                    </div>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                      ${mod.status || '100% COVERED'}
                    </span>
                  </div>

                  <div class="divide-y divide-zinc-800/50">
                    ${specializedSpecs.map(spec => {
                      const docKey = `modules/${modId}/${spec.filename}`;
                      const meta = modMetaMap[spec.filename] || docMetadata[docKey] || {
                        title: spec.title,
                        summary: spec.desc,
                        readingTime: 2,
                        wordCount: 300,
                        ruleCount: 0,
                        reqCount: 0
                      };

                      return `
                        <div
                          class="kb-shelf-doc-card plane-page-item group flex items-center justify-between gap-4 px-5 py-3 bg-zinc-950 hover:bg-zinc-900/75 transition-colors"
                          data-doc-key="${escapeAttr(docKey)}"
                          data-doc-shelf="modules"
                          data-doc-title="${escapeAttr(spec.title)}"
                          data-doc-module="${escapeAttr(modId)}"
                        >
                          <div class="flex items-center gap-3 min-w-0 flex-1">
                            <span class="text-zinc-400 group-hover:text-indigo-400 shrink-0">${spec.icon('w-4 h-4')}</span>
                            <div class="min-w-0 flex-1">
                              <div class="flex items-center gap-2">
                                <span class="text-xs font-medium text-zinc-100 truncate">${escapeHtml(spec.title)}</span>
                                <span class="px-1.5 py-0.2 rounded text-[10px] font-mono border ${spec.badge}">${spec.filename}</span>
                              </div>
                              <p class="text-[11px] text-zinc-500 truncate mt-0.5">${escapeHtml(spec.desc)}</p>
                            </div>
                          </div>

                          <div class="flex items-center gap-2 shrink-0">
                            ${meta.ruleCount ? `<span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-500/30">${meta.ruleCount} BR</span>` : ''}
                            ${meta.reqCount ? `<span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">${meta.reqCount} RF</span>` : ''}
                            <span class="text-[11px] font-mono text-zinc-500 hidden sm:inline">${meta.readingTime || 2}m</span>
                            <button
                              type="button"
                              data-action="open-article-read"
                              data-doc-key="${escapeAttr(docKey)}"
                              class="h-6 px-2.5 rounded bg-zinc-900 hover:bg-indigo-600 text-zinc-200 hover:text-white border border-zinc-800 text-[11px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              ${Icons.bookOpen('w-3 h-3')}
                              <span>Leer</span>
                            </button>
                            <button
                              type="button"
                              data-action="open-article-edit"
                              data-doc-key="${escapeAttr(docKey)}"
                              class="h-6 w-6 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              ${Icons.edit('w-3 h-3')}
                            </button>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- PANEL TIER 3: MASTER BUNDLE (Plane List Format)                -->
        <!-- ============================================================== -->
        <div id="kb-perspective-panel-master" class="kb-perspective-panel hidden flex-1 flex flex-col">
          <!-- Master Bundle Top Bar -->
          <div class="px-5 py-3 bg-zinc-900/40 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <span class="p-1.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300">
                ${Icons.fileText('w-4 h-4')}
              </span>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-xs font-bold text-zinc-100">MASTER-PROJECT-KNOWLEDGE.md</h3>
                  <span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-950/80 text-purple-300 border border-purple-500/30">Single-File AI Bundle</span>
                </div>
                <p class="text-[11px] text-zinc-400">~${masterDocMeta.wordCount || 8200} palabras · 9 Capítulos Canónicos · 12 Diagramas Mermaid · ${moduleNames.length} Bounded Contexts</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                data-action="open-article-read"
                data-doc-key="${escapeAttr(masterDocKey)}"
                class="h-7 px-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                ${Icons.bookOpen('w-3.5 h-3.5')}
                <span>Open Master Document</span>
              </button>
              <button
                type="button"
                data-action="copy-master-doc"
                class="h-7 px-2.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                ${Icons.copy('w-3.5 h-3.5')}
                <span>Copy Markdown</span>
              </button>
              <button
                type="button"
                data-action="download-master-doc"
                class="h-7 px-2.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                ${Icons.download('w-3.5 h-3.5')}
                <span>Download .md</span>
              </button>
            </div>
          </div>

          <!-- 9 Chapters as Plane List Rows -->
          <div class="divide-y divide-zinc-800/50">
            ${[
              { num: '01', title: 'Resumen Ejecutivo & Problema de Negocio (IEEE 830)', desc: 'Definición formal del problema, usuarios del sistema, objetivos cuantificables y matriz RACI.' },
              { num: '02', title: 'Arquitectura General & Screaming Architecture', desc: 'Topología AS-IS, patrones arquitectónicos, estilo hexagonal y flujo de datos.' },
              { num: '03', title: 'Modelado C4 & Diagramas Globales (Mermaid)', desc: 'Contexto C1, Contenedores C2, Componentes C3, Diagramas de Secuencia y Clases de Dominio.' },
              { num: '04', title: 'Bounded Contexts & Tarjetas CRC (DDD Táctico)', desc: 'Lenguaje ubicuo de negocio, responsabilidades por bounded context y colaboradores.' },
              { num: '05', title: 'Requerimientos Funcionales & No Funcionales (INVEST)', desc: 'Matriz RF-*, historias de usuario y requerimientos no funcionales.' },
              { num: '06', title: 'Diccionario de Datos & Modelo Entidad-Relación (ERD)', desc: 'Modelo relacional SQLite (28 tablas), entidades, llaves foráneas e índices.' },
              { num: '07', title: 'Catálogo de Invariantes & Reglas de Negocio (BR-*)', desc: 'Invariantes de dominio de estricto cumplimiento para evitar alucinaciones.' },
              { num: '08', title: 'Servicios Externos & Contratos de Integración', desc: 'Protocolos de red, variables de entorno, mecanismos de autenticación y contingencia failover.' },
              { num: '09', title: 'Matriz de Trazabilidad RTM & Guardrails Anti-Sesgo', desc: 'Trazabilidad Requerimiento <-> Código <-> Tests y directrices de código.' }
            ].map(ch => `
              <div class="flex items-center justify-between gap-4 px-5 py-2.5 bg-zinc-950 hover:bg-zinc-900/75 transition-colors">
                <div class="flex items-center gap-3 min-w-0 flex-1">
                  <span class="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-500/30 shrink-0">
                    CH-${ch.num}
                  </span>
                  <div class="min-w-0 flex-1">
                    <div class="text-xs font-medium text-zinc-100 truncate">${escapeHtml(ch.title)}</div>
                    <div class="text-[11px] text-zinc-500 truncate">${escapeHtml(ch.desc)}</div>
                  </div>
                </div>
                <button
                  type="button"
                  data-action="open-article-read"
                  data-doc-key="${escapeAttr(masterDocKey)}"
                  class="h-6 px-2.5 rounded bg-zinc-900 hover:bg-purple-600 text-zinc-300 hover:text-white border border-zinc-800 text-[11px] font-medium shrink-0 transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Open Chapter</span>
                  ${Icons.arrowRight('w-3 h-3')}
                </button>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- PANEL TIER 4: PLANE PAGES SPLIT WORKSPACE & KNOWLEDGE GRAPH    -->
        <!-- ============================================================== -->
        <div id="kb-perspective-panel-plane-workspace" class="kb-perspective-panel hidden flex-1 overflow-hidden">
          ${PagesPage({
            pages: planePages,
            issues: features,
            activePageId: planePageState.activePageId || (planePages[0] && planePages[0].id) || null,
            activePageContent: planePageState.activePageContent || '',
            searchQuery: planePageState.searchQuery || '',
            filterTab: planePageState.filterTab || 'all',
            editorMode: planePageState.editorMode || 'reader',
            isFullWidth: Boolean(planePageState.isFullWidth),
            showNavigationPane: planePageState.showNavigationPane !== false,
            activeNavTab: planePageState.activeNavTab || 'outline',
            showAiMenu: Boolean(planePageState.showAiMenu)
          })}
        </div>

        <!-- ============================================================== -->
        <!-- PANEL TIER 5: RULES, EXTERNAL SERVICES & GUARDRAILS            -->
        <!-- ============================================================== -->
        <div id="kb-perspective-panel-governance" class="kb-perspective-panel hidden flex-1 divide-y divide-zinc-800">
          <!-- Business Rules Section -->
          <div>
            <div class="px-5 py-2.5 bg-zinc-900/45 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="text-amber-400">${Icons.scale('w-4 h-4')}</span>
                <h3 class="text-xs font-semibold text-zinc-100">Catálogo de Reglas de Negocio (Invariantes BR-*)</h3>
              </div>
              <div class="flex items-center gap-2 text-xs">
                <span class="text-zinc-500 font-mono text-[11px]">Module:</span>
                <select
                  id="kb-rules-module-filter"
                  class="h-7 px-2.5 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-200 text-xs font-mono focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Modules (${rules.length})</option>
                  ${moduleNames.map(m => `<option value="${escapeAttr(m)}">${m}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="divide-y divide-zinc-800/50" id="kb-rules-list">
              ${rules.map(rule => {
                const isCritical = rule.severity === 'Crítica' || rule.severity === 'Critica' || rule.severity === 'Alta';
                const sevBadge = isCritical
                  ? 'bg-rose-950/70 text-rose-300 border-rose-500/30'
                  : 'bg-amber-950/70 text-amber-300 border-amber-500/30';
                return `
                  <div
                    data-rule-module="${escapeAttr(rule.module || 'general')}"
                    class="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-900/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors"
                  >
                    <div class="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                      <span class="font-mono text-[11px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 shrink-0">
                        ${rule.id}
                      </span>
                      <span class="font-mono text-[10px] px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 shrink-0">
                        ${rule.module || 'general'}
                      </span>
                      <div class="min-w-0 flex-1">
                        <span class="text-xs font-semibold text-zinc-100">${escapeHtml(rule.title)}</span>
                        <span class="text-xs text-zinc-400 ml-2">${escapeHtml(rule.description)}</span>
                      </div>
                    </div>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${sevBadge}">
                      ${rule.severity || 'Normal'}
                    </span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- External Services & Anti-Bias Guardrails -->
          <div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
            <div class="p-5 space-y-3">
              <div class="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                <span class="text-cyan-400">${Icons.server('w-4 h-4')}</span>
                <span>External Services & Integration Contracts (${services.length})</span>
              </div>
              <div class="space-y-2">
                ${services.map(svc => `
                  <div class="p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div class="font-semibold text-zinc-100">${escapeHtml(svc.name)} <span class="text-[10px] font-mono text-cyan-400">(${escapeHtml(svc.type)})</span></div>
                      <div class="text-[11px] text-zinc-400 font-mono">Protocol: ${escapeHtml(svc.protocol)} · Auth: ${escapeHtml(svc.auth)}</div>
                    </div>
                    <code class="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-indigo-300">${escapeHtml(svc.env_var)}</code>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="p-5 space-y-3">
              <div class="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                <span class="text-rose-400">${Icons.shield('w-4 h-4')}</span>
                <span>Anti-Hallucination Guardrails & Naming Conventions</span>
              </div>
              <ul class="space-y-1.5 text-xs text-zinc-300">
                ${(guardrails.length > 0 ? guardrails : [
                  'Prohibido instalar paquetes o bibliotecas redundantes no canónicas.',
                  'Toda regla de negocio BR-* debe implementarse con tests automatizados.',
                  'Inversión de dependencias obligatoria en controladores y servicios.'
                ]).map(g => `
                  <li class="flex items-start gap-2">
                    <span class="text-rose-400 font-mono font-bold shrink-0">•</span>
                    <span>${escapeHtml(g)}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>
        </div>

      </div>

      <!-- ============================================================== -->
      <!-- VISTA 2: PLANE PAGE ROOT CANVAS (Full-Screen Reader / Editor)  -->
      <!-- ============================================================== -->
      <div id="kb-view-article" class="hidden flex-1 flex flex-col min-h-0 bg-zinc-950">

        <!-- 2.1 Plane PageEditorToolbarRoot (Sticky Top Header Bar h-11) -->
        <div class="min-h-11 px-5 py-1.5 border-b border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20 shrink-0">
          <!-- Left: Breadcrumb Library / Shelf / Active Page -->
          <div class="flex items-center gap-2 text-xs font-mono min-w-0">
            <button
              type="button"
              data-action="back-to-library"
              class="h-7 inline-flex items-center gap-1.5 px-2.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-sans font-medium transition-colors cursor-pointer"
            >
              ${Icons.arrowLeft('w-3.5 h-3.5 text-zinc-400')}
              <span>Library</span>
            </button>
            <span class="text-zinc-600">/</span>
            <span id="article-shelf-badge" class="px-2 py-0.5 rounded text-[11px] bg-zinc-900 border border-zinc-800 text-zinc-400">
              ${activeDocMeta.shelf || 'Canónico'}
            </span>
            <span class="text-zinc-600">/</span>
            <span id="doc-active-path" class="text-indigo-300 font-semibold px-2 py-0.5 rounded bg-indigo-950/50 border border-indigo-500/25 truncate max-w-xs sm:max-w-md">
              ${activeDocKey}
            </span>
          </div>

          <!-- Right: Plane PageHeaderActions + Mode Switcher -->
          <div class="flex flex-wrap items-center gap-1.5">
            <div id="article-plane-header-actions">
              ${renderPageHeaderActions({
                activePage: activePlanePage,
                isFullWidth: Boolean(planePageState.isFullWidth),
                showNavigationPane: planePageState.showNavigationPane !== false,
                showAiMenu: Boolean(planePageState.showAiMenu)
              })}
            </div>

            <span id="article-reading-time-badge" class="hidden xl:inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400">
              ${Icons.clock('w-3 h-3')} <span>${activeDocMeta.readingTime} min</span>
            </span>

            <button
              type="button"
              id="btn-toggle-doc-editor"
              class="h-7 px-2.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              title="Alternar entre Lector y Editor Dual"
            >
              <span id="btn-toggle-doc-icon">${Icons.edit('w-3.5 h-3.5')}</span>
              <span id="btn-toggle-doc-text">Modo Editor</span>
            </button>

            <button
              type="button"
              id="copy-active-doc-btn"
              class="h-7 w-7 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
              title="Copiar Markdown completo"
            >
              ${Icons.copy('w-3.5 h-3.5')}
            </button>

            <button
              type="button"
              data-action="download-active-doc"
              class="h-7 w-7 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
              title="Descargar archivo .md"
            >
              ${Icons.download('w-3.5 h-3.5')}
            </button>

            <button
              type="button"
              data-action="delete-active-doc"
              class="h-7 w-7 rounded-md bg-zinc-900 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 border border-zinc-800 hover:border-rose-500/30 flex items-center justify-center transition-colors cursor-pointer"
              title="Eliminar documento"
            >
              ${Icons.trash('w-3.5 h-3.5')}
            </button>
          </div>
        </div>

        <!-- 2.1b Plane Lock / Archive Read-Only Protection Banner (BR-PAGE-02) -->
        <div
          id="article-status-banner"
          class="${(isActiveLocked || isActiveArchived) ? 'flex' : 'hidden'} px-5 py-2 border-b ${isActiveArchived ? 'bg-rose-950/25 border-rose-500/30 text-rose-200' : 'bg-amber-950/20 border-amber-500/30 text-amber-200'} items-center justify-between gap-3 text-xs"
        >
          <div class="flex items-center gap-2">
            ${isActiveArchived ? Icons.archive('w-3.5 h-3.5 text-rose-400') : Icons.lock('w-3.5 h-3.5 text-amber-400')}
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
                class="px-2.5 py-1 rounded bg-rose-600/20 hover:bg-rose-600/35 border border-rose-500/40 text-rose-200 text-[11px] font-mono font-semibold cursor-pointer"
              >
                Restore page
              </button>
            ` : `
              <button
                type="button"
                data-action="toggle-page-lock"
                data-page-id="${activePlanePage.id}"
                class="px-2.5 py-1 rounded bg-amber-600/20 hover:bg-amber-600/35 border border-amber-500/40 text-amber-200 text-[11px] font-mono font-semibold cursor-pointer"
              >
                Unlock page
              </button>
            `}
          </div>
        </div>

        <!-- 2.2 Plane PageEditorBody + Right Docked PageNavigationPane -->
        <div id="doc-reader-view-container" class="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-96px)] bg-zinc-950 relative">

          <!-- Center Document Canvas (Distraction-Free Plane Page Canvas: max-w-[720px] or max-w-[1152px] Full Width) -->
          <div id="doc-reader-main-col" class="flex-1 overflow-y-auto px-6 sm:px-14 py-8 bg-zinc-950">
            <!-- Plane PageEditorHeaderRoot & Telemetry Subtitle Bar -->
            <div class="${planePageState.isFullWidth ? 'max-w-[1152px]' : 'max-w-[720px]'} mx-auto mb-6 pb-3 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-zinc-400">
              <div class="flex items-center gap-3">
                <span class="inline-flex items-center gap-1 text-indigo-300">
                  ${Icons.bot('w-3.5 h-3.5')}
                  <span>${activePlanePage.owned_by_role || 'spec-author'}</span>
                </span>
                <span>·</span>
                <span>Words: <strong id="article-meta-words" class="text-zinc-200">${activeDocMeta.wordCount || 0}</strong></span>
                <span>Rules BR: <strong id="article-meta-br" class="text-amber-400">${activeDocMeta.ruleCount || 0}</strong></span>
                <span>Reqs RF: <strong id="article-meta-rf" class="text-emerald-400">${activeDocMeta.reqCount || 0}</strong></span>
              </div>
              <span class="text-zinc-500">Smart Chips Active (INT-* / BR-* / RF-*)</span>
            </div>

            <article id="doc-active-body" class="prose dark:prose-invert ${planePageState.isFullWidth ? 'max-w-[1152px]' : 'max-w-[720px]'} mx-auto text-zinc-200 leading-relaxed text-sm">
              ${enrichMarkdownWithSmartChips(renderMarkdown(activeDocContent), features)}
            </article>
          </div>

          <!-- Floating Outline Mini-Bars when PageNavigationPane is collapsed -->
          <div id="article-floating-outline-wrapper" class="${planePageState.showNavigationPane === false ? 'block' : 'hidden'}">
            ${renderFloatingOutlineBars(activeDocToc)}
          </div>

          <!-- Right Docked Plane PageNavigationPane (4 Tabs: Outline, Info, Assets, Historial) -->
          <div id="doc-reader-right-col" class="${planePageState.showNavigationPane === false ? 'hidden' : 'w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-zinc-800 bg-zinc-950 shrink-0 flex flex-col'}">
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

            <!-- Canonical TOC Container for direct DOM lookup -->
            <div class="px-4 py-3 border-t border-zinc-800/80 bg-zinc-950/90">
              <div class="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 pb-1.5 flex items-center gap-1.5">
                ${Icons.fileText('w-3 h-3')} <span>On this page</span>
              </div>
              <div id="doc-active-toc" class="max-h-40 overflow-y-auto pr-1">
                ${renderTableOfContentsHtml(activeDocToc)}
              </div>
            </div>
          </div>

        </div>

        <!-- 2.3 Plane Dual Editor Mode (Markdown + Live Preview / Visual Blocks) -->
        <div id="doc-editor-view-container" class="hidden flex-1 flex flex-col bg-zinc-950 p-6 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-zinc-800">
            <div class="flex items-center gap-2">
              <div class="flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                <button
                  type="button"
                  id="btn-editor-mode-md"
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-semibold bg-indigo-600 text-white cursor-pointer transition-all"
                >
                  ${Icons.code('w-3.5 h-3.5')} <span>Modo Markdown</span>
                </button>
                <button
                  type="button"
                  id="btn-editor-mode-blocks"
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-medium text-zinc-400 hover:text-zinc-100 cursor-pointer transition-all"
                >
                  ${Icons.grid('w-3.5 h-3.5')} <span>Modo Bloques Visuales</span>
                </button>
              </div>
              <span id="editor-sync-indicator" class="text-xs text-zinc-500 font-mono hidden sm:inline">
                Sincronización activa (SQLite + .md)
              </span>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                id="btn-cancel-doc-edit"
                class="h-7 px-3 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn-save-doc-edit"
                class="h-7 px-3.5 rounded-md text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                ${Icons.save('w-3.5 h-3.5')} <span>Guardar Cambios</span>
              </button>
            </div>
          </div>

          <!-- Markdown Split Editor -->
          <div id="editor-pane-markdown" class="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
            <div class="flex flex-col space-y-1.5">
              <div class="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
                <span>Markdown Source (.md)</span>
                <span>GitHub Alerts, Tables, Mermaid</span>
              </div>
              <textarea
                id="doc-editor-textarea"
                rows="24"
                class="w-full p-4 font-mono text-xs rounded-lg border border-zinc-800 bg-zinc-900/70 text-zinc-100 resize-none focus:outline-none focus:border-indigo-500 leading-relaxed h-[560px] overflow-y-auto"
              >${escapeHtml(activeDocContent)}</textarea>
            </div>

            <div class="flex flex-col space-y-1.5">
              <div class="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
                <span>Live Preview</span>
                <span class="text-emerald-400">● Synchronized Scroll</span>
              </div>
              <div id="doc-editor-live-preview" class="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 overflow-y-auto h-[560px] prose dark:prose-invert max-w-none text-xs">
                ${renderMarkdown(activeDocContent)}
              </div>
            </div>
          </div>

          <!-- Visual Blocks Editor -->
          <div id="editor-pane-blocks" class="hidden space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono">
              <span class="font-semibold text-zinc-300 flex items-center gap-1.5">
                ${Icons.grid('w-3.5 h-3.5')} <span>Add Block:</span>
              </span>
              <div class="flex flex-wrap items-center gap-1.5">
                <button type="button" data-add-block="header" class="h-6 px-2.5 rounded bg-zinc-950 border border-zinc-800 hover:border-indigo-500 text-zinc-200 cursor-pointer">Header</button>
                <button type="button" data-add-block="paragraph" class="h-6 px-2.5 rounded bg-zinc-950 border border-zinc-800 hover:border-indigo-500 text-zinc-200 cursor-pointer">Paragraph</button>
                <button type="button" data-add-block="business_rule" class="h-6 px-2.5 rounded bg-zinc-950 border border-zinc-800 hover:border-amber-500 text-zinc-200 cursor-pointer">Rule BR</button>
                <button type="button" data-add-block="callout" class="h-6 px-2.5 rounded bg-zinc-950 border border-zinc-800 hover:border-cyan-500 text-zinc-200 cursor-pointer">Callout</button>
                <button type="button" data-add-block="code" class="h-6 px-2.5 rounded bg-zinc-950 border border-zinc-800 hover:border-purple-500 text-zinc-200 cursor-pointer">Mermaid / Code</button>
              </div>
            </div>
            <div id="doc-editor-blocks-container" class="space-y-3 max-h-[560px] overflow-y-auto pr-1"></div>
          </div>
        </div>

      </div>

      <!-- ============================================================== -->
      <!-- MODAL: CREAR NUEVA PÁGINA EN LIBRARY (Plane CreatePageModal)   -->
      <!-- ============================================================== -->
      <div id="new-doc-modal" class="fixed inset-0 z-50 bg-zinc-950/75 backdrop-blur-xs hidden items-center justify-center p-4">
        <div class="w-full max-w-xl bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl p-5 space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 class="text-xs font-bold text-zinc-100 flex items-center gap-2">
              ${Icons.page('w-4 h-4 text-indigo-400')} <span>Create New Library Page (.md + SQLite)</span>
            </h3>
            <button type="button" data-action="close-new-doc-modal" class="w-6 h-6 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-100 flex items-center justify-center cursor-pointer">
              ${Icons.close('w-3.5 h-3.5')}
            </button>
          </div>

          <form id="new-doc-form" class="space-y-3 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-mono text-[11px] text-zinc-400 mb-1">Module or Shelf:</label>
                <input type="text" id="new-doc-module" placeholder="general, backend, billing, infra..." value="general" class="w-full px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-xs focus:border-indigo-500 focus:outline-none" required />
              </div>
              <div>
                <label class="block font-mono text-[11px] text-zinc-400 mb-1">Page Access (Plane Visibility):</label>
                <select id="new-doc-access" class="w-full px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-xs focus:border-indigo-500 focus:outline-none">
                  <option value="0">Public (Visible in Library)</option>
                  <option value="1">Private (Personal / Draft)</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-mono text-[11px] text-zinc-400 mb-1">Filename (.md):</label>
              <input type="text" id="new-doc-filename" placeholder="my-specification.md" class="w-full px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-xs focus:border-indigo-500 focus:outline-none" required />
            </div>

            <div>
              <label class="block font-mono text-[11px] text-zinc-400 mb-1">Initial Markdown Content:</label>
              <textarea id="new-doc-content" rows="8" placeholder="# Page Title&#10;&#10;Specification and requirements..." class="w-full p-3 font-mono text-xs rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 resize-none focus:border-indigo-500 focus:outline-none" required></textarea>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2">
              <button type="button" data-action="close-new-doc-modal" class="h-7 px-3 rounded-md text-zinc-400 hover:bg-zinc-800 font-medium cursor-pointer">
                Cancel
              </button>
              <button type="submit" class="h-7 px-3.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors cursor-pointer">
                Create Page
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- MODAL: EXPORTAR PÁGINA (Plane ExportPageModal)                 -->
      <!-- ============================================================== -->
      <div id="export-page-modal" class="fixed inset-0 z-50 bg-zinc-950/75 backdrop-blur-xs hidden items-center justify-center p-4">
        <div class="w-full max-w-md bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl p-5 space-y-4 text-xs">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 class="text-xs font-bold text-zinc-100 flex items-center gap-2">
              ${Icons.download('w-4 h-4 text-indigo-400')} <span>Export Page (Plane Library Exporter)</span>
            </h3>
            <button type="button" data-action="close-export-page-modal" class="w-6 h-6 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-100 flex items-center justify-center cursor-pointer">
              ${Icons.close('w-3.5 h-3.5')}
            </button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block font-mono text-[11px] text-zinc-400 mb-1">Export Scope:</label>
              <select id="export-page-scope" class="w-full px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-xs focus:border-indigo-500 focus:outline-none">
                <option value="active">Active / Selected Page</option>
                <option value="all">Full Sovereign Library Bundle (All Pages)</option>
              </select>
            </div>

            <div>
              <label class="block font-mono text-[11px] text-zinc-400 mb-1">Format:</label>
              <select id="export-page-format" class="w-full px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-xs focus:border-indigo-500 focus:outline-none">
                <option value="md">Markdown (.md)</option>
                <option value="html">Standalone HTML Report (.html)</option>
              </select>
            </div>

            <label class="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 cursor-pointer">
              <span class="text-zinc-300">Include Mermaid Diagrams & Assets</span>
              <input type="checkbox" id="export-page-include-assets" checked class="accent-indigo-500 rounded cursor-pointer" />
            </label>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
            <button type="button" data-action="close-export-page-modal" class="h-7 px-3 rounded-md text-zinc-400 hover:bg-zinc-800 font-medium cursor-pointer">
              Cancel
            </button>
            <button
              type="button"
              data-action="confirm-export-page"
              class="h-7 px-3.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              ${Icons.download('w-3.5 h-3.5')}
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- MODAL: PROMPT BUNDLER DINÁMICO PARA IA (SYSTEM PROMPT)          -->
      <!-- ============================================================== -->
      <div id="ai-context-modal" class="fixed inset-0 z-50 bg-zinc-950/75 backdrop-blur-xs hidden items-center justify-center p-4">
        <div class="w-full max-w-2xl bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl p-5 space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 class="text-xs font-bold text-zinc-100 flex items-center gap-2">
              ${Icons.sparkles('w-4 h-4 text-indigo-400')} <span>Canonical AI System Prompt (Zero-Bias Context)</span>
            </h3>
            <button type="button" data-action="close-ai-context-modal" class="w-6 h-6 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-100 flex items-center justify-center cursor-pointer">
              ${Icons.close('w-3.5 h-3.5')}
            </button>
          </div>
          <p class="text-xs text-zinc-400">
            Copy this live-generated context from the harness SQLite + Markdown Library to initialize any LLM agent without bias:
          </p>
          <div class="relative">
            <textarea id="ai-context-prompt-text" readonly rows="13" class="w-full p-3.5 font-mono text-[11px] rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-200 resize-none focus:outline-none leading-relaxed">${escapeHtml(dynamicAiPrompt)}</textarea>
          </div>
          <div class="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              id="copy-context-btn"
              class="h-7 px-3.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- MODAL: EXPANDIR DIAGRAMAS A PANTALLA COMPLETA                   -->
      <!-- ============================================================== -->
      <div id="diagram-modal" class="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-xs hidden items-center justify-center p-4">
        <div class="w-full max-w-6xl max-h-[92vh] bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
          <div class="px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-indigo-400">${Icons.architecture('w-4 h-4')}</span>
              <h3 id="diagram-modal-title" class="font-bold text-xs text-zinc-100">Expanded Diagram</h3>
            </div>
            <button type="button" data-action="close-diagram-modal" class="w-6 h-6 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-100 flex items-center justify-center cursor-pointer">
              ${Icons.close('w-3.5 h-3.5')}
            </button>
          </div>
          <div id="diagram-modal-content" class="p-6 overflow-auto flex-1 flex justify-center items-center bg-zinc-950"></div>
        </div>
      </div>

    </div>
  `;
}

function getShelfIconSvg(shelfId, cls = 'w-4 h-4') {
  switch (shelfId) {
    case 'architecture': return Icons.architecture(cls);
    case 'business_rules': return Icons.scale(cls);
    case 'requirements': return Icons.fileText(cls);
    case 'adrs': return Icons.cube(cls);
    case 'standards': return Icons.shield(cls);
    case 'modules': return Icons.folder(cls);
    default: return Icons.book(cls);
  }
}

function renderTableOfContentsHtml(toc = []) {
  if (!toc || toc.length === 0) {
    return `<div class="text-[11px] text-zinc-500 italic py-1">No headings in this page.</div>`;
  }

  return `
    <nav class="space-y-0.5 text-xs font-mono">
      ${toc.map(item => `
        <a href="#${item.id}"
           class="block py-1 px-2 rounded hover:bg-zinc-900 hover:text-indigo-300 transition-colors truncate text-zinc-400 ${item.level === 1 ? 'font-bold text-zinc-200' : item.level === 2 ? 'pl-3' : 'pl-5 text-[11px]'}"
           title="${escapeAttr(item.text)}">
          ${escapeHtml(item.text)}
        </a>
      `).join('')}
    </nav>
  `;
}

function buildAiSystemPrompt({ projectSpec, kData, rules = [], services = [], guardrails = [], naming = {} }) {
  const pName = projectSpec?.project?.name || projectSpec?.name || 'Sistema de Ingeniería Soberana';
  const archStyle = projectSpec?.architecture?.style || 'Clean Architecture (Hexagonal)';
  const patterns = (projectSpec?.architecture?.patterns || []).join(', ');
  const stack = projectSpec?.tech_stack ? Object.entries(projectSpec.tech_stack).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : (v?.name || v)}`).join(' | ') : 'Agnóstico';

  const rulesText = rules.slice(0, 10).map(r => `- ${r.id} (${r.module || 'general'}): ${r.title}. ${r.description}`).join('\n');
  const servicesText = services.map(s => `- ${s.name} (${s.type}): Protocolo ${s.protocol}, Auth: ${s.auth}, Var: ${s.env_var}`).join('\n');
  const guardrailsText = guardrails.map(g => `- [GUARDRAIL] ${g}`).join('\n');

  return `# Contexto Canónico del Proyecto — ${pName}
Arquitectura: ${archStyle} ${patterns ? `(${patterns})` : ''}
Stack Tecnológico: ${stack}

## Reglas de Negocio Clave (Invariantes Obligatorias):
${rulesText || '- Sin reglas de negocio registradas aún.'}

## Integraciones y Servicios Externos:
${servicesText || '- Sin servicios externos registrados aún.'}

## Guardrails Anti-Sesgo & Estándares:
${guardrailsText || '- No inventar librerías redundantes.\n- Respetar convención de ramas {type}/INT-{id}/{name} (≤80c).'}

## Convenciones de Nomenclatura:
- Archivos: ${naming.files || 'kebab-case'}
- Clases / Tipos: ${naming.classes || 'PascalCase'}
- Ramas Git: {type}/INT-{id}/{name} (≤80c)
- Commits: Conventional Commits (feat, fix, docs, refactor)
`;
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(text) {
  if (!text) return '';
  return String(text).replace(/"/g, '&quot;');
}

function getFallbackKnowledge() {
  if (typeof window !== 'undefined' && window.__FALLBACK_DATA__?.knowledgeIndex) {
    return window.__FALLBACK_DATA__.knowledgeIndex;
  }
  return {
    diagrams: [],
    business_rules: [],
    external_services: [],
    coding_standards: { guardrails: [], naming_conventions: {} },
    docs: getDefaultDocs()
  };
}

function buildDocMetadataFallback(docs) {
  const meta = {};
  for (const [k, c] of Object.entries(docs)) {
    const words = c.trim().split(/\s+/).length;
    meta[k] = {
      key: k,
      title: k.replace(/\.md$/, '').replace(/[-_]/g, ' '),
      summary: c.slice(0, 140) + '...',
      shelf: k.startsWith('modules/') ? 'modules' : 'architecture',
      readingTime: Math.max(1, Math.ceil(words / 200)),
      wordCount: words,
      ruleCount: (c.match(/BR-[A-Z]+-[0-9]+/g) || []).length,
      reqCount: (c.match(/RF-[A-Z]+-[0-9]+/g) || []).length,
      adrCount: (c.match(/ADR-[0-9]+/g) || []).length,
      moduleName: k.startsWith('modules/') ? k.split('/')[1] : null
    };
  }
  return meta;
}

function buildShelvesFallback(docMetadata) {
  const shelves = {
    architecture: { id: 'architecture', title: 'Arquitectura & Modelado C4', iconName: 'architecture', docs: [] },
    business_rules: { id: 'business_rules', title: 'Reglas de Negocio & Dominio', iconName: 'business_rules', docs: [] },
    requirements: { id: 'requirements', title: 'Requerimientos & Metodología Ágil', iconName: 'requirements', docs: [] },
    adrs: { id: 'adrs', title: 'Decisiones de Arquitectura (ADRs)', iconName: 'adrs', docs: [] },
    standards: { id: 'standards', title: 'Estándares, Capacidades & Servicios', iconName: 'standards', docs: [] },
    modules: { id: 'modules', title: 'Módulos & Bounded Contexts', iconName: 'modules', docs: [] }
  };
  for (const [k, m] of Object.entries(docMetadata)) {
    const s = m.shelf && shelves[m.shelf] ? m.shelf : (k.startsWith('modules/') ? 'modules' : 'architecture');
    shelves[s].docs.push(k);
  }
  return shelves;
}

function buildModulesDataFallback(docMetadata) {
  const modules = {};
  for (const [k, m] of Object.entries(docMetadata)) {
    if (k.startsWith('modules/')) {
      const parts = k.split('/');
      const modId = parts[1];
      const filename = parts.slice(2).join('/');
      if (!modules[modId]) {
        modules[modId] = {
          id: modId,
          name: modId,
          title: modId.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          status: 'COMPLETAMENTE CUBIERTO',
          docs: [],
          docMetadata: {}
        };
      }
      modules[modId].docs.push(k);
      modules[modId].docMetadata[filename] = m;
    }
  }
  return modules;
}

function getDefaultDocs() {
  return {
    'c4-model.md': '# Modelo C4 — Arquitectura de Sistema y Contenedores\n\n> [!NOTE]\n> Especificación de contexto y contenedores del sistema.\n\n## Componentes\n- API Gateway\n- Microservicios de Dominio\n- Bases de datos transaccionales',
    'coding-standards.md': '# Estándares de Codificación & Guardrails Anti-Sesgo\n\n> [!NOTE]\n> Este documento define las directrices obligatorias para desarrolladores y agentes de IA.\n\n## Convenciones\n- **Ramas**: `{type}/INT-{id}/{name}` (≤80c)\n- **Commits**: `feat(scope): desc` o `fix(scope): desc`\n\n## Guardrails Estrictos\n1. No instalar librerías redundantes.\n2. Inversión de dependencias estricta en controladores.'
  };
}
