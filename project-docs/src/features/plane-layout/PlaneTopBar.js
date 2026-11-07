import { Icons } from '../../shared/Icons.js';

export function renderPlaneTopBar({
  workspaceName = 'Harness Engineering',
  projectName = 'Arnés SDD',
  viewTitle = 'Tareas (Issues)',
  theme = 'dark',
  activeSpec = null,
  onOpenOmnibox = () => {},
  onSync = () => {},
  onToggleTheme = () => {}
}) {
  return `
    <header id="plane-topbar" class="h-14 px-6 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between gap-4 sticky top-0 z-20">
      <!-- Breadcrumbs -->
      <div class="flex items-center gap-2 text-xs text-zinc-400 overflow-hidden">
        <span class="hover:text-zinc-200 transition-colors cursor-pointer truncate font-medium">${workspaceName}</span>
        <span class="text-zinc-600">/</span>
        <span class="hover:text-zinc-200 transition-colors cursor-pointer truncate">${projectName}</span>
        <span class="text-zinc-600">/</span>
        <span class="text-zinc-100 font-semibold truncate">${viewTitle}</span>
        ${activeSpec && activeSpec.name ? `
          <span class="text-zinc-600">/</span>
          <span class="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-mono truncate">
            Activo: ${activeSpec.name}
          </span>
        ` : ''}
      </div>

      <!-- Actions & Omnibox Trigger -->
      <div class="flex items-center gap-2.5">
        <!-- Global Search / Omnibox Trigger (Ctrl+K) -->
        <button id="plane-omnibox-trigger" class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-colors shadow-sm">
          ${Icons.search('w-3.5 h-3.5 text-zinc-400')}
          <span class="hidden sm:inline">Buscar tareas, docs, reglas...</span>
          <kbd class="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700/60 text-[10px] font-mono text-zinc-300">
            Ctrl+K
          </kbd>
        </button>

        <!-- Sync SQLite Button -->
        <button id="plane-sync-trigger" class="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors" title="Sincronizar base de datos SQLite y archivos Markdown">
          ${Icons.refresh('w-4 h-4')}
        </button>

        <!-- Theme Toggle -->
        <button id="plane-theme-toggle" class="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors" title="Cambiar tema">
          ${theme === 'dark' ? Icons.sun('w-4 h-4 text-amber-400') : Icons.moon('w-4 h-4 text-zinc-300')}
        </button>
      </div>
    </header>
  `;
}
