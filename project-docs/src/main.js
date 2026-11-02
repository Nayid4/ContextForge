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
import { renderMarkdown } from './shared/MarkdownViewer.js';

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
    this.autoSyncController = null;
    this.lastSyncTime = new Date();
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
    // Si la aplicación ya está montada y estamos en la pestaña de features,
    // actualizamos solo la tabla y paginación para no destruir el <input> de búsqueda
    // ni perder el cursor o el foco del usuario.
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

    // Guardar foco de input si existe antes de renderizar
    const activeElementId = document.activeElement?.id;
    const selectionStart = document.activeElement?.selectionStart;
    const selectionEnd = document.activeElement?.selectionEnd;

    const state = store.getState();
    const stats = store.getStats();
    const filteredFeatures = store.getFilteredFeatures();
    const modules = store.getAvailableModules();
    const isDark = state.theme === 'dark';
    const activeAgent = this.envInfo?.activeAgent || { name: 'Google Antigravity', icon: '⚡' };
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

            <!-- Chips de Agente, Stack y Auto-Sync -->
            <div class="hidden lg:flex items-center gap-2 text-xs">
              
              <!-- Badge de Auto-Sync Reactivo -->
              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl ${isLocalFile ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300' : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300'} shadow-xs"
                   title="${isLocalFile ? 'Modo local file://. Usa abrir-tablero.bat para auto-sync HTTP.' : 'Auto-Sync activo: detecta cambios en feature_list.json y progres/ en vivo'}">
                <span id="sync-status-dot" class="w-2 h-2 rounded-full ${isLocalFile ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'} transition-all"></span>
                <span id="sync-last-time" class="font-mono text-[11px] font-semibold">${isLocalFile ? 'file:// local' : 'En vivo'}</span>
              </div>

              <!-- Agente Detectado -->
              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 shadow-xs"
                   title="Agentes compatibles homologados: Google Antigravity, Open Code, GitHub Copilot, Claude Code, Codex">
                <span class="text-sm">${activeAgent.icon}</span>
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
            ${renderTabButton({ id: 'knowledge', label: 'Base de Conocimiento', icon: Icons.book, active: this.activeTab === 'knowledge', badge: String(state.knowledgeIndex?.business_rules?.length || 10) })}
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

        <!-- Modal de Detalle -->
        <div id="modal-container">
          ${renderModal(state.selectedFeature)}
        </div>
      </div>
    `;

    this.isAppMounted = true;
    this.postRender({ state, filteredFeatures });

    // Restaurar foco y cursor si el input de búsqueda estaba activo
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
  }

  async initMermaidDiagrams() {
    if (typeof window === 'undefined' || !window.mermaid) return;

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

      // 1. Renderizar tarjetas interactivas .mermaid-render-target con data-mermaid-code
      const targets = document.querySelectorAll('.mermaid-render-target[data-mermaid-code]');
      for (const target of targets) {
        const rawCode = target.getAttribute('data-mermaid-code');
        if (!rawCode) continue;

        // Si ya tiene un SVG renderizado válido y no ha cambiado el código, omitir
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
              <div class="font-bold flex items-center justify-center gap-1.5">
                <span>⚠️</span> Diagrama en edición de sintaxis
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

      // 2. Renderizar bloques Markdown <pre class="mermaid">
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

        // Atenuar todo
        nodes.forEach(n => n.classList.add('opacity-30'));
        edges.forEach(e => e.classList.add('opacity-10'));

        // Resaltar nodo actual
        node.classList.remove('opacity-30');
        node.classList.add('scale-105', 'ring-2', 'ring-indigo-500');

        // Resaltar dependencias (predecesores) en ámbar
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

        // Resaltar dependientes (sucesores) en cian
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

      // Clic en nodo de grafo para ver detalle
      const graphNode = e.target.closest('[data-graph-node]');
      if (graphNode) {
        const id = parseInt(graphNode.getAttribute('data-graph-node'), 10);
        const feature = store.getState().features.find(f => f.id === id);
        if (feature) store.setSelectedFeature(feature);
        return;
      }

      // Ver detalle de feature
      const viewDetailBtn = e.target.closest('[data-action="view-detail"]');
      if (viewDetailBtn) {
        const id = parseInt(viewDetailBtn.getAttribute('data-id'), 10);
        const feature = store.getState().features.find(f => f.id === id);
        if (feature) store.setSelectedFeature(feature);
        return;
      }

      // Fila de la tabla (abrir detalle con click)
      const tableRow = e.target.closest('tr[data-feature-id]');
      if (tableRow && !e.target.closest('button')) {
        const id = parseInt(tableRow.getAttribute('data-feature-id'), 10);
        const feature = store.getState().features.find(f => f.id === id);
        if (feature) store.setSelectedFeature(feature);
        return;
      }

      // Cerrar modal
      const closeModalBtn = e.target.closest('[data-action="close-modal"]');
      if (closeModalBtn) {
        store.setSelectedFeature(null);
        return;
      }

      // Paginación de página
      const pageBtn = e.target.closest('[data-page]');
      if (pageBtn) {
        const page = parseInt(pageBtn.getAttribute('data-page'), 10);
        if (!isNaN(page) && page > 0) {
          store.setPage(page);
        }
        return;
      }

      // Reset filtros
      const resetFiltersBtn = e.target.closest('[data-action="reset-filters"]');
      if (resetFiltersBtn) {
        const searchInput = document.getElementById('feature-search-input');
        if (searchInput) searchInput.value = '';
        store.resetFilters();
        return;
      }

      // Cambio de diagrama en Arquitectura & Stack
      const archTabBtn = e.target.closest('[data-arch-tab]');
      if (archTabBtn) {
        const tabId = archTabBtn.getAttribute('data-arch-tab');
        document.querySelectorAll('.arch-tab-btn').forEach(btn => {
          btn.classList.remove('active', 'bg-indigo-600', 'text-white');
          btn.classList.add('text-slate-600', 'dark:text-slate-400');
        });
        archTabBtn.classList.add('active', 'bg-indigo-600', 'text-white');
        archTabBtn.classList.remove('text-slate-600', 'dark:text-slate-400');

        document.querySelectorAll('.diagram-panel').forEach(panel => {
          panel.classList.add('hidden');
          panel.classList.remove('block');
        });
        const targetPanel = document.getElementById(`diagram-panel-${tabId}`);
        if (targetPanel) {
          targetPanel.classList.remove('hidden');
          targetPanel.classList.add('block');
          this.initMermaidDiagrams();
        }
        return;
      }

      // Copiar código Mermaid del diagrama activo
      const copyActiveBtn = e.target.closest('#copy-active-mermaid-btn');
      if (copyActiveBtn) {
        const activePanel = document.querySelector('.diagram-panel:not(.hidden)');
        const codeEl = activePanel?.querySelector('pre code');
        const textToCopy = codeEl ? codeEl.textContent : 'Clean Architecture + Event-Driven Architecture Layers';
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(textToCopy).then(() => {
            const origHtml = copyActiveBtn.innerHTML;
            copyActiveBtn.innerHTML = '<span>✅</span> ¡Copiado!';
            setTimeout(() => { copyActiveBtn.innerHTML = origHtml; }, 2000);
          }).catch(() => {});
        }
        return;
      }

      // Copiar código Mermaid individual
      const copyMermaidBtn = e.target.closest('[data-copy-mermaid]');
      if (copyMermaidBtn) {
        const mermaidText = copyMermaidBtn.getAttribute('data-copy-mermaid');
        if (mermaidText && navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(mermaidText).then(() => {
            const origHtml = copyMermaidBtn.innerHTML;
            copyMermaidBtn.innerHTML = '<span>✅</span> ¡Copiado!';
            setTimeout(() => { copyMermaidBtn.innerHTML = origHtml; }, 2000);
          }).catch(() => {});
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
            copyContextBtn.innerHTML = '¡Contexto Copiado! ✅';
            setTimeout(() => { copyContextBtn.innerHTML = origHtml; }, 2000);
          }).catch(() => {});
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

      // Cerrar modal de diagrama ampliado
      const closeDiagModal = e.target.closest('[data-action="close-diagram-modal"]');
      if (closeDiagModal || e.target.id === 'diagram-modal') {
        const modal = document.getElementById('diagram-modal');
        if (modal) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
        return;
      }

      // Lector Docs-as-Code: Seleccionar documento Markdown
      const docItem = e.target.closest('[data-doc-key]');
      if (docItem) {
        const docKey = docItem.getAttribute('data-doc-key');
        const state = store.getState();
        const docs = state.knowledgeIndex?.docs || {};
        const content = docs[docKey] || '# Documento no disponible';

        document.querySelectorAll('.doc-nav-item').forEach(el => {
          el.classList.remove('active', 'bg-indigo-600', 'text-white', 'font-bold');
          el.classList.add('text-slate-600', 'dark:text-slate-400');
        });
        docItem.classList.add('active', 'bg-indigo-600', 'text-white', 'font-bold');
        docItem.classList.remove('text-slate-600', 'dark:text-slate-400');

        const pathEl = document.getElementById('doc-active-path');
        const bodyEl = document.getElementById('doc-active-body');
        if (pathEl) pathEl.textContent = docKey;
        if (bodyEl) {
          bodyEl.innerHTML = renderMarkdown(content);
          this.initMermaidDiagrams();
        }

        // Actualizar también editor y previsualización si están en pantalla
        const editorTextarea = document.getElementById('doc-editor-textarea');
        const editorPreview = document.getElementById('doc-editor-live-preview');
        if (editorTextarea) editorTextarea.value = content;
        if (editorPreview) editorPreview.innerHTML = renderMarkdown(content);
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
            // Entrar al editor
            const docKey = pathEl ? pathEl.textContent.trim() : '';
            const docs = store.getState().knowledgeIndex?.docs || {};
            const content = docs[docKey] || '';
            if (textarea) textarea.value = content;
            if (preview) preview.innerHTML = renderMarkdown(content);
            editorContainer.classList.remove('hidden');
            readerContainer.classList.add('hidden');
            if (btnText) btnText.textContent = 'Ver Lector';
            if (btnIcon) btnIcon.textContent = '👁️';
          } else {
            // Salir del editor
            editorContainer.classList.add('hidden');
            readerContainer.classList.remove('hidden');
            if (btnText) btnText.textContent = 'Editar';
            if (btnIcon) btnIcon.textContent = '✏️';
          }
        }
        return;
      }

      // Cancelar edición de documento
      const cancelEditBtn = e.target.closest('#btn-cancel-doc-edit');
      if (cancelEditBtn) {
        const readerContainer = document.getElementById('doc-reader-view-container');
        const editorContainer = document.getElementById('doc-editor-view-container');
        const btnText = document.getElementById('btn-toggle-doc-text');
        const btnIcon = document.getElementById('btn-toggle-doc-icon');
        if (readerContainer && editorContainer) {
          editorContainer.classList.add('hidden');
          readerContainer.classList.remove('hidden');
          if (btnText) btnText.textContent = 'Editar';
          if (btnIcon) btnIcon.textContent = '✏️';
        }
        return;
      }

      // Guardar cambios del documento editado
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

          const readerContainer = document.getElementById('doc-reader-view-container');
          const editorContainer = document.getElementById('doc-editor-view-container');
          const btnText = document.getElementById('btn-toggle-doc-text');
          const btnIcon = document.getElementById('btn-toggle-doc-icon');
          if (readerContainer && editorContainer) {
            editorContainer.classList.add('hidden');
            readerContainer.classList.remove('hidden');
            if (btnText) btnText.textContent = 'Editar';
            if (btnIcon) btnIcon.textContent = '✏️';
          }
          this.initMermaidDiagrams();
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

      // Eliminar documento activo
      const deleteDocBtn = e.target.closest('[data-action="delete-active-doc"]');
      if (deleteDocBtn) {
        const pathEl = document.getElementById('doc-active-path');
        const docKey = pathEl ? pathEl.textContent.trim() : '';
        if (docKey) {
          if (confirm(`¿Estás seguro de que deseas eliminar el documento "${docKey}" de la Base de Conocimiento?`)) {
            store.deleteDoc(docKey);
          }
        }
        return;
      }

      // Descargar documento activo en archivo .md
      const downloadDocBtn = e.target.closest('[data-action="download-active-doc"]');
      if (downloadDocBtn) {
        const pathEl = document.getElementById('doc-active-path');
        const docKey = pathEl ? pathEl.textContent.trim() : '';
        const docs = store.getState().knowledgeIndex?.docs || {};
        const content = docs[docKey] || '';
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

      // Filtrar documentos por píldora de módulo (Pills)
      const kbModPill = e.target.closest('.kb-mod-pill');
      if (kbModPill) {
        const targetMod = kbModPill.getAttribute('data-kb-filter-module');
        document.querySelectorAll('.kb-mod-pill').forEach(p => {
          p.classList.remove('active', 'bg-indigo-600', 'text-white', 'font-bold');
          p.classList.add('bg-slate-200/70', 'dark:bg-slate-800/80', 'text-slate-600', 'dark:text-slate-400');
        });
        kbModPill.classList.add('active', 'bg-indigo-600', 'text-white', 'font-bold');
        kbModPill.classList.remove('bg-slate-200/70', 'dark:bg-slate-800/80', 'text-slate-600', 'dark:text-slate-400');

        const generalGroup = document.querySelector('.kb-doc-group[data-group-type="general"]');
        const moduleItems = document.querySelectorAll('.kb-module-item');

        if (!targetMod) {
          if (generalGroup) generalGroup.classList.remove('hidden');
          moduleItems.forEach(mi => mi.classList.remove('hidden'));
        } else if (targetMod === 'general') {
          if (generalGroup) generalGroup.classList.remove('hidden');
          moduleItems.forEach(mi => mi.classList.add('hidden'));
        } else {
          if (generalGroup) generalGroup.classList.add('hidden');
          moduleItems.forEach(mi => {
            const mName = mi.getAttribute('data-module-name');
            if (mName === targetMod) {
              mi.classList.remove('hidden');
            } else {
              mi.classList.add('hidden');
            }
          });
        }
        return;
      }

      // Copiar Markdown Activo
      const copyDocBtn = e.target.closest('#copy-active-doc-btn');
      if (copyDocBtn) {
        const pathEl = document.getElementById('doc-active-path');
        const docKey = pathEl ? pathEl.textContent.trim() : '';
        const state = store.getState();
        const content = state.knowledgeIndex?.docs?.[docKey] || '';
        if (content && navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(content).then(() => {
            const orig = copyDocBtn.innerHTML;
            copyDocBtn.innerHTML = '<span>✅</span> ¡Copiado!';
            setTimeout(() => { copyDocBtn.innerHTML = orig; }, 2000);
          });
        }
        return;
      }

      // Copiar bloque de código dentro del Markdown
      const copyCodeBlockBtn = e.target.closest('[data-action="copy-code-block"]');
      if (copyCodeBlockBtn) {
        const pre = copyCodeBlockBtn.closest('div.my-4')?.querySelector('pre code');
        if (pre && navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(pre.textContent).then(() => {
            const orig = copyCodeBlockBtn.textContent;
            copyCodeBlockBtn.textContent = '¡Copiado! ✓';
            setTimeout(() => { copyCodeBlockBtn.textContent = orig; }, 2000);
          });
        }
        return;
      }
    });

    // Búsqueda con Debouncing Inteligente (260ms) para no bloquear la escritura
    document.addEventListener('input', (e) => {
      if (e.target.id === 'feature-search-input') {
        clearTimeout(this.searchDebounceTimer);
        const val = e.target.value;
        this.searchDebounceTimer = setTimeout(() => {
          store.setFilter('search', val);
        }, 260);
      } else if (e.target.id === 'kb-doc-search-input') {
        clearTimeout(this.kbSearchDebounceTimer);
        const query = (e.target.value || '').toLowerCase().trim();
        this.kbSearchDebounceTimer = setTimeout(() => {
          const docItems = document.querySelectorAll('.doc-nav-item');
          docItems.forEach(item => {
            const name = (item.getAttribute('data-doc-name') || '').toLowerCase();
            const key = (item.getAttribute('data-doc-key') || '').toLowerCase();
            const mod = (item.getAttribute('data-doc-module') || '').toLowerCase();
            if (!query || name.includes(query) || key.includes(query) || mod.includes(query)) {
              item.classList.remove('hidden');
            } else {
              item.classList.add('hidden');
            }
          });

          // Ocultar o mostrar grupos de módulos según si tienen documentos visibles
          document.querySelectorAll('.kb-module-item').forEach(mi => {
            const visibleChildren = mi.querySelectorAll('.doc-nav-item:not(.hidden)');
            if (query && visibleChildren.length === 0) {
              mi.classList.add('hidden');
            } else {
              mi.classList.remove('hidden');
            }
          });
        }, 180);
      } else if (e.target.id === 'doc-editor-textarea') {
        // Previsualización en vivo en el editor Markdown
        const preview = document.getElementById('doc-editor-live-preview');
        if (preview) {
          preview.innerHTML = renderMarkdown(e.target.value);
        }
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
            // Archivo .md o .markdown
            store.saveDoc(file.name, text);
          }
          e.target.value = '';
        };
        fileReader.readAsText(file);
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

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
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

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
