import { Icons } from '../../shared/Icons.js';

export function renderIssueSpreadsheetView({
  issues = [],
  onSelectIssue = () => {}
}) {
  return `
    <div class="p-6">
      <div class="border border-zinc-800/80 rounded-xl bg-zinc-950/70 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-zinc-900/90 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 select-none">
                <th class="py-3 px-4 w-24">ID</th>
                <th class="py-3 px-4 min-w-[260px]">Título de Tarea</th>
                <th class="py-3 px-4 w-32">Estado</th>
                <th class="py-3 px-4 w-28">Prioridad</th>
                <th class="py-3 px-4 w-32">Agente</th>
                <th class="py-3 px-4 w-40">Módulo</th>
                <th class="py-3 px-4 w-36">Ciclo</th>
                <th class="py-3 px-4 w-28">Subtareas</th>
                <th class="py-3 px-4 min-w-[200px]">Rama Git</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800/50">
              ${issues.map(issue => {
                const subtotal = issue.subtasks ? issue.subtasks.length : 0;
                const completed = issue.subtasks ? issue.subtasks.filter(s => s.status === 'done' || s.status === 'passed').length : 0;

                return `
                  <tr
                    data-issue-id="${issue.id}"
                    class="plane-spreadsheet-row hover:bg-zinc-900/60 transition-colors cursor-pointer group"
                  >
                    <!-- ID -->
                    <td class="py-2.5 px-4 font-mono font-medium text-zinc-400 group-hover:text-indigo-400">
                      ${issue.id}
                    </td>

                    <!-- Title -->
                    <td class="py-2.5 px-4 font-medium text-zinc-200 group-hover:text-white truncate max-w-xs">
                      ${issue.title}
                    </td>

                    <!-- State -->
                    <td class="py-2.5 px-4">
                      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium" style="background-color: ${issue.state_color}20; color: ${issue.state_color}; border: 1px solid ${issue.state_color}40;">
                        <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${issue.state_color}"></span>
                        ${issue.state_name}
                      </span>
                    </td>

                    <!-- Priority -->
                    <td class="py-2.5 px-4">
                      <span class="text-[11px] font-medium text-zinc-300 capitalize">
                        ${issue.priority || 'none'}
                      </span>
                    </td>

                    <!-- Assignee -->
                    <td class="py-2.5 px-4">
                      <span class="inline-flex items-center gap-1 text-[11px] text-zinc-300">
                        ${Icons.bot('w-3 h-3 text-zinc-500')}
                        <span>${issue.assignee_role || 'leader'}</span>
                      </span>
                    </td>

                    <!-- Module -->
                    <td class="py-2.5 px-4 text-zinc-400 truncate">
                      ${issue.module_name || 'Harness Core'}
                    </td>

                    <!-- Cycle -->
                    <td class="py-2.5 px-4 text-zinc-400 truncate">
                      ${issue.cycle_name ? issue.cycle_name.split(':')[0] : '-'}
                    </td>

                    <!-- Subtasks -->
                    <td class="py-2.5 px-4 font-mono text-[11px] text-zinc-300">
                      ${completed}/${subtotal}
                    </td>

                    <!-- Branch -->
                    <td class="py-2.5 px-4 font-mono text-[10px] text-zinc-400 truncate max-w-[200px]" title="${issue.branch || ''}">
                      ${issue.branch || '-'}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
