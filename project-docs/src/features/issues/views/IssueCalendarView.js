import { Icons } from '../../../shared/Icons.js';
import { renderList } from '../../../shared/utils/renderList.js';

export function renderIssueCalendarView({
  issues = [],
  cycles = []
}) {
  const renderTimelineItem = (issue) => `
    <div
      data-issue-id="${issue.id}"
      class="plane-issue-row p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex items-center justify-between gap-4 transition-all cursor-pointer"
    >
      <div class="flex items-center gap-3 min-w-0">
        <span class="text-xs font-mono font-bold text-indigo-400 shrink-0">${issue.id}</span>
        <span class="text-xs text-zinc-200 font-medium truncate">${issue.title}</span>
      </div>

      <div class="flex items-center gap-3 shrink-0 text-xs">
        <span class="text-[11px] font-mono text-zinc-400">${issue.cycle_name || 'Sprint Activo'}</span>
        <span class="px-2 py-0.5 rounded text-[10px] font-mono ${
          issue.state_id === 'state-done'
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            : 'bg-zinc-800 text-zinc-300'
        }">
          ${issue.state_name || issue.state_id}
        </span>
      </div>
    </div>
  `;

  return `
    <div class="p-6 space-y-6 max-w-6xl mx-auto">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            ${Icons.calendar('w-4 h-4 text-indigo-400')}
            <span>Cronograma Temporal de Tareas (Calendar & Timeline)</span>
          </h2>
          <p class="text-xs text-zinc-400 mt-0.5">Seguimiento temporal por ciclos e iteraciones de entrega.</p>
        </div>
      </div>

      <div class="space-y-2">
        ${renderList(issues, renderTimelineItem, 'No hay tareas programadas')}
      </div>
    </div>
  `;
}
