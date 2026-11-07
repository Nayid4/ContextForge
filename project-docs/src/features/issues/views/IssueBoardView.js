import { IssueCard } from '../components/IssueCard.js';
import { renderList } from '../../../shared/utils/renderList.js';
import { Icons } from '../../../shared/Icons.js';

export function renderIssueBoardView({
  issues = [],
  states = []
}) {
  const defaultStates = states.length > 0 ? states : [
    { id: 'state-backlog', name: 'Backlog', color: 'bg-zinc-500' },
    { id: 'state-todo', name: 'Por Hacer', color: 'bg-sky-500' },
    { id: 'state-in-progress', name: 'En Progreso', color: 'bg-amber-500' },
    { id: 'state-in-review', name: 'En Revisión', color: 'bg-purple-500' },
    { id: 'state-done', name: 'Completado', color: 'bg-emerald-500' },
    { id: 'state-cancelled', name: 'Cancelado', color: 'bg-rose-500' }
  ];

  const renderColumn = (state) => {
    const colIssues = issues.filter(i => i.state_id === state.id);

    return `
      <div
        data-state-column="${state.id}"
        class="w-72 sm:w-80 shrink-0 bg-zinc-950/60 rounded-2xl border border-zinc-800/80 flex flex-col max-h-[calc(100vh-12rem)] shadow-lg"
      >
        <!-- Column Header -->
        <div class="px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between gap-2 bg-zinc-900/40 rounded-t-2xl">
          <div class="flex items-center gap-2 min-w-0">
            <span class="w-2.5 h-2.5 rounded-full ${state.color || 'bg-zinc-400'} shrink-0 shadow-sm"></span>
            <span class="text-xs font-bold text-zinc-200 truncate tracking-tight">${state.name}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono font-medium">
              ${colIssues.length}
            </span>
          </div>
        </div>

        <!-- Column Cards Container -->
        <div class="flex-1 overflow-y-auto p-3 space-y-3">
          ${renderList(colIssues, IssueCard, () => `
            <div class="p-6 text-center rounded-xl border border-dashed border-zinc-800/80 text-[11px] text-zinc-400">
              Sin tareas en este estado
            </div>
          `)}
        </div>
      </div>
    `;
  };

  return `
    <div class="p-6 overflow-x-auto min-h-full">
      <div class="flex items-start gap-4 pb-4">
        ${renderList(defaultStates, renderColumn)}
      </div>
    </div>
  `;
}
