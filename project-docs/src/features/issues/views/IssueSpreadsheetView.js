import { Icons } from '../../../shared/Icons.js';
import { renderList } from '../../../shared/utils/renderList.js';

export function renderIssueSpreadsheetView({
  issues = []
}) {
  const renderTableRow = (issue, idx) => `
    <tr
      data-issue-id="${issue.id}"
      class="plane-issue-row border-b border-zinc-800/50 hover:bg-zinc-900/60 transition-colors cursor-pointer text-xs"
    >
      <td class="p-3 text-center text-zinc-500 font-mono">${idx + 1}</td>
      <td class="p-3 font-mono font-bold text-indigo-400">${issue.id}</td>
      <td class="p-3 font-medium text-zinc-200 truncate max-w-xs">${issue.title}</td>
      <td class="p-3">
        <span class="px-2 py-0.5 rounded text-[10px] font-mono ${
          issue.state_id === 'state-done'
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            : issue.state_id === 'state-in-progress'
            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            : 'bg-zinc-800 text-zinc-400'
        }">
          ${issue.state_name || issue.state_id}
        </span>
      </td>
      <td class="p-3 font-mono text-[11px] text-zinc-300 capitalize">${issue.priority || 'none'}</td>
      <td class="p-3 text-zinc-400 font-mono text-[11px]">${issue.assignee_role || 'leader'}</td>
      <td class="p-3 text-zinc-400 font-mono text-[11px]">${issue.module_name || 'Harness Core'}</td>
      <td class="p-3 text-zinc-400 font-mono text-[11px]">${issue.cycle_name || 'Sprint Activo'}</td>
    </tr>
  `;

  return `
    <div class="p-6 overflow-x-auto">
      <div class="rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-hidden shadow-xl">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-zinc-900/80 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              <th class="p-3 text-center w-12">#</th>
              <th class="p-3 w-28">ID</th>
              <th class="p-3">Título de la Tarea</th>
              <th class="p-3 w-32">Estado</th>
              <th class="p-3 w-28">Prioridad</th>
              <th class="p-3 w-32">Agente</th>
              <th class="p-3 w-36">Módulo</th>
              <th class="p-3 w-36">Ciclo</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-800/40">
            ${renderList(issues, renderTableRow, () => `
              <tr>
                <td colspan="8" class="p-8 text-center text-xs text-zinc-400">
                  No hay tareas registradas en la hoja de cálculo
                </td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
