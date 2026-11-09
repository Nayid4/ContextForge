/**
 * PagesHeader Component (Plane Library Header & Navigation)
 * Fiel 1:1 a apps/web/components/pages/header/tab-navigation.tsx y order-by.tsx de Plane:
 * - Altura fija: h-11 con borde continuo border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950
 * - Tipografía de pestañas: text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200
 * - Pestaña activa: text-gray-900 dark:text-zinc-100 font-semibold border-b-2 border-indigo-600 dark:border-indigo-500 -mb-[1px]
 * - Badges numéricos planos: text-[11px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 font-mono
 * - Controles: List/Card toggle, Search con Ctrl+K, Sort by con toggle ASC/DESC, Filters Popover,
 *   AI Context, Import, Export y New Page split button (Blank / Template).
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { Icons } from '../../../shared/Icons.js';

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

function getShelfIconSvg(shelfId, cls = 'w-3 h-3') {
  switch (shelfId) {
    case 'architecture': return Icons.architecture ? Icons.architecture(cls) : Icons.layers(cls);
    case 'business_rules': return Icons.scale ? Icons.scale(cls) : Icons.shield(cls);
    case 'requirements': return Icons.fileText(cls);
    case 'adrs': return Icons.cube ? Icons.cube(cls) : Icons.box(cls);
    case 'standards': return Icons.shield(cls);
    case 'modules': return Icons.folder(cls);
    default: return Icons.book(cls);
  }
}

export function renderPagesHeader({
  allCount = 0,
  createdByMeCount = 0,
  favoritedCount = 0,
  archivedCount = 0,
  publicCount = 0,
  privateCount = 0,
  moduleNames = [],
  rules = [],
  services = [],
  shelvesData = {},
  docKeys = []
}) {
  return `
    <!-- 1.1 Plane PagesListHeaderRoot: Unified Tab Navigation + Search/Sort/Filter + Actions -->
    <div class="h-11 px-5 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
      <!-- Left: Plane PageTabNavigation (All Pages, Created by me, Favorited, Archived | Public, Private) -->
      <div class="flex items-center gap-1 overflow-x-auto h-full" id="kb-perspective-nav">
        <!-- Plane Primary State Tabs (tab-navigation.tsx) -->
        <button
          type="button"
          data-page-tab="all"
          data-kb-perspective="global"
          class="kb-page-state-tab kb-perspective-btn active h-11 px-3 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-900 dark:text-zinc-100 border-b-2 border-indigo-600 dark:border-indigo-500 -mb-[1px] transition-all cursor-pointer shrink-0"
        >
          ${Icons.page('w-3.5 h-3.5 text-indigo-500')}
          <span>All Pages</span>
          <span id="kb-tab-count-all" class="text-[11px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 font-mono">${allCount}</span>
        </button>

        <button
          type="button"
          data-page-tab="created_by_me"
          data-kb-perspective="global"
          class="kb-page-state-tab kb-perspective-btn h-11 px-3 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200 border-b-2 border-transparent -mb-[1px] transition-all cursor-pointer shrink-0"
        >
          ${Icons.user('w-3.5 h-3.5')}
          <span>Created by me</span>
          <span id="kb-tab-count-created" class="text-[11px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 font-mono">${createdByMeCount}</span>
        </button>

        <button
          type="button"
          data-page-tab="favorited"
          data-kb-perspective="global"
          class="kb-page-state-tab kb-perspective-btn h-11 px-3 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200 border-b-2 border-transparent -mb-[1px] transition-all cursor-pointer shrink-0"
        >
          ${Icons.star('w-3.5 h-3.5 text-amber-500')}
          <span>Favorited</span>
          <span id="kb-tab-count-favorited" class="text-[11px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 font-mono">${favoritedCount}</span>
        </button>

        <button
          type="button"
          data-page-tab="archived"
          data-page-access-tab="archived"
          data-kb-perspective="global"
          class="kb-page-state-tab kb-perspective-btn h-11 px-3 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200 border-b-2 border-transparent -mb-[1px] transition-all cursor-pointer shrink-0"
        >
          ${Icons.archive('w-3.5 h-3.5')}
          <span>Archived</span>
          <span id="kb-tab-count-archived" class="text-[11px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 font-mono">${archivedCount}</span>
        </button>

        <span class="h-4 w-px bg-gray-200 dark:bg-zinc-800 mx-1 shrink-0" aria-hidden="true"></span>

        <!-- Access Sub-Pills (Public / Private) -->
        <button
          type="button"
          data-page-access-tab="public"
          class="kb-access-tab-btn h-11 px-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200 border-b-2 border-transparent -mb-[1px] transition-all cursor-pointer shrink-0"
        >
          ${Icons.globe('w-3.5 h-3.5 text-indigo-500')}
          <span>Public</span>
          <span id="kb-tab-count-public" class="text-[10px] text-gray-500 dark:text-zinc-500 font-mono">${publicCount}</span>
        </button>
        <button
          type="button"
          data-page-access-tab="private"
          class="kb-access-tab-btn h-11 px-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200 border-b-2 border-transparent -mb-[1px] transition-all cursor-pointer shrink-0"
        >
          ${Icons.lock('w-3.5 h-3.5 text-violet-500')}
          <span>Private</span>
          <span id="kb-tab-count-private" class="text-[10px] text-gray-500 dark:text-zinc-500 font-mono">${privateCount}</span>
        </button>
      </div>

      <!-- Right: Plane PageHeaderFilters (Search, OrderBy, Filters) & Actions -->
      <div class="flex items-center gap-1.5">
        <!-- 0. Plane View Layout Toggle (List View vs Card / Gallery View) -->
        <div class="inline-flex items-center rounded-md bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-0.5 gap-0.5">
          <button
            type="button"
            id="btn-view-layout-list"
            data-action="set-library-view-layout"
            data-view-layout="list"
            class="h-6 w-6 rounded bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 shadow-2xs flex items-center justify-center transition-colors cursor-pointer"
            title="List view"
          >
            ${Icons.list('w-3.5 h-3.5')}
          </button>
          <button
            type="button"
            id="btn-view-layout-card"
            data-action="set-library-view-layout"
            data-view-layout="card"
            class="h-6 w-6 rounded text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
            title="Card / Gallery view"
          >
            ${Icons.layoutGrid('w-3.5 h-3.5')}
          </button>
        </div>

        <!-- 1. Plane Search Input with Ctrl+K shortcut -->
        <div class="relative">
          <input
            type="text"
            id="kb-library-search-input"
            placeholder="Search pages..."
            class="h-7 w-40 sm:w-52 pl-7 pr-10 rounded-md text-xs bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
          />
          <span class="absolute left-2 top-1.5 text-gray-400 dark:text-zinc-500 pointer-events-none">
            ${Icons.search('w-3.5 h-3.5')}
          </span>
          <kbd class="hidden sm:inline-block absolute right-1.5 top-1.5 px-1 py-0.2 text-[9px] font-mono text-gray-400 dark:text-zinc-400 bg-gray-200/60 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded">Ctrl+K</kbd>
        </div>

        <!-- 2. Plane PageOrderByDropdown (Sort by Last modified / Date created / Title + Asc/Desc) -->
        <div class="inline-flex items-center rounded-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 h-7 px-1.5 gap-1 shadow-2xs">
          <span class="text-gray-400 dark:text-zinc-500">${Icons.arrowUpDown('w-3 h-3')}</span>
          <select
            id="kb-sort-by-select"
            aria-label="Ordenar páginas por"
            class="bg-transparent text-gray-700 dark:text-zinc-300 text-[11px] font-mono focus:outline-none cursor-pointer pr-1"
          >
            <option value="updated_at" class="bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200">Last modified</option>
            <option value="created_at" class="bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200">Date created</option>
            <option value="name" class="bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200">Title</option>
          </select>
          <button
            type="button"
            id="kb-sort-dir-btn"
            data-action="toggle-kb-sort-dir"
            data-sort-dir="desc"
            class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[10px] font-mono text-indigo-600 dark:text-indigo-300 cursor-pointer"
            title="Toggle ASC / DESC"
          >
            <span id="kb-sort-dir-icon">${Icons.sortDesc('w-3 h-3')}</span>
            <span id="kb-sort-dir-text">DESC</span>
          </button>
        </div>

        <!-- 3. Plane PageFiltersSelection Popover -->
        <div class="relative">
          <button
            type="button"
            data-action="toggle-kb-filters-popover"
            class="h-7 inline-flex items-center gap-1.5 px-2.5 rounded-md bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
            title="Filtrar páginas"
          >
            ${Icons.filter('w-3 h-3 text-gray-400 dark:text-zinc-400')}
            <span>Filters</span>
          </button>

          <div
            id="kb-filters-popover"
            class="hidden absolute right-0 top-8 z-40 w-64 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-3 text-xs text-gray-800 dark:text-zinc-200"
          >
            <div class="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-1.5">
              <span class="font-semibold text-gray-900 dark:text-zinc-200">Plane Page Filters</span>
              <button
                type="button"
                data-action="clear-kb-filters"
                class="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Reset
              </button>
            </div>

            <label class="flex items-center justify-between gap-2 py-1 px-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800/60 cursor-pointer">
              <span class="flex items-center gap-2 text-gray-700 dark:text-zinc-300">
                ${Icons.star('w-3.5 h-3.5 text-amber-500')}
                <span>Favorites only</span>
              </span>
              <input type="checkbox" id="kb-filter-favorites-chk" class="accent-indigo-600 rounded cursor-pointer" />
            </label>

            <label class="flex items-center justify-between gap-2 py-1 px-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800/60 cursor-pointer">
              <span class="flex items-center gap-2 text-gray-700 dark:text-zinc-300">
                ${Icons.lock('w-3.5 h-3.5 text-amber-500')}
                <span>Locked (Normative)</span>
              </span>
              <input type="checkbox" id="kb-filter-locked-chk" class="accent-indigo-600 rounded cursor-pointer" />
            </label>

            <div class="space-y-1 pt-1 border-t border-gray-200 dark:border-zinc-800/80">
              <span class="text-[10px] font-mono uppercase text-gray-500 dark:text-zinc-400">Created by (Bot Agent)</span>
              <select
                id="kb-filter-owner-select"
                class="w-full h-7 px-2 rounded bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-zinc-200 text-xs font-mono focus:outline-none focus:border-indigo-500"
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
          class="h-7 inline-flex items-center gap-1.5 px-2.5 rounded-md bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-600/15 dark:hover:bg-indigo-600/25 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-xs font-medium transition-colors cursor-pointer"
          title="Generar System Prompt Anti-Sesgo para IA"
        >
          ${Icons.sparkles('w-3.5 h-3.5')}
          <span class="hidden xl:inline">AI Context</span>
        </button>

        <!-- 5. Import & Export -->
        <button
          type="button"
          data-action="trigger-import-doc"
          class="h-7 inline-flex items-center gap-1.5 px-2 rounded-md bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
          title="Importar archivo Markdown (.md)"
        >
          ${Icons.upload('w-3.5 h-3.5')}
          <span class="hidden xl:inline">Import</span>
        </button>
        <input type="file" id="import-doc-file-input" accept=".md,.markdown" class="hidden" />

        <button
          type="button"
          data-action="open-export-page-modal"
          class="h-7 inline-flex items-center gap-1.5 px-2 rounded-md bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
          title="Exportar páginas (Plane Export Modal: Markdown / Reporte)"
        >
          ${Icons.download('w-3.5 h-3.5')}
          <span class="hidden xl:inline">Export</span>
        </button>

        <!-- 6. New Page with Dropdown (Blank page / From template) -->
        <div class="relative inline-flex items-center">
          <button
            type="button"
            id="btn-new-page-main"
            data-action="open-new-doc-modal"
            class="h-7 inline-flex items-center gap-1.5 px-2.5 rounded-l-md bg-[#0070e0] hover:bg-[#005fb8] text-white text-xs font-medium shadow-2xs transition-colors cursor-pointer"
          >
            ${Icons.plus('w-3.5 h-3.5')}
            <span>New Page</span>
          </button>
          <button
            type="button"
            id="btn-new-page-dropdown-toggle"
            data-action="toggle-new-page-dropdown"
            class="h-7 px-1.5 rounded-r-md bg-[#0064c8] hover:bg-[#0057ab] text-white border-l border-white/20 text-xs font-medium transition-colors cursor-pointer"
            title="More page options"
          >
            ${Icons.chevronDown('w-3 h-3')}
          </button>
          <div
            id="new-page-dropdown-menu"
            class="hidden absolute right-0 top-8 z-40 w-44 py-1 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xl text-xs font-sans text-gray-700 dark:text-zinc-200"
          >
            <button
              type="button"
              data-action="open-new-blank-page"
              class="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-zinc-800 text-left cursor-pointer"
            >
              ${Icons.page('w-3.5 h-3.5 text-gray-400')}
              <span>Blank page</span>
            </button>
            <button
              type="button"
              data-action="open-new-template-page"
              class="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-zinc-800 text-left cursor-pointer"
            >
              ${Icons.template ? Icons.template('w-3.5 h-3.5 text-indigo-500') : Icons.fileText('w-3.5 h-3.5 text-indigo-500')}
              <span>From template</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
