import { Icons } from '../../shared/Icons.js';

export function renderPlaneSidebar({
  currentView = 'issues',
  activeWorkspace = 'Harness Engineering',
  activeProject = 'Arnés de Ingeniería SDD',
  issueCount = 0,
  cycleCount = 0,
  moduleCount = 0,
  pageCount = 0,
  isCollapsed = false,
  onNavigate = () => {}
}) {
  return `
    <aside id="plane-sidebar" class="${isCollapsed ? 'w-16' : 'w-64'} bg-zinc-950 border-r border-zinc-800/80 flex flex-col shrink-0 transition-all duration-200 select-none h-screen sticky top-0 z-30">
      <!-- Workspace Switcher Header -->
      <div class="h-14 px-4 border-b border-zinc-800/80 flex items-center justify-between gap-2">
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
            HE
          </div>
          ${!isCollapsed ? `
            <div class="flex flex-col min-w-0">
              <span class="text-xs font-semibold text-zinc-100 truncate tracking-tight">${activeWorkspace}</span>
              <span class="text-[10px] text-zinc-400 truncate">Plane Edition</span>
            </div>
          ` : ''}
        </div>
        ${!isCollapsed ? `
          <button id="toggle-sidebar-collapse" class="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded transition-colors" title="Colapsar barra lateral">
            ${Icons.chevronLeft('w-4 h-4')}
          </button>
        ` : `
          <button id="toggle-sidebar-collapse" class="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded transition-colors" title="Expandir barra lateral">
            ${Icons.chevronRight('w-4 h-4')}
          </button>
        `}
      </div>

      <!-- Project Selector Pill -->
      <div class="px-3 py-3 border-b border-zinc-800/50">
        <div class="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800/80 text-zinc-200">
          <div class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
          ${!isCollapsed ? `
            <span class="text-xs font-medium truncate flex-1">${activeProject}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">SDD</span>
          ` : ''}
        </div>
      </div>

      <!-- Main Navigation Menu -->
      <nav class="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        <div class="px-2 py-1 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase ${isCollapsed ? 'text-center' : ''}">
          ${!isCollapsed ? 'Gestión de Proyecto' : '•••'}
        </div>

        <!-- Issues (Work Items) -->
        <button data-plane-nav="issues" class="w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${currentView === 'issues' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'}">
          ${Icons.kanban('w-4 h-4 shrink-0')}
          ${!isCollapsed ? `
            <span class="flex-1 text-left">Tareas (Issues)</span>
            <span class="text-[11px] px-1.5 py-0.2 rounded-full bg-zinc-800/80 text-zinc-300 font-mono">${issueCount}</span>
          ` : ''}
        </button>

        <!-- Cycles (Sprints) -->
        <button data-plane-nav="cycles" class="w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${currentView === 'cycles' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'}">
          ${Icons.cycle('w-4 h-4 shrink-0')}
          ${!isCollapsed ? `
            <span class="flex-1 text-left">Ciclos (Cycles)</span>
            <span class="text-[11px] px-1.5 py-0.2 rounded-full bg-zinc-800/80 text-zinc-300 font-mono">${cycleCount}</span>
          ` : ''}
        </button>

        <!-- Modules (Epics) -->
        <button data-plane-nav="modules" class="w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${currentView === 'modules' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'}">
          ${Icons.moduleIcon('w-4 h-4 shrink-0')}
          ${!isCollapsed ? `
            <span class="flex-1 text-left">Módulos (Epics)</span>
            <span class="text-[11px] px-1.5 py-0.2 rounded-full bg-zinc-800/80 text-zinc-300 font-mono">${moduleCount}</span>
          ` : ''}
        </button>

        <!-- Pages (Docs & Knowledge) -->
        <button data-plane-nav="pages" class="w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${currentView === 'pages' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'}">
          ${Icons.page('w-4 h-4 shrink-0')}
          ${!isCollapsed ? `
            <span class="flex-1 text-left">Páginas (Docs / IA)</span>
            <span class="text-[11px] px-1.5 py-0.2 rounded-full bg-zinc-800/80 text-zinc-300 font-mono">${pageCount}</span>
          ` : ''}
        </button>

        <!-- Analytics -->
        <button data-plane-nav="analytics" class="w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${currentView === 'analytics' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'}">
          ${Icons.activity('w-4 h-4 shrink-0')}
          ${!isCollapsed ? `
            <span class="flex-1 text-left">Métricas & Burn-down</span>
          ` : ''}
        </button>

        <div class="pt-4 px-2 py-1 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase ${isCollapsed ? 'text-center' : ''}">
          ${!isCollapsed ? 'Vistas Heredadas' : '•••'}
        </div>

        <!-- 3D Space View -->
        <button data-plane-nav="space3d" class="w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${currentView === 'space3d' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'}">
          ${Icons.cube('w-4 h-4 shrink-0')}
          ${!isCollapsed ? `<span class="flex-1 text-left">Constelación 3D</span>` : ''}
        </button>

        <!-- Dependency Graph -->
        <button data-plane-nav="depgraph" class="w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${currentView === 'depgraph' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'}">
          ${Icons.gitTree('w-4 h-4 shrink-0')}
          ${!isCollapsed ? `<span class="flex-1 text-left">Grafo de Dependencias</span>` : ''}
        </button>

        <!-- Tablero Clásico -->
        <a href="#features" class="w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors" title="Ver tablero en modo clásico con pestañas">
          ${Icons.table('w-4 h-4 shrink-0')}
          ${!isCollapsed ? `<span class="flex-1 text-left">Tablero Clásico</span>` : ''}
        </a>
      </nav>

      <!-- Footer: Agentes & SQLite State -->
      <div class="p-3 border-t border-zinc-800/80 bg-zinc-950/80 space-y-2">
        ${!isCollapsed ? `
          <div class="flex items-center justify-between text-[11px] text-zinc-400">
            <span class="flex items-center gap-1.5 font-medium">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              SQLite Relacional
            </span>
            <span class="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-mono">WAL</span>
          </div>
          <div class="text-[10px] text-zinc-400 flex items-center justify-between">
            <span>Dual Sync: Markdown</span>
            <span class="text-emerald-400 font-mono">100% OK</span>
          </div>
        ` : `
          <div class="flex justify-center" title="SQLite Conectado">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
        `}
      </div>
    </aside>
  `;
}
