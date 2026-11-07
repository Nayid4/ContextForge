/**
 * IssueFilters Component
 * Barra de filtrado reactivo para el dominio Issues (por estado, prioridad, agente y texto).
 * 100% Vectorial, sin dependencias externas ni emojis.
 */
import { Icons } from '../../../shared/ui/Icons.js';
import { CANONICAL_STATES } from '../services/issue.service.js';

export function IssueFilters({
  filters = {
    state: 'all',
    priority: 'all',
    assignee: 'all',
    module: 'all',
    search: ''
  },
  states = CANONICAL_STATES,
  modules = []
} = {}) {
  const activeStates = states && states.length > 0 ? states : CANONICAL_STATES;

  return `
    <div id="plane-issue-filters" class="px-6 py-2.5 bg-zinc-950/70 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
      <!-- Left: Filter Dropdowns -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- State Filter -->
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
          <span class="text-[11px] text-zinc-400">Estado:</span>
          <select id="plane-filter-state" data-filter="state" class="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer">
            <option value="all" class="bg-zinc-900 text-zinc-200" ${filters.state === 'all' ? 'selected' : ''}>Todos</option>
            ${activeStates.map(s => `
              <option value="${s.id}" class="bg-zinc-900 text-zinc-200" ${filters.state === s.id ? 'selected' : ''}>
                ${s.name}
              </option>
            `).join('')}
          </select>
        </div>

        <!-- Priority Filter -->
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
          <span class="text-[11px] text-zinc-400">Prioridad:</span>
          <select id="plane-filter-priority" data-filter="priority" class="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer">
            <option value="all" class="bg-zinc-900 text-zinc-200" ${filters.priority === 'all' ? 'selected' : ''}>Todas</option>
            <option value="urgent" class="bg-zinc-900 text-zinc-200" ${filters.priority === 'urgent' ? 'selected' : ''}>Urgente (P0)</option>
            <option value="high" class="bg-zinc-900 text-zinc-200" ${filters.priority === 'high' ? 'selected' : ''}>Alta (P1)</option>
            <option value="medium" class="bg-zinc-900 text-zinc-200" ${filters.priority === 'medium' ? 'selected' : ''}>Media (P2)</option>
            <option value="low" class="bg-zinc-900 text-zinc-200" ${filters.priority === 'low' ? 'selected' : ''}>Baja (P3)</option>
          </select>
        </div>

        <!-- Assignee Filter -->
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
          <span class="text-[11px] text-zinc-400">Agente:</span>
          <select id="plane-filter-assignee" data-filter="assignee" class="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer font-mono">
            <option value="all" class="bg-zinc-900 text-zinc-200" ${filters.assignee === 'all' ? 'selected' : ''}>Todos</option>
            <option value="implementer" class="bg-zinc-900 text-zinc-200" ${filters.assignee === 'implementer' ? 'selected' : ''}>implementer</option>
            <option value="reviewer" class="bg-zinc-900 text-zinc-200" ${filters.assignee === 'reviewer' ? 'selected' : ''}>reviewer (QA)</option>
            <option value="spec-author" class="bg-zinc-900 text-zinc-200" ${filters.assignee === 'spec-author' ? 'selected' : ''}>spec-author</option>
          </select>
        </div>

        <!-- Reset Button -->
        <button id="plane-filter-reset" data-action="reset-filters" class="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors" title="Restablecer filtros">
          ${Icons.refresh('w-3.5 h-3.5')}
        </button>
      </div>

      <!-- Right: Search Input -->
      <div class="relative min-w-[200px] max-w-xs">
        <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-zinc-500">
          ${Icons.search('w-3.5 h-3.5')}
        </span>
        <input
          type="text"
          id="plane-search-input"
          value="${filters.search || ''}"
          placeholder="Buscar tareas (Ctrl+K)..."
          class="w-full pl-8 pr-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50"
        />
      </div>
    </div>
  `;
}
