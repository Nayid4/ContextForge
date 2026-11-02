import { store } from './core/store.js';
import { api } from './core/api.js';
import { router } from './core/router.js';
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

class App {
  constructor() {
    this.root = document.getElementById('app');
    this.spaceView3D = new SpaceView3D();
    this.currentTreeComponent = null;
    this.activeTab = 'features';
  }

  async init() {
    // Escuchar cambios de ruta en el hash
    router.init((tabId) => {
      this.handleTabChange(tabId);
    });

    // Suscribirse a cambios en el Store reactivo
    store.subscribe(() => {
      this.render();
    });

    // Delegación global de eventos interactivos
    this.bindGlobalEvents();

    // Cargar datos
    await this.refreshData();
  }

  async refreshData() {
    store.setLoading(true);
    try {
      const data = await api.fetchAll();
      store.setData(data);
    } catch (err) {
      console.error('Error cargando datos del arnés:', err);
      store.setError(err.message || 'Error al conectar con los datos del arnés');
    } finally {
      store.setLoading(false);
    }
  }

  handleTabChange(tabId) {
    // Si salimos de 3D, desmontar Three.js
    if (this.activeTab === 'three' && tabId !== 'three') {
      this.spaceView3D.unmount();
    }
    this.activeTab = tabId;
    this.render();
  }

  render() {
    if (!this.root) return;

    const state = store.getState();
    const stats = store.getStats();
    const filteredFeatures = store.getFilteredFeatures();
    const modules = store.getAvailableModules();

    // 1. Loading State
    if (state.loading && state.features.length === 0) {
      this.root.innerHTML = `
        <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
          <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 class="text-xl font-bold tracking-tight">Cargando Antigravity AI Harness...</h2>
          <p class="text-sm text-slate-400 mt-1 font-mono">Sincronizando spec, tareas y branches</p>
        </div>
      `;
      return;
    }

    // 2. Error State
    if (state.error && state.features.length === 0) {
      this.root.innerHTML = `
        <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
          <div class="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
            ${Icons.clock}
          </div>
          <h2 class="text-xl font-bold text-rose-400">Error al inicializar el tablero</h2>
          <p class="text-sm text-slate-400 mt-2 max-w-md text-center">${state.error}</p>
          <button type="button" data-action="refresh" class="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all">
            Reintentar
          </button>
        </div>
      `;
      return;
    }

    // 3. Render Principal
    this.root.innerHTML = `
      <div class="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        <!-- Barra de Estado Superior -->
        <header class="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <span class="font-mono font-black text-sm">AG</span>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h1 class="text-sm font-bold tracking-tight text-white">Antigravity AI Harness</h1>
                  <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                    SDD 2.0
                  </span>
                </div>
                <p class="text-[11px] text-slate-400 font-mono">
                  Branch naming: <span class="text-indigo-300">{type}/INT-{id}/{name}</span> (≤80c)
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button type="button" 
                      data-action="refresh" 
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
                <span class="${state.loading ? 'animate-spin' : ''}">${Icons.refresh}</span>
                <span>Refrescar</span>
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
          <nav class="flex items-center gap-2 border-b border-slate-800/80 pb-3" aria-label="Vistas del tablero">
            ${renderTabButton({ id: 'features', label: 'Tareas y Bugfixes', icon: Icons.folder, active: this.activeTab === 'features', badge: String(state.features.length) })}
            ${renderTabButton({ id: 'graph', label: 'Grafo de Bloqueos', icon: Icons.gitBranch, active: this.activeTab === 'graph' })}
            ${renderTabButton({ id: 'tree', label: 'Árbol Jerárquico', icon: Icons.check, active: this.activeTab === 'tree' })}
            ${renderTabButton({ id: 'three', label: 'Constelación 3D', icon: Icons.eye, active: this.activeTab === 'three' })}
            ${renderTabButton({ id: 'history', label: 'Bitácora Histórica', icon: Icons.clock, active: this.activeTab === 'history', badge: String(state.history?.records?.length || 0) })}
          </nav>

          <!-- 4. Contenido Dinámico de la Pestaña -->
          <section id="tab-content" class="min-h-[400px]">
            ${this.renderActiveTabContent({ state, filteredFeatures, modules })}
          </section>
        </main>

        <!-- Modal de Detalle -->
        ${renderModal(state.selectedFeature)}
      </div>
    `;

    // Inicializaciones post-render para vistas con canvas (Tree / 3D)
    this.postRender({ state, filteredFeatures });
  }

  renderActiveTabContent({ state, filteredFeatures, modules }) {
    switch (this.activeTab) {
      case 'features':
        return `
          <div class="space-y-6">
            ${renderFeatureFilters({ filters: state.filters, modules })}
            ${renderFeatureTable({ 
              features: filteredFeatures, 
              pagination: state.pagination,
              onSelect: (f) => store.setSelectedFeature(f)
            })}
            ${renderFeaturePagination({ 
              totalItems: filteredFeatures.length, 
              pagination: state.pagination 
            })}
          </div>
        `;

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
    }
  }

  bindGlobalEvents() {
    // 1. Delegación de clics
    document.addEventListener('click', (e) => {
      // Cambio de pestaña
      const tabBtn = e.target.closest('[data-tab]');
      if (tabBtn) {
        const tabId = tabBtn.getAttribute('data-tab');
        router.navigate(tabId);
        return;
      }

      // Refrescar datos
      const refreshBtn = e.target.closest('[data-action="refresh"]');
      if (refreshBtn) {
        this.refreshData();
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
        store.resetFilters();
        return;
      }
    });

    // 2. Delegación de inputs y cambios (filtros de búsqueda)
    document.addEventListener('input', (e) => {
      if (e.target.id === 'feature-search-input') {
        store.setFilter('search', e.target.value);
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
      }
    });

    // 3. Tecla Escape para cerrar modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && store.getState().selectedFeature) {
        store.setSelectedFeature(null);
      }
    });
  }
}

// Arrancar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
