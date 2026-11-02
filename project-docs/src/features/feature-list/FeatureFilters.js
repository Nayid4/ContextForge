/**
 * Feature Filters Component
 */
import { Icons } from '../../shared/Icons.js';

export function renderFeatureFilters({ filters, modules = [] }) {
  const currentFilters = filters || {};
  const searchVal = currentFilters.search || '';

  const moduleOptions = modules.map(m => `
    <option value="${m}" ${currentFilters.module === m ? 'selected' : ''}>${m}</option>
  `).join('');

  return `
    <div class="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-lg">
      <!-- Search Bar -->
      <div class="relative flex-1 min-w-[240px]">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          ${Icons.search}
        </div>
        <input
          type="text"
          id="feature-search-input"
          value="${escapeAttr(searchVal)}"
          placeholder="Buscar por ID, título, nombre o rama..."
          class="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
        />
      </div>

      <!-- Type Filter -->
      <select id="filter-type" class="px-3 py-2 text-xs rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono">
        <option value="">Todos los Tipos</option>
        <option value="feature" ${currentFilters.type === 'feature' ? 'selected' : ''}>feature</option>
        <option value="bugfix" ${currentFilters.type === 'bugfix' ? 'selected' : ''}>bugfix</option>
      </select>

      <!-- Status Filter -->
      <select id="filter-status" class="px-3 py-2 text-xs rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500">
        <option value="">Todos los Estados</option>
        <option value="pending" ${currentFilters.status === 'pending' ? 'selected' : ''}>Pendiente</option>
        <option value="spec_ready" ${currentFilters.status === 'spec_ready' ? 'selected' : ''}>Spec Listo</option>
        <option value="in_progress" ${currentFilters.status === 'in_progress' ? 'selected' : ''}>En Progreso</option>
        <option value="done" ${currentFilters.status === 'done' ? 'selected' : ''}>Completado</option>
        <option value="blocked" ${currentFilters.status === 'blocked' ? 'selected' : ''}>Bloqueado</option>
      </select>

      <!-- Module Filter -->
      <select id="filter-module" class="px-3 py-2 text-xs rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500">
        <option value="">Todos los Módulos</option>
        ${moduleOptions}
      </select>

      <!-- Priority Filter -->
      <select id="filter-priority" class="px-3 py-2 text-xs rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500">
        <option value="">Todas las Prioridades</option>
        <option value="alta" ${currentFilters.priority === 'alta' ? 'selected' : ''}>Alta</option>
        <option value="media" ${currentFilters.priority === 'media' ? 'selected' : ''}>Media</option>
        <option value="baja" ${currentFilters.priority === 'baja' ? 'selected' : ''}>Baja</option>
        <option value="P0" ${currentFilters.priority === 'P0' ? 'selected' : ''}>P0</option>
        <option value="P1" ${currentFilters.priority === 'P1' ? 'selected' : ''}>P1</option>
        <option value="P2" ${currentFilters.priority === 'P2' ? 'selected' : ''}>P2</option>
      </select>

      <!-- Reset Button -->
      <button
        data-action="reset-filters"
        type="button"
        class="px-3 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
        title="Restablecer filtros"
      >
        Limpiar
      </button>
    </div>
  `;
}

function escapeAttr(text) {
  if (!text) return '';
  return String(text).replace(/"/g, '&quot;');
}
