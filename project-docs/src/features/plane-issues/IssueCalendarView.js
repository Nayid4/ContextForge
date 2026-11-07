import { Icons } from '../../shared/Icons.js';

export function renderIssueCalendarView({
  issues = [],
  cycles = [],
  onSelectIssue = () => {}
}) {
  return `
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-semibold text-zinc-100 tracking-tight">Cronograma Temporal de Ciclos & Entregas</h2>
          <p class="text-xs text-zinc-400 mt-0.5">Seguimiento de sprints y ventanas de ejecución de tareas por agentes.</p>
        </div>
      </div>

      <!-- Cycles Timeline Cards -->
      <div class="space-y-4">
        ${cycles.map(cycle => {
          const cycleIssues = issues.filter(i => i.cycle_id === cycle.id);
          const total = cycleIssues.length;
          const done = cycleIssues.filter(i => i.state_id === 'state-done').length;
          const percent = total > 0 ? Math.round((done / total) * 100) : 0;
          const isActive = cycle.status === 'active';

          return `
            <div class="border ${isActive ? 'border-indigo-500/40 bg-indigo-950/10' : 'border-zinc-800/80 bg-zinc-950/60'} rounded-xl p-5 space-y-4 shadow-sm">
              <!-- Cycle Header -->
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg ${isActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-900 text-zinc-400'} border border-zinc-800">
                    ${Icons.calendar('w-4 h-4')}
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="text-xs font-semibold text-zinc-100">${cycle.name}</h3>
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-medium font-mono ${isActive ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}">
                        ${cycle.status.toUpperCase()}
                      </span>
                    </div>
                    <p class="text-[11px] text-zinc-400 mt-0.5">${cycle.description || 'Sin descripción'}</p>
                  </div>
                </div>

                <div class="text-right">
                  <span class="text-xs font-mono font-medium text-zinc-300">${cycle.start_date} al ${cycle.end_date}</span>
                  <div class="text-[10px] text-zinc-400 mt-0.5">${done} de ${total} completadas (${percent}%)</div>
                </div>
              </div>

              <!-- Progress bar -->
              <div class="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80">
                <div class="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300" style="width: ${percent}%"></div>
              </div>

              <!-- Scheduled Issues in this Cycle -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
                ${cycleIssues.map(issue => `
                  <div
                    data-issue-id="${issue.id}"
                    class="plane-calendar-card p-2.5 rounded-lg bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 cursor-pointer transition-all flex items-center justify-between gap-2"
                  >
                    <div class="flex items-center gap-2 truncate">
                      <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${issue.state_color || '#71717a'}"></span>
                      <span class="text-[11px] font-mono font-medium text-zinc-400 shrink-0">${issue.id}</span>
                      <span class="text-xs text-zinc-200 truncate">${issue.title}</span>
                    </div>
                    <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 shrink-0">
                      ${issue.assignee_role}
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
