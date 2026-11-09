/**
 * PlaneSidebar Component (Shared UI)
 * Barra de navegación lateral idéntica a Plane (@makeplane/propel) con Arquitectura Dual:
 * 1. App Rail (Barra estrecha w-14 en el extremo izquierdo: Work, Wiki, AI, Settings)
 * 2. Secondary Sidebar (w-60: en modo Wiki muestra Collections, Favorites, Shared, Private;
 *    en modo Work muestra Work items, Cycles, Modules, Views).
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
  sharedPages = [],
  privatePages = [],
  dynamicCollections = [],
  isCollapsed = false,
  activeCollection = 'product'
} = {}) {
  const isWikiView = currentView === 'pages';
  const isWorkView = ['issues', 'cycles', 'modules'].includes(currentView);
  const isAiView = currentView === 'harness';
  const isSettingsView = ['architecture', 'analytics'].includes(currentView);

  // App Rail Item Builder
  const renderAppRailItem = ({ id, label, iconFn, isActive, title }) => `
    <button
      type="button"
      data-plane-nav="${id}"
      class="group flex flex-col items-center justify-center gap-0.5 cursor-pointer outline-none select-none transition-colors"
      title="${title || label}"
    >
      <div class="flex items-center justify-center w-8 h-8 rounded-lg transition-colors relative ${
        isActive
          ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 font-semibold shadow-2xs'
          : 'text-gray-500 dark:text-zinc-400 group-hover:text-gray-900 dark:group-hover:text-zinc-100 group-hover:bg-gray-50 dark:group-hover:bg-zinc-900'
      }">
        ${iconFn('w-4 h-4')}
        ${isActive ? '<span class="absolute -right-1 top-1 w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>' : ''}
      </div>
      <span class="text-[10px] tracking-tight ${
        isActive
          ? 'font-semibold text-gray-900 dark:text-zinc-100'
          : 'font-medium text-gray-500 dark:text-zinc-400 group-hover:text-gray-700 dark:group-hover:text-zinc-200'
      }">
        ${label}
      </span>
    </button>
  `;

  // Secondary Sidebar - Work Mode Nav Items
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

  const renderWorkNavItem = (item) => {
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
            ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-300 font-semibold'
            : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100/70 dark:hover:bg-zinc-900/80'
        }"
        title="${item.label}"
      >
        ${iconFn(`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-zinc-400'}`)}
        <span class="flex-1 text-left truncate">${item.label}</span>
        ${item.count !== undefined && item.count !== null ? `<span class="text-[10px] px-1.5 py-0.2 rounded bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 font-mono">${item.count}</span>` : ''}
      </button>
    `;
  };

  // Secondary Sidebar - Wiki Collections (Dynamic from SQLite or Default Fallback)
  const iconMap = {
    folder: Icons.folder,
    flag: Icons.flag,
    monitor: Icons.monitor,
    palette: Icons.palette,
    messageSquare: Icons.messageSquare,
    layers: Icons.layers,
    book: Icons.book,
    database: Icons.database,
    checkCircle: Icons.checkCircle || Icons.check
  };

  const collections = Array.isArray(dynamicCollections) && dynamicCollections.length > 0
    ? dynamicCollections.map(c => ({
        id: c.id,
        label: c.name,
        icon: iconMap[c.icon] || Icons.folder,
        color: c.id === 'product' ? 'text-orange-500' : c.id === 'engineering' ? 'text-amber-500' : c.id === 'design' ? 'text-purple-500' : c.id === 'customer_support' ? 'text-emerald-500' : 'text-gray-500',
        is_private: Boolean(c.is_private)
      }))
    : [
        { id: 'general', label: 'General', icon: Icons.folder, color: 'text-gray-500' },
        { id: 'engineering', label: 'Engineering', icon: Icons.flag, color: 'text-amber-500' },
        { id: 'product', label: 'Product', icon: Icons.monitor, color: 'text-orange-500', is_private: true },
        { id: 'design', label: 'Design', icon: Icons.palette, color: 'text-purple-500' },
        { id: 'customer_support', label: 'Customer support', icon: Icons.messageSquare, color: 'text-emerald-500' }
      ];

  // Secondary Sidebar - Dynamic Pages (Favorites, Shared, Private)
  const displayFavorites = Array.isArray(favoritePages) && favoritePages.length > 0
    ? favoritePages.slice(0, 10).map(p => ({
        title: p.title || 'Page',
        docKey: (p.file_path || '').replace(/^knowledge\//, '') || p.id
      }))
    : [
        { title: 'Q3 2026 goals', docKey: '01-project-overview-and-business.md' },
        { title: 'Guest access launch', docKey: '01-project-overview-and-business.md' },
        { title: 'Permission matrix v3', docKey: '02-architecture-and-patterns.md' }
      ];

  const displayShared = Array.isArray(sharedPages) && sharedPages.length > 0
    ? sharedPages.slice(0, 8).map(p => ({
        title: p.title || 'Page',
        docKey: (p.file_path || '').replace(/^knowledge\//, '') || p.id
      }))
    : [
        { title: 'Enterprise readiness plan', docKey: 'c4-model.md' },
        { title: 'On-call rotation', docKey: 'verify.sh' },
        { title: 'Release calendar', docKey: 'history.json' },
        { title: 'Frontend conventions', docKey: 'coding-standards.md' }
      ];

  const displayPrivate = Array.isArray(privatePages) && privatePages.length > 0
    ? privatePages.slice(0, 8).map(p => ({
        title: p.title || 'Page',
        docKey: (p.file_path || '').replace(/^knowledge\//, '') || p.id
      }))
    : [
        { title: 'Guest invite copy drafts', docKey: '03-capabilities-and-features.md' }
      ];

  return `
    <aside id="plane-sidebar" class="flex flex-row shrink-0 select-none h-screen sticky top-0 z-30 font-sans transition-all">
      <!-- ============================================================== -->
      <!-- 1. APP RAIL (Far Left Narrow Icon Bar w-14)                     -->
      <!-- ============================================================== -->
      <div class="w-14 bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 flex flex-col justify-between py-3 items-center shrink-0">
        <!-- Top Rail Items -->
        <div class="flex flex-col items-center gap-4 w-full">
          <!-- Workspace Avatar Logo -->
          <div
            data-action="open-omnibox"
            class="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer transition-colors"
            title="${activeWorkspace} (Ctrl+K)"
          >
            HE
          </div>

          <!-- Rail Navigation Buttons -->
          <div class="flex flex-col items-center gap-3 w-full">
            <!-- Work -->
            ${renderAppRailItem({
              id: 'issues',
              label: 'Work',
              iconFn: Icons.kanban,
              isActive: isWorkView,
              title: 'Work items, Cycles & Modules'
            })}

            <!-- Wiki (Image 1 Active Style) -->
            ${renderAppRailItem({
              id: 'pages',
              label: 'Wiki',
              iconFn: Icons.bookOpen,
              isActive: isWikiView,
              title: 'Wiki & Knowledge Base Library'
            })}

            <!-- AI -->
            ${renderAppRailItem({
              id: 'harness',
              label: 'AI',
              iconFn: Icons.sparkles,
              isActive: isAiView,
              title: 'AI Agents, Intake & Orquestación'
            })}
          </div>
        </div>

        <!-- Bottom Rail Items -->
        <div class="flex flex-col items-center gap-3 w-full">
          <!-- Settings -->
          ${renderAppRailItem({
            id: 'architecture',
            label: 'Settings',
            iconFn: Icons.settings,
            isActive: isSettingsView,
            title: 'Settings, Architecture C4 & Analytics'
          })}
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- 2. SECONDARY SIDEBAR (w-60 Wiki or Work Drawer)                -->
      <!-- ============================================================== -->
      ${!isCollapsed ? `
        <div class="w-60 bg-[#fbfbfc] dark:bg-zinc-900/40 border-r border-gray-200 dark:border-zinc-800 flex flex-col h-full overflow-hidden text-gray-900 dark:text-zinc-100 shrink-0 transition-all">
          ${isWikiView ? `
            <!-- 2.A WIKI SIDEBAR (Exact Replica of Image 1) -->
            <!-- Header: Title "Wiki" + Sliders & Collapse Buttons -->
            <div class="h-12 px-3.5 border-b border-gray-200/80 dark:border-zinc-800 flex items-center justify-between gap-2 shrink-0">
              <span class="text-sm font-semibold text-gray-900 dark:text-zinc-100 tracking-tight">Wiki</span>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  data-action="open-omnibox"
                  class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 rounded transition-colors cursor-pointer"
                  title="Preferences / Search"
                >
                  ${Icons.sliders('w-3.5 h-3.5')}
                </button>
                <button
                  type="button"
                  id="toggle-sidebar-collapse"
                  class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 rounded transition-colors cursor-pointer"
                  title="Collapse secondary sidebar"
                >
                  ${Icons.sidebarCollapse('w-3.5 h-3.5')}
                </button>
              </div>
            </div>

            <!-- "+ New page" Button (Matching Image 1 Card Button) -->
            <div class="px-3 pt-3 pb-1 shrink-0">
              <button
                type="button"
                data-action="open-new-doc-modal"
                class="w-full bg-white dark:bg-zinc-800 border border-gray-200/90 dark:border-zinc-700/80 rounded-lg shadow-2xs py-1.5 px-3 text-xs font-medium text-gray-700 dark:text-zinc-200 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-750 transition-colors cursor-pointer"
                title="Create a new page in Wiki"
              >
                ${Icons.plus('w-3.5 h-3.5 text-gray-400')}
                <span>New page</span>
              </button>
            </div>

            <!-- Wiki Nav Tree -->
            <div class="flex-1 overflow-y-auto px-2 py-2 space-y-3.5 scrollbar-sm">
              <!-- Quick Nav: Home & Library -->
              <div class="space-y-0.5">
                <button
                  type="button"
                  data-action="select-wiki-collection"
                  data-collection="home"
                  class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                    activeCollection === 'home'
                      ? 'bg-gray-200/70 dark:bg-zinc-800 font-medium text-gray-900 dark:text-zinc-100'
                      : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100/70 dark:hover:bg-zinc-800/60 hover:text-gray-900 dark:hover:text-zinc-200'
                  }"
                >
                  ${Icons.home('w-4 h-4 text-gray-500 dark:text-zinc-400')}
                  <span>Home</span>
                </button>

                <button
                  type="button"
                  data-action="select-wiki-collection"
                  data-collection="library"
                  class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                    activeCollection === 'library'
                      ? 'bg-gray-200/70 dark:bg-zinc-800 font-medium text-gray-900 dark:text-zinc-100'
                      : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100/70 dark:hover:bg-zinc-800/60 hover:text-gray-900 dark:hover:text-zinc-200'
                  }"
                >
                  ${Icons.bookOpen('w-4 h-4 text-gray-500 dark:text-zinc-400')}
                  <span>Library</span>
                </button>
              </div>

              <!-- Collections Section (Collapsible with + Button) -->
              <div class="space-y-1" id="sidebar-sec-collections">
                <div class="flex items-center justify-between px-2 py-1 text-[11px] font-medium text-gray-500 dark:text-zinc-400">
                  <button
                    type="button"
                    data-action="toggle-sidebar-section"
                    data-section="collections"
                    class="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    <span>Collections</span>
                    ${Icons.chevronDown('w-3 h-3 text-gray-400')}
                  </button>
                  <button
                    type="button"
                    data-action="open-create-collection-modal"
                    class="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                    title="Create new collection"
                  >
                    ${Icons.plus('w-3 h-3')}
                  </button>
                </div>
                <div class="space-y-0.5" id="sidebar-list-collections">
                  ${collections.map(col => {
                    const isColActive = activeCollection === col.id;
                    return `
                      <button
                        type="button"
                        data-action="select-wiki-collection"
                        data-collection="${col.id}"
                        class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors cursor-pointer group ${
                          isColActive
                            ? 'bg-orange-50/70 dark:bg-orange-950/20 font-medium text-orange-900 dark:text-orange-200'
                            : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100/70 dark:hover:bg-zinc-800/60 hover:text-gray-900 dark:hover:text-zinc-200'
                        }"
                      >
                        <span class="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-zinc-300 text-[10px] w-2.5 inline-flex items-center">
                          ${Icons.chevronRight('w-2.5 h-2.5')}
                        </span>
                        <span class="${col.color} shrink-0">${col.icon('w-3.5 h-3.5')}</span>
                        <span class="truncate text-left flex-1">${col.label}</span>
                        ${col.is_private ? `<span class="text-[9px] px-1 py-0.2 rounded bg-gray-100 dark:bg-zinc-800 text-gray-500 font-mono">lock</span>` : ''}
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- Favorites Section (Collapsible) -->
              <div class="space-y-1" id="sidebar-sec-favorites">
                <div class="flex items-center justify-between px-2 py-1 text-[11px] font-medium text-gray-500 dark:text-zinc-400">
                  <button
                    type="button"
                    data-action="toggle-sidebar-section"
                    data-section="favorites"
                    class="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    <span>Favorites</span>
                    ${Icons.chevronDown('w-3 h-3 text-gray-400')}
                  </button>
                </div>
                <div class="space-y-0.5" id="sidebar-list-favorites">
                  ${displayFavorites.map(fav => `
                    <button
                      type="button"
                      data-action="open-article-read"
                      data-doc-key="${fav.docKey}"
                      class="w-full flex items-center gap-2 px-2 py-1 rounded-md text-xs text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-100/70 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer group truncate"
                      title="${fav.title}"
                    >
                      ${Icons.page('w-3.5 h-3.5 text-gray-400 shrink-0 group-hover:text-indigo-500')}
                      <span class="truncate text-left">${fav.title}</span>
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Shared Section (Collapsible) -->
              <div class="space-y-1" id="sidebar-sec-shared">
                <div class="flex items-center justify-between px-2 py-1 text-[11px] font-medium text-gray-500 dark:text-zinc-400">
                  <button
                    type="button"
                    data-action="toggle-sidebar-section"
                    data-section="shared"
                    class="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    <span>Shared</span>
                    ${Icons.chevronDown('w-3 h-3 text-gray-400')}
                  </button>
                </div>
                <div class="space-y-0.5" id="sidebar-list-shared">
                  ${displayShared.map(sh => `
                    <button
                      type="button"
                      data-action="open-article-read"
                      data-doc-key="${sh.docKey}"
                      class="w-full flex items-center gap-2 px-2 py-1 rounded-md text-xs text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-100/70 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer group truncate"
                      title="${sh.title}"
                    >
                      ${Icons.page('w-3.5 h-3.5 text-gray-400 shrink-0 group-hover:text-indigo-500')}
                      <span class="truncate text-left">${sh.title}</span>
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Private Section (Collapsible) -->
              <div class="space-y-1" id="sidebar-sec-private">
                <div class="flex items-center justify-between px-2 py-1 text-[11px] font-medium text-gray-500 dark:text-zinc-400">
                  <button
                    type="button"
                    data-action="toggle-sidebar-section"
                    data-section="private"
                    class="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    <span>Private</span>
                    ${Icons.chevronDown('w-3 h-3 text-gray-400')}
                  </button>
                </div>
                <div class="space-y-0.5" id="sidebar-list-private">
                  ${displayPrivate.map(pv => `
                    <button
                      type="button"
                      data-action="open-article-read"
                      data-doc-key="${pv.docKey}"
                      class="w-full flex items-center gap-2 px-2 py-1 rounded-md text-xs text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-100/70 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer group truncate"
                      title="${pv.title}"
                    >
                      ${Icons.page('w-3.5 h-3.5 text-gray-400 shrink-0 group-hover:text-indigo-500')}
                      <span class="truncate text-left">${pv.title}</span>
                    </button>
                  `).join('')}
                </div>
              </div>
            </div>
          ` : `
            <!-- 2.B WORK SIDEBAR (Work items, Cycles, Modules & Views) -->
            <div class="h-12 px-3 border-b border-gray-200/80 dark:border-zinc-800 flex items-center justify-between gap-2 shrink-0">
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-4 h-4 rounded bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-[9px] font-mono font-bold shrink-0">
                  P
                </span>
                <span class="text-xs font-semibold text-gray-900 dark:text-zinc-100 truncate">${activeProject}</span>
              </div>
              <button
                type="button"
                id="toggle-sidebar-collapse"
                class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 rounded transition-colors cursor-pointer"
                title="Collapse sidebar"
              >
                ${Icons.sidebarCollapse('w-3.5 h-3.5')}
              </button>
            </div>

            <!-- Quick Action: Search -->
            <div class="px-3 pt-2.5 pb-1 shrink-0">
              <button
                type="button"
                id="sidebar-omnibox-trigger"
                class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md bg-white dark:bg-zinc-800/80 hover:bg-gray-50 dark:hover:bg-zinc-750 border border-gray-200 dark:border-zinc-700 text-xs text-gray-500 dark:text-zinc-400 transition-colors cursor-pointer shadow-2xs"
                title="Search work items (Ctrl+K)"
              >
                <div class="flex items-center gap-2">
                  ${Icons.search('w-3.5 h-3.5')}
                  <span class="text-[11px]">Search...</span>
                </div>
                <kbd class="px-1 py-0.2 rounded bg-gray-100 dark:bg-zinc-800 text-[10px] font-mono text-gray-500 dark:text-zinc-400 border border-gray-200/60 dark:border-zinc-700/60">Ctrl K</kbd>
              </button>
            </div>

            <nav class="flex-1 px-2.5 py-2 space-y-4 overflow-y-auto scrollbar-sm">
              <div class="space-y-1">
                <div class="px-2 py-0.5 text-[11px] font-semibold text-gray-500 dark:text-zinc-400">Projects</div>
                <div class="space-y-0.5">
                  ${renderList(projectNavItems, renderWorkNavItem)}
                </div>
              </div>

              <div class="space-y-1">
                <div class="px-2 py-0.5 text-[11px] font-semibold text-gray-500 dark:text-zinc-400">Workspace Views</div>
                <div class="space-y-0.5">
                  ${renderList(workspaceNavItems, renderWorkNavItem)}
                </div>
              </div>
            </nav>
          `}

          <!-- Footer: SQLite WAL & Markdown Dual Sync Status -->
          <div class="px-3 py-2 border-t border-gray-200/80 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 shrink-0">
            <div class="flex items-center justify-between text-[11px] text-gray-500 dark:text-zinc-400">
              <span class="flex items-center gap-1.5 font-medium text-gray-700 dark:text-zinc-300">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>SQLite + .md Sync</span>
              </span>
              <span class="px-1.5 py-0.2 rounded bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">WAL</span>
            </div>
          </div>
        </div>
      ` : ''}
    </aside>
  `;
}