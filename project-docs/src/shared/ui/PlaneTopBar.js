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
  theme = 'dark'
} = {}) {
  const viewIconMap = {
    issues: Icons.kanban,
    cycles: Icons.cycle,
    modules: Icons.moduleIcon,
    pages: Icons.page,
    architecture: Icons.layers,
    graph: Icons.gitTree,
    tree: Icons.gitTree,
    constellation: Icons.cube,
    analytics: Icons.activity,
    harness: Icons.bot
  };
  const activeIconFn = viewIconMap[currentView] || Icons.kanban;

  return `
    <header class="h-12 border-b border-zinc-800/80 bg-zinc-950 px-5 flex items-center justify-between gap-4 sticky top-0 z-20 select-none shrink-0">
      <!-- Left: Plane Breadcrumbs -->
      <div class="flex items-center gap-2 text-xs min-w-0">
        <div class="flex items-center gap-1.5 text-zinc-400 font-medium truncate">
          <span class="w-4 h-4 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-[9px] font-mono font-bold shrink-0">
            P
          </span>
          <span class="truncate hidden sm:inline">${activeProject}</span>
        </div>
        <span class="text-zinc-600">/</span>
        <div class="flex items-center gap-1.5 text-zinc-100 min-w-0">
          <span class="text-zinc-400 shrink-0">${activeIconFn('w-3.5 h-3.5')}</span>
          <h1 class="text-zinc-100 font-semibold tracking-tight text-xs sm:text-sm truncate">${viewTitle}</h1>
        </div>
      </div>

      <!-- Right: Plane Header Actions -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Quick Search / Omnibox Trigger (Ctrl+K) -->
        <button
          type="button"
          id="plane-omnibox-trigger"
          data-action="open-omnibox"
          class="h-7 flex items-center gap-2 px-2.5 rounded-md bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-colors cursor-pointer"
          title="Search work items and library pages (Ctrl+K)"
        >
          ${Icons.search('w-3.5 h-3.5')}
          <span class="hidden md:inline text-[11px]">Search...</span>
          <kbd class="hidden md:inline-block px-1 py-0.2 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400">Ctrl K</kbd>
        </button>

        <!-- Sync SQLite Button -->
        <button
          type="button"
          id="plane-manual-sync-btn"
          class="h-7 flex items-center gap-1.5 px-2.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
          title="Sincronizar SQLite con archivos Markdown (.md)"
        >
          ${Icons.refresh('w-3.5 h-3.5 text-indigo-400')}
          <span class="hidden sm:inline text-[11px]">Sync</span>
        </button>

        <!-- Theme Toggle -->
        <button
          type="button"
          id="plane-theme-toggle"
          class="h-7 w-7 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
          title="Cambiar tema claro/oscuro"
        >
          ${theme === 'dark' ? Icons.sun('w-3.5 h-3.5') : Icons.moon('w-3.5 h-3.5')}
        </button>
      </div>
    </header>
  `;
}
