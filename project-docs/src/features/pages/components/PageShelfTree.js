import { Icons } from '../../../shared/Icons.js';
import { renderList } from '../../../shared/utils/renderList.js';

export function PageShelfTree({
  shelves = {},
  activePageId = null,
  searchQuery = ''
}) {
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
            id="plane-page-search"
            type="text"
            placeholder="Buscar documentos..."
            value="${searchQuery}"
            class="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-500 text-xs focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
          />
          <span class="absolute left-2.5 top-2 text-zinc-500 pointer-events-none">
            ${Icons.search('w-3.5 h-3.5')}
          </span>
        </div>
      </div>

      <!-- Shelf & Pages Tree List -->
      <div class="flex-1 p-2 space-y-3 overflow-y-auto">
        ${renderList(shelfKeys, renderShelf, 'No hay documentos que coincidan con la búsqueda')}
      </div>
    </aside>
  `;
}
