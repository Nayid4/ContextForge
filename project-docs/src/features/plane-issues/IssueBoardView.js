import { Icons } from '../../shared/Icons.js';

function getPriorityBadge(priority) {
  switch ((priority || '').toLowerCase()) {
    case 'urgent':
      return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">${Icons.priorityUrgent('w-3 h-3')} Urgente</span>`;
    case 'high':
      return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">${Icons.priorityHigh('w-3 h-3')} Alta</span>`;
    case 'medium':
      return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">${Icons.priorityMedium('w-3 h-3')} Media</span>`;
    case 'low':
      return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">${Icons.priorityLow('w-3 h-3')} Baja</span>`;
    default:
      return '';
  }
}

export function renderIssueBoardView({
  issues = [],
  states = [],
  onSelectIssue = () => {},
  onMoveState = () => {}
}) {
  const issuesByState = {};
  for (const s of states) {
    issuesByState[s.id] = [];
  }

  for (const issue of issues) {
    if (!issuesByState[issue.state_id]) {
      issuesByState[issue.state_id] = [];
    }
    issuesByState[issue.state_id].push(issue);
  }

  return `
    <div class="p-6 overflow-x-auto min-h-[calc(100vh-140px)]">
      <div class="flex items-start gap-4 min-w-[1280px]">
        ${states.map((state, stateIndex) => {
          const colIssues = issuesByState[state.id] || [];

          return `
            <div
              data-state-column="${state.id}"
              class="w-80 shrink-0 flex flex-col rounded-xl bg-zinc-950/70 border border-zinc-800/80 max-h-[calc(100vh-160px)] shadow-sm"
            >
              <!-- Column Header -->
              <div class="p-3 border-b border-zinc-800/80 flex items-center justify-between gap-2 bg-zinc-900/60 rounded-t-xl">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${state.color}"></span>
                  <span class="text-xs font-semibold text-zinc-200 tracking-tight">${state.name}</span>
                  <span class="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] font-mono text-zinc-400">
                    ${colIssues.length}
                  </span>
                </div>
              </div>

              <!-- Cards Container -->
              <div class="flex-1 p-2 space-y-2.5 overflow-y-auto">
                ${colIssues.length === 0 ? `
                  <div class="p-6 border border-dashed border-zinc-800/60 rounded-lg text-center text-xs text-zinc-400 italic">
                    Sin tareas
                  </div>
                ` : colIssues.map(issue => {
                  const subtotal = issue.subtasks ? issue.subtasks.length : 0;
                  const completed = issue.subtasks ? issue.subtasks.filter(s => s.status === 'done' || s.status === 'passed').length : 0;
                  const percent = subtotal > 0 ? Math.round((completed / subtotal) * 100) : (issue.state_id === 'state-done' ? 100 : 0);

                  const prevState = stateIndex > 0 ? states[stateIndex - 1] : null;
                  const nextState = stateIndex < states.length - 1 ? states[stateIndex + 1] : null;

                  return `
                    <div
                      data-issue-id="${issue.id}"
                      class="plane-board-card p-3 rounded-lg bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer shadow-sm group space-y-2.5"
                    >
                      <!-- Card Header: ID & Priority -->
                      <div class="flex items-center justify-between gap-2">
                        <span class="text-[11px] font-mono font-medium text-zinc-400 group-hover:text-indigo-400 transition-colors">
                          ${issue.id}
                        </span>
                        <div class="flex items-center gap-1.5">
                          ${getPriorityBadge(issue.priority)}
                        </div>
                      </div>

                      <!-- Title -->
                      <h4 class="text-xs font-medium text-zinc-100 group-hover:text-white line-clamp-2 leading-relaxed">
                        ${issue.title}
                      </h4>

                      <!-- Subtasks Mini-Bar -->
                      ${subtotal > 0 ? `
                        <div class="space-y-1">
                          <div class="flex items-center justify-between text-[10px] text-zinc-400">
                            <span>Subtareas</span>
                            <span class="font-mono">${completed}/${subtotal} (${percent}%)</span>
                          </div>
                          <div class="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div class="h-full bg-emerald-500 rounded-full" style="width: ${percent}%"></div>
                          </div>
                        </div>
                      ` : ''}

                      <!-- Footer: Assignee, Cycle & Transition Buttons -->
                      <div class="pt-2 border-t border-zinc-800/60 flex items-center justify-between gap-2 text-[11px]">
                        <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-zinc-800 text-[10px] text-zinc-300 font-medium">
                          ${Icons.bot('w-2.5 h-2.5')}
                          <span>${issue.assignee_role || 'leader'}</span>
                        </span>

                        <!-- Quick Move State Buttons -->
                        <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          ${prevState ? `
                            <button
                              data-action="move-state"
                              data-issue-id="${issue.id}"
                              data-target-state="${prevState.id}"
                              class="p-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                              title="Mover a ${prevState.name}"
                            >
                              ${Icons.chevronLeft('w-3 h-3')}
                            </button>
                          ` : ''}
                          ${nextState ? `
                            <button
                              data-action="move-state"
                              data-issue-id="${issue.id}"
                              data-target-state="${nextState.id}"
                              class="p-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                              title="Mover a ${nextState.name}"
                            >
                              ${Icons.chevronRight('w-3 h-3')}
                            </button>
                          ` : ''}
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
