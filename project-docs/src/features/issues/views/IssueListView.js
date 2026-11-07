import { IssueRow } from '../components/IssueRow.js';
import { renderList } from '../../../shared/utils/renderList.js';
import { Icons } from '../../../shared/Icons.js';

export function renderIssueListView({
  issues = [],
  states = [],
  groupBy = 'state'
}) {
  if (issues.length === 0) {
    return `
      <div class="p-12 text-center space-y-3">
        <div class="inline-flex p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500">
          ${Icons.search('w-6 h-6')}
        </div>
        <h3 class="text-sm font-semibold text-zinc-300">No se encontraron tareas</h3>
        <p class="text-xs text-zinc-500 max-w-sm mx-auto">Prueba ajustando los filtros de búsqueda, estado o prioridad.</p>
      </div>
    `;
  }

  // Agrupación por Estado
  if (groupBy === 'state') {
    return `
      <div class="p-4">
        <div class="rounded-xl border border-zinc-800/80 bg-zinc-950/60 overflow-hidden shadow-sm">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-zinc-900/80 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <th class="py-2.5 px-4 w-32">ID</th>
                <th class="py-2.5 px-4">Tarea</th>
                <th class="py-2.5 px-4 w-36 hidden sm:table-cell">Subtareas</th>
                <th class="py-2.5 px-4 w-36 hidden md:table-cell">Módulo</th>
                <th class="py-2.5 px-4 w-32 hidden lg:table-cell">Agente</th>
                <th class="py-2.5 px-4 w-32 text-right">Estado</th>
              </tr>
            </thead>
            ${renderList(states, state => {
              const stateIssues = issues.filter(i => i.state_id === state.id);
              if (stateIssues.length === 0) return '';

              return `
                <tbody class="divide-y divide-zinc-800/40">
                  <tr class="bg-zinc-900/60 border-y border-zinc-800/80">
                    <td colspan="6" class="px-4 py-2">
                      <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full ${state.color || 'bg-zinc-400'}"></span>
                        <span class="text-xs font-bold text-zinc-200 tracking-tight">${state.name}</span>
                        <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono font-medium">
                          ${stateIssues.length}
                        </span>
                      </div>
                    </td>
                  </tr>
                  ${renderList(stateIssues, IssueRow)}
                </tbody>
              `;
            })}
          </table>
        </div>
      </div>
    `;
  }

  // Plano sin agrupar
  return `
    <div class="p-4">
      <div class="rounded-xl border border-zinc-800/80 bg-zinc-950/60 overflow-hidden shadow-sm">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-zinc-900/80 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              <th class="py-2.5 px-4 w-32">ID</th>
              <th class="py-2.5 px-4">Tarea</th>
              <th class="py-2.5 px-4 w-36 hidden sm:table-cell">Subtareas</th>
              <th class="py-2.5 px-4 w-36 hidden md:table-cell">Módulo</th>
              <th class="py-2.5 px-4 w-32 hidden lg:table-cell">Agente</th>
              <th class="py-2.5 px-4 w-32 text-right">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${renderList(issues, IssueRow)}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
