import { store } from './core/store.js';
import { api } from './core/api.js';
import { router } from './core/router.js';
import { detectEnvironment } from './core/detector.js';
import { Icons } from './shared/Icons.js';
import { renderTabButton } from './shared/Button.js';
import { renderModal } from './shared/Modal.js';
import { renderStatsSummary } from './features/stats/StatsSummary.js';
import { renderCurrentSpecCard } from './features/current-spec/CurrentSpecCard.js';
import { renderFeatureFilters } from './features/feature-list/FeatureFilters.js';
import { renderFeatureTable } from './features/feature-list/FeatureTable.js';
import { renderFeaturePagination } from './features/feature-list/FeaturePagination.js';
import { renderDependencyGraph } from './features/dependency-graph/DependencyGraph.js';
import { DependencyTreeComponent } from './features/dependency-tree/DependencyTree.js';
import { SpaceView3D } from './features/space-view-3d/SpaceView3D.js';
import { renderHistoryTimeline } from './features/history-timeline/HistoryTimeline.js';
import { renderArchitectureDocs } from './features/architecture-docs/ArchitectureDocs.js';
import { renderKnowledgeBase } from './features/knowledge-base/KnowledgeBase.js';
import { renderMarkdown, extractTableOfContents, parseMarkdownToBlocks, blocksToMarkdown } from './shared/MarkdownViewer.js';

class App {
  constructor() {
    this.root = document.getElementById('app');
    this.spaceView3D = new SpaceView3D();
    this.currentTreeComponent = null;
    this.activeTab = 'features';
    this.envInfo = null;
    this.isAppMounted = false;
    this.searchDebounceTimer = null;
    this.kbSearchDebounceTimer = null;
    this.omniboxDebounceTimer = null;
    this.autoSyncController = null;
    this.lastSyncTime = new Date();

    // Estado del Editor Dual & Base de Conocimiento
    this.currentActiveDocKey = 'c4-model.md';
    this.editorMode = 'markdown'; // 'markdown' | 'blocks'
    this.currentBlocks = [];

    // Estado de Omnibox
    this.omniboxResults = [];
    this.activeOmniboxIndex = -1;

    // Control de Scroll Sincronizado
    this.isScrollingFromEditor = false;
    this.isScrollingFromPreview = false;
    this.scrollResetTimer = null;
  }

  async init() {
    router.init((tabId) => {
      this.handleTabChange(tabId);
    });

    store.subscribe((state) => {
      this.handleStateChange(state);
    });

    this.bindGlobalEvents();

    await this.refreshData();

    // Iniciar Auto-Sync reactivo para detectar cambios en los JSON en segundo plano
    this.initAutoSync();
  }

  initAutoSync() {
    if (typeof window !== 'undefined' && window.location?.protocol === 'file:') {
      return;
    }

    if (this.autoSyncController) {
      this.autoSyncController.stop();
    }

    this.autoSyncController = api.startAutoSync({
      intervalMs: 2500,
      onUpdate: (freshData) => {
        this.lastSyncTime = new Date();
        this.pulseSyncIndicator();
        store.setData(freshData);
      }
    });
  }

  pulseSyncIndicator() {
    const dot = document.getElementById('sync-status-dot');
    const timeEl = document.getElementById('sync-last-time');
    if (dot) {
      dot.classList.remove('bg-emerald-500');
      dot.classList.add('bg-cyan-400', 'scale-125');
      setTimeout(() => {
        dot.classList.remove('bg-cyan-400', 'scale-125');
        dot.classList.add('bg-emerald-500');
      }, 600);
    }
    if (timeEl) {
      timeEl.textContent = 'Actualizado';
      setTimeout(() => {
        if (timeEl) timeEl.textContent = 'En vivo';
      }, 1500);
    }
  }

  async refreshData() {
    store.setLoading(true);
    try {
      const data = await api.fetchAll({ bypassCache: true });
      this.envInfo = await detectEnvironment(data);
      this.lastSyncTime = new Date();
      store.setData(data);
    } catch (err) {
      console.error('Error cargando datos del arnés:', err);
      store.setError(err.message || 'Error al conectar con los datos del arnés');
    } finally {
      store.setLoading(false);
    }
  }

  handleTabChange(tabId) {
    if (this.activeTab === 'three' && tabId !== 'three') {
      this.spaceView3D.unmount();
    }
    this.activeTab = tabId;
    this.render();
  }

  handleStateChange(state) {
    const tableContainer = document.getElementById('feature-table-container');
    const paginationContainer = document.getElementById('feature-pagination-container');
    const isSearchFocused = document.activeElement && document.activeElement.id === 'feature-search-input';

    if (this.isAppMounted && this.activeTab === 'features' && tableContainer && paginationContainer && isSearchFocused) {
      const filteredFeatures = store.getFilteredFeatures();
      tableContainer.innerHTML = renderFeatureTable({
        features: filteredFeatures,
        pagination: state.pagination,
        onSelect: (f) => store.setSelectedFeature(f)
      });
      paginationContainer.innerHTML = renderFeaturePagination({
        totalItems: filteredFeatures.length,
        pagination: state.pagination
      });
      return;
    }

    this.render();
  }

  render() {
    if (!this.root) return;

    const activeElementId = document.activeElement?.id;
    const selectionStart = document.activeElement?.selectionStart;
    const selectionEnd = document.activeElement?.selectionEnd;

    const state = store.getState();
    const stats = store.getStats();
    const filteredFeatures = store.getFilteredFeatures();
    const modules = store.getAvailableModules();
    const isDark = state.theme === 'dark';
    const activeAgent = this.envInfo?.activeAgent || { name: 'Google Antigravity', iconName: 'zap' };
    const stackInfo = this.envInfo?.stack || { name: 'Multi-Stack Agnostico' };
    const isLocalFile = typeof window !== 'undefined' && window.location.protocol === 'file:';

    // 1. Loading State Inicial
    if (state.loading && state.features.length === 0) {
      this.root.innerHTML = `
        <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center p-6">
          <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 class="text-xl font-bold tracking-tight">Cargando Antigravity AI Harness...</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 font-mono">Sincronizando spec, tareas y branches</p>
        </div>
      `;
      return;
    }

    // 2. Error State
    if (state.error && state.features.length === 0) {
      this.root.innerHTML = `
        <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center p-6">
          <div class="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-4">
            ${Icons.clock}
          </div>
          <h2 class="text-xl font-bold text-rose-600 dark:text-rose-400">Error al inicializar el tablero</h2>
          <p class="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md text-center">${state.error}</p>
          <button type="button" data-action="refresh" class="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer">
            Reintentar
          </button>
        </div>
      `;
      return;
    }

    // 3. Render Principal
    this.root.innerHTML = `
      <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-200 transition-colors duration-200">
        
        <!-- Barra de Estado Superior -->
        <header class="border-b border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md sticky top-0 z-30 transition-colors">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            
            <!-- Logo & Info del Proyecto -->
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <span class="font-mono font-black text-sm">AG</span>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h1 class="text-sm font-bold tracking-tight text-slate-900 dark:text-white">${escapeHtml(state.project)}</h1>
                  <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-semibold">
                    SDD 2.0
                  </span>
                </div>
                <div class="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>Branch: <code class="text-indigo-600 dark:text-indigo-300 font-semibold">{type}/INT-{id}/{name}</code></span>
                  <span class="text-slate-300 dark:text-slate-700">•</span>
                  <span class="hidden sm:inline">Límite: <strong class="text-slate-700 dark:text-slate-300">≤80c</strong></span>
                </div>
              </div>
            </div>

            <!-- Chips de Agente, Omnibox, Stack y Auto-Sync -->
            <div class="hidden lg:flex items-center gap-2 text-xs">
              
              <!-- Omnibox Trigger Button (Ctrl+K) -->
              <button type="button" 
                      data-action="open-omnibox"
                      class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer shadow-xs"
                      title="Búsqueda global omnibox (Ctrl+K)">
                <span class="inline-flex items-center gap-1.5">${Icons.search('w-3.5 h-3.5')} <span>Buscar...</span></span>
                <kbd class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold">Ctrl K</kbd>
              </button>

              <!-- Badge de Auto-Sync Reactivo -->
              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl ${isLocalFile ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300' : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300'} shadow-xs"
                   title="${isLocalFile ? 'Modo local file://. Usa abrir-tablero.bat para auto-sync HTTP.' : 'Auto-Sync activo: detecta cambios en feature_list.json y progres/ en vivo'}">
                <span id="sync-status-dot" class="w-2 h-2 rounded-full ${isLocalFile ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'} transition-all"></span>
                <span id="sync-last-time" class="font-mono text-[11px] font-semibold">${isLocalFile ? 'file:// local' : 'En vivo'}</span>
              </div>

              <!-- Agente Detectado -->
              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 shadow-xs"
                   title="Agentes compatibles homologados: Google Antigravity, Open Code, GitHub Copilot, Claude Code, Codex">
                <span class="text-indigo-600 dark:text-indigo-400 flex items-center">${Icons[activeAgent.iconName || 'zap'] ? Icons[activeAgent.iconName || 'zap']('w-4 h-4') : Icons.zap('w-4 h-4')}</span>
                <span class="font-medium">${activeAgent.name}</span>
              </div>

              <!-- Stack Detectado -->
              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs"
                   title="Stack tecnológico detectado por technical-audit">
                <span class="text-slate-400">Stack:</span>
                <span class="font-semibold">${escapeHtml(stackInfo.name)}</span>
              </div>
            </div>

            <!-- Controles: Modo Claro/Oscuro y Refrescar -->
            <div class="flex items-center gap-2">
              <!-- Switch Modo Claro/Oscuro -->
              <button type="button" 
                      data-action="toggle-theme" 
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-all shadow-xs cursor-pointer select-none"
                      title="${isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}">
                <span class="text-amber-500 shrink-0">
                  ${isDark ? Icons.sun : Icons.moon}
                </span>
                <span class="hidden sm:inline">${isDark ? 'Modo Claro' : 'Modo Oscuro'}</span>
              </button>

              <!-- Botón Refrescar -->
              <button type="button" 
                      data-action="refresh" 
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-all shadow-xs cursor-pointer"
                      title="Refrescar datos del arnés ahora">
                <span class="shrink-0 ${state.loading ? 'animate-spin' : ''}">${Icons.refresh}</span>
                <span class="hidden sm:inline">Refrescar</span>
              </button>
            </div>
          </div>
        </header>

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <!-- 1. KPI Stats Summary -->
          <section aria-labelledby="stats-heading">
            <h2 id="stats-heading" class="sr-only">Métricas Generales</h2>
            ${renderStatsSummary(stats)}
          </section>

          <!-- 2. AI Active Execution Card -->
          <section aria-labelledby="active-spec-heading">
            <h2 id="active-spec-heading" class="sr-only">Ejecución Activa del Agente</h2>
            ${renderCurrentSpecCard(state.currentSpec)}
          </section>

          <!-- 3. Navegación por pestañas (Router) -->
          <nav class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-3 overflow-x-auto" aria-label="Vistas del tablero">
            ${renderTabButton({ id: 'features', label: 'Tareas y Bugfixes', icon: Icons.folder, active: this.activeTab === 'features', badge: String(state.features.length) })}
            ${renderTabButton({ id: 'knowledge', label: 'Base de Conocimiento', icon: Icons.book, active: this.activeTab === 'knowledge', badge: String(Object.keys(state.knowledgeIndex?.docs || {}).length || 22) })}
            ${renderTabButton({ id: 'architecture', label: 'Arquitectura & Stack', icon: Icons.layers, active: this.activeTab === 'architecture' })}
            ${renderTabButton({ id: 'graph', label: 'Grafo Visual DAG', icon: Icons.gitBranch, active: this.activeTab === 'graph' })}
            ${renderTabButton({ id: 'tree', label: 'Árbol Jerárquico', icon: Icons.check, active: this.activeTab === 'tree' })}
            ${renderTabButton({ id: 'three', label: 'Constelación 3D', icon: Icons.eye, active: this.activeTab === 'three' })}
            ${renderTabButton({ id: 'history', label: 'Bitácora Histórica', icon: Icons.clock, active: this.activeTab === 'history', badge: String(state.history?.records?.length || 0) })}
          </nav>

          <!-- 4. Contenido Dinámico de la Pestaña -->
          <section id="tab-content" class="min-h-[420px]">
            ${this.renderActiveTabContent({ state, filteredFeatures, modules })}
          </section>
        </main>

        <!-- Modal de Detalle de Feature -->
        <div id="modal-container">
          ${renderModal(state.selectedFeature)}
        </div>

        <!-- MODAL OMNIBOX GLOBAL SEARCH (Ctrl+K / Cmd+K) -->
        <div id="omnibox-modal" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm hidden items-start justify-center pt-16 sm:pt-24 px-4">
          <div class="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <span class="text-slate-400 text-sm flex items-center">${Icons.search('w-4 h-4')}</span>
              <input type="text" 
                     id="omnibox-input" 
                     placeholder="Buscar tareas (INT-*), docs, reglas (BR-*), módulos..." 
                     class="w-full bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 text-sm font-mono placeholder-slate-400" 
                     autocomplete="off" />
              <kbd class="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">ESC</kbd>
            </div>
            <div id="omnibox-results" class="p-3 overflow-y-auto space-y-3 flex-1 text-xs font-mono max-h-[460px]">
              <!-- Resultados generados en vivo -->
            </div>
            <div class="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Navegar: <kbd class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border">↑</kbd> <kbd class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border">↓</kbd></span>
              <span>Seleccionar: <kbd class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border">Enter</kbd></span>
              <span>Cerrar: <kbd class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border">ESC</kbd></span>
            </div>
          </div>
        </div>

      </div>
    `;

    this.isAppMounted = true;
    this.postRender({ state, filteredFeatures });

    if (activeElementId && activeElementId === 'feature-search-input') {
      requestAnimationFrame(() => {
        const input = document.getElementById('feature-search-input');
        if (input) {
          input.focus();
          if (typeof selectionStart === 'number' && typeof selectionEnd === 'number') {
            input.setSelectionRange(selectionStart, selectionEnd);
          }
        }
      });
    }
  }

  renderActiveTabContent({ state, filteredFeatures, modules }) {
    switch (this.activeTab) {
      case 'features':
        return `
          <div class="space-y-6">
            <div id="feature-filters-container">
              ${renderFeatureFilters({ filters: state.filters, modules })}
            </div>
            <div id="feature-table-container">
              ${renderFeatureTable({ 
                features: filteredFeatures, 
                pagination: state.pagination,
                onSelect: (f) => store.setSelectedFeature(f)
              })}
            </div>
            <div id="feature-pagination-container">
              ${renderFeaturePagination({ 
                totalItems: filteredFeatures.length, 
                pagination: state.pagination 
              })}
            </div>
          </div>
        `;

      case 'knowledge':
        return renderKnowledgeBase({
          knowledgeIndex: state.knowledgeIndex,
          projectSpec: state.projectSpec,
          features: state.features
        });

      case 'architecture':
        return renderArchitectureDocs({ 
          projectSpec: state.projectSpec, 
          knowledgeIndex: state.knowledgeIndex,
          features: state.features 
        });

      case 'graph':
        return renderDependencyGraph({ 
          features: state.features 
        });

      case 'tree':
        return `<div id="tree-mount-target" class="w-full"></div>`;

      case 'three':
        return `<div id="three-mount-target" class="w-full"></div>`;

      case 'history':
        return renderHistoryTimeline({ 
          history: state.history, 
          features: state.features 
        });

      default:
        return `<div class="p-8 text-center text-slate-500">Pestaña no encontrada.</div>`;
    }
  }

  postRender({ state, filteredFeatures }) {
    if (this.activeTab === 'tree') {
      const treeTarget = document.getElementById('tree-mount-target');
      if (treeTarget) {
        this.currentTreeComponent = new DependencyTreeComponent(treeTarget, {
          features: state.features,
          currentSpec: state.currentSpec,
          onSelect: (f) => store.setSelectedFeature(f)
        });
        this.currentTreeComponent.render();
      }
    } else if (this.activeTab === 'three') {
      const threeTarget = document.getElementById('three-mount-target');
      if (threeTarget) {
        this.spaceView3D.mount(threeTarget, {
          features: state.features,
          onSelect: (f) => store.setSelectedFeature(f)
        });
      }
    } else if (this.activeTab === 'graph') {
      this.bindGraphHoverEvents();
    }

    if (this.activeTab === 'architecture' || this.activeTab === 'knowledge') {
      this.initMermaidDiagrams();
    }

    if (this.activeTab === 'knowledge') {
      this.setupSynchronizedScroll();
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

  async initMermaidDiagrams(retryCount = 0) {
    if (typeof window === 'undefined') return;
    if (!window.mermaid) {
      if (retryCount < 10) {
        setTimeout(() => this.initMermaidDiagrams(retryCount + 1), 200);
      }
      return;
    }

    try {
      const isDark = document.documentElement.classList.contains('dark');
      window.mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'neutral',
        themeVariables: {
          darkMode: isDark,
          background: 'transparent',
          primaryColor: '#6366f1',
          primaryTextColor: isDark ? '#f8fafc' : '#0f172a',
          primaryBorderColor: '#818cf8',
          lineColor: '#38bdf8',
          secondaryColor: '#3b82f6',
          tertiaryColor: '#1e293b'
        },
        securityLevel: 'loose',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      });

      // Renderizar tarjetas con clase .mermaid-render-target
      const targets = document.querySelectorAll('.mermaid-render-target[data-mermaid-code]');
      for (const target of targets) {
        const rawCode = target.getAttribute('data-mermaid-code');
        if (!rawCode) continue;

        if (target.querySelector('svg') && target.getAttribute('data-rendered-code') === rawCode) {
          continue;
        }

        const uniqueId = 'mmd_' + Math.random().toString(36).substring(2, 9);
        try {
          const { svg } = await window.mermaid.render(uniqueId, rawCode);
          target.innerHTML = svg;
          target.setAttribute('data-rendered-code', rawCode);
          const svgEl = target.querySelector('svg');
          if (svgEl) {
            svgEl.style.maxWidth = '100%';
            svgEl.style.height = 'auto';
          }
        } catch (renderErr) {
          console.warn('Mermaid render error for target:', renderErr);
          target.innerHTML = `
            <div class="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 max-w-lg text-center space-y-2">
              <div class="font-bold flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400">
                ${Icons.alertTriangle('w-4 h-4')} <span>Diagrama en edición de sintaxis</span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">
                ${escapeHtml(renderErr.message || 'Error de parsing en Mermaid')}
              </p>
              <pre class="text-[10px] font-mono text-left bg-slate-900 text-indigo-300 p-2.5 rounded-xl overflow-x-auto max-h-36">${escapeHtml(rawCode)}</pre>
            </div>
          `;
          const strayError = document.getElementById('d' + uniqueId);
          if (strayError) strayError.remove();
        }
      }

      // Renderizar bloques Markdown <pre class="mermaid">
      const preMermaids = document.querySelectorAll('pre.mermaid:not([data-processed="true"])');
      for (const pre of preMermaids) {
        pre.setAttribute('data-processed', 'true');
        const code = pre.textContent.trim();
        const uniqueId = 'mmd_pre_' + Math.random().toString(36).substring(2, 9);
        try {
          const { svg } = await window.mermaid.render(uniqueId, code);
          const wrapper = document.createElement('div');
          wrapper.className = 'w-full flex justify-center items-center py-2';
          wrapper.innerHTML = svg;
          const svgEl = wrapper.querySelector('svg');
          if (svgEl) {
            svgEl.style.maxWidth = '100%';
            svgEl.style.height = 'auto';
          }
          pre.replaceWith(wrapper);
        } catch (err) {
          console.warn('Mermaid pre render error:', err);
          const strayError = document.getElementById('d' + uniqueId);
          if (strayError) strayError.remove();
        }
      }
    } catch (err) {
      console.warn('Error Mermaid general initialization:', err);
    }
  }

  bindGraphHoverEvents() {
    const nodes = document.querySelectorAll('[data-graph-node]');
    const edges = document.querySelectorAll('.graph-edge');

    nodes.forEach(node => {
      node.addEventListener('mouseenter', () => {
        const nodeId = parseInt(node.getAttribute('data-graph-node'), 10);
        const nodeDeps = (node.getAttribute('data-deps') || '').split(',').filter(Boolean).map(Number);

        nodes.forEach(n => n.classList.add('opacity-30'));
        edges.forEach(e => e.classList.add('opacity-10'));

        node.classList.remove('opacity-30');
        node.classList.add('scale-105', 'ring-2', 'ring-indigo-500');

        nodeDeps.forEach(depId => {
          const depEl = document.querySelector(`[data-graph-node="${depId}"]`);
          if (depEl) {
            depEl.classList.remove('opacity-30');
            depEl.classList.add('ring-2', 'ring-amber-500');
          }
          const edge = document.querySelector(`[data-edge-from="${depId}"][data-edge-to="${nodeId}"]`);
          if (edge) {
            edge.classList.remove('opacity-10');
            edge.setAttribute('stroke-width', '4');
            edge.setAttribute('opacity', '1');
          }
        });

        document.querySelectorAll(`.graph-edge[data-edge-from="${nodeId}"]`).forEach(edge => {
          edge.classList.remove('opacity-10');
          edge.setAttribute('stroke-width', '4');
          edge.setAttribute('opacity', '1');
          const toId = edge.getAttribute('data-edge-to');
          const toEl = document.querySelector(`[data-graph-node="${toId}"]`);
          if (toEl) {
            toEl.classList.remove('opacity-30');
            toEl.classList.add('ring-2', 'ring-cyan-500');
          }
        });
      });

      node.addEventListener('mouseleave', () => {
        nodes.forEach(n => n.classList.remove('opacity-30', 'scale-105', 'ring-2', 'ring-indigo-500', 'ring-amber-500', 'ring-cyan-500'));
        edges.forEach(e => {
          e.classList.remove('opacity-10');
          e.setAttribute('stroke-width', '2.2');
          e.setAttribute('opacity', '0.75');
        });
      });
    });
  }

  // Abre el visor de artículo con el documento indicado
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

  // Abre el Omnibox Global Search
  openOmnibox() {
    const modal = document.getElementById('omnibox-modal');
    const input = document.getElementById('omnibox-input');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      if (input) {
        input.value = '';
        input.focus();
        this.renderOmniboxResults('');
      }
    }
  }

  closeOmnibox() {
    const modal = document.getElementById('omnibox-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  renderOmniboxResults(query = '') {
    const resultsContainer = document.getElementById('omnibox-results');
    if (!resultsContainer) return;

    const q = (query || '').toLowerCase().trim();
    const state = store.getState();
    const features = state.features || [];
    const docs = state.knowledgeIndex?.docMetadata || {};
    const rules = state.knowledgeIndex?.business_rules || [];
    const modules = store.getAvailableModules() || [];

    const matchedFeatures = features.filter(f => 
      !q || f.title.toLowerCase().includes(q) || f.name.toLowerCase().includes(q) || f.module.toLowerCase().includes(q) || `int-${f.id}`.includes(q)
    ).slice(0, 5);

    const matchedDocs = Object.values(docs).filter(d => 
      !q || d.key.toLowerCase().includes(q) || (d.title && d.title.toLowerCase().includes(q)) || (d.summary && d.summary.toLowerCase().includes(q))
    ).slice(0, 5);

    const matchedRules = rules.filter(r => 
      !q || r.id.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedModules = modules.filter(m => 
      !q || m.toLowerCase().includes(q)
    ).slice(0, 4);

    let html = '';

    if (matchedFeatures.length > 0) {
      html += `
        <div class="space-y-1">
          <div class="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 flex items-center gap-1">${Icons.fileText('w-3 h-3')} <span>Tareas & Specs</span></div>
          ${matchedFeatures.map((f, i) => `
            <div class="omnibox-item p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer flex items-center justify-between transition-colors"
                 data-omnibox-type="feature"
                 data-feature-id="${f.id}">
              <div class="flex items-center gap-2 truncate">
                <span class="font-bold text-indigo-500">[INT-${f.id}]</span>
                <span class="truncate">${escapeHtml(f.title)}</span>
              </div>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">${f.status}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (matchedDocs.length > 0) {
      html += `
        <div class="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div class="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 flex items-center gap-1">${Icons.book('w-3 h-3')} <span>Base de Conocimiento</span></div>
          ${matchedDocs.map(d => `
            <div class="omnibox-item p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer flex items-center justify-between transition-colors"
                 data-omnibox-type="doc"
                 data-doc-key="${escapeAttr(d.key)}">
              <div class="flex items-center gap-2 truncate">
                <span class="text-indigo-600 dark:text-indigo-400">${Icons.fileText('w-3.5 h-3.5')}</span>
                <span class="font-bold truncate">${escapeHtml(d.title)}</span>
                <span class="text-[10px] text-slate-400 font-mono truncate">(${escapeHtml(d.key)})</span>
              </div>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono inline-flex items-center gap-1">${Icons.clock('w-3 h-3')} <span>${d.readingTime || 2}m</span></span>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (matchedRules.length > 0) {
      html += `
        <div class="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div class="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 flex items-center gap-1">${Icons.scale('w-3 h-3')} <span>Reglas de Negocio (BR-*)</span></div>
          ${matchedRules.map(r => `
            <div class="omnibox-item p-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer flex items-center justify-between transition-colors"
                 data-omnibox-type="rule"
                 data-rule-id="${escapeAttr(r.id)}"
                 data-rule-module="${escapeAttr(r.module || '')}">
              <div class="flex items-center gap-2 truncate">
                <span class="font-bold text-amber-500">${r.id}</span>
                <span class="truncate">${escapeHtml(r.title)}</span>
              </div>
              <span class="text-[10px] font-mono text-slate-400">[${r.module || 'general'}]</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (!matchedFeatures.length && !matchedDocs.length && !matchedRules.length) {
      html = `<div class="p-6 text-center text-slate-400">No se encontraron resultados para "${escapeHtml(q)}"</div>`;
    }

    resultsContainer.innerHTML = html;
  }

  // Renderiza los bloques interactivos en el editor de bloques visuales
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
              <button type="button" data-block-action="move-up" class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer text-xs" title="Mover arriba" ${idx === 0 ? 'disabled style="opacity:0.3"' : ''}>${Icons.chevronUp('w-3.5 h-3.5')}</button>
              <button type="button" data-block-action="move-down" class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer text-xs" title="Mover abajo" ${idx === blocks.length - 1 ? 'disabled style="opacity:0.3"' : ''}>${Icons.chevronDown('w-3.5 h-3.5')}</button>
              <button type="button" data-block-action="delete" class="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-500 cursor-pointer text-xs" title="Eliminar bloque">${Icons.trash('w-3.5 h-3.5')}</button>
            </div>
          </div>
          ${this.renderBlockInputControls(b)}
        </div>
      `;
    }).join('');
  }

  renderBlockInputControls(b) {
    switch (b.type) {
      case 'header':
        return `
          <div class="flex items-center gap-2">
            <select class="block-input-header-level px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono">
              <option value="1" ${b.level === 1 ? 'selected' : ''}>H1 (#)</option>
              <option value="2" ${b.level === 2 ? 'selected' : ''}>H2 (##)</option>
              <option value="3" ${b.level === 3 ? 'selected' : ''}>H3 (###)</option>
            </select>
            <input type="text" class="block-input-header-text flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-slate-100" value="${escapeAttr(b.text || '')}" placeholder="Título del encabezado" />
          </div>
        `;

      case 'paragraph':
        return `
          <textarea class="block-input-paragraph-text w-full p-3 font-sans text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 resize-y leading-relaxed" rows="3" placeholder="Párrafo o contenido descriptivo...">${escapeHtml(Array.isArray(b.lines) ? b.lines.join('\n') : (b.text || ''))}</textarea>
        `;

      case 'callout':
        return `
          <div class="space-y-2">
            <select class="block-input-callout-kind px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold">
              <option value="NOTE" ${b.kind === 'NOTE' ? 'selected' : ''}>NOTE (Nota informativa)</option>
              <option value="TIP" ${b.kind === 'TIP' ? 'selected' : ''}>TIP (Consejo/Buenas prácticas)</option>
              <option value="IMPORTANT" ${b.kind === 'IMPORTANT' ? 'selected' : ''}>IMPORTANT (Importante)</option>
              <option value="WARNING" ${b.kind === 'WARNING' ? 'selected' : ''}>WARNING (Advertencia)</option>
              <option value="CAUTION" ${b.kind === 'CAUTION' ? 'selected' : ''}>CAUTION (Precaución)</option>
              <option value="DANGER" ${b.kind === 'DANGER' ? 'selected' : ''}>DANGER (Riesgo Crítico)</option>
            </select>
            <textarea class="block-input-callout-text w-full p-2.5 font-sans text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 resize-y" rows="2" placeholder="Mensaje de la alerta...">${escapeHtml(b.text || '')}</textarea>
          </div>
        `;

      case 'business_rule':
        return `
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <input type="text" class="block-input-rule-id w-36 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold text-amber-600 dark:text-amber-400" value="${escapeAttr(b.ruleId || 'BR-GEN-001')}" placeholder="BR-XXX-001" />
              <input type="text" class="block-input-rule-title flex-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 font-semibold" value="${escapeAttr(b.title || '')}" placeholder="Título de la regla de negocio" />
            </div>
            <textarea class="block-input-rule-desc w-full p-2.5 font-sans text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 resize-y" rows="2" placeholder="Descripción detallada de la invariante...">${escapeHtml(b.text || b.description || '')}</textarea>
          </div>
        `;

      case 'code':
        return `
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-mono text-slate-400">Lenguaje:</span>
              <select class="block-input-code-lang px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                <option value="mermaid" ${b.lang === 'mermaid' ? 'selected' : ''}>mermaid</option>
                <option value="drawio" ${b.lang === 'drawio' ? 'selected' : ''}>drawio</option>
                <option value="csharp" ${b.lang === 'csharp' ? 'selected' : ''}>csharp (.NET)</option>
                <option value="javascript" ${b.lang === 'javascript' ? 'selected' : ''}>javascript</option>
                <option value="typescript" ${b.lang === 'typescript' ? 'selected' : ''}>typescript</option>
                <option value="json" ${b.lang === 'json' ? 'selected' : ''}>json</option>
                <option value="sql" ${b.lang === 'sql' ? 'selected' : ''}>sql</option>
                <option value="bash" ${b.lang === 'bash' ? 'selected' : ''}>bash</option>
                <option value="yaml" ${b.lang === 'yaml' ? 'selected' : ''}>yaml</option>
              </select>
            </div>
            <textarea class="block-input-code-content w-full p-3 font-mono text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-900 text-indigo-300 resize-y" rows="6" placeholder="Código o sintaxis del diagrama...">${escapeHtml(Array.isArray(b.content) ? b.content.join('\n') : (b.content || ''))}</textarea>
          </div>
        `;

      case 'divider':
        return `
          <div class="py-2 text-center text-xs font-mono text-slate-400 flex items-center gap-2">
            <div class="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
            <span>--- Separador de Sección ---</span>
            <div class="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
          </div>
        `;

      default:
        return `
          <textarea class="block-input-raw-text w-full p-2.5 font-mono text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950" rows="3">${escapeHtml(b.raw || '')}</textarea>
        `;
    }
  }

  // Extrae y sincroniza bloques visuales desde el DOM
  syncBlocksFromDom() {
    const cards = document.querySelectorAll('.visual-block-card');
    const newBlocks = [];

    cards.forEach(card => {
      const bId = card.getAttribute('data-block-id');
      const origBlock = this.currentBlocks.find(b => b.id === bId) || {};
      const type = origBlock.type || 'paragraph';

      if (type === 'header') {
        const level = parseInt(card.querySelector('.block-input-header-level')?.value || '1', 10);
        const text = card.querySelector('.block-input-header-text')?.value || '';
        newBlocks.push({ ...origBlock, level, text });
      } else if (type === 'paragraph') {
        const text = card.querySelector('.block-input-paragraph-text')?.value || '';
        newBlocks.push({ ...origBlock, lines: text.split('\n') });
      } else if (type === 'callout') {
        const kind = card.querySelector('.block-input-callout-kind')?.value || 'NOTE';
        const text = card.querySelector('.block-input-callout-text')?.value || '';
        newBlocks.push({ ...origBlock, kind, text });
      } else if (type === 'business_rule') {
        const ruleId = card.querySelector('.block-input-rule-id')?.value || 'BR-GEN-001';
        const title = card.querySelector('.block-input-rule-title')?.value || '';
        const text = card.querySelector('.block-input-rule-desc')?.value || '';
        newBlocks.push({ ...origBlock, ruleId, title, text });
      } else if (type === 'code') {
        const lang = card.querySelector('.block-input-code-lang')?.value || 'mermaid';
        const content = card.querySelector('.block-input-code-content')?.value || '';
        newBlocks.push({ ...origBlock, lang, content: content.split('\n') });
      } else if (type === 'divider') {
        newBlocks.push({ ...origBlock, type: 'divider' });
      }
    });

    this.currentBlocks = newBlocks;
    const serializedMd = blocksToMarkdown(this.currentBlocks);
    const textarea = document.getElementById('doc-editor-textarea');
    const preview = document.getElementById('doc-editor-live-preview');
    if (textarea) textarea.value = serializedMd;
    if (preview) preview.innerHTML = renderMarkdown(serializedMd);
  }

  bindGlobalEvents() {
    document.addEventListener('click', (e) => {
      // Toggle de Modo Claro / Oscuro
      const themeBtn = e.target.closest('[data-action="toggle-theme"]');
      if (themeBtn) {
        store.toggleTheme();
        setTimeout(() => this.initMermaidDiagrams(), 50);
        return;
      }

      // Cambio de pestaña
      const tabBtn = e.target.closest('[data-tab]');
      if (tabBtn) {
        const tabId = tabBtn.getAttribute('data-tab');
        router.navigate(tabId);
        return;
      }

      // Refrescar datos manualmente
      const refreshBtn = e.target.closest('[data-action="refresh"]');
      if (refreshBtn) {
        this.refreshData();
        return;
      }

      // Abrir Omnibox Global Search
      const openOmniboxBtn = e.target.closest('[data-action="open-omnibox"]');
      if (openOmniboxBtn) {
        this.openOmnibox();
        return;
      }

      // Selección dentro de Omnibox
      const omniboxItem = e.target.closest('.omnibox-item');
      if (omniboxItem) {
        const type = omniboxItem.getAttribute('data-omnibox-type');
        this.closeOmnibox();

        if (type === 'feature') {
          const id = parseInt(omniboxItem.getAttribute('data-feature-id'), 10);
          const feature = store.getState().features.find(f => f.id === id);
          if (feature) store.setSelectedFeature(feature);
        } else if (type === 'doc') {
          const docKey = omniboxItem.getAttribute('data-doc-key');
          router.navigate('knowledge');
          setTimeout(() => this.openArticleView(docKey, false), 50);
        } else if (type === 'rule') {
          router.navigate('knowledge');
          setTimeout(() => {
            const rulesEl = document.getElementById('kb-rules-list');
            if (rulesEl) rulesEl.scrollIntoView({ behavior: 'smooth' });
          }, 80);
        }
        return;
      }

      // Clic fuera del Omnibox para cerrar
      if (e.target.id === 'omnibox-modal') {
        this.closeOmnibox();
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

      // Conmutar entre Modo Lectura y Modo Editor en la Base de Conocimiento
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

        // Parsear markdown actual a bloques
        const textarea = document.getElementById('doc-editor-textarea');
        const currentMd = textarea ? textarea.value : '';
        this.currentBlocks = parseMarkdownToBlocks(currentMd);
        this.renderVisualBlocks(this.currentBlocks);
        return;
      }

      // Agregar bloque visual de cualquier tipo
      const addBlockBtn = e.target.closest('[data-add-block]');
      if (addBlockBtn) {
        const type = addBlockBtn.getAttribute('data-add-block');
        const newBlock = {
          id: 'blk_' + Math.random().toString(36).substring(2, 9),
          type
        };
        if (type === 'header') { newBlock.level = 2; newBlock.text = 'Nuevo Encabezado'; }
        else if (type === 'paragraph') { newBlock.lines = ['Escribe aquí tu contenido descriptivo...']; }
        else if (type === 'callout') { newBlock.kind = 'NOTE'; newBlock.text = 'Nota importante para desarrolladores o IA.'; }
        else if (type === 'business_rule') { newBlock.ruleId = 'BR-NEW-001'; newBlock.title = 'Nueva Regla'; newBlock.text = 'Invariante de cumplimiento estricto.'; }
        else if (type === 'code') { newBlock.lang = 'mermaid'; newBlock.content = ['flowchart TD\n  A[Inicio] --> B[Fin]']; }

        this.currentBlocks.push(newBlock);
        this.renderVisualBlocks(this.currentBlocks);
        const serialized = blocksToMarkdown(this.currentBlocks);
        const textarea = document.getElementById('doc-editor-textarea');
        if (textarea) textarea.value = serialized;
        return;
      }

      // Acciones de bloque visual individual: mover arriba, mover abajo, eliminar
      const blockActionBtn = e.target.closest('[data-block-action]');
      if (blockActionBtn) {
        const card = blockActionBtn.closest('.visual-block-card');
        const bId = card?.getAttribute('data-block-id');
        const action = blockActionBtn.getAttribute('data-block-action');
        const idx = this.currentBlocks.findIndex(b => b.id === bId);

        if (idx !== -1) {
          if (action === 'move-up' && idx > 0) {
            const temp = this.currentBlocks[idx - 1];
            this.currentBlocks[idx - 1] = this.currentBlocks[idx];
            this.currentBlocks[idx] = temp;
          } else if (action === 'move-down' && idx < this.currentBlocks.length - 1) {
            const temp = this.currentBlocks[idx + 1];
            this.currentBlocks[idx + 1] = this.currentBlocks[idx];
            this.currentBlocks[idx] = temp;
          } else if (action === 'delete') {
            this.currentBlocks.splice(idx, 1);
          }
          this.renderVisualBlocks(this.currentBlocks);
          const serialized = blocksToMarkdown(this.currentBlocks);
          const textarea = document.getElementById('doc-editor-textarea');
          if (textarea) textarea.value = serialized;
        }
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

      // Copiar Markdown Activo
      const copyDocBtn = e.target.closest('#copy-active-doc-btn');
      if (copyDocBtn) {
        const pathEl = document.getElementById('doc-active-path');
        const docKey = pathEl ? pathEl.textContent.trim() : '';
        const content = store.getState().knowledgeIndex?.docs?.[docKey] || '';
        if (content && navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(content).then(() => {
            const orig = copyDocBtn.innerHTML;
            copyDocBtn.innerHTML = Icons.checkCircle('w-3.5 h-3.5');
            setTimeout(() => { copyDocBtn.innerHTML = orig; }, 2000);
          });
        }
        return;
      }

      // Descargar documento activo en .md
      const downloadDocBtn = e.target.closest('[data-action="download-active-doc"]');
      if (downloadDocBtn) {
        const pathEl = document.getElementById('doc-active-path');
        const docKey = pathEl ? pathEl.textContent.trim() : '';
        const content = store.getState().knowledgeIndex?.docs?.[docKey] || '';
        const filename = docKey.split('/').pop() || 'document.md';
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }

      // Eliminar documento activo
      const deleteDocBtn = e.target.closest('[data-action="delete-active-doc"]');
      if (deleteDocBtn) {
        const pathEl = document.getElementById('doc-active-path');
        const docKey = pathEl ? pathEl.textContent.trim() : '';
        if (docKey && confirm(`¿Estás seguro de que deseas eliminar "${docKey}" de la Base de Conocimiento?`)) {
          store.deleteDoc(docKey);
          document.getElementById('kb-view-article')?.classList.add('hidden');
          document.getElementById('kb-view-library')?.classList.remove('hidden');
        }
        return;
      }

      // Abrir modal de contexto IA
      const openAiModalBtn = e.target.closest('[data-action="open-ai-context-modal"]');
      if (openAiModalBtn) {
        const modal = document.getElementById('ai-context-modal');
        if (modal) {
          modal.classList.remove('hidden');
          modal.classList.add('flex');
        }
        return;
      }

      // Cerrar modal de contexto IA
      const closeAiModalBtn = e.target.closest('[data-action="close-ai-context-modal"]');
      if (closeAiModalBtn || e.target.id === 'ai-context-modal') {
        const modal = document.getElementById('ai-context-modal');
        if (modal) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
        return;
      }

      // Copiar prompt de contexto para IA
      const copyContextBtn = e.target.closest('#copy-context-btn');
      if (copyContextBtn) {
        const textarea = document.getElementById('ai-context-prompt-text');
        if (textarea && navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(textarea.value).then(() => {
            const origHtml = copyContextBtn.innerHTML;
            copyContextBtn.innerHTML = `<span class="inline-flex items-center gap-1">${Icons.checkCircle('w-3.5 h-3.5')} <span>¡Copiado!</span></span>`;
            setTimeout(() => { copyContextBtn.innerHTML = origHtml; }, 2000);
          }).catch(() => {});
        }
        return;
      }

      // Abrir modal de nuevo documento
      const openNewDocBtn = e.target.closest('[data-action="open-new-doc-modal"]');
      if (openNewDocBtn) {
        const modal = document.getElementById('new-doc-modal');
        if (modal) {
          modal.classList.remove('hidden');
          modal.classList.add('flex');
          const modInput = document.getElementById('new-doc-module');
          if (modInput) modInput.focus();
        }
        return;
      }

      // Cerrar modal de nuevo documento
      const closeNewDocBtn = e.target.closest('[data-action="close-new-doc-modal"]');
      if (closeNewDocBtn || e.target.id === 'new-doc-modal') {
        const modal = document.getElementById('new-doc-modal');
        if (modal) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
        return;
      }

      // Exportar toda la Base de Conocimiento en JSON
      const exportKnowledgeBtn = e.target.closest('[data-action="export-all-knowledge"]');
      if (exportKnowledgeBtn) {
        const kData = store.getState().knowledgeIndex;
        const jsonStr = JSON.stringify(kData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `knowledge-base-${store.getState().project || 'project'}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }

      // Trigger para importar documento o JSON desde archivo local
      const triggerImportBtn = e.target.closest('[data-action="trigger-import-doc"]');
      if (triggerImportBtn) {
        const fileInput = document.getElementById('import-doc-file-input');
        if (fileInput) fileInput.click();
        return;
      }

      // Detalle de Feature desde tabla o nodo
      const viewDetailBtn = e.target.closest('[data-action="view-detail"]');
      if (viewDetailBtn) {
        const id = parseInt(viewDetailBtn.getAttribute('data-id'), 10);
        const feature = store.getState().features.find(f => f.id === id);
        if (feature) store.setSelectedFeature(feature);
        return;
      }

      const tableRow = e.target.closest('tr[data-feature-id]');
      if (tableRow && !e.target.closest('button')) {
        const id = parseInt(tableRow.getAttribute('data-feature-id'), 10);
        const feature = store.getState().features.find(f => f.id === id);
        if (feature) store.setSelectedFeature(feature);
        return;
      }

      const closeModalBtn = e.target.closest('[data-action="close-modal"]');
      if (closeModalBtn) {
        store.setSelectedFeature(null);
        return;
      }

      const pageBtn = e.target.closest('[data-page]');
      if (pageBtn) {
        const page = parseInt(pageBtn.getAttribute('data-page'), 10);
        if (!isNaN(page) && page > 0) store.setPage(page);
        return;
      }

      const resetFiltersBtn = e.target.closest('[data-action="reset-filters"]');
      if (resetFiltersBtn) {
        const searchInput = document.getElementById('feature-search-input');
        if (searchInput) searchInput.value = '';
        store.resetFilters();
        return;
      }

      // Pestañas del Visualizador de Arquitectura y Diagramas (C4, UML, ERD)
      const archTabBtn = e.target.closest('[data-arch-tab]');
      if (archTabBtn) {
        const targetTab = archTabBtn.getAttribute('data-arch-tab');
        const navContainer = archTabBtn.closest('#arch-diagram-nav') || document.getElementById('arch-diagram-nav');
        if (navContainer) {
          navContainer.querySelectorAll('.arch-tab-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-indigo-600', 'text-white', 'font-semibold');
            btn.classList.add('text-slate-600', 'dark:text-slate-400');
          });
          archTabBtn.classList.add('active', 'bg-indigo-600', 'text-white', 'font-semibold');
          archTabBtn.classList.remove('text-slate-600', 'dark:text-slate-400');
        }

        const panels = document.querySelectorAll('.diagram-panel');
        panels.forEach(p => {
          p.classList.add('hidden');
          p.classList.remove('block');
        });

        const activePanel = document.getElementById(`diagram-panel-${targetTab}`);
        if (activePanel) {
          activePanel.classList.remove('hidden');
          activePanel.classList.add('block');
          this.initMermaidDiagrams();
        }
        return;
      }

      // Copiar código Mermaid individual
      const copyMermaidBtn = e.target.closest('[data-copy-mermaid]');
      if (copyMermaidBtn) {
        const code = copyMermaidBtn.getAttribute('data-copy-mermaid');
        if (code && navigator.clipboard) {
          navigator.clipboard.writeText(code).then(() => {
            store.showNotification('Código Mermaid copiado al portapapeles', 'success');
          }).catch(() => {
            store.showNotification('No se pudo acceder al portapapeles', 'warning');
          });
        }
        return;
      }

      // Copiar código del diagrama activo en la sección de arquitectura
      const copyActiveBtn = e.target.closest('#copy-active-mermaid-btn');
      if (copyActiveBtn) {
        const activePanel = document.querySelector('.diagram-panel:not(.hidden)');
        const target = activePanel?.querySelector('.mermaid-render-target[data-mermaid-code]');
        const code = target?.getAttribute('data-mermaid-code');
        if (code && navigator.clipboard) {
          navigator.clipboard.writeText(code).then(() => {
            store.showNotification('Código del diagrama copiado al portapapeles', 'success');
          }).catch(() => {
            store.showNotification('No se pudo acceder al portapapeles', 'warning');
          });
        } else {
          store.showNotification('No hay código de diagrama activo para copiar', 'info');
        }
        return;
      }

      // Conmutar entre Diagrama Visual y Código Mermaid
      const diagToggle = e.target.closest('[data-diagram-toggle]');
      if (diagToggle) {
        const viewMode = diagToggle.getAttribute('data-diagram-toggle');
        const diagId = diagToggle.getAttribute('data-diagram-id');
        const card = document.getElementById(`mermaid-card-${diagId}`);
        if (card) {
          card.querySelectorAll('.diagram-view-btn').forEach(b => {
            b.classList.remove('active', 'bg-white', 'dark:bg-slate-900', 'text-slate-900', 'dark:text-white', 'shadow-xs');
            b.classList.add('text-slate-600', 'dark:text-slate-400');
          });
          diagToggle.classList.add('active', 'bg-white', 'dark:bg-slate-900', 'text-slate-900', 'dark:text-white', 'shadow-xs');
          diagToggle.classList.remove('text-slate-600', 'dark:text-slate-400');

          const visualEl = document.getElementById(`diagram-view-visual-${diagId}`);
          const codeEl = document.getElementById(`diagram-view-code-${diagId}`);
          if (viewMode === 'visual') {
            visualEl?.classList.remove('hidden');
            codeEl?.classList.add('hidden');
            this.initMermaidDiagrams();
          } else {
            visualEl?.classList.add('hidden');
            codeEl?.classList.remove('hidden');
          }
        }
        return;
      }

      // Expandir Diagrama a Pantalla Completa
      const expandBtn = e.target.closest('[data-action="expand-diagram"]');
      if (expandBtn) {
        const diagId = expandBtn.getAttribute('data-diagram-id');
        const visualTarget = document.getElementById(`mermaid-target-${diagId}`);
        const modal = document.getElementById('diagram-modal');
        const modalContent = document.getElementById('diagram-modal-content');
        const modalTitle = document.getElementById('diagram-modal-title');
        const cardTitle = document.querySelector(`#mermaid-card-${diagId} h4`);

        if (modal && modalContent && visualTarget) {
          modalTitle.textContent = cardTitle ? cardTitle.textContent : 'Diagrama Ampliado';
          modalContent.innerHTML = visualTarget.innerHTML;
          modal.classList.remove('hidden');
          modal.classList.add('flex');
        }
        return;
      }

      // Cerrar modal de diagrama
      const closeDiagModal = e.target.closest('[data-action="close-diagram-modal"]');
      if (closeDiagModal || e.target.id === 'diagram-modal') {
        const modal = document.getElementById('diagram-modal');
        if (modal) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
        return;
      }
    });

    // Inputs con debouncing
    document.addEventListener('input', (e) => {
      if (e.target.id === 'feature-search-input') {
        clearTimeout(this.searchDebounceTimer);
        const val = e.target.value;
        this.searchDebounceTimer = setTimeout(() => {
          store.setFilter('search', val);
        }, 260);
      } else if (e.target.id === 'kb-library-search-input') {
        clearTimeout(this.kbSearchDebounceTimer);
        const query = (e.target.value || '').toLowerCase().trim();
        this.kbSearchDebounceTimer = setTimeout(() => {
          const cards = document.querySelectorAll('.kb-shelf-doc-card');
          cards.forEach(card => {
            const title = (card.getAttribute('data-doc-title') || '').toLowerCase();
            const key = (card.getAttribute('data-doc-key') || '').toLowerCase();
            const mod = (card.getAttribute('data-doc-module') || '').toLowerCase();
            const text = card.textContent.toLowerCase();
            if (!query || title.includes(query) || key.includes(query) || mod.includes(query) || text.includes(query)) {
              card.classList.remove('hidden');
            } else {
              card.classList.add('hidden');
            }
          });

          document.querySelectorAll('.kb-shelf-section').forEach(sec => {
            const visibleCards = sec.querySelectorAll('.kb-shelf-doc-card:not(.hidden)');
            if (query && visibleCards.length === 0) {
              sec.classList.add('hidden');
            } else {
              sec.classList.remove('hidden');
            }
          });
        }, 180);
      } else if (e.target.id === 'omnibox-input') {
        clearTimeout(this.omniboxDebounceTimer);
        const query = e.target.value;
        this.omniboxDebounceTimer = setTimeout(() => {
          this.renderOmniboxResults(query);
        }, 150);
      } else if (e.target.id === 'doc-editor-textarea') {
        const preview = document.getElementById('doc-editor-live-preview');
        if (preview) {
          preview.innerHTML = renderMarkdown(e.target.value);
        }
      } else if (e.target.closest('.visual-block-card')) {
        this.syncBlocksFromDom();
      }
    });

    document.addEventListener('change', (e) => {
      if (e.target.id === 'filter-type') {
        store.setFilter('type', e.target.value);
      } else if (e.target.id === 'filter-status') {
        store.setFilter('status', e.target.value);
      } else if (e.target.id === 'filter-module') {
        store.setFilter('module', e.target.value);
      } else if (e.target.id === 'filter-priority') {
        store.setFilter('priority', e.target.value);
      } else if (e.target.id === 'page-size-select') {
        store.setPageSize(parseInt(e.target.value, 10));
      } else if (e.target.id === 'kb-rules-module-filter') {
        const selectedMod = e.target.value.toLowerCase().trim();
        const ruleCards = document.querySelectorAll('[data-rule-module]');
        ruleCards.forEach(card => {
          const cardMod = (card.getAttribute('data-rule-module') || '').toLowerCase().trim();
          if (!selectedMod || cardMod === selectedMod) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });
      } else if (e.target.id === 'import-doc-file-input') {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileReader = new FileReader();
        fileReader.onload = (loadEvent) => {
          const text = loadEvent.target.result;
          if (file.name.endsWith('.json')) {
            try {
              const parsed = JSON.parse(text);
              if (parsed.docs && typeof parsed.docs === 'object') {
                Object.entries(parsed.docs).forEach(([k, c]) => store.saveDoc(k, c));
              } else if (typeof parsed === 'object') {
                Object.entries(parsed).forEach(([k, c]) => {
                  if (typeof c === 'string') store.saveDoc(k, c);
                });
              }
            } catch (err) {
              alert('Error al parsear el archivo JSON: ' + err.message);
            }
          } else {
            store.saveDoc(file.name, text);
          }
          e.target.value = '';
        };
        fileReader.readAsText(file);
      } else if (e.target.closest('.visual-block-card')) {
        this.syncBlocksFromDom();
      }
    });

    // Envío del formulario para crear nuevo documento
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'new-doc-form') {
        e.preventDefault();
        const modInput = document.getElementById('new-doc-module');
        const fileInput = document.getElementById('new-doc-filename');
        const contentInput = document.getElementById('new-doc-content');

        const modVal = (modInput?.value || '').trim();
        let fileVal = (fileInput?.value || '').trim();
        const contentVal = contentInput?.value || '# Nuevo Documento';

        if (!fileVal) return;
        if (!fileVal.endsWith('.md') && !fileVal.endsWith('.markdown')) {
          fileVal += '.md';
        }

        let docKey = fileVal;
        if (modVal && modVal.toLowerCase() !== 'general') {
          docKey = `modules/${modVal.toLowerCase()}/${fileVal}`;
        }

        store.saveDoc(docKey, contentVal);

        const modal = document.getElementById('new-doc-modal');
        if (modal) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
        e.target.reset();
      }
    });

    // Atajos de Teclado Globales (Ctrl+K / Cmd+K y Escape)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openOmnibox();
        return;
      }

      if (e.key === 'Escape') {
        this.closeOmnibox();
        if (store.getState().selectedFeature) {
          store.setSelectedFeature(null);
        }
        const aiModal = document.getElementById('ai-context-modal');
        if (aiModal && !aiModal.classList.contains('hidden')) {
          aiModal.classList.add('hidden');
          aiModal.classList.remove('flex');
        }
        const diagModal = document.getElementById('diagram-modal');
        if (diagModal && !diagModal.classList.contains('hidden')) {
          diagModal.classList.add('hidden');
          diagModal.classList.remove('flex');
        }
        const newDocModal = document.getElementById('new-doc-modal');
        if (newDocModal && !newDocModal.classList.contains('hidden')) {
          newDocModal.classList.add('hidden');
          newDocModal.classList.remove('flex');
        }
      }
    });
  }
}

function getBlockTypeLabel(type) {
  switch (type) {
    case 'header': return 'Encabezado';
    case 'paragraph': return 'Párrafo';
    case 'callout': return 'Alerta';
    case 'business_rule': return 'Regla BR';
    case 'code': return 'Código / Diagrama';
    case 'divider': return 'Separador';
    default: return 'Bloque';
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
  return String(text).replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
