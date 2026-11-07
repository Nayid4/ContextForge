import { store } from './core/store.js';
import { api } from './core/api.js';
import { router } from './core/router.js';
import { detectEnvironment } from './core/detector.js';
import { Icons } from './shared/Icons.js';

// Screaming Architecture Domain Features
import {
  renderMasterLayout,
  renderPlaneControlsBar
} from './features/layout/index.js';

import {
  renderIssueListView,
  renderIssueBoardView,
  renderIssueCalendarView,
  renderIssueSpreadsheetView,
  IssueDetailModal
} from './features/issues/index.js';

import { renderCyclesView } from './features/cycles/index.js';
import { renderModulesView } from './features/modules/index.js';
import { renderPlanePagesView, renderKnowledgeBase } from './features/pages/index.js';
import { renderMarkdown, extractTableOfContents, parseMarkdownToBlocks, blocksToMarkdown } from './shared/MarkdownViewer.js';
import { renderArchitectureDocs, renderArchitectureView } from './features/architecture/index.js';
import { renderDependencyGraphView, renderDependencyGraph, DependencyTreeComponent } from './features/graph/index.js';
import { renderConstellation3DView, SpaceView3D } from './features/constellation/index.js';
import { renderAnalyticsView } from './features/analytics/index.js';

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
    const issues = planeData.issues || state.features || [];
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
      issues: 'Tareas (Work Items)',
      cycles: 'Ciclos de Desarrollo (Sprints)',
      modules: 'Módulos de Arquitectura (Epics)',
      pages: 'Páginas & Base de Conocimiento (Docs / IA)',
      architecture: 'Arquitectura C4 & Stack Tecnológico',
      graph: 'Grafo & Árbol de Dependencias',
      tree: 'Árbol Jerárquico de Requerimientos',
      constellation: 'Constelación Piramidal 3D',
      analytics: 'Analítica, Velocidad & Rendimiento'
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
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
          ${renderKnowledgeBase({
            knowledgeIndex: state.knowledgeIndex || planeData.knowledgeIndex,
            projectSpec: state.projectSpec || planeData.projectSpec,
            features: state.features || issues
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
        const issues = store.getState().planeData?.issues || store.getState().features || [];
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
        const targetShelf = shelfPill.getAttribute('data-shelf-filter');
        document.querySelectorAll('.kb-shelf-pill').forEach(p => {
          p.classList.remove('active', 'bg-indigo-600', 'text-white', 'font-bold', 'shadow-xs');
          p.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-400');
        });
        shelfPill.classList.add('active', 'bg-indigo-600', 'text-white', 'font-bold', 'shadow-xs');
        shelfPill.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-400');

        document.querySelectorAll('.kb-shelf-section').forEach(sec => {
          const sId = sec.getAttribute('data-shelf-id');
          if (!targetShelf || sId === targetShelf) {
            sec.classList.remove('hidden');
          } else {
            sec.classList.add('hidden');
          }
        });
        return;
      }

      // Conmutar entre Niveles de Perspectiva (Global / Módulos / Dossier Maestro)
      const perspectiveBtn = e.target.closest('[data-kb-perspective]');
      if (perspectiveBtn) {
        const targetPersp = perspectiveBtn.getAttribute('data-kb-perspective');
        document.querySelectorAll('.kb-perspective-btn').forEach(btn => {
          btn.classList.remove('active', 'bg-indigo-600', 'text-white', 'font-bold', 'shadow-xs');
          btn.classList.add('text-slate-600', 'dark:text-slate-400', 'font-medium');
        });
        perspectiveBtn.classList.add('active', 'bg-indigo-600', 'text-white', 'font-bold', 'shadow-xs');
        perspectiveBtn.classList.remove('text-slate-600', 'dark:text-slate-400', 'font-medium');

        document.querySelectorAll('.kb-perspective-panel').forEach(panel => {
          panel.classList.add('hidden');
        });
        const targetPanel = document.getElementById(`kb-perspective-panel-${targetPersp}`);
        if (targetPanel) {
          targetPanel.classList.remove('hidden');
        }
        return;
      }

      // Selección de página en la base de conocimiento
      const pageBtn = e.target.closest('button[data-page-id]');
      if (pageBtn) {
        const pageId = pageBtn.getAttribute('data-page-id');
        const page = (store.getState().planeData?.pages || []).find(p => p.id === pageId);
        store.setState({
          planeActivePageId: pageId,
          planeActivePageContent: page?.content_markdown || '',
          planePageEditorMode: 'reader'
        });
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
      if (e.target.closest('#plane-omnibox-trigger') || e.target.closest('[data-action="open-omnibox"]')) {
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
      if (e.target.id === 'plane-issue-search') {
        clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = setTimeout(() => {
          store.setState({ planeSearchQuery: e.target.value });
        }, 150);
        return;
      }

      if (e.target.id === 'plane-page-search') {
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
  }

  openArticleView(docKey, openInEditor = false) {
    this.currentActiveDocKey = docKey;
    const state = store.getState();
    const docs = state.knowledgeIndex?.docs || {};
    const meta = state.knowledgeIndex?.docMetadata?.[docKey] || {
      title: docKey,
      shelf: 'general',
      readingTime: 3,
      wordCount: 400
    };
    const content = docs[docKey] || '# Documento no disponible';

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

    if (bodyEl) bodyEl.innerHTML = renderMarkdown(content);
    if (tocEl) {
      const toc = extractTableOfContents(content);
      tocEl.innerHTML = renderTocHtml(toc);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
