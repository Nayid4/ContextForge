/**
 * IssueControlsBar Component
 * Barra de control superior para alternar modos de vista (Kanban, Lista, Hoja de Cálculo, Calendario) y agrupación.
 * 100% Vectorial, sin dependencias externas ni emojis.
 */
import { Icons } from '../../../shared/ui/Icons.js';

export function IssueControlsBar({
  currentViewMode = 'board',
  groupBy = 'state',
  issueCount = 0
} = {}) {
  const views = [
    { id: 'board', label: 'Tablero', icon: 'kanban' },
    { id: 'list', label: 'Lista', icon: 'table' },
    { id: 'spreadsheet', label: 'Tabla', icon: 'grid' },
    { id: 'calendar', label: 'Calendario', icon: 'calendar' }
  ];

  return `
    <div id="plane-issue-controls-bar" class="h-12 border-b border-gray-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 px-6 flex items-center justify-between gap-4 sticky top-12 z-10 select-none transition-colors">
      <!-- Left: View Mode Pills -->
      <div class="flex items-center gap-1 bg-gray-100 dark:bg-zinc-900/80 p-1 rounded-xl border border-gray-200 dark:border-zinc-800/80">
        ${views.map(v => {
          const isActive = currentViewMode === v.id;
          const iconFn = Icons[v.icon] || Icons.terminal;
          return `
            <button
              data-plane-view-mode="${v.id}"
              class="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 shadow-xs font-semibold'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-200/50 dark:hover:bg-zinc-800/50'
              }"
            >
              ${iconFn('w-3.5 h-3.5')}
              <span class="hidden sm:inline">${v.label}</span>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Right: GroupBy & Metrics -->
      <div class="flex items-center gap-3 text-xs">
        <!-- GroupBy Selector -->
        <div class="flex items-center gap-1.5 text-gray-500 dark:text-zinc-400">
          <span class="hidden md:inline text-[11px]">Agrupar:</span>
          <select id="plane-group-by" class="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-gray-700 dark:text-zinc-300 focus:outline-none cursor-pointer">
            <option value="state" ${groupBy === 'state' ? 'selected' : ''}>Por Estado</option>
            <option value="priority" ${groupBy === 'priority' ? 'selected' : ''}>Por Prioridad</option>
            <option value="assignee" ${groupBy === 'assignee' ? 'selected' : ''}>Por Agente</option>
          </select>
        </div>

        <!-- Issue Counter Pill -->
        <span class="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 font-mono text-[11px]">
          ${issueCount} ${issueCount === 1 ? 'tarea' : 'tareas'}
        </span>
      </div>
    </div>
  `;
}
