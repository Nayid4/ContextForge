/**
 * IssueBoard Component (Kanban Board View)
 * Renderiza el tablero Kanban reactivo de Plane con columnas por estado y tarjetas compuestas con renderList.
 * 100% Vectorial, sin dependencias externas ni emojis.
 */
import { IssueCard } from './IssueCard.js';
import { renderList } from '../../../shared/utils/renderList.js';
import { CANONICAL_STATES } from '../services/issue.service.js';

export function IssueBoard({
  issues = [],
  states = []
} = {}) {
  const activeStates = states && states.length > 0 ? states : CANONICAL_STATES;

  const renderColumn = (state) => {
    const colIssues = issues.filter(i => i.state_id === state.id);

    return `
      <div
        data-state-column="${state.id}"
        class="w-72 sm:w-80 shrink-0 bg-zinc-950/60 rounded-2xl border border-zinc-800/80 flex flex-col max-h-[calc(100vh-12rem)] shadow-lg select-none"
      >
        <!-- Column Header -->
        <div class="px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between gap-2 bg-zinc-900/40 rounded-t-2xl">
          <div class="flex items-center gap-2 min-w-0">
            <span class="w-2.5 h-2.5 rounded-full ${state.color || 'bg-zinc-400'} shrink-0 shadow-xs"></span>
            <span class="text-xs font-bold text-zinc-200 truncate tracking-tight">${state.name}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono font-medium">
              ${colIssues.length}
            </span>
          </div>
        </div>

        <!-- Column Cards Container -->
        <div class="flex-1 overflow-y-auto p-3 space-y-3">
          ${renderList(colIssues, IssueCard, () => `
            <div class="p-6 text-center rounded-xl border border-dashed border-zinc-800/80 text-[11px] text-zinc-500">
              Sin tareas en este estado
            </div>
          `)}
        </div>
      </div>
    `;
  };

  return `
    <div id="plane-board-container" class="p-6 overflow-x-auto min-h-full">
      <div class="flex items-start gap-4 pb-4">
        ${renderList(activeStates, renderColumn)}
      </div>
    </div>
  `;
}
