import { Icons } from '../../shared/Icons.js';

export function renderModulesView({
  modules = [],
  issues = [],
  onSelectIssue = () => {}
}) {
  return `
    <div class="p-6 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 class="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
          ${Icons.moduleIcon('w-5 h-5 text-indigo-400')}
          <span>Módulos de Arquitectura & Bounded Contexts (Plane Modules)</span>
        </h1>
        <p class="text-xs text-zinc-400 mt-0.5">Agrupación modular de requerimientos y epics de arquitectura asignados a roles especializados.</p>
      </div>

      <!-- Module Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        ${modules.map(mod => {
          const modIssues = issues.filter(i => i.module_id === mod.id);
          const total = modIssues.length;
          const done = modIssues.filter(i => i.state_id === 'state-done').length;
          const inProgress = modIssues.filter(i => i.state_id === 'state-in-progress' || i.state_id === 'state-in-review').length;
          const percent = total > 0 ? Math.round((done / total) * 100) : 0;
          const isDone = done === total && total > 0;

          return `
            <div class="border border-zinc-800/80 rounded-2xl bg-zinc-950/70 p-5 space-y-4 hover:border-zinc-700/80 transition-all shadow-sm">
              <!-- Module Header -->
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400">
                    ${Icons.cube('w-5 h-5')}
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-zinc-100 tracking-tight">${mod.name}</h3>
                    <p class="text-[11px] text-zinc-400 line-clamp-1">${mod.description || ''}</p>
                  </div>
                </div>

                <span class="px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${isDone ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}">
                  ${isDone ? 'COMPLETADO' : 'EN DESARROLLO'}
                </span>
              </div>

              <!-- Lead Role & Counts -->
              <div class="flex items-center justify-between text-xs pt-1">
                <div class="flex items-center gap-1.5 text-zinc-400">
                  <span>Líder Técnico:</span>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-[11px] font-medium">
                    ${Icons.bot('w-3 h-3 text-indigo-400')}
                    <span>${mod.lead_role || 'leader'}</span>
                  </span>
                </div>

                <div class="font-mono text-xs text-zinc-300">
                  <span class="text-emerald-400 font-bold">${done}</span> de ${total} completadas
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="space-y-1">
                <div class="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80">
                  <div class="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300" style="width: ${percent}%"></div>
                </div>
                <div class="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>Progreso acumulado</span>
                  <span>${percent}%</span>
                </div>
              </div>

              <!-- Issues Mini List -->
              <div class="pt-2 border-t border-zinc-800/60 space-y-1.5 max-h-48 overflow-y-auto">
                ${modIssues.map(issue => `
                  <div
                    data-issue-id="${issue.id}"
                    class="plane-module-issue px-2.5 py-1.5 rounded-lg bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/40 hover:border-zinc-700/60 cursor-pointer flex items-center justify-between gap-2 text-xs transition-colors"
                  >
                    <div class="flex items-center gap-2 truncate">
                      <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${issue.state_color || '#71717a'}"></span>
                      <span class="font-mono font-medium text-zinc-400 text-[11px]">${issue.id}</span>
                      <span class="text-zinc-200 truncate">${issue.title}</span>
                    </div>
                    <span class="text-[10px] text-zinc-400 font-medium shrink-0 capitalize">
                      ${issue.priority || 'none'}
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
