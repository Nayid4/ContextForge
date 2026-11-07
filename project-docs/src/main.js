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
import { renderMarkdown, extractTableOfContents, parseMarkdownToBlocks, blocksToMarkdown } from './shared/MarkdownViewer.js';

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
    this.currentActiveDocKey = null;
    this.isArticleOpen = false;
    this.activeKbPerspective = 'global';
    this.editorMode = 'markdown';
    this.currentBlocks = [];
    this.isScrollingFromEditor = false;
    this.isScrollingFromPreview = false;
    this.scrollResetTimer = null;
  }

  async init() {
    router.init((domainView, rawHash) => {
      this.handleViewChange(domainView, rawHash);
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

  handleViewChange(domainView, rawHash) {
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
        <div class="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 space-y-4">
          <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <h2 class="text-base font-bold tracking-tight">Iniciando Plataforma Plane...</h2>
          <p class="text-xs text-zinc-500 font-mono">Sincronizando SQLite y base de conocimiento Markdown</p>
        </div>
      `;
      return;
    }

    // 2. Error State
    if (state.error && issues.length === 0) {
      this.root.innerHTML = `
        <div class="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 space-y-4">
          <div class="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
            ${Icons.clock('w-8 h-8')}
          </div>
          <h2 class="text-lg font-bold text-rose-400">Error al inicializar el tablero</h2>
          <p class="text-xs text-zinc-400 max-w-md text-center">${state.error}</p>
          <button type="button" data-action="refresh" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer">
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
        <div class="flex-1 flex flex-col min-h-0 overflow-y-auto bg-zinc-950">
          ${renderKnowledgeBase({
            knowledgeIndex: state.knowledgeIndex || planeData.knowledgeIndex,
            projectSpec: state.projectSpec || planeData.projectSpec,
            features: state.features || issues,
            planePages: pages,
            planePageState: {
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
        isCollapsed: state.isSidebarCollapsed || false
      },
      topBarProps: {
        currentView,
        viewTitle,
        activeProject: planeData.project?.name || 'Arnés SDD Multi-Agente',
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
      } else {
        this.initMermaidDiagrams();
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
        window.mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          themeVariables: {
            darkMode: true,
            background: '#09090b',
            primaryColor: '#6366f1',
            primaryBorderColor: '#818cf8',
            primaryTextColor: '#f4f4f5',
            lineColor: '#52525b'
          }
        });
        window.mermaid.run({ querySelector: '.mermaid' });
      } catch (e) {
        console.warn('Error inicializando Mermaid:', e);
      }
    }
  }

  bindGlobalEvents() {
    // 1. Delegación de eventos de click en toda la aplicación
    document.addEventListener('click', async (e) => {
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

      // Volver a la Biblioteca de Conocimiento
      const backToLibBtn = e.target.closest('[data-action="back-to-library"]');
      if (backToLibBtn) {
        this.isArticleOpen = false;
        document.getElementById('kb-view-article')?.classList.add('hidden');
        document.getElementById('kb-view-library')?.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Abrir Documento en Modo Lectura (Editorial Article)
      const openReadBtn = e.target.closest('[data-action="open-article-read"]');
      if (openReadBtn) {
        const docKey = openReadBtn.getAttribute('data-doc-key');
        if (docKey) this.openArticleView(docKey, false);
        return;
      }

      // Abrir Documento en Modo Edición
      const openEditBtn = e.target.closest('[data-action="open-article-edit"]');
      if (openEditBtn) {
        const docKey = openEditBtn.getAttribute('data-doc-key');
        if (docKey) this.openArticleView(docKey, true);
        return;
      }

      // Alternar Modo Editor / Lectura en Artículo
      const toggleEditorBtn = e.target.closest('#btn-toggle-doc-editor');
      if (toggleEditorBtn) {
        const readerContainer = document.getElementById('doc-reader-view-container');
        const editorContainer = document.getElementById('doc-editor-view-container');
        const btnText = document.getElementById('btn-toggle-doc-text');
        const btnIcon = document.getElementById('btn-toggle-doc-icon');
        const textarea = document.getElementById('doc-editor-textarea');
        const preview = document.getElementById('doc-editor-live-preview');
        const pathEl = document.getElementById('doc-active-path');

        if (readerContainer && editorContainer) {
          const isEditorHidden = editorContainer.classList.contains('hidden');
          if (isEditorHidden) {
            const docKey = pathEl ? pathEl.textContent.trim() : '';
            const docs = store.getState().knowledgeIndex?.docs || {};
            const content = docs[docKey] || '';
            if (textarea) textarea.value = content;
            if (preview) preview.innerHTML = renderMarkdown(content);
            editorContainer.classList.remove('hidden');
            readerContainer.classList.add('hidden');
            if (btnText) btnText.textContent = 'Modo Lectura';
            if (btnIcon) btnIcon.innerHTML = Icons.eye('w-3.5 h-3.5');
            this.setupSynchronizedScroll();
          } else {
            editorContainer.classList.add('hidden');
            readerContainer.classList.remove('hidden');
            if (btnText) btnText.textContent = 'Modo Editor';
            if (btnIcon) btnIcon.innerHTML = Icons.edit('w-3.5 h-3.5');
          }
        }
        return;
      }

      // Conmutador del Editor Dual: Modo Markdown
      const btnModeMd = e.target.closest('#btn-editor-mode-md');
      if (btnModeMd) {
        this.editorMode = 'markdown';
        btnModeMd.classList.add('bg-indigo-600', 'text-white');
        btnModeMd.classList.remove('text-slate-600', 'dark:text-slate-400');
        const btnModeBlocks = document.getElementById('btn-editor-mode-blocks');
        btnModeBlocks?.classList.remove('bg-indigo-600', 'text-white');
        btnModeBlocks?.classList.add('text-slate-600', 'dark:text-slate-400');

        document.getElementById('editor-pane-markdown')?.classList.remove('hidden');
        document.getElementById('editor-pane-blocks')?.classList.add('hidden');
        this.setupSynchronizedScroll();
        return;
      }

      // Conmutador del Editor Dual: Modo Bloques Visuales (ContextForge)
      const btnModeBlocks = e.target.closest('#btn-editor-mode-blocks');
      if (btnModeBlocks) {
        this.editorMode = 'blocks';
        btnModeBlocks.classList.add('bg-indigo-600', 'text-white');
        btnModeBlocks.classList.remove('text-slate-600', 'dark:text-slate-400');
        const btnModeMd = document.getElementById('btn-editor-mode-md');
        btnModeMd?.classList.remove('bg-indigo-600', 'text-white');
        btnModeMd?.classList.add('text-slate-600', 'dark:text-slate-400');

        document.getElementById('editor-pane-markdown')?.classList.add('hidden');
        document.getElementById('editor-pane-blocks')?.classList.remove('hidden');

        const textarea = document.getElementById('doc-editor-textarea');
        const currentMd = textarea ? textarea.value : '';
        this.currentBlocks = parseMarkdownToBlocks(currentMd);
        this.renderVisualBlocks(this.currentBlocks);
        return;
      }

      // Cancelar edición de documento
      const cancelEditBtn = e.target.closest('#btn-cancel-doc-edit');
      if (cancelEditBtn) {
        document.getElementById('doc-editor-view-container')?.classList.add('hidden');
        document.getElementById('doc-reader-view-container')?.classList.remove('hidden');
        const btnText = document.getElementById('btn-toggle-doc-text');
        const btnIcon = document.getElementById('btn-toggle-doc-icon');
        if (btnText) btnText.textContent = 'Modo Editor';
        if (btnIcon) btnIcon.innerHTML = Icons.edit('w-3.5 h-3.5');
        return;
      }

      // Guardar cambios del documento
      const saveEditBtn = e.target.closest('#btn-save-doc-edit');
      if (saveEditBtn) {
        const pathEl = document.getElementById('doc-active-path');
        const docKey = pathEl ? pathEl.textContent.trim() : '';
        const textarea = document.getElementById('doc-editor-textarea');
        const newContent = textarea ? textarea.value : '';

        if (docKey) {
          store.saveDoc(docKey, newContent);
          const bodyEl = document.getElementById('doc-active-body');
          if (bodyEl) bodyEl.innerHTML = renderMarkdown(newContent);
          const tocEl = document.getElementById('doc-active-toc');
          if (tocEl) tocEl.innerHTML = renderTocHtml(extractTableOfContents(newContent));

          document.getElementById('doc-editor-view-container')?.classList.add('hidden');
          document.getElementById('doc-reader-view-container')?.classList.remove('hidden');
          const btnText = document.getElementById('btn-toggle-doc-text');
          const btnIcon = document.getElementById('btn-toggle-doc-icon');
          if (btnText) btnText.textContent = 'Modo Editor';
          if (btnIcon) btnIcon.innerHTML = Icons.edit('w-3.5 h-3.5');

          this.initMermaidDiagrams();
        }
        return;
      }

      // Filtrar estantes por píldora en la Biblioteca
      const shelfPill = e.target.closest('.kb-shelf-pill');
      if (shelfPill) {
        const targetShelf = shelfPill.getAttribute('data-shelf-filter') || '';
        this.kbActiveShelfFilter = targetShelf;
        document.querySelectorAll('.kb-shelf-pill').forEach(p => {
          p.classList.remove('active', 'bg-indigo-600', 'text-white', 'font-semibold');
          p.classList.add('bg-zinc-900', 'text-zinc-400');
        });
        shelfPill.classList.add('active', 'bg-indigo-600', 'text-white', 'font-semibold');
        shelfPill.classList.remove('bg-zinc-900', 'text-zinc-400');
        this.applyLibraryFiltersAndSort();
        return;
      }

      // Conmutar entre pestañas de Módulos DDD en Library
      const modTabBtn = e.target.closest('[data-module-tab]');
      if (modTabBtn) {
        const targetMod = modTabBtn.getAttribute('data-module-tab');
        document.querySelectorAll('.kb-module-tab-btn').forEach(b => {
          const isMatch = b.getAttribute('data-module-tab') === targetMod;
          b.classList.toggle('active', isMatch);
          b.classList.toggle('bg-indigo-600', isMatch);
          b.classList.toggle('text-white', isMatch);
          b.classList.toggle('font-semibold', isMatch);
          b.classList.toggle('bg-zinc-900', !isMatch);
          b.classList.toggle('text-zinc-400', !isMatch);
        });
        document.querySelectorAll('.kb-module-content-panel').forEach(panel => {
          panel.classList.toggle('hidden', panel.id !== `kb-module-content-${targetMod}`);
        });
        return;
      }

      // Abrir página favorita directamente desde la sección Favorites del Sidebar de Plane
      const favSidebarBtn = e.target.closest('[data-action="sidebar-open-favorite-page"]');
      if (favSidebarBtn) {
        const docKey = favSidebarBtn.getAttribute('data-doc-key') || 'c4-model.md';
        this.currentActiveDocKey = docKey;
        this.isArticleOpen = true;
        if (store.getState().planeView !== 'pages') {
          router.navigate('pages');
        } else {
          this.openArticleView(docKey, false);
        }
        return;
      }

      // Conmutar entre Niveles de Perspectiva y Pestañas Plane (Public / Private / Archived / Modules / Master / Split / Governance)
      const perspectiveBtn = e.target.closest('[data-kb-perspective]');
      if (perspectiveBtn) {
        const targetPersp = perspectiveBtn.getAttribute('data-kb-perspective');
        const accessTab = perspectiveBtn.getAttribute('data-page-access-tab');
        this.activeKbPerspective = targetPersp || 'global';
        if (accessTab) {
          this.kbAccessTab = accessTab;
        }
        document.querySelectorAll('.kb-perspective-btn').forEach(btn => {
          btn.classList.remove('active', 'border-indigo-500', 'text-zinc-100', 'font-semibold');
          btn.classList.add('border-transparent', 'text-zinc-400', 'font-medium');
        });
        perspectiveBtn.classList.add('active', 'border-indigo-500', 'text-zinc-100', 'font-semibold');
        perspectiveBtn.classList.remove('border-transparent', 'text-zinc-400', 'font-medium');

        document.querySelectorAll('.kb-perspective-panel').forEach(panel => {
          panel.classList.add('hidden');
        });
        const targetPanel = document.getElementById(`kb-perspective-panel-${targetPersp}`);
        if (targetPanel) {
          targetPanel.classList.remove('hidden');
        }
        if (targetPersp === 'global') {
          this.applyLibraryFiltersAndSort();
        }
        this.initMermaidDiagrams();
        return;
      }

      // Alternar dirección de ordenamiento Ascendente / Descendente (Plane OrderBy)
      const sortDirBtn = e.target.closest('[data-action="toggle-kb-sort-dir"]');
      if (sortDirBtn) {
        const curr = sortDirBtn.getAttribute('data-sort-dir') || 'desc';
        const next = curr === 'desc' ? 'asc' : 'desc';
        sortDirBtn.setAttribute('data-sort-dir', next);
        sortDirBtn.textContent = next.toUpperCase();
        this.kbSortDir = next;
        this.applyLibraryFiltersAndSort();
        return;
      }

      // Mostrar / Ocultar Popover de Filtros de Library
      const toggleFiltersPopoverBtn = e.target.closest('[data-action="toggle-kb-filters-popover"]');
      if (toggleFiltersPopoverBtn) {
        const pop = document.getElementById('kb-filters-popover');
        if (pop) pop.classList.toggle('hidden');
        return;
      }

      // Limpiar todos los filtros de Library (Plane Clear all)
      const clearKbFiltersBtn = e.target.closest('[data-action="clear-kb-filters"]');
      if (clearKbFiltersBtn) {
        this.kbAccessTab = 'public';
        this.kbActiveShelfFilter = '';
        this.kbSearchQuery = '';
        this.kbFilterFavorites = false;
        this.kbFilterLocked = false;
        this.kbFilterOwner = '';
        const searchInput = document.getElementById('kb-library-search-input');
        if (searchInput) searchInput.value = '';
        const favChk = document.getElementById('kb-filter-favorites-chk');
        if (favChk) favChk.checked = false;
        const lockChk = document.getElementById('kb-filter-locked-chk');
        if (lockChk) lockChk.checked = false;
        const ownerSel = document.getElementById('kb-filter-owner-select');
        if (ownerSel) ownerSel.value = '';
        document.querySelectorAll('.kb-shelf-pill').forEach((p, idx) => {
          p.classList.toggle('active', idx === 0);
          p.classList.toggle('bg-indigo-600', idx === 0);
          p.classList.toggle('text-white', idx === 0);
          p.classList.toggle('font-semibold', idx === 0);
          p.classList.toggle('bg-zinc-900', idx !== 0);
          p.classList.toggle('text-zinc-400', idx !== 0);
        });
        document.querySelectorAll('.kb-access-tab-btn').forEach(btn => {
          const isPub = btn.getAttribute('data-page-access-tab') === 'public';
          btn.classList.toggle('active', isPub);
          btn.classList.toggle('border-indigo-500', isPub);
          btn.classList.toggle('text-zinc-100', isPub);
          btn.classList.toggle('font-semibold', isPub);
          btn.classList.toggle('border-transparent', !isPub);
          btn.classList.toggle('text-zinc-400', !isPub);
        });
        document.getElementById('kb-filters-popover')?.classList.add('hidden');
        this.applyLibraryFiltersAndSort();
        return;
      }

      // Mostrar / Ocultar menú contextual (...) de una fila de página
      const rowMenuBtn = e.target.closest('[data-action="toggle-page-row-menu"]');
      if (rowMenuBtn) {
        e.stopPropagation();
        const pageId = rowMenuBtn.getAttribute('data-page-id');
        const targetMenu = document.getElementById(`page-row-menu-${pageId}`);
        document.querySelectorAll('.plane-row-actions-menu').forEach(m => {
          if (m !== targetMenu) m.classList.add('hidden');
        });
        if (targetMenu) targetMenu.classList.toggle('hidden');
        return;
      }

      // Cerrar menús contextuales abiertos al hacer clic fuera
      if (!e.target.closest('.plane-row-actions-menu') && !e.target.closest('#kb-filters-popover')) {
        document.querySelectorAll('.plane-row-actions-menu').forEach(m => m.classList.add('hidden'));
      }

      // Alternar Visibilidad de Página Plane: Public (0) <-> Private (1) según BR-PAGE-01 y BR-PAGE-04
      const accessPageBtn = e.target.closest('[data-action="toggle-page-access"]');
      if (accessPageBtn) {
        const pageId = accessPageBtn.getAttribute('data-page-id');
        const pd = store.getState().planeData || {};
        const pages = pd.pages || [];
        const target = pages.find(p => p.id === pageId);
        if (target && target.archived_at) return;
        const nextAccess = target ? (Number(target.access || 0) === 1 ? 0 : 1) : 1;
        if (target) target.access = nextAccess;
        await api.updatePlanePage(pageId, { access: nextAccess });
        store.setState({ planeData: { ...pd, pages: [...pages] } });
        return;
      }

      // Archivar / Restaurar Página Plane según BR-PAGE-03 (auto-unfavorite al archivar)
      const archivePageBtn = e.target.closest('[data-action="toggle-page-archive"]');
      if (archivePageBtn) {
        const pageId = archivePageBtn.getAttribute('data-page-id');
        const pd = store.getState().planeData || {};
        const pages = pd.pages || [];
        const target = pages.find(p => p.id === pageId);
        const willArchive = !(target && target.archived_at);
        if (target) {
          target.archived_at = willArchive ? new Date().toISOString() : null;
          if (willArchive) target.is_favorite = 0;
        }
        await api.updatePlanePage(pageId, { archived: willArchive });
        store.setState({ planeData: { ...pd, pages: [...pages] } });
        return;
      }

      // Duplicar Página Plane (Make a copy) según BR-PAGE-05
      const dupPageBtn = e.target.closest('[data-action="duplicate-page"]');
      if (dupPageBtn) {
        const pageId = dupPageBtn.getAttribute('data-page-id');
        if (pageId) {
          await api.updatePlanePage(pageId, { duplicate: true });
          await this.refreshData();
        }
        return;
      }

      // Copiar Enlace Directo de Página
      const copyLinkBtn = e.target.closest('[data-action="copy-page-link"]');
      if (copyLinkBtn) {
        const docKey = copyLinkBtn.getAttribute('data-doc-key') || this.currentActiveDocKey || 'c4-model.md';
        const url = `${window.location.origin}${window.location.pathname}#pages?doc=${encodeURIComponent(docKey)}`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).catch(() => {});
        }
        document.querySelectorAll('.plane-row-actions-menu').forEach(m => m.classList.add('hidden'));
        return;
      }

      // Abrir / Cerrar / Confirmar Modal de Exportación de Página (Plane ExportPageModal)
      const openExportModalBtn = e.target.closest('[data-action="open-export-page-modal"]');
      if (openExportModalBtn) {
        this.exportTargetDocKey = openExportModalBtn.getAttribute('data-doc-key') || this.currentActiveDocKey || 'c4-model.md';
        const modal = document.getElementById('export-page-modal');
        if (modal) {
          modal.classList.remove('hidden');
          modal.classList.add('flex');
        }
        document.querySelectorAll('.plane-row-actions-menu').forEach(m => m.classList.add('hidden'));
        return;
      }
      if (e.target.closest('[data-action="close-export-page-modal"]')) {
        const modal = document.getElementById('export-page-modal');
        if (modal) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
        return;
      }
      if (e.target.closest('[data-action="confirm-export-page"]')) {
        const scope = document.getElementById('export-page-scope')?.value || 'active';
        const format = document.getElementById('export-page-format')?.value || 'md';
        const includeAssets = document.getElementById('export-page-include-assets')?.checked !== false;
        const docs = store.getState().knowledgeIndex?.docs || {};
        const docKey = scope === 'all' ? 'MASTER-PROJECT-KNOWLEDGE.md' : (this.exportTargetDocKey || this.currentActiveDocKey || 'c4-model.md');
        let rawMd = docs[docKey] || Object.values(docs).join('\n\n---\n\n') || '# Exported Page';
        if (!includeAssets) {
          rawMd = rawMd.replace(/```mermaid[\s\S]*?```/gi, '_[Diagram omitted in text-only export]_');
        }
        const blobContent = format === 'html'
          ? `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>${docKey}</title><style>body{font-family:system-ui,sans-serif;max-width:820px;margin:2rem auto;padding:0 1rem;background:#09090b;color:#f4f4f5;line-height:1.6}pre,code{background:#18181b;padding:0.2rem 0.4rem;border-radius:4px}</style></head><body>${renderMarkdown(rawMd)}</body></html>`
          : rawMd;
        const mime = format === 'html' ? 'text/html;charset=utf-8' : 'text/markdown;charset=utf-8';
        const ext = format === 'html' ? '.html' : '.md';
        const blob = new Blob([blobContent], { type: mime });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = docKey.replace(/\.md$/i, '') + ext;
        link.click();
        const modal = document.getElementById('export-page-modal');
        if (modal) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
        return;
      }

      // Filtro rápido de árbol de páginas Plane (all / favorites / locked / modules)
      const pageFilterBtn = e.target.closest('[data-action="set-page-tree-filter"]');
      if (pageFilterBtn) {
        const filter = pageFilterBtn.getAttribute('data-filter') || 'all';
        store.setState({ planePageFilterTab: filter });
        return;
      }

      // Cambiar pestaña del Panel de Inspección Derecho (outline / info / assets / version_history)
      const navTabBtn = e.target.closest('[data-action="switch-page-nav-tab"]');
      if (navTabBtn) {
        const tab = navTabBtn.getAttribute('data-tab') || 'outline';
        store.setState({ planePageNavTab: tab, planePageShowNavPane: true, planePageShowAiMenu: false });
        return;
      }

      // Mostrar / Ocultar Panel de Inspección Derecho
      const toggleNavPaneBtn = e.target.closest('[data-action="toggle-page-nav-pane"]');
      if (toggleNavPaneBtn) {
        const curr = store.getState().planePageShowNavPane !== false;
        store.setState({ planePageShowNavPane: !curr });
        return;
      }

      // Alternar Favorito en página Plane (is_favorite)
      const favPageBtn = e.target.closest('[data-action="toggle-page-favorite"]');
      if (favPageBtn) {
        const pageId = favPageBtn.getAttribute('data-page-id');
        const pd = store.getState().planeData || {};
        const pages = pd.pages || [];
        const target = pages.find(p => p.id === pageId);
        const nextFav = target ? (target.is_favorite ? 0 : 1) : 1;
        if (target) target.is_favorite = nextFav;
        await api.updatePlanePage(pageId, { is_favorite: Boolean(nextFav) });
        store.setState({ planeData: { ...pd, pages: [...pages] } });
        return;
      }

      // Alternar Bloqueo Normativo en página Plane (is_locked)
      const lockPageBtn = e.target.closest('[data-action="toggle-page-lock"]');
      if (lockPageBtn) {
        const pageId = lockPageBtn.getAttribute('data-page-id');
        const pd = store.getState().planeData || {};
        const pages = pd.pages || [];
        const target = pages.find(p => p.id === pageId);
        const nextLock = target ? (target.is_locked ? 0 : 1) : 0;
        if (target) target.is_locked = nextLock;
        await api.updatePlanePage(pageId, { is_locked: Boolean(nextLock) });
        store.setState({ planeData: { ...pd, pages: [...pages] } });
        return;
      }

      // Alternar Ancho Completo (Full Width)
      const fullWidthBtn = e.target.closest('[data-action="toggle-page-fullwidth"]');
      if (fullWidthBtn) {
        const pageId = fullWidthBtn.getAttribute('data-page-id');
        const nextFw = !store.getState().planePageFullWidth;
        if (pageId) await api.updatePlanePage(pageId, { full_width: nextFw });
        store.setState({ planePageFullWidth: nextFw });
        return;
      }

      // Alternar Menú Ask Harness AI
      const aiMenuBtn = e.target.closest('[data-action="toggle-page-ai-menu"]');
      if (aiMenuBtn) {
        const curr = Boolean(store.getState().planePageShowAiMenu);
        store.setState({ planePageShowAiMenu: !curr });
        return;
      }

      // Copiar Markdown de la página activa
      const copyPageMdBtn = e.target.closest('[data-action="copy-page-markdown"]');
      if (copyPageMdBtn) {
        const pageId = copyPageMdBtn.getAttribute('data-page-id');
        const page = (store.getState().planeData?.pages || []).find(p => p.id === pageId);
        const md = page?.content_markdown || store.getState().planeActivePageContent || '';
        if (navigator.clipboard && md) {
          navigator.clipboard.writeText(md).catch(() => {});
        }
        return;
      }

      // Restaurar versión histórica desde PageVersion
      const restoreVerBtn = e.target.closest('[data-action="restore-page-version"]');
      if (restoreVerBtn) {
        const pageId = restoreVerBtn.getAttribute('data-page-id');
        const versionId = restoreVerBtn.getAttribute('data-version-id');
        if (pageId && versionId) {
          await api.updatePlanePage(pageId, { restore_version_id: versionId });
          await this.refreshData();
        }
        return;
      }

      // Saltar a diagrama o asset desde la pestaña Assets
      const scrollAssetBtn = e.target.closest('[data-action="scroll-to-asset"]');
      if (scrollAssetBtn) {
        const idx = Math.max(0, Number(scrollAssetBtn.getAttribute('data-asset-index') || 1) - 1);
        const diagrams = document.querySelectorAll('.mermaid, article pre, article img');
        if (diagrams[idx]) {
          diagrams[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // Conmutar modo Lector / Editor Dual en PagesPage
      const setPageModeBtn = e.target.closest('[data-action="set-page-mode"]');
      if (setPageModeBtn) {
        const mode = setPageModeBtn.getAttribute('data-mode') || 'reader';
        store.setState({ planePageEditorMode: mode });
        return;
      }

      // Selección de página en la base de conocimiento
      const pageBtn = e.target.closest('button[data-page-id]');
      if (pageBtn && !pageBtn.hasAttribute('data-action')) {
        const pageId = pageBtn.getAttribute('data-page-id');
        const page = (store.getState().planeData?.pages || []).find(p => p.id === pageId);
        store.setState({
          planeActivePageId: pageId,
          planeActivePageContent: page?.content_markdown || '',
          planePageEditorMode: 'reader'
        });
        return;
      }

      // Seleccionar página vinculada desde Backlinks / Forward Links en PageNavigationPane
      const selectLinkedPageBtn = e.target.closest('[data-action="select-page"]');
      if (selectLinkedPageBtn) {
        const pageId = selectLinkedPageBtn.getAttribute('data-page-id');
        const page = (store.getState().planeData?.pages || []).find(p => p.id === pageId);
        if (page) {
          if (this.isArticleOpen && page.file_path) {
            const cleanKey = page.file_path.replace(/^knowledge\//, '');
            this.openArticleView(cleanKey, false);
          } else {
            store.setState({
              planeActivePageId: pageId,
              planeActivePageContent: page.content_markdown || '',
              planePageEditorMode: 'reader'
            });
          }
        }
        return;
      }

      // Alternar modo editor/lector de página
      if (e.target.closest('#plane-page-toggle-mode')) {
        const curr = store.getState().planePageEditorMode || 'reader';
        store.setState({ planePageEditorMode: curr === 'reader' ? 'editor' : 'reader' });
        return;
      }

      // Guardar página desde editor en SQLite y disco
      const savePageBtn = e.target.closest('#plane-page-save-btn');
      if (savePageBtn) {
        const pageId = savePageBtn.getAttribute('data-page-id');
        const editorInput = document.getElementById('plane-page-editor-input');
        const content = editorInput ? editorInput.value : '';
        if (pageId && content) {
          savePageBtn.textContent = 'Guardando...';
          await api.updatePlanePage(pageId, content);
          await this.refreshData();
          store.setState({ planeActivePageContent: content, planePageEditorMode: 'reader' });
        }
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

      // Modales de Library (New Page & AI Context)
      if (e.target.closest('[data-action="open-new-doc-modal"]')) {
        const modal = document.getElementById('new-doc-modal');
        if (modal) {
          modal.classList.remove('hidden');
          modal.classList.add('flex');
        }
        return;
      }
      if (e.target.closest('[data-action="close-new-doc-modal"]')) {
        const modal = document.getElementById('new-doc-modal');
        if (modal) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
        return;
      }
      if (e.target.closest('[data-action="open-ai-context-modal"]')) {
        const modal = document.getElementById('ai-context-modal');
        if (modal) {
          modal.classList.remove('hidden');
          modal.classList.add('flex');
        }
        return;
      }
      if (e.target.closest('[data-action="close-ai-context-modal"]')) {
        const modal = document.getElementById('ai-context-modal');
        if (modal) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
        return;
      }
    });

    // 2. Delegación de inputs (Búsqueda y filtros)
    document.addEventListener('input', (e) => {
      if (e.target.id === 'plane-issue-search') {
        clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = setTimeout(() => {
          store.setState({ planeSearchQuery: e.target.value });
        }, 150);
        return;
      }

      if (e.target.id === 'kb-library-search-input') {
        this.kbSearchQuery = (e.target.value || '').trim().toLowerCase();
        this.applyLibraryFiltersAndSort();
        return;
      }

      if (e.target.id === 'plane-page-search' || e.target.id === 'plane-pages-search') {
        clearTimeout(this.pageSearchDebounceTimer);
        this.pageSearchDebounceTimer = setTimeout(() => {
          store.setState({ planePageSearchQuery: e.target.value });
        }, 150);
        return;
      }

      if (e.target.id === 'plane-omnibox-input' || e.target.id === 'omnibox-input') {
        store.setState({ omniboxQuery: e.target.value });
        return;
      }

      if (e.target.id === 'doc-editor-textarea') {
        const preview = document.getElementById('doc-editor-live-preview');
        if (preview) {
          preview.innerHTML = renderMarkdown(e.target.value);
        }
        return;
      }
    });

    // 3. Delegación de selects de filtros y modales
    document.addEventListener('change', async (e) => {
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
      if (e.target.id === 'kb-sort-by-select') {
        this.kbSortBy = e.target.value || 'updated_at';
        this.applyLibraryFiltersAndSort();
        return;
      }
      if (e.target.id === 'kb-filter-favorites-chk') {
        this.kbFilterFavorites = Boolean(e.target.checked);
        this.applyLibraryFiltersAndSort();
        return;
      }
      if (e.target.id === 'kb-filter-locked-chk') {
        this.kbFilterLocked = Boolean(e.target.checked);
        this.applyLibraryFiltersAndSort();
        return;
      }
      if (e.target.id === 'kb-filter-owner-select') {
        this.kbFilterOwner = e.target.value || '';
        this.applyLibraryFiltersAndSort();
        return;
      }
      if (e.target.id === 'kb-rules-module-filter') {
        const mod = (e.target.value || '').trim();
        document.querySelectorAll('#kb-rules-list [data-rule-module]').forEach(row => {
          const rMod = row.getAttribute('data-rule-module') || '';
          row.classList.toggle('hidden', Boolean(mod && rMod !== mod));
        });
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
        const isOpen = store.getState().isOmniboxOpen;
        store.setState({ isOmniboxOpen: !isOpen, omniboxQuery: '' });
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
      if (e.target.id === 'new-doc-form') {
        e.preventDefault();
        const titleInput = document.getElementById('new-doc-title');
        const shelfSelect = document.getElementById('new-doc-shelf');
        const accessSelect = document.getElementById('new-doc-access');
        const pathInput = document.getElementById('new-doc-path');
        const contentInput = document.getElementById('new-doc-content');

        const rawTitle = (titleInput?.value || '').trim();
        const safeTitle = rawTitle.length > 0 ? rawTitle : 'Untitled';
        const shelf = shelfSelect?.value || 'architecture';
        const access = Number(accessSelect?.value || 0);
        const rawPath = (pathInput?.value || '').trim() || `${safeTitle.toLowerCase().replace(/[^a-z0-9_-]+/g, '-')}.md`;
        const cleanDocKey = rawPath.endsWith('.md') ? rawPath : `${rawPath}.md`;
        const content = (contentInput?.value || '').trim() || `# ${safeTitle}\n\n> [!NOTE] Nueva página creada en Plane Library.\n`;

        store.saveDoc(cleanDocKey, content);
        await api.createPlanePage({
          title: safeTitle,
          shelf,
          access,
          file_path: `knowledge/${cleanDocKey}`,
          content_markdown: content
        });

        const modal = document.getElementById('new-doc-modal');
        if (modal) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
        await this.refreshData();
        this.openArticleView(cleanDocKey, false);
      }
    });
  }

  /**
   * Motor de Filtrado y Ordenamiento de Páginas al estilo Plane (BR-PAGE-06)
   * Implementa shouldFilterPage (Public / Private / Archived + Favorites + Locked + Created By + Shelf + Search)
   * y sortBy / orderBy (updated_at, created_at, name en asc / desc), además de PageAppliedFiltersList.
   */
  applyLibraryFiltersAndSort() {
    const accessTab = this.kbAccessTab || 'public';
    const shelfFilter = this.kbActiveShelfFilter || '';
    const query = (this.kbSearchQuery || '').trim().toLowerCase();
    const filterFav = Boolean(this.kbFilterFavorites);
    const filterLocked = Boolean(this.kbFilterLocked);
    const filterOwner = this.kbFilterOwner || '';
    const sortBy = this.kbSortBy || 'updated_at';
    const sortDir = this.kbSortDir || 'desc';

    let totalVisible = 0;

    document.querySelectorAll('#kb-shelves-container .kb-shelf-section').forEach(section => {
      const shelfId = section.getAttribute('data-shelf-id') || '';
      const rowsContainer = section.querySelector('.kb-shelf-rows-list');
      const cards = Array.from(section.querySelectorAll('.kb-shelf-doc-card'));

      // Ordenar tarjetas dentro del estante según sortBy y sortDir
      cards.sort((a, b) => {
        if (sortBy === 'name') {
          const nameA = (a.getAttribute('data-doc-title') || '').toLowerCase();
          const nameB = (b.getAttribute('data-doc-title') || '').toLowerCase();
          return sortDir === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        }
        if (sortBy === 'created_at') {
          const cA = new Date(a.getAttribute('data-page-created') || 0).getTime();
          const cB = new Date(b.getAttribute('data-page-created') || 0).getTime();
          return sortDir === 'asc' ? cA - cB : cB - cA;
        }
        const uA = new Date(a.getAttribute('data-page-updated') || 0).getTime();
        const uB = new Date(b.getAttribute('data-page-updated') || 0).getTime();
        return sortDir === 'asc' ? uA - uB : uB - uA;
      });

      if (rowsContainer) {
        cards.forEach(card => rowsContainer.appendChild(card));
      }

      let shelfVisible = 0;
      cards.forEach(card => {
        const isArchived = card.getAttribute('data-page-archived') === '1';
        const isPrivate = card.getAttribute('data-page-access') === '1';
        const isFav = card.getAttribute('data-page-favorite') === '1';
        const isLock = card.getAttribute('data-page-locked') === '1';
        const owner = card.getAttribute('data-page-owner') || '';
        const title = (card.getAttribute('data-doc-title') || '').toLowerCase();
        const key = (card.getAttribute('data-doc-key') || '').toLowerCase();
        const mod = (card.getAttribute('data-doc-module') || '').toLowerCase();

        let visible = true;
        // 1. Filtro por pestaña Plane (Public / Private / Archived)
        if (accessTab === 'archived') {
          if (!isArchived) visible = false;
        } else if (accessTab === 'private') {
          if (isArchived || !isPrivate) visible = false;
        } else if (accessTab === 'public') {
          if (isArchived || isPrivate) visible = false;
        }

        // 2. Filtro por Estante (Shelf)
        if (visible && shelfFilter && shelfId !== shelfFilter) {
          visible = false;
        }

        // 3. Filtros de Popover Plane (Favorites / Locked / Created by)
        if (visible && filterFav && !isFav) visible = false;
        if (visible && filterLocked && !isLock) visible = false;
        if (visible && filterOwner && owner !== filterOwner) visible = false;

        // 4. Búsqueda textual
        if (visible && query) {
          if (!title.includes(query) && !key.includes(query) && !mod.includes(query) && !shelfId.toLowerCase().includes(query)) {
            visible = false;
          }
        }

        card.classList.toggle('hidden', !visible);
        if (visible) {
          shelfVisible++;
          totalVisible++;
        }
      });

      const countBadge = section.querySelector('.kb-shelf-visible-count');
      if (countBadge) countBadge.textContent = String(shelfVisible);
      section.classList.toggle('hidden', shelfVisible === 0);
    });

    // Ocultar franja de favoritos fijados cuando se está en Private o Archived o con búsqueda activa
    const pinnedStrip = document.getElementById('kb-pinned-featured-strip');
    if (pinnedStrip) {
      pinnedStrip.classList.toggle('hidden', accessTab !== 'public' || Boolean(query) || Boolean(shelfFilter));
    }

    // Mostrar estado vacío Plane cuando no hay coincidencias
    const emptyState = document.getElementById('kb-empty-filter-state');
    if (emptyState) {
      emptyState.classList.toggle('hidden', totalVisible > 0);
      emptyState.classList.toggle('flex', totalVisible === 0);
    }

    // Actualizar barra de filtros aplicados (PageAppliedFiltersList)
    const appliedBar = document.getElementById('kb-applied-filters-bar');
    const chipsContainer = document.getElementById('kb-applied-filters-chips');
    const activeChips = [];
    if (accessTab !== 'public') activeChips.push(`Tab: ${accessTab.toUpperCase()}`);
    if (shelfFilter) activeChips.push(`Shelf: ${shelfFilter}`);
    if (filterFav) activeChips.push('Favorite: Yes');
    if (filterLocked) activeChips.push('Locked: Yes');
    if (filterOwner) activeChips.push(`Created by: ${filterOwner}`);
    if (query) activeChips.push(`Query: "${query}"`);

    if (appliedBar && chipsContainer) {
      if (activeChips.length > 0) {
        appliedBar.classList.remove('hidden');
        appliedBar.classList.add('flex');
        chipsContainer.innerHTML = activeChips.map(c => `
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-mono text-[10px]">
            ${escapeHtml(c)}
          </span>
        `).join('');
      } else {
        appliedBar.classList.add('hidden');
        appliedBar.classList.remove('flex');
        chipsContainer.innerHTML = '';
      }
    }
  }

  openArticleView(docKey, openInEditor = false, skipScroll = false) {
    this.currentActiveDocKey = docKey;
    this.isArticleOpen = true;
    const state = store.getState();
    const planeData = state.planeData || {};
    const planePages = planeData.pages || [];
    const issues = (planeData.issues && planeData.issues.length > 0) ? planeData.issues : (state.features || []);
    const docs = state.knowledgeIndex?.docs || {};
    const meta = state.knowledgeIndex?.docMetadata?.[docKey] || {
      title: docKey,
      shelf: 'general',
      readingTime: 3,
      wordCount: 400
    };
    const matchedPlanePage = planePages.find(p => (p.file_path || '').endsWith(docKey) || p.file_path === `knowledge/${docKey}`) || {
      id: `page-kb-${docKey.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
      title: meta.title || docKey,
      file_path: `knowledge/${docKey}`,
      word_count: meta.wordCount || 400,
      reading_time_min: meta.readingTime || 3,
      is_locked: 1,
      is_favorite: docKey === 'c4-model.md' ? 1 : 0,
      access: 0,
      archived_at: null
    };
    const content = docs[docKey] || matchedPlanePage.content_markdown || '# Documento no disponible';

    const libView = document.getElementById('kb-view-library');
    const artView = document.getElementById('kb-view-article');
    const pathEl = document.getElementById('doc-active-path');
    const shelfBadge = document.getElementById('article-shelf-badge');
    const readingTimeBadge = document.getElementById('article-reading-time-badge');
    const bodyEl = document.getElementById('doc-active-body');
    const tocEl = document.getElementById('doc-active-toc');
    const wordsEl = document.getElementById('article-meta-words');
    const brEl = document.getElementById('article-meta-br');
    const rfEl = document.getElementById('article-meta-rf');
    const headerActionsEl = document.getElementById('article-plane-header-actions');
    const inspectorEl = document.getElementById('article-plane-inspector-container');
    const statusBannerEl = document.getElementById('article-status-banner');
    const floatingOutlineEl = document.getElementById('article-floating-outline-wrapper');

    const readerContainer = document.getElementById('doc-reader-view-container');
    const editorContainer = document.getElementById('doc-editor-view-container');
    const btnText = document.getElementById('btn-toggle-doc-text');
    const btnIcon = document.getElementById('btn-toggle-doc-icon');
    const textarea = document.getElementById('doc-editor-textarea');
    const livePreview = document.getElementById('doc-editor-live-preview');

    if (pathEl) pathEl.textContent = docKey;
    if (shelfBadge) shelfBadge.textContent = meta.shelf || 'Canónico';
    if (readingTimeBadge) readingTimeBadge.innerHTML = `<span class="inline-flex items-center gap-1">${Icons.clock('w-3 h-3')} <span>${meta.readingTime || 3} min</span></span>`;
    if (wordsEl) wordsEl.textContent = meta.wordCount || 0;
    if (brEl) brEl.textContent = meta.ruleCount || 0;
    if (rfEl) rfEl.textContent = meta.reqCount || 0;

    const toc = extractTableOfContents(content);
    if (bodyEl) bodyEl.innerHTML = enrichMarkdownWithSmartChips(renderMarkdown(content), issues);
    if (tocEl) {
      tocEl.innerHTML = renderTocHtml(toc);
    }
    if (headerActionsEl) {
      headerActionsEl.innerHTML = renderPageHeaderActions({
        activePage: matchedPlanePage,
        isFullWidth: Boolean(state.planePageFullWidth),
        showNavigationPane: state.planePageShowNavPane !== false,
        showAiMenu: Boolean(state.planePageShowAiMenu)
      });
    }
    if (statusBannerEl) {
      const isLocked = Boolean(matchedPlanePage.is_locked);
      const isArchived = Boolean(matchedPlanePage.archived_at);
      statusBannerEl.classList.toggle('hidden', !isLocked && !isArchived);
      statusBannerEl.classList.toggle('flex', isLocked || isArchived);
    }
    if (floatingOutlineEl) {
      floatingOutlineEl.innerHTML = state.planePageShowNavPane === false ? renderFloatingOutlineBars(toc) : '';
    }
    if (inspectorEl) {
      inspectorEl.innerHTML = PageNavigationPane({
        page: matchedPlanePage,
        content,
        toc,
        activeTab: state.planePageNavTab || 'outline',
        issues,
        pages: planePages
      });
    }

    if (textarea) textarea.value = content;
    if (livePreview) livePreview.innerHTML = renderMarkdown(content);

    if (openInEditor) {
      readerContainer?.classList.add('hidden');
      editorContainer?.classList.remove('hidden');
      if (btnText) btnText.textContent = 'Modo Lectura';
      if (btnIcon) btnIcon.innerHTML = Icons.eye('w-3.5 h-3.5');
      this.setupSynchronizedScroll();
    } else {
      editorContainer?.classList.add('hidden');
      readerContainer?.classList.remove('hidden');
      if (btnText) btnText.textContent = 'Modo Editor';
      if (btnIcon) btnIcon.innerHTML = Icons.edit('w-3.5 h-3.5');
    }

    libView?.classList.add('hidden');
    artView?.classList.remove('hidden');

    this.initMermaidDiagrams();
    if (!skipScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  setupSynchronizedScroll() {
    const textarea = document.getElementById('doc-editor-textarea');
    const preview = document.getElementById('doc-editor-live-preview');
    if (!textarea || !preview) return;

    textarea.onscroll = () => {
      if (this.isScrollingFromPreview) return;
      this.isScrollingFromEditor = true;
      const scrollMaxTextarea = textarea.scrollHeight - textarea.clientHeight;
      const scrollMaxPreview = preview.scrollHeight - preview.clientHeight;
      if (scrollMaxTextarea > 0 && scrollMaxPreview > 0) {
        const ratio = textarea.scrollTop / scrollMaxTextarea;
        preview.scrollTop = ratio * scrollMaxPreview;
      }
      clearTimeout(this.scrollResetTimer);
      this.scrollResetTimer = setTimeout(() => { this.isScrollingFromEditor = false; }, 60);
    };

    preview.onscroll = () => {
      if (this.isScrollingFromEditor) return;
      this.isScrollingFromPreview = true;
      const scrollMaxTextarea = textarea.scrollHeight - textarea.clientHeight;
      const scrollMaxPreview = preview.scrollHeight - preview.clientHeight;
      if (scrollMaxTextarea > 0 && scrollMaxPreview > 0) {
        const ratio = preview.scrollTop / scrollMaxPreview;
        textarea.scrollTop = ratio * scrollMaxTextarea;
      }
      clearTimeout(this.scrollResetTimer);
      this.scrollResetTimer = setTimeout(() => { this.isScrollingFromPreview = false; }, 60);
    };
  }

  renderVisualBlocks(blocks = []) {
    const container = document.getElementById('doc-editor-blocks-container');
    if (!container) return;

    if (!blocks || blocks.length === 0) {
      container.innerHTML = `
        <div class="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-slate-400 text-xs">
          Sin bloques de contenido aún. Añade uno con la barra superior de acciones.
        </div>
      `;
      return;
    }

    container.innerHTML = blocks.map((b, idx) => {
      const typeLabel = getBlockTypeLabel(b.type);
      return `
        <div class="visual-block-card rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3"
             data-block-id="${b.id}"
             data-block-index="${idx}">
          <div class="flex items-center justify-between text-xs font-mono pb-2 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-[10px]">
                ${typeLabel}
              </span>
              <span class="text-slate-400 text-[10px]">Bloque #${idx + 1}</span>
            </div>
            <div class="flex items-center gap-1">
              <button type="button" data-block-action="move-up" class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600" title="Subir">
                ${Icons.chevronUp('w-3.5 h-3.5')}
              </button>
              <button type="button" data-block-action="move-down" class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600" title="Bajar">
                ${Icons.chevronDown('w-3.5 h-3.5')}
              </button>
              <button type="button" data-block-action="delete" class="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600" title="Eliminar">
                ${Icons.trash('w-3.5 h-3.5')}
              </button>
            </div>
          </div>
          <div class="space-y-2">
            ${b.type === 'header' ? `
              <input type="text" class="w-full text-base font-bold bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white" value="${escapeAttr(b.text)}" placeholder="Título..." />
            ` : `
              <textarea rows="3" class="w-full text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-mono text-slate-900 dark:text-white">${escapeHtml(Array.isArray(b.lines) ? b.lines.join('\n') : (b.text || (Array.isArray(b.content) ? b.content.join('\n') : '')))}</textarea>
            `}
          </div>
        </div>
      `;
    }).join('');
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
