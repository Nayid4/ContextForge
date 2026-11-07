/**
 * PageShelfTree Component (Plane Pages Sidebar & Quick Filter Tabs)
 * Árbol jerárquico de estantes temáticos y documentos vivos Markdown con filtros rápidos,
 * indicadores de página normativa bloqueada (lock), favorita (star) y conteo de diagramas.
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { Icons } from '../../../shared/ui/Icons.js';
import { renderList } from '../../../shared/utils/renderList.js';

export function PageShelfTree({
  shelves = {},
  activePageId = null,
  searchQuery = '',
  filterTab = 'all' // 'all' | 'favorites' | 'locked' | 'modules'
} = {}) {
  const shelfKeys = Object.keys(shelves);

  const filterTabs = [
    { id: 'all', label: 'Todas' },
    { id: 'favorites', label: 'Favoritas' },
    { id: 'locked', label: 'Normativas' },
    { id: 'modules', label: 'Por Módulo' }
  ];

  const matchesFilterTab = (page, sKey) => {
    if (filterTab === 'favorites') return Boolean(page.is_favorite);
    if (filterTab === 'locked') return Boolean(page.is_locked);
    if (filterTab === 'modules') return Boolean(page.module_id) || sKey === 'modules' || sKey === 'specs';
    return true;
  };

  const renderShelf = (sKey) => {
    const shelf = shelves[sKey];
    if (!shelf || !Array.isArray(shelf.pages) || shelf.pages.length === 0) return '';

    const visiblePages = shelf.pages.filter(p => matchesFilterTab(p, sKey));
    if (visiblePages.length === 0) return '';

    return `
      <div class="space-y-1">
        <div class="px-2 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
          <span>${shelf.name}</span>
          <span class="font-mono text-[9px] text-zinc-400">${visiblePages.length}</span>
        </div>

        <div class="space-y-0.5">
          ${renderList(visiblePages, page => {
            const isSelected = page.id === activePageId;
            const isLocked = Boolean(page.is_locked);
            const isFavorite = Boolean(page.is_favorite);
            const diagCount = Number(page.diagrams_count || 0);

            return `
              <button
                data-page-id="${page.id}"
                class="plane-page-item w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left truncate ${
                  isSelected
                    ? 'bg-indigo-600/15 text-indigo-300 font-semibold border border-indigo-500/25 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                }"
                title="${page.title}"
              >
                <div class="flex items-center gap-2 min-w-0 flex-1">
                  ${Icons.fileText('w-3.5 h-3.5 shrink-0 text-zinc-400')}
                  <span class="truncate">${page.title}</span>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  ${isFavorite ? `<span class="text-amber-400" title="Página Favorita">${Icons.star('w-3 h-3 fill-amber-400')}</span>` : ''}
                  ${isLocked ? `<span class="text-amber-400/90" title="Página Normativa Bloqueada">${Icons.lock('w-3 h-3')}</span>` : ''}
                  ${diagCount > 0 ? `<span class="px-1 py-0.2 rounded bg-zinc-800/90 text-[9px] font-mono text-indigo-300 border border-zinc-700/60" title="${diagCount} diagramas Mermaid">${diagCount}d</span>` : ''}
                </div>
              </button>
            `;
          })}
        </div>
      </div>
    `;
  };

  const renderedShelves = renderList(shelfKeys, renderShelf);

  return `
    <aside class="w-full md:w-80 border-b md:border-b-0 md:border-r border-zinc-800/80 bg-zinc-950/70 flex flex-col shrink-0">
      <!-- Search Box & Quick Filter Tabs -->
      <div class="p-3 border-b border-zinc-800/80 space-y-2.5">
        <div class="relative">
          <input
            id="plane-pages-search"
            type="text"
            value="${searchQuery}"
            placeholder="Filtrar páginas..."
            class="w-full pl-8 pr-3 py-1.5 bg-zinc-900/60 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <div class="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-zinc-500">
            ${Icons.search('w-3.5 h-3.5')}
          </div>
        </div>

        <!-- Plane Filter Tabs (Todas, Favoritas, Normativas, Por Módulo) -->
        <div id="plane-pages-filter-tabs" class="grid grid-cols-4 gap-1 p-0.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80">
          ${renderList(filterTabs, tab => {
            const isActive = filterTab === tab.id;
            return `
              <button
                type="button"
                data-action="set-page-tree-filter"
                data-filter="${tab.id}"
                class="px-1.5 py-1 rounded-md text-[10px] font-semibold transition-all truncate ${
                  isActive
                    ? 'bg-indigo-600/25 text-indigo-300 border border-indigo-500/30 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                }"
              >
                ${tab.label}
              </button>
            `;
          })}
        </div>
      </div>

      <!-- Shelves Navigation List -->
      <nav class="flex-1 p-3 space-y-4 overflow-y-auto">
        ${renderedShelves.trim() ? renderedShelves : `
          <div class="p-6 text-center text-xs text-zinc-500">
            No hay páginas que coincidan con el filtro seleccionado.
          </div>
        `}
      </nav>
    </aside>
  `;
}
