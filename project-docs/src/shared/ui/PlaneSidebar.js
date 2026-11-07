/**
 * PlaneSidebar Component (Shared UI)
 * Barra de navegación lateral idéntica a Plane (@makeplane/propel):
 * - Workspace Header + User Avatar + Collapse Toggle
 * - Quick Actions (New work item + Ctrl+K Search)
 * - Favorites Collapsible Section (Páginas favoritas con acceso en 1 clic)
 * - Projects Collapsible Accordion (Work items, Cycles, Modules, Library, Intake/AI)
 * - Workspace Collapsible Section (Views: DAG/Tree/3D, Architecture C4, Analytics)
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { Icons } from './Icons.js';
import { renderList } from '../utils/renderList.js';

export function renderPlaneSidebar({
  currentView = 'issues',
  activeWorkspace = 'Harness Engineering',
  activeProject = 'Arnés SDD Multi-Agente',
  issueCount = 0,
  cycleCount = 0,
  moduleCount = 0,
  pageCount = 0,
  favoritePages = [],
  isCollapsed = false
} = {}) {
  const projectNavItems = [
    { id: 'issues', legacyTab: 'features', label: 'Work items', icon: 'kanban', count: issueCount },
    { id: 'cycles', legacyTab: 'history', label: 'Cycles', icon: 'cycle', count: cycleCount },
    { id: 'modules', label: 'Modules', icon: 'moduleIcon', count: moduleCount },
    { id: 'pages', legacyTab: 'knowledge', label: 'Library', icon: 'page', count: pageCount },
    { id: 'harness', label: 'Intake & AI Runs', icon: 'bot' }
  ];

  const workspaceNavItems = [
    { id: 'architecture', legacyTab: 'architecture', label: 'Architecture C4', icon: 'layers' },
    { id: 'graph', legacyTab: 'graph', label: 'Views · Dependency DAG', icon: 'gitTree' },
    { id: 'tree', legacyTab: 'tree', label: 'Views · Hierarchy Tree', icon: 'gitTree' },
    { id: 'constellation', legacyTab: 'three', label: 'Views · 3D Constellation', icon: 'cube' },
    { id: 'analytics', label: 'Analytics', icon: 'activity' }
  ];

  const renderNavItem = (item) => {
    const isActive = currentView === item.id;
    const iconFn = Icons[item.icon] || Icons.terminal;
    const tabAttr = item.legacyTab ? `data-tab="${item.legacyTab}"` : '';

    return `
      <button
        type="button"
        data-plane-nav="${item.id}"
        ${tabAttr}
        class="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
          isActive
            ? 'bg-indigo-600/15 text-indigo-300 font-semibold'
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
        }"
        title="${item.label}"
      >
        ${iconFn(`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-zinc-400'}`)}
        ${!isCollapsed ? `
          <span class="flex-1 text-left truncate">${item.label}</span>
          ${item.count !== undefined && item.count !== null ? `<span class="text-[10px] px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">${item.count}</span>` : ''}
        ` : ''}
      </button>
    `;
  };

  const renderFavoriteItem = (fav) => {
    const docKey = (fav.file_path || 'c4-model.md').replace(/^knowledge\//, '');
    return `
      <button
        type="button"
        data-action="sidebar-open-favorite-page"
        data-page-id="${fav.id || ''}"
        data-doc-key="${docKey}"
        class="w-full flex items-center justify-between gap-2 px-2 py-1 rounded-md text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 transition-colors cursor-pointer group"
        title="${fav.title || docKey}"
      >
        <div class="flex items-center gap-2 min-w-0 flex-1">
          ${Icons.page('w-3.5 h-3.5 shrink-0 text-zinc-400 group-hover:text-indigo-400')}
          ${!isCollapsed ? `<span class="truncate text-left">${fav.title || docKey}</span>` : ''}
        </div>
        ${!isCollapsed ? `<span class="text-amber-400 shrink-0">${Icons.star('w-3 h-3 fill-amber-400')}</span>` : ''}
      </button>
    `;
  };

  return `
    <aside id="plane-sidebar" class="${isCollapsed ? 'w-14' : 'w-[250px]'} bg-zinc-950 border-r border-zinc-800/80 flex flex-col shrink-0 transition-all duration-200 select-none h-screen sticky top-0 z-30">
      <!-- 1. Plane AppSidebarHeader: Workspace Switcher & User Menu -->
      <div class="h-12 px-3 border-b border-zinc-800/80 flex items-center justify-between gap-2 shrink-0">
        <div class="flex items-center gap-2.5 overflow-hidden">
          <div class="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-[11px] shrink-0 shadow-xs">
            HE
          </div>
          ${!isCollapsed ? `
            <div class="flex items-center gap-1 min-w-0">
              <span class="text-[13px] font-semibold text-zinc-100 truncate tracking-tight">${activeWorkspace}</span>
              ${Icons.chevronDown('w-3.5 h-3.5 text-zinc-500 shrink-0')}
            </div>
          ` : ''}
        </div>
        <div class="flex items-center gap-1 shrink-0">
          ${!isCollapsed ? `
            <div class="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-mono font-bold text-indigo-300" title="Agente Activo: Leader / Spec-Author">
              AI
            </div>
          ` : ''}
          <button
            type="button"
            id="toggle-sidebar-collapse"
            class="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded transition-colors cursor-pointer"
            title="${isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}"
          >
            ${isCollapsed ? Icons.chevronRight('w-4 h-4') : Icons.chevronLeft('w-4 h-4')}
          </button>
        </div>
      </div>

      <!-- 2. Plane SidebarQuickActions: New Work Item + Search (Ctrl+K) -->
      <div class="px-3 pt-2.5 pb-1.5 flex items-center gap-1.5 shrink-0">
        ${!isCollapsed ? `
          <button
            type="button"
            data-action="open-new-doc-modal"
            class="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 text-xs font-medium text-zinc-200 transition-colors shadow-2xs cursor-pointer"
            title="Crear nueva página o documento en Library"
          >
            ${Icons.plus('w-3.5 h-3.5 text-zinc-400')}
            <span class="truncate">New page / item</span>
          </button>
        ` : ''}
        <button
          type="button"
          id="sidebar-omnibox-trigger"
          class="p-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer ${isCollapsed ? 'w-full flex justify-center' : ''}"
          title="Search work items & library pages (Ctrl+K)"
        >
          ${Icons.search('w-3.5 h-3.5')}
        </button>
      </div>

      <!-- 3. Plane Main Navigation Menu (Favorites, Projects, Workspace) -->
      <nav class="flex-1 px-2.5 py-2 space-y-4 overflow-y-auto">
        <!-- Favorites Section -->
        ${!isCollapsed && favoritePages.length > 0 ? `
          <div class="space-y-1">
            <div class="px-2 py-0.5 text-[11px] font-semibold text-zinc-500 flex items-center justify-between">
              <span>Favorites</span>
              <span class="text-[10px] font-mono text-zinc-600">${favoritePages.length}</span>
            </div>
            <div class="space-y-0.5">
              ${renderList(favoritePages.slice(0, 5), renderFavoriteItem)}
            </div>
          </div>
        ` : ''}

        <!-- Projects Accordion Section -->
        <div class="space-y-1">
          ${!isCollapsed ? `
            <div class="px-2 py-0.5 text-[11px] font-semibold text-zinc-500 flex items-center justify-between">
              <span>Projects</span>
              <span class="text-[10px] font-mono text-zinc-600">1</span>
            </div>
            <!-- Active Project Item -->
            <div class="flex items-center justify-between gap-2 px-2 py-1.5 rounded-md bg-zinc-900/60 text-zinc-200">
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-4 h-4 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-[9px] font-mono font-bold shrink-0">
                  P
                </span>
                <span class="text-xs font-semibold truncate">${activeProject}</span>
              </div>
              ${Icons.chevronDown('w-3.5 h-3.5 text-zinc-500 shrink-0')}
            </div>
            <!-- Project Nested Tree Navigation (Work items, Cycles, Modules, Library, Intake) -->
            <div class="relative mt-1 mb-1.5 flex flex-col gap-0.5 pl-4">
              <div class="absolute top-0 bottom-1 left-[11px] w-[1px] bg-zinc-800/90"></div>
              ${renderList(projectNavItems, renderNavItem)}
            </div>
          ` : `
            <div class="space-y-1">
              ${renderList(projectNavItems, renderNavItem)}
            </div>
          `}
        </div>

        <!-- Workspace Section (Architecture, Views, Analytics) -->
        <div class="space-y-1">
          ${!isCollapsed ? `
            <div class="px-2 py-0.5 text-[11px] font-semibold text-zinc-500 flex items-center justify-between">
              <span>Workspace</span>
            </div>
          ` : ''}
          <div class="flex flex-col gap-0.5">
            ${renderList(workspaceNavItems, renderNavItem)}
          </div>
        </div>
      </nav>

      <!-- 4. Plane Sidebar Footer: SQLite WAL & Markdown Dual Sync Status -->
      <div class="px-3 py-2.5 border-t border-zinc-800/80 bg-zinc-950 shrink-0">
        ${!isCollapsed ? `
          <div class="flex items-center justify-between text-[11px] text-zinc-400">
            <span class="flex items-center gap-1.5 font-medium text-zinc-300">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>SQLite + .md Sync</span>
            </span>
            <span class="px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-emerald-400 font-mono">WAL</span>
          </div>
        ` : `
          <div class="flex justify-center" title="SQLite + Markdown Synced">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
        `}
      </div>
    </aside>
  `;
}
