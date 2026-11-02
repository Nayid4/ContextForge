/**
 * Feature Filters Component
 */
import { store } from '../../core/store.js';
import { Icons } from '../../shared/Icons.js';

export function FeatureFilters() {
  const { filters } = store.getState();

  const container = document.createElement('div');
  container.className = 'flex flex-wrap items-center gap-3 mb-4';

  container.innerHTML = `
    <!-- Search Bar -->
    <div class="relative flex-1 min-w-[220px]">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        ${Icons.search()}
      </div>
      <input
        type="text"
        id="filter-search"
        value="${filters.search}"
        placeholder="Buscar por título, nombre, rama o ID..."
        class="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
    </div>

    <!-- Type Filter -->
    <select id="filter-type" class="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
      <option value="">Todos los Tipos</option>
      <option value="feature" ${filters.type === 'feature' ? 'selected' : ''}>Feature</option>
      <option value="bugfix" ${filters.type === 'bugfix' ? 'selected' : ''}>Bugfix</option>
    </select>

    <!-- Status Filter -->
    <select id="filter-status" class="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
      <option value="">Todos los Estados</option>
      <option value="pending" ${filters.status === 'pending' ? 'selected' : ''}>Pendiente</option>
      <option value="spec_ready" ${filters.status === 'spec_ready' ? 'selected' : ''}>Spec Listo</option>
      <option value="in_progress" ${filters.status === 'in_progress' ? 'selected' : ''}>En Progreso</option>
      <option value="done" ${filters.status === 'done' ? 'selected' : ''}>Completado</option>
      <option value="blocked" ${filters.status === 'blocked' ? 'selected' : ''}>Bloqueado</option>
    </select>

    <!-- Module Filter -->
    <select id="filter-module" class="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
      <option value="">Todos los Módulos</option>
      <option value="backend" ${filters.module === 'backend' ? 'selected' : ''}>Backend</option>
      <option value="frontend" ${filters.module === 'frontend' ? 'selected' : ''}>Frontend</option>
      <option value="infra" ${filters.module === 'infra' ? 'selected' : ''}>Infra</option>
      <option value="domain" ${filters.module === 'domain' ? 'selected' : ''}>Domain</option>
      <option value="application" ${filters.module === 'application' ? 'selected' : ''}>Application</option>
    </select>

    <!-- Priority Filter -->
    <select id="filter-priority" class="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
      <option value="">Todas las Prioridades</option>
      <option value="alta" ${filters.priority === 'alta' ? 'selected' : ''}>Alta</option>
      <option value="media" ${filters.priority === 'media' ? 'selected' : ''}>Media</option>
      <option value="baja" ${filters.priority === 'baja' ? 'selected' : ''}>Baja</option>
    </select>

    <!-- Reset Button -->
    <button
      id="filter-reset"
      type="button"
      class="px-3 py-2 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      title="Restablecer filtros"
    >
      Limpiar
    </button>
  `;

  // Attach reactive handlers
  const searchInput = container.querySelector('#filter-search');
  searchInput.addEventListener('input', (e) => {
    store.setState({
      filters: { ...store.getState().filters, search: e.target.value },
      pagination: { ...store.getState().pagination, page: 1 }
    });
  });

  ['type', 'status', 'module', 'priority'].forEach(key => {
    const select = container.querySelector(`#filter-${key}`);
    select.addEventListener('change', (e) => {
      store.setState({
        filters: { ...store.getState().filters, [key]: e.target.value },
        pagination: { ...store.getState().pagination, page: 1 }
      });
    });
  });

  container.querySelector('#filter-reset').addEventListener('click', () => {
    store.setState({
      filters: { search: '', status: '', module: '', priority: '', type: '' },
      pagination: { ...store.getState().pagination, page: 1 }
    });
  });

  return container;
}
