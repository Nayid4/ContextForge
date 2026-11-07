import { Icons } from '../../../shared/Icons.js';

export function CycleCard({ cycle, issues = [] }) {
  const cycleIssues = issues.filter(i => i.cycle_id === cycle.id);
  const total = cycleIssues.length;
  const done = cycleIssues.filter(i => i.state_id === 'state-done').length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const isActive = cycle.status === 'active';

  return `
    <div class="p-4 rounded-xl border ${isActive ? 'border-indigo-500/30 bg-indigo-950/10' : 'border-zinc-800 bg-zinc-900/40'} space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'}"></span>
          <span class="text-xs font-bold text-zinc-100">${cycle.name}</span>
          ${isActive ? `
            <span class="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[10px] font-semibold">ACTIVO</span>
          ` : `
            <span class="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px]">CERRADO</span>
          `}
        </div>

        <div class="text-xs font-mono text-zinc-400">
          <span>${cycle.start_date || 'N/A'} al ${cycle.end_date || 'N/A'}</span>
        </div>
      </div>

      <p class="text-xs text-zinc-400 line-clamp-2">${cycle.description || ''}</p>

      <!-- Progress Bar -->
      <div class="space-y-1">
        <div class="flex justify-between text-[11px] font-mono text-zinc-400">
          <span>${done}/${total} tareas completadas</span>
          <span class="${percent === 100 ? 'text-emerald-400' : 'text-zinc-300'} font-bold">${percent}%</span>
        </div>
        <div class="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div class="h-full bg-indigo-500 rounded-full" style="width: ${percent}%"></div>
        </div>
      </div>
    </div>
  `;
}
