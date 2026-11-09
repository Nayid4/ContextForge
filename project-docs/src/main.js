import { store } from './core/store.js';
import { api } from './core/api.js';
import { router } from './core/router.js';
import { detectEnvironment } from './core/detector.js';
import { Icons } from './shared/Icons.js';

// Screaming Architecture Domain Modules & Shared UI
import {
  renderMasterLayout,
  renderPlaneControlsBar
} from './shared/ui/index.js';

import {
  renderIssueListView,
  renderIssueBoardView,
  renderIssueCalendarView,
  renderIssueSpreadsheetView,
  IssueDetailModal,
  renderCyclesView,
  renderModulesView,
  renderPlanePagesView,
  renderPageHeaderActions,
  PageNavigationPane,
  renderFloatingOutlineBars,
  enrichMarkdownWithSmartChips,
  renderKnowledgeBase,
  renderArchitectureDocs,
  renderArchitectureView,
  renderDependencyGraphView,
  renderDependencyGraph,
  DependencyTreeComponent,
  renderConstellation3DView,
  SpaceView3D,
  renderAnalyticsView,
  renderHarnessView
} from './modules/index.js';
import { PagesController } from './modules/Pages/controllers/PagesController.js';
import { renderMarkdown, extractTableOfContents, parseMarkdownToBlocks, blocksToMarkdown } from './shared/MarkdownViewer.js';
import { formatTimeAgo } from './shared/utils/dates.js';

class App {
  constructor() {
    this.root = document.getElementById('app');
    this.spaceView3D = new SpaceView3D();
    this.currentTreeComponent = null;
    this.activeView = 'issues';
    this.envInfo = null;
    this.isAppMounted = false;
    this.searchDebounceTimer = null;
    this.pageSearchDebounceTimer = null;
    this.autoSyncController = null;
    this.lastSyncTime = new Date();
    this.pagesController = new PagesController(this);
  }

  get currentActiveDocKey() { return this.pagesController.currentActiveDocKey; }
  set currentActiveDocKey(v) { this.pagesController.currentActiveDocKey = v; }
  get isArticleOpen() { return this.pagesController.isArticleOpen; }
  set isArticleOpen(v) { this.pagesController.isArticleOpen = v; }
  get activeKbPerspective() { return this.pagesController.activeKbPerspective; }
  set activeKbPerspective(v) { this.pagesController.activeKbPerspective = v; }

  async init() {
    router.init((domainView, rawHash, params, isAnchor) => {
      this.handleViewChange(domainView, rawHash, params, isAnchor);
    });

    store.subscribe((state) => {
      this.handleStateChange(state);
    });

    this.bindGlobalEvents();

    await this.refreshData();

    this.initAutoSync();
  }

  initAutoSync() {
    if (typeof window !== 'undefined' && window.location?.protocol === 'file:') {
      return;
    }

    if (this.autoSyncController) {
      this.autoSyncController.stop();
    }

    this.autoSyncController = api.startPolling(5000, (freshData) => {
      if (freshData) {
        this.lastSyncTime = new Date();
        store.setData(freshData);
      }
    });
  }

  async refreshData() {
    store.setLoading(true);
    try {
      const data = await api.fetchAll({ bypassCache: true });
      const planeData = await api.fetchPlaneData({ bypassCache: true });
      this.envInfo = await detectEnvironment(data);
      this.lastSyncTime = new Date();
      store.setData(data);
      store.setState({ planeData });
    } catch (err) {
      console.error('Error cargando datos del arnés:', err);
      store.setError(err.message || 'Error al conectar con los datos del arnés');
    } finally {
      store.setLoading(false);
    }
  }

  handleViewChange(domainView, rawHash, params = {}, isAnchor = false) {
    if (isAnchor || params.anchor) {
      const headingId = params.anchor || rawHash;
      this.pagesController?.scrollToHeading(headingId);
      return;
    }

    if (this.activeView === 'constellation' && domainView !== 'constellation') {
      this.spaceView3D.unmount();
    }

    this.activeView = domainView;
    store.setState({
      planeView: domainView,
      graphMode: rawHash === 'tree' ? 'tree' : 'graph'
    });

    this.render();
  }

  handleStateChange(state) {
    this.render();
  }

  render() {
    if (!this.root) return;

    const state = store.getState();
    const planeData = state.planeData || {};
    const issues = (planeData.issues && planeData.issues.length > 0) ? planeData.issues : (state.features || []);
    const states = planeData.states || [];
    const cycles = planeData.cycles || [];
    const modules = planeData.modules || [];
    const pages = planeData.pages || [];
    const currentView = state.planeView || 'issues';

    // 1. Loading State
    if (state.loading && issues.length === 0) {
      this.root.innerHTML = `
        <div class="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center p-6 space-y-4">
          <div class="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <h2 class="text-sm font-semibold tracking-tight text-gray-800 dark:text-zinc-200">Iniciando Plataforma Plane...</h2>
          <p class="text-xs text-gray-500 dark:text-zinc-500 font-mono">Sincronizando SQLite y base de conocimiento</p>
        </div>
      `;
      return;
    }

    // 2. Error State
    if (state.error && issues.length === 0) {
      this.root.innerHTML = `
        <div class="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center p-6 space-y-4">
          <div class="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-500 flex items-center justify-center">
            ${Icons.clock('w-7 h-7')}
          </div>
          <h2 class="text-base font-semibold text-rose-600 dark:text-rose-400">Error al inicializar el tablero</h2>
          <p class="text-xs text-gray-600 dark:text-zinc-400 max-w-md text-center">${state.error}</p>
          <button type="button" data-action="refresh" class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-all cursor-pointer shadow-2xs">
            Reintentar
          </button>
        </div>
      `;
      return;
    }

    // Filtrar issues para la vista
    const searchQuery = state.planeSearchQuery || '';
    const filterState = state.planeFilterState || 'all';
    const filterPriority = state.planeFilterPriority || 'all';
    const filterAssignee = state.planeFilterAssignee || 'all';

    const filteredIssues = issues.filter(issue => {
      if (filterState !== 'all' && issue.state_id !== filterState) return false;
      if (filterPriority !== 'all' && (issue.priority || 'none').toLowerCase() !== filterPriority.toLowerCase()) return false;
      if (filterAssignee !== 'all' && (issue.assignee_role || '').toLowerCase() !== filterAssignee.toLowerCase()) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (issue.title || '').toLowerCase().includes(q);
        const matchId = (issue.id || '').toLowerCase().includes(q);
        const matchDesc = (issue.description || '').toLowerCase().includes(q);
        if (!matchTitle && !matchId && !matchDesc) return false;
      }
      return true;
    });

    // 3. Resolver Título de la Vista
    const viewTitles = {
      issues: 'Work items (Tareas)',
      cycles: 'Ciclos de Desarrollo (Cycles)',
      modules: 'Modules (Epics)',
      pages: 'Library · Base de Conocimiento (Docs / IA)',
      architecture: 'Architecture C4 & Tech Stack',
      graph: 'Views · Grafo de Dependencias',
      tree: 'Views · Árbol Jerárquico',
      constellation: 'Views · Constelación 3D',
      analytics: 'Analytics & Velocity',
      harness: 'Intake & Orquestación de Agentes IA'
    };
    const viewTitle = viewTitles[currentView] || 'Tareas';

    // 4. Renderizar Contenido de la Feature Activa
    let mainContentHtml = '';

    if (currentView === 'issues') {
      const controlsHtml = renderPlaneControlsBar({
        currentViewMode: state.planeViewMode || 'list',
        filterState,
        filterPriority,
        filterAssignee,
        groupBy: state.planeGroupBy || 'state',
        orderBy: state.planeOrderBy || 'sequence',
        searchQuery,
        totalIssues: issues.length,
        filteredIssues: filteredIssues.length
      });

      let viewComponentHtml = '';
      if (state.planeViewMode === 'board') {
        viewComponentHtml = renderIssueBoardView({ issues: filteredIssues, states });
      } else if (state.planeViewMode === 'calendar') {
        viewComponentHtml = renderIssueCalendarView({ issues: filteredIssues, cycles });
      } else if (state.planeViewMode === 'spreadsheet') {
        viewComponentHtml = renderIssueSpreadsheetView({ issues: filteredIssues });
      } else {
        viewComponentHtml = renderIssueListView({ issues: filteredIssues, states, groupBy: state.planeGroupBy || 'state' });
      }

      mainContentHtml = `
        ${controlsHtml}
        <div class="flex-1 overflow-y-auto">
          ${viewComponentHtml}
        </div>
      `;
    } else if (currentView === 'cycles') {
      mainContentHtml = `
        <div class="flex-1 overflow-y-auto">
          ${renderCyclesView({ cycles, issues, onSelectIssue: (id) => this.openIssueModal(id) })}
        </div>
      `;
    } else if (currentView === 'modules') {
      mainContentHtml = `
        <div class="flex-1 overflow-y-auto">
          ${renderModulesView({ modules, issues, onSelectIssue: (id) => this.openIssueModal(id) })}
        </div>
      `;
    } else if (currentView === 'pages') {
      mainContentHtml = `
        <div class="flex-1 flex flex-col min-h-0 overflow-y-auto bg-white dark:bg-zinc-950">
          ${renderKnowledgeBase({
            knowledgeIndex: state.knowledgeIndex || planeData.knowledgeIndex,
            projectSpec: state.projectSpec || planeData.projectSpec,
            features: state.features || issues,
            planePages: pages,
            planePageState: {
              activeCollection: this.pagesController?.activeCollection || 'product',
              isArticleOpen: this.pagesController?.isArticleOpen || false,
              activeDocKey: this.pagesController?.currentActiveDocKey,
              expandedParentIds: this.pagesController?.expandedParentIds,
              activePageId: state.planeActivePageId,
              activePageContent: state.planeActivePageContent,
              searchQuery: state.planePageSearchQuery || '',
              filterTab: state.planePageFilterTab || 'all',
              editorMode: state.planePageEditorMode || 'reader',
              isFullWidth: Boolean(state.planePageFullWidth),
              showNavigationPane: state.planePageShowNavPane !== false,
              activeNavTab: state.planePageNavTab || 'outline',
              showAiMenu: Boolean(state.planePageShowAiMenu)
            }
          })}
        </div>
      `;
    } else if (currentView === 'architecture') {
      mainContentHtml = `
        <div class="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto space-y-6">
          ${renderArchitectureDocs({
            projectSpec: state.projectSpec || planeData.projectSpec,
            knowledgeIndex: state.knowledgeIndex || planeData.knowledgeIndex,
            features: state.features || issues
          })}
        </div>
      `;
    } else if (currentView === 'graph' || currentView === 'tree') {
      mainContentHtml = `
        <div class="flex-1 overflow-y-auto">
          ${renderDependencyGraphView({
            features: state.features || issues,
            graphMode: state.graphMode || (currentView === 'tree' ? 'tree' : 'graph')
          })}
        </div>
      `;
    } else if (currentView === 'constellation') {
      mainContentHtml = `
        <div class="flex-1 overflow-y-auto">
          ${renderConstellation3DView()}
        </div>
      `;
    } else if (currentView === 'analytics') {
      mainContentHtml = `
        <div class="flex-1 overflow-y-auto">
          ${renderAnalyticsView({ issues, states, cycles, modules })}
        </div>
      `;
    } else if (currentView === 'harness' || currentView === 'agents') {
      mainContentHtml = `
        <div class="flex-1 overflow-y-auto">
          ${renderHarnessView({
            aiConfigs: planeData.aiConfigs || [],
            aiRuns: planeData.aiRuns || [],
            apiTokens: planeData.apiTokens || []
          })}
        </div>
      `;
    }

    // 5. Modal de Detalle de Tarea
    let modalHtml = '';
    if (state.planeSelectedIssueId) {
      const selectedIssue = issues.find(i => String(i.id) === String(state.planeSelectedIssueId));
      if (selectedIssue) {
        modalHtml = IssueDetailModal({
          issue: selectedIssue,
          states,
          cycles,
          modules
        });
      }
    }

    // 6. Ensamblado Maestro en MasterLayout
    this.root.innerHTML = renderMasterLayout({
      sidebarProps: {
        currentView,
        activeWorkspace: planeData.workspace?.name || 'Harness Engineering',
        activeProject: planeData.project?.name || 'Arnés SDD Multi-Agente',
        issueCount: issues.length,
        cycleCount: cycles.length,
        moduleCount: modules.length,
        pageCount: pages.length,
        favoritePages: pages.filter(p => p.is_favorite),
        sharedPages: pages.filter(p => !p.is_favorite && p.access === 0),
        privatePages: pages.filter(p => p.access === 1),
        dynamicCollections: planeData.collections || [],
        isCollapsed: state.isSidebarCollapsed || false,
        activeCollection: this.pagesController?.activeCollection || 'product'
      },
      topBarProps: {
        currentView,
        viewTitle,
        activeProject: planeData.project?.name || 'Arnés SDD Multi-Agente',
        activeCollection: this.pagesController?.activeCollection || 'product',
        theme: state.theme
      },
      omniboxProps: {
        isOpen: state.isOmniboxOpen || false,
        query: state.omniboxQuery || '',
        issues,
        pages
      },
      mainContentHtml,
      modalHtml
    });

    // 7. Post-Render Mounts
    if (currentView === 'constellation') {
      const threeTarget = document.getElementById('space-3d-canvas-container');
      if (threeTarget) {
        this.spaceView3D.mount(threeTarget, {
          features: state.features || issues,
          onSelect: (f) => this.openIssueModal(f.id)
        });
      }
    } else if (currentView === 'graph' || currentView === 'tree') {
      if (state.graphMode === 'tree') {
        const treeTarget = document.getElementById('dependency-interactive-target');
        if (treeTarget) {
          this.currentTreeComponent = new DependencyTreeComponent(treeTarget, {
            features: state.features || issues,
            currentSpec: state.currentSpec,
            onSelect: (f) => this.openIssueModal(f.id)
          });
        }
      }
    } else if (currentView === 'architecture') {
      this.initMermaidDiagrams();
    } else if (currentView === 'pages') {
      if (this.activeKbPerspective && this.activeKbPerspective !== 'global') {
        document.querySelectorAll('.kb-perspective-btn').forEach(btn => {
          const isMatch = btn.getAttribute('data-kb-perspective') === this.activeKbPerspective;
          btn.classList.toggle('active', isMatch);
          btn.classList.toggle('border-indigo-500', isMatch);
          btn.classList.toggle('text-zinc-100', isMatch);
          btn.classList.toggle('font-semibold', isMatch);
          btn.classList.toggle('border-transparent', !isMatch);
          btn.classList.toggle('text-zinc-400', !isMatch);
        });
        document.querySelectorAll('.kb-perspective-panel').forEach(panel => {
          panel.classList.add('hidden');
        });
        document.getElementById(`kb-perspective-panel-${this.activeKbPerspective}`)?.classList.remove('hidden');
      }
      if (this.isArticleOpen && this.currentActiveDocKey) {
        this.openArticleView(this.currentActiveDocKey, false, true);
      }
    }

    this.isAppMounted = true;
  }

  openIssueModal(issueId) {
    store.setState({ planeSelectedIssueId: issueId });
  }

  closeIssueModal() {
    store.setState({ planeSelectedIssueId: null });
  }

  initMermaidDiagrams() {
    if (window.mermaid) {
      try {
        const isDark = document.documentElement.classList.contains('dark');
        window.mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'default',
          suppressErrorRendering: true,
          themeVariables: {
            darkMode: isDark,
            background: isDark ? '#09090b' : '#ffffff',
            primaryColor: '#6366f1',
            primaryBorderColor: '#818cf8',
            primaryTextColor: isDark ? '#f4f4f5' : '#111827',
            lineColor: '#52525b'
          }
        });
        const unrendered = Array.from(document.querySelectorAll('.mermaid:not([data-processed="true"])'))
          .filter(el => el.offsetParent !== null);
        if (unrendered.length > 0) {
          window.mermaid.run({ nodes: unrendered }).catch(() => {});
        }
      } catch (e) {
        console.warn('Error inicializando Mermaid:', e);
      }
    }
  }

  bindGlobalEvents() {
    // 1. Delegación de eventos de click en toda la aplicación
    document.addEventListener('click', async (e) => {
      // 0. Navegación en documento: Desplazamiento interactivo a encabezados H1-H4
      const scrollHeadingBtn = e.target.closest('[data-action="scroll-to-heading"], #doc-active-toc a, #plane-page-navigation-pane nav a, #article-floating-outline-wrapper a');
      if (scrollHeadingBtn) {
        e.preventDefault();
        e.stopPropagation();
        const headingId = scrollHeadingBtn.getAttribute('data-heading-id') || (scrollHeadingBtn.getAttribute('href') || '').replace(/^#/, '');
        if (headingId) {
          this.pagesController?.scrollToHeading(headingId);
        }
        return;
      }

      // Toggle Sidebar Collapse
      const toggleCollapseBtn = e.target.closest('#toggle-sidebar-collapse');
      if (toggleCollapseBtn) {
        const curr = store.getState().isSidebarCollapsed || false;
        store.setState({ isSidebarCollapsed: !curr });
        return;
      }

      // Navegación de vistas desde la barra lateral
      const navBtn = e.target.closest('[data-plane-nav]');
      if (navBtn) {
        const targetView = navBtn.getAttribute('data-plane-nav');
        if (targetView) {
          router.navigate(targetView);
        }
        return;
      }

      // Conmutación de sub-pestañas de arquitectura (C1, C2, C3, Layers)
      const archTabBtn = e.target.closest('button[data-arch-tab]');
      if (archTabBtn) {
        const tabId = archTabBtn.getAttribute('data-arch-tab');
        document.querySelectorAll('.arch-tab-btn').forEach(b => {
          b.classList.remove('active', 'bg-indigo-600', 'text-white');
          b.classList.add('text-slate-400');
        });
        archTabBtn.classList.add('active', 'bg-indigo-600', 'text-white');
        archTabBtn.classList.remove('text-slate-400');

        document.querySelectorAll('.diagram-panel').forEach(p => {
          p.classList.add('hidden');
          p.classList.remove('block');
        });
        const targetPanel = document.getElementById(`diagram-panel-${tabId}`);
        if (targetPanel) {
          targetPanel.classList.remove('hidden');
          targetPanel.classList.add('block');
        }
        return;
      }

      // Conmutación de modo Grafo DAG vs Árbol Jerárquico
      if (e.target.closest('#toggle-graph-mode-dag')) {
        store.setState({ graphMode: 'graph' });
        router.navigate('graph');
        return;
      }
      if (e.target.closest('#toggle-graph-mode-tree')) {
        store.setState({ graphMode: 'tree' });
        router.navigate('tree');
        return;
      }

      // Selector de modo de vista (List, Board, Calendar, Spreadsheet)
      const viewModeBtn = e.target.closest('button[data-view-mode]');
      if (viewModeBtn) {
        const mode = viewModeBtn.getAttribute('data-view-mode');
        store.setState({ planeViewMode: mode });
        return;
      }

      // Abrir modal de tarea desde botón view-detail
      const viewDetailBtn = e.target.closest('button[data-action="view-detail"]');
      if (viewDetailBtn) {
        const id = viewDetailBtn.getAttribute('data-id');
        const pdIssues = store.getState().planeData?.issues;
        const issues = (pdIssues && pdIssues.length > 0) ? pdIssues : (store.getState().features || []);
        const match = issues.find(i => String(i.id) === String(id) || String(i.id) === `INT-${String(id).padStart(3, '0')}` || String(i.sequence_id) === String(id));
        if (match) {
          this.openIssueModal(match.id);
        } else if (id) {
          this.openIssueModal(id);
        }
        return;
      }

      // Clic en fila o tarjeta de tarea para abrir modal de detalle
      const issueRow = e.target.closest('.plane-issue-row, .plane-issue-card');
      if (issueRow && !e.target.closest('button') && !e.target.closest('select')) {
        const issueId = issueRow.getAttribute('data-issue-id');
        if (issueId) {
          this.openIssueModal(issueId);
        }
        return;
      }

      // Cerrar modal de tarea
      if (e.target.closest('#plane-modal-close') || e.target.closest('[data-action="close-modal"]') || e.target.id === 'plane-issue-modal-backdrop') {
        this.closeIssueModal();
        return;
      }

      // Alternar subtarea interactiva (DEV / QA)
      const toggleSubtaskBtn = e.target.closest('[data-action="toggle-subtask"]');
      if (toggleSubtaskBtn) {
        e.stopPropagation();
        const issueId = toggleSubtaskBtn.getAttribute('data-issue-id');
        const subtaskId = toggleSubtaskBtn.getAttribute('data-subtask-id');
        const pdIssues = store.getState().planeData?.issues;
        const issues = (pdIssues && pdIssues.length > 0) ? pdIssues : (store.getState().features || []);
        const targetIssue = issues.find(i => String(i.id) === String(issueId));
        if (targetIssue && Array.isArray(targetIssue.subtasks)) {
          const sub = targetIssue.subtasks.find(s => String(s.id) === String(subtaskId));
          if (sub) {
            sub.status = (sub.status === 'done' || sub.status === 'passed') ? 'pending' : 'passed';
            sub.completed = sub.status === 'passed' || sub.status === 'done';
            targetIssue.subtasks_done = targetIssue.subtasks.filter(s => s.status === 'done' || s.status === 'passed' || s.completed).length;
            targetIssue.subtasks_count = targetIssue.subtasks.length;
            store.setState({ features: [...issues] });
          }
        }
        return;
      }

      // Cambio rápido de estado desde tarjeta Kanban
      const quickStateBtn = e.target.closest('button[data-action="quick-state"]');
      if (quickStateBtn) {
        e.stopPropagation();
        const targetState = quickStateBtn.getAttribute('data-target-state');
        const issueId = quickStateBtn.getAttribute('data-issue-id');
        if (issueId && targetState) {
          await api.updatePlaneIssue(issueId, { state_id: targetState });
          await this.refreshData();
        }
        return;
      }

      // Delegar eventos de Library y Pages a PagesController (SOLID)
      if (await this.pagesController.handleClick(e)) {
        return;
      }

      // Sincronización manual SQLite <-> Markdown
      if (e.target.closest('#plane-manual-sync-btn')) {
        const btn = document.getElementById('plane-manual-sync-btn');
        if (btn) btn.classList.add('animate-pulse');
        await api.syncPlane();
        await this.refreshData();
        if (btn) btn.classList.remove('animate-pulse');
        return;
      }

      // Cambiar tema claro/oscuro
      if (e.target.closest('#plane-theme-toggle')) {
        store.toggleTheme();
        return;
      }

      // Abrir Omnibox (Ctrl+K)
      if (e.target.closest('#plane-omnibox-trigger') || e.target.closest('#sidebar-omnibox-trigger') || e.target.closest('[data-action="open-omnibox"]')) {
        store.setState({ isOmniboxOpen: true, omniboxQuery: '' });
        return;
      }

      // Cerrar Omnibox
      if (e.target.id === 'plane-omnibox-backdrop' || e.target.id === 'omnibox-modal') {
        store.setState({ isOmniboxOpen: false });
        return;
      }

      // Selección en Omnibox
      const omniIssue = e.target.closest('[data-action="omnibox-select-issue"]');
      if (omniIssue) {
        const issueId = omniIssue.getAttribute('data-issue-id');
        store.setState({ isOmniboxOpen: false });
        router.navigate('issues');
        this.openIssueModal(issueId);
        return;
      }

      const omniPage = e.target.closest('[data-action="omnibox-select-page"]');
      if (omniPage) {
        const pageId = omniPage.getAttribute('data-page-id');
        const page = (store.getState().planeData?.pages || []).find(p => p.id === pageId);
        store.setState({
          isOmniboxOpen: false,
          planeActivePageId: pageId,
          planeActivePageContent: page?.content_markdown || ''
        });
        router.navigate('pages');
        return;
      }
    });

    // 2. Delegación de inputs (Búsqueda y filtros)
    document.addEventListener('input', (e) => {
      if (this.pagesController.handleInput(e)) return;

      if (e.target.id === 'plane-issue-search') {
        clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = setTimeout(() => {
          store.setState({ planeSearchQuery: e.target.value });
        }, 150);
        return;
      }

      if (e.target.id === 'plane-omnibox-input' || e.target.id === 'omnibox-input') {
        store.setState({ omniboxQuery: e.target.value });
        return;
      }
    });

    // 3. Delegación de selects de filtros y modales
    document.addEventListener('change', async (e) => {
      if (await this.pagesController.handleChange(e)) return;

      if (e.target.id === 'plane-filter-state') {
        store.setState({ planeFilterState: e.target.value });
        return;
      }
      if (e.target.id === 'plane-filter-priority') {
        store.setState({ planeFilterPriority: e.target.value });
        return;
      }
      if (e.target.id === 'plane-group-by') {
        store.setState({ planeGroupBy: e.target.value });
        return;
      }

      // Select de estado en el modal de detalle
      if (e.target.id === 'modal-state-select') {
        const issueId = e.target.getAttribute('data-issue-id');
        const newState = e.target.value;
        if (issueId && newState) {
          await api.updatePlaneIssue(issueId, { state_id: newState });
          await this.refreshData();
        }
        return;
      }

      // Select de prioridad en el modal de detalle
      if (e.target.id === 'modal-priority-select') {
        const issueId = e.target.getAttribute('data-issue-id');
        const newPriority = e.target.value;
        if (issueId && newPriority) {
          await api.updatePlaneIssue(issueId, { priority: newPriority });
          await this.refreshData();
        }
        return;
      }
    });

    // 4. Atajos de teclado globales (Ctrl+K, Escape)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('kb-library-search-input');
        const libView = document.getElementById('kb-view-library');
        if (libView && !libView.classList.contains('hidden') && searchInput) {
          searchInput.focus();
          searchInput.select();
          return;
        }
        const isOpen = store.getState().isOmniboxOpen;
        store.setState({ isOmniboxOpen: !isOpen, omniboxQuery: '' });
        return;
      }

      if (e.key === 'Enter' && e.target.id === 'article-editable-title') {
        e.target.blur();
        return;
      }

      if (e.key === 'Escape') {
        const st = store.getState();
        if (st.isOmniboxOpen) {
          store.setState({ isOmniboxOpen: false });
        } else if (st.planeSelectedIssueId) {
          this.closeIssueModal();
        }
      }
    });

    // 5. Creación de nueva página en Plane Library (#new-doc-form)
    document.addEventListener('submit', async (e) => {
      if (await this.pagesController.handleSubmit(e)) return;
    });
  }

  /**
   * Métodos delegados a PagesController para mantener la compatibilidad hacia atrás
   */
  openArticleView(docKey, openInEditor = false, skipScroll = false) {
    return this.pagesController.openArticleView(docKey, openInEditor, skipScroll);
  }

  applyLibraryFiltersAndSort() {
    return this.pagesController.applyLibraryFiltersAndSort();
  }

  setupSynchronizedScroll() {
    return this.pagesController.setupSynchronizedScroll();
  }

  renderVisualBlocks(blocks = []) {
    return this.pagesController.renderVisualBlocks(blocks);
  }
}

function renderTocHtml(toc = []) {
  if (!toc || toc.length === 0) {
    return `<div class="text-[11px] text-slate-400 italic py-2">Sin encabezados.</div>`;
  }

  return `
    <nav class="space-y-1 text-xs font-mono">
      ${toc.map(item => `
        <a href="#${item.id}" 
           class="block py-1 px-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate text-slate-600 dark:text-slate-400 ${item.level === 1 ? 'font-bold text-slate-900 dark:text-slate-100' : item.level === 2 ? 'pl-3' : 'pl-5 text-[11px]'}"
           title="${escapeAttr(item.text)}">
          ${escapeHtml(item.text)}
        </a>
      `).join('')}
    </nav>
  `;
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getBlockTypeLabel(type) {
  switch (type) {
    case 'header': return 'Encabezado';
    case 'paragraph': return 'Párrafo';
    case 'callout': return 'Alerta';
    case 'business_rule': return 'Invariante BR';
    case 'code': return 'Código / Diagrama';
    case 'table': return 'Tabla';
    default: return 'Bloque';
  }
}

// Inicialización de la aplicación
const app = new App();
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      app.init();
    });
  } else {
    app.init();
  }
}
