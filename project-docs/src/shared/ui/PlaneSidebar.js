/**
 * PlaneSidebar Component (Shared UI)
 * Barra de navegación lateral persistente con selector de workspace, dominios Screaming y estado de persistencia.
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { Icons } from './Icons.js';
import { renderList } from '../utils/renderList.js';

export function renderPlaneSidebar({
  currentView = 'issues',
  activeWorkspace = 'Harness Engineering',
  activeProject = 'Arnés de Ingeniería SDD',
  issueCount = 0,
  cycleCount = 0,
  moduleCount = 0,
  pageCount = 0,
  isCollapsed = false
} = {}) {
  const navItems = [
    { id: 'issues', legacyTab: 'features', label: 'Tareas (Issues)', icon: 'kanban', count: issueCount },
    { id: 'cycles', legacyTab: 'history', label: 'Ciclos (Cycles)', icon: 'cycle', count: cycleCount },
    { id: 'modules', label: 'Módulos (Epics)', icon: 'moduleIcon', count: moduleCount },
    { id: 'pages', legacyTab: 'knowledge', label: 'Páginas (Docs / IA)', icon: 'page', count: pageCount },
    { id: 'architecture', legacyTab: 'architecture', label: 'Arquitectura C4', icon: 'layers' },
    { id: 'graph', legacyTab: 'graph', label: 'Grafo de Dependencias', icon: 'gitTree' },
    { id: 'tree', legacyTab: 'tree', label: 'Árbol Jerárquico', icon: 'gitTree' },
    { id: 'constellation', legacyTab: 'three', label: 'Constelación 3D', icon: 'cube' },
    { id: 'analytics', label: 'Métricas & Burn-down', icon: 'activity' }
  ];

  const renderNavItem = (item) => {
    const isActive = currentView === item.id;
    const iconFn = Icons[item.icon] || Icons.terminal;
    const tabAttr = item.legacyTab ? `data-tab="${item.legacyTab}"` : '';

    return `
      <button data-plane-nav="${item.id}" ${tabAttr} class="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
        isActive
          ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/25 shadow-xs font-semibold'
          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 border border-transparent'
      }">
        ${iconFn('w-4 h-4 shrink-0')}
        ${!isCollapsed ? `
          <span class="flex-1 text-left truncate">${item.label}</span>
          ${item.count !== undefined && item.count !== null ? `<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 font-mono font-medium">${item.count}</span>` : ''}
        ` : ''}
      </button>
    `;
  };

  return `
    <aside id="plane-sidebar" class="${isCollapsed ? 'w-16' : 'w-64'} bg-zinc-950 border-r border-zinc-800/80 flex flex-col shrink-0 transition-all duration-200 select-none h-screen sticky top-0 z-30">
      <!-- Workspace Switcher Header -->
      <div class="h-14 px-4 border-b border-zinc-800/80 flex items-center justify-between gap-2">
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md">
            HE
          </div>
          ${!isCollapsed ? `
            <div class="flex flex-col min-w-0">
              <span class="text-xs font-semibold text-zinc-100 truncate tracking-tight">${activeWorkspace}</span>
              <span class="text-[10px] text-zinc-400 truncate">Plane Edition · Screaming</span>
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
          <div class="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse"></div>
          ${!isCollapsed ? `
            <span class="text-xs font-medium truncate flex-1">${activeProject}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">SDD</span>
          ` : ''}
        </div>
      </div>

      <!-- Main Navigation Menu (Screaming Domains) -->
      <nav class="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        <div class="px-2 py-1 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase ${isCollapsed ? 'text-center' : ''}">
          ${!isCollapsed ? 'Dominio del Negocio' : '•••'}
        </div>

        ${renderList(navItems, renderNavItem)}
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
