/**
 * PlaneControlsBar Component (Shared UI)
 * Barra de control superior inspirada en Plane para alternar modos de vista (Lista, Tablero, Calendario, Hoja de Calculo),
 * filtros reactivos por estado, prioridad y agrupacion.
 * 100% Vectorial, accesible y con cero emojis.
 */
import { Icons } from './Icons.js';
import { renderList } from '../utils/renderList.js';

export function renderPlaneControlsBar({
  currentViewMode = 'list',
  filterState = 'all',
  filterPriority = 'all',
  filterAssignee = 'all',
  groupBy = 'state',
  orderBy = 'sequence',
  searchQuery = '',
  totalIssues = 0,
  filteredIssues = 0
} = {}) {
  const viewModes = [
    { id: 'list', label: 'Lista', icon: 'alignLeft' },
    { id: 'board', label: 'Tablero (Kanban)', icon: 'kanban' },
    { id: 'calendar', label: 'Calendario', icon: 'calendar' },
    { id: 'spreadsheet', label: 'Hoja de Cálculo', icon: 'table' }
  ];

  const renderViewModeBtn = (m) => `
    <button data-view-mode="${m.id}" class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
      currentViewMode === m.id
        ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/80 font-semibold'
        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
    }">
      ${(Icons[m.icon] || Icons.terminal)('w-3.5 h-3.5')}
      <span>${m.label}</span>
    </button>
  `;

  return `
    <div id="plane-controls-bar" class="border-b border-zinc-800/80 bg-zinc-950/60 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs sticky top-14 z-10 backdrop-blur-sm">
      <!-- Left: View Mode Pills -->
      <div class="flex items-center gap-1 bg-zinc-900/90 p-0.5 rounded-lg border border-zinc-800">
        ${renderList(viewModes, renderViewModeBtn)}
      </div>

      <!-- Right: Filters & Search Input -->
      <div class="flex items-center flex-wrap gap-2.5">
        <!-- Search Input -->
        <div class="relative">
          <input
            type="text"
            id="plane-issue-search"
            value="${searchQuery}"
            placeholder="Filtrar tareas..."
            class="pl-8 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 focus:border-indigo-500 focus:outline-none text-xs text-zinc-200 placeholder-zinc-500 w-48 sm:w-60 transition-all shadow-inner"
          />
          <div class="absolute left-2.5 top-2 text-zinc-500 pointer-events-none">
            ${Icons.search('w-3.5 h-3.5')}
          </div>
        </div>

        <!-- Filter by State -->
        <select id="plane-filter-state" class="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs focus:outline-none focus:border-indigo-500 transition-colors">
          <option value="all" ${filterState === 'all' ? 'selected' : ''}>Todos los Estados</option>
          <option value="state-backlog" ${filterState === 'state-backlog' ? 'selected' : ''}>Backlog</option>
          <option value="state-todo" ${filterState === 'state-todo' ? 'selected' : ''}>Por Hacer (Todo)</option>
          <option value="state-in-progress" ${filterState === 'state-in-progress' ? 'selected' : ''}>En Progreso</option>
          <option value="state-in-review" ${filterState === 'state-in-review' ? 'selected' : ''}>En Revisión</option>
          <option value="state-done" ${filterState === 'state-done' ? 'selected' : ''}>Completado</option>
          <option value="state-cancelled" ${filterState === 'state-cancelled' ? 'selected' : ''}>Cancelado</option>
        </select>

        <!-- Filter by Priority -->
        <select id="plane-filter-priority" class="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs focus:outline-none focus:border-indigo-500 transition-colors">
          <option value="all" ${filterPriority === 'all' ? 'selected' : ''}>Prioridad (Todas)</option>
          <option value="urgent" ${filterPriority === 'urgent' ? 'selected' : ''}>P0 Urgente</option>
          <option value="high" ${filterPriority === 'high' ? 'selected' : ''}>P1 Alta</option>
          <option value="medium" ${filterPriority === 'medium' ? 'selected' : ''}>P2 Media</option>
          <option value="low" ${filterPriority === 'low' ? 'selected' : ''}>P3 Baja</option>
        </select>

        <!-- Group By -->
        <select id="plane-group-by" class="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs focus:outline-none focus:border-indigo-500 transition-colors">
          <option value="state" ${groupBy === 'state' ? 'selected' : ''}>Agrupar: Estado</option>
          <option value="priority" ${groupBy === 'priority' ? 'selected' : ''}>Agrupar: Prioridad</option>
          <option value="assignee" ${groupBy === 'assignee' ? 'selected' : ''}>Agrupar: Agente</option>
        </select>

        <!-- Count indicator -->
        <div class="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800/80 text-[11px] font-mono text-zinc-400">
          <span class="text-zinc-200 font-bold">${filteredIssues}</span> / ${totalIssues}
        </div>
      </div>
    </div>
  `;
}
