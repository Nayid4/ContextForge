/**
 * PlaneTopBar Component (Shared UI)
 * Barra superior compacta idéntica a Plane (h-12):
 * Breadcrumbs con icono de proyecto + vista activa, disparador de búsqueda (Ctrl+K),
 * botón de sincronización SQLite/.md y conmutador de tema.
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { Icons } from './Icons.js';

export function renderPlaneTopBar({
  currentView = 'issues',
  viewTitle = 'Work items',
  activeProject = 'Arnés SDD Multi-Agente',
  activeCollection = 'product',
  theme = 'light'
} = {}) {
  const collectionMeta = {
    product: { label: 'Product', icon: Icons.monitor, color: 'text-orange-500' },
    engineering: { label: 'Engineering', icon: Icons.flag, color: 'text-amber-500' },
    general: { label: 'General', icon: Icons.folder, color: 'text-sky-500' },
    design: { label: 'Design', icon: Icons.palette, color: 'text-purple-500' },
    customer_support: { label: 'Customer support', icon: Icons.messageSquare, color: 'text-emerald-500' },
    home: { label: 'Home', icon: Icons.home, color: 'text-gray-500' },
    library: { label: 'Library', icon: Icons.bookOpen, color: 'text-indigo-500' },
    favorites: { label: 'Favorites', icon: Icons.star, color: 'text-amber-400' },
    shared: { label: 'Shared', icon: Icons.share, color: 'text-blue-500' },
    private: { label: 'Private', icon: Icons.lock, color: 'text-gray-500' }
  };

  const activeCol = collectionMeta[activeCollection] || collectionMeta.product;

  const viewIconMap = {
    issues: Icons.kanban,
    cycles: Icons.cycle,
    modules: Icons.moduleIcon,
    pages: activeCol.icon,
    architecture: Icons.layers,
    graph: Icons.gitTree,
    tree: Icons.gitTree,
    constellation: Icons.cube,
    analytics: Icons.activity,
    harness: Icons.bot
  };
  const activeIconFn = viewIconMap[currentView] || Icons.kanban;

  return `
    <header class="h-12 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-5 flex items-center justify-between gap-4 sticky top-0 z-20 select-none shrink-0 transition-colors">
      <!-- Left: Plane Breadcrumbs -->
      <div class="flex items-center gap-2 text-xs min-w-0">
        ${currentView === 'pages' ? `
          <div class="flex items-center gap-2 text-gray-800 dark:text-zinc-200 font-medium">
            <span class="${activeCol.color} shrink-0">${activeCol.icon('w-4 h-4')}</span>
            <span class="font-medium text-xs sm:text-sm text-gray-900 dark:text-zinc-100">${activeCol.label}</span>
          </div>
        ` : `
          <div class="flex items-center gap-1.5 text-gray-500 dark:text-zinc-400 font-medium truncate">
            <span class="w-4 h-4 rounded bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-[9px] font-mono font-bold shrink-0">
              P
            </span>
            <span class="truncate hidden sm:inline text-gray-600 dark:text-zinc-400">${activeProject}</span>
          </div>
          <span class="text-gray-300 dark:text-zinc-600">/</span>
          <div class="flex items-center gap-1.5 text-gray-900 dark:text-zinc-100 min-w-0">
            <span class="text-gray-500 dark:text-zinc-400 shrink-0">${activeIconFn('w-3.5 h-3.5')}</span>
            <h1 class="text-gray-900 dark:text-zinc-100 font-semibold tracking-tight text-xs sm:text-sm truncate">${viewTitle}</h1>
          </div>
        `}
      </div>

      <!-- Right: Plane Header Actions -->
      <div class="flex items-center gap-2 shrink-0">
        ${currentView === 'pages' ? `
          <!-- Plane Share Button -->
          <button
            type="button"
            data-action="open-export-modal"
            class="h-7 px-3 rounded-md bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 text-xs font-medium transition-colors shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
            title="Compartir o Exportar documento"
          >
            ${Icons.share('w-3.5 h-3.5 text-gray-500 dark:text-zinc-400')}
            <span>Share</span>
          </button>

          <!-- More Options Menu -->
          <button
            type="button"
            data-action="open-more-menu"
            class="h-7 w-7 rounded-md bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 transition-colors shadow-2xs flex items-center justify-center cursor-pointer"
            title="More actions"
          >
            ${Icons.dotsHorizontal('w-4 h-4 text-gray-500 dark:text-zinc-400')}
          </button>
        ` : ''}

        <!-- Quick Search / Omnibox Trigger (Ctrl+K) -->
        <button
          type="button"
          id="plane-omnibox-trigger"
          data-action="open-omnibox"
          class="h-7 flex items-center gap-2 px-2.5 rounded-md bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800/80 border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 text-xs transition-colors cursor-pointer shadow-2xs"
          title="Search work items and library pages (Ctrl+K)"
        >
          ${Icons.search('w-3.5 h-3.5')}
          <span class="hidden md:inline text-[11px]">Search...</span>
          <kbd class="hidden md:inline-block px-1 py-0.2 rounded bg-gray-100 dark:bg-zinc-800 text-[10px] font-mono text-gray-500 dark:text-zinc-400 border border-gray-200/60 dark:border-zinc-700/60">Ctrl K</kbd>
        </button>

        <!-- Sync SQLite Button -->
        <button
          type="button"
          id="plane-manual-sync-btn"
          class="h-7 flex items-center gap-1.5 px-2.5 rounded-md bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-200 border border-gray-200 dark:border-zinc-800 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
          title="Sincronizar SQLite con archivos Markdown (.md)"
        >
          ${Icons.refresh('w-3.5 h-3.5 text-indigo-500')}
          <span class="hidden sm:inline text-[11px]">Sync</span>
        </button>

        <!-- Theme Toggle -->
        <button
          type="button"
          id="plane-theme-toggle"
          class="h-7 w-7 rounded-md bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
          title="Cambiar tema claro/oscuro"
        >
          ${theme === 'dark' ? Icons.sun('w-3.5 h-3.5') : Icons.moon('w-3.5 h-3.5')}
        </button>
      </div>
    </header>
  `;
}
