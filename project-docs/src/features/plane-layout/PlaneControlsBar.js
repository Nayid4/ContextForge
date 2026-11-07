import { Icons } from '../../shared/Icons.js';

export function renderPlaneControlsBar({
  currentViewMode = 'list', // 'list' | 'board' | 'calendar' | 'spreadsheet'
  filterState = 'all',
  filterPriority = 'all',
  filterAssignee = 'all',
  groupBy = 'state', // 'state' | 'priority' | 'assignee'
  orderBy = 'sequence', // 'sequence' | 'priority' | 'title'
  searchQuery = '',
  totalIssues = 0,
  filteredIssues = 0
}) {
  return `
    <div id="plane-controls-bar" class="px-6 py-3 border-b border-zinc-800/80 bg-zinc-950/40 flex flex-wrap items-center justify-between gap-3 text-xs">
      <!-- Left: View Mode Pills -->
      <div class="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-900 border border-zinc-800/80">
        <!-- List View -->
        <button data-view-mode="list" class="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${currentViewMode === 'list' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}">
          ${Icons.table('w-3.5 h-3.5')}
          <span>Lista</span>
        </button>

        <!-- Board (Kanban) View -->
        <button data-view-mode="board" class="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${currentViewMode === 'board' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}">
          ${Icons.kanban('w-3.5 h-3.5')}
          <span>Tablero (Kanban)</span>
        </button>

        <!-- Calendar View -->
        <button data-view-mode="calendar" class="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${currentViewMode === 'calendar' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}">
          ${Icons.calendar('w-3.5 h-3.5')}
          <span>Calendario</span>
        </button>

        <!-- Spreadsheet View -->
        <button data-view-mode="spreadsheet" class="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${currentViewMode === 'spreadsheet' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}">
          ${Icons.grid('w-3.5 h-3.5')}
          <span>Hoja de Cálculo</span>
        </button>
      </div>

      <!-- Right: Filters, Search & Grouping -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Live Filter Input -->
        <div class="relative">
          <input
            id="plane-issue-search"
            type="text"
            placeholder="Filtrar tareas..."
            value="${searchQuery}"
            class="w-40 sm:w-48 pl-7 pr-3 py-1 rounded-md bg-zinc-900/90 border border-zinc-800 text-zinc-200 placeholder-zinc-500 text-xs focus:outline-none focus:border-indigo-500 focus:w-56 transition-all"
          />
          <span class="absolute left-2.5 top-1.5 text-zinc-500 pointer-events-none">
            ${Icons.search('w-3.5 h-3.5')}
          </span>
        </div>

        <!-- Group By Selector -->
        <div class="flex items-center gap-1.5 text-zinc-400 bg-zinc-900/60 px-2 py-1 rounded-md border border-zinc-800/80">
          <span class="text-[11px] text-zinc-400">Agrupar:</span>
          <select id="plane-group-by" class="bg-transparent text-zinc-200 text-xs focus:outline-none cursor-pointer">
            <option value="state" ${groupBy === 'state' ? 'selected' : ''}>Estado</option>
            <option value="priority" ${groupBy === 'priority' ? 'selected' : ''}>Prioridad</option>
            <option value="assignee" ${groupBy === 'assignee' ? 'selected' : ''}>Agente</option>
          </select>
        </div>

        <!-- Filter State Selector -->
        <select id="plane-filter-state" class="bg-zinc-900 text-zinc-200 text-xs px-2.5 py-1 rounded-md border border-zinc-800 focus:outline-none cursor-pointer">
          <option value="all" ${filterState === 'all' ? 'selected' : ''}>Todos los Estados</option>
          <option value="state-backlog" ${filterState === 'state-backlog' ? 'selected' : ''}>Backlog</option>
          <option value="state-todo" ${filterState === 'state-todo' ? 'selected' : ''}>Todo</option>
          <option value="state-in-progress" ${filterState === 'state-in-progress' ? 'selected' : ''}>In Progress</option>
          <option value="state-in-review" ${filterState === 'state-in-review' ? 'selected' : ''}>In Review</option>
          <option value="state-done" ${filterState === 'state-done' ? 'selected' : ''}>Done</option>
        </select>

        <!-- Count Indicator -->
        <span class="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[11px]">
          ${filteredIssues} de ${totalIssues}
        </span>
      </div>
    </div>
  `;
}
