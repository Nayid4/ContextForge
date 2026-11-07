/**
 * PageShelfTree Component
 * Árbol jerárquico de estantes temáticos y documentos vivos Markdown.
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { Icons } from '../../../shared/ui/Icons.js';
import { renderList } from '../../../shared/utils/renderList.js';

export function PageShelfTree({
  shelves = {},
  activePageId = null,
  searchQuery = ''
} = {}) {
  const shelfKeys = Object.keys(shelves);

  const renderShelf = (sKey) => {
    const shelf = shelves[sKey];
    if (!shelf || shelf.pages.length === 0) return '';

    return `
      <div class="space-y-1">
        <div class="px-2 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
          <span>${shelf.name}</span>
          <span class="font-mono text-[9px] text-zinc-400">${shelf.pages.length}</span>
        </div>

        <div class="space-y-0.5">
          ${renderList(shelf.pages, page => {
            const isSelected = page.id === activePageId;
            return `
              <button
                data-page-id="${page.id}"
                class="plane-page-item w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left truncate ${
                  isSelected
                    ? 'bg-indigo-600/15 text-indigo-300 font-semibold border border-indigo-500/25 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                }"
                title="${page.title}"
              >
                ${Icons.fileText('w-3.5 h-3.5 shrink-0 text-zinc-400')}
                <span class="truncate">${page.title}</span>
              </button>
            `;
          })}
        </div>
      </div>
    `;
  };

  return `
    <aside class="w-full md:w-80 border-b md:border-b-0 md:border-r border-zinc-800/80 bg-zinc-950/70 flex flex-col shrink-0">
      <!-- Search Box -->
      <div class="p-3 border-b border-zinc-800/80">
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
      </div>

      <!-- Shelves Navigation List -->
      <nav class="flex-1 p-3 space-y-4 overflow-y-auto">
        ${renderList(shelfKeys, renderShelf)}
      </nav>
    </aside>
  `;
}
