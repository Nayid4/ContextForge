import { Icons } from '../../../shared/Icons.js';

export function renderPlaneTopBar({
  currentView = 'issues',
  viewTitle = 'Tareas (Work Items)',
  activeProject = 'Arnés SDD Multi-Agente',
  theme = 'dark'
}) {
  return `
    <header class="h-14 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      <!-- Breadcrumbs -->
      <div class="flex items-center gap-2 text-xs">
        <span class="text-zinc-400 font-medium">${activeProject}</span>
        <span class="text-zinc-600">/</span>
        <h1 class="text-zinc-100 font-bold tracking-tight text-sm">${viewTitle}</h1>
      </div>

      <!-- Action Tools -->
      <div class="flex items-center gap-3">
        <!-- Quick Search / Omnibox Trigger (Ctrl+K) -->
        <button id="plane-omnibox-trigger" data-action="open-omnibox" class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs transition-colors shadow-inner" title="Buscar tareas y documentos (Ctrl+K)">
          ${Icons.search('w-3.5 h-3.5')}
          <span class="hidden sm:inline">Buscar tareas o docs...</span>
          <kbd class="hidden sm:inline-block px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400">Ctrl K</kbd>
        </button>

        <!-- Sync SQLite Button -->
        <button id="plane-manual-sync-btn" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs font-medium transition-colors" title="Sincronizar SQLite con Markdown">
          ${Icons.refresh('w-3.5 h-3.5')}
          <span class="hidden sm:inline">Sincronizar</span>
        </button>

        <!-- Theme Toggle -->
        <button id="plane-theme-toggle" class="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors" title="Cambiar tema claro/oscuro">
          ${theme === 'dark' ? Icons.sun('w-4 h-4') : Icons.moon('w-4 h-4')}
        </button>
      </div>
    </header>
  `;
}
