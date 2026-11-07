import { Icons } from '../../../shared/Icons.js';
import { renderList } from '../../../shared/utils/renderList.js';

export function ModuleCard({ module, issues = [] }) {
  const modIssues = issues.filter(i => i.module_id === module.id || i.module_name === module.name);
  const total = modIssues.length;
  const done = modIssues.filter(i => i.state_id === 'state-done').length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return `
    <div class="border border-zinc-800 rounded-2xl bg-zinc-950/60 p-5 space-y-4 hover:border-zinc-700 transition-all shadow-md hover:shadow-xl">
      <!-- Module Header -->
      <div class="flex items-start justify-between gap-3">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full ${percent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'} shrink-0"></span>
            <h3 class="text-sm font-bold text-zinc-100 tracking-tight">${module.name}</h3>
          </div>
          <p class="text-xs text-zinc-400 line-clamp-2">${module.description || 'Módulo de arquitectura'}</p>
        </div>

        <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
          percent === 100
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
            : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
        }">
          ${percent}% OK
        </span>
      </div>

      <!-- Progress Bar -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <span>${done} de ${total} requerimientos</span>
          <span class="font-bold text-zinc-300">${percent}%</span>
        </div>
        <div class="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300" style="width: ${percent}%"></div>
        </div>
      </div>

      <!-- Associated Tasks Summary -->
      ${total > 0 ? `
        <div class="pt-2 border-t border-zinc-800/60 space-y-1.5">
          <span class="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Tareas Vinculadas</span>
          <div class="space-y-1">
            ${renderList(modIssues.slice(0, 3), i => `
              <div data-issue-id="${i.id}" class="plane-issue-row flex items-center justify-between p-1.5 rounded hover:bg-zinc-900 cursor-pointer text-xs">
                <span class="font-mono text-indigo-400 shrink-0 text-[11px]">${i.id}</span>
                <span class="text-zinc-300 truncate max-w-[200px] text-[11px]">${i.title}</span>
                <span class="text-[10px] text-zinc-500 font-mono">${i.state_name || i.state_id}</span>
              </div>
            `)}
            ${total > 3 ? `
              <div class="text-[10px] text-zinc-500 text-center pt-1">+${total - 3} tareas más en este módulo</div>
            ` : ''}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}
