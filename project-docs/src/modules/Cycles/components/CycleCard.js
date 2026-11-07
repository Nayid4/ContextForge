/**
 * CycleCard Component
 * Tarjeta de visualización de sprint / ciclo de desarrollo.
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { Icons } from '../../../shared/ui/Icons.js';

export function CycleCard({
  cycle = {},
  metrics = {},
  isActive = false
} = {}) {
  const percent = metrics.percent || 0;
  const total = metrics.total || 0;
  const done = metrics.done || 0;

  const isCompleted = cycle.status === 'completed';
  const statusBadge = isCompleted
    ? '<span class="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono text-[10px] font-semibold">FINALIZADO</span>'
    : '<span class="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-semibold">ACTIVO</span>';

  return `
    <div class="p-5 rounded-2xl border ${isActive ? 'border-indigo-500/40 bg-zinc-900/60 shadow-lg' : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'} space-y-4 transition-all">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          ${Icons.cycle('w-4 h-4 text-indigo-400')}
          <h4 class="text-sm font-bold text-zinc-200 tracking-tight">${cycle.name || 'Ciclo'}</h4>
        </div>
        ${statusBadge}
      </div>

      <p class="text-xs text-zinc-400 line-clamp-2">${cycle.description || 'Sin descripción para este ciclo.'}</p>

      <div class="space-y-2 pt-2 border-t border-zinc-800/60 text-xs">
        <div class="flex items-center justify-between text-zinc-400">
          <span>Avance de entrega</span>
          <span class="font-mono font-bold text-zinc-200">${done}/${total} tareas (${percent}%)</span>
        </div>
        <div class="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
          <div class="h-full bg-indigo-500 rounded-full transition-all duration-300" style="width: ${percent}%"></div>
        </div>
      </div>

      <div class="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
        <span>${cycle.start_date || 'N/A'}</span>
        <span>${cycle.end_date || 'N/A'}</span>
      </div>
    </div>
  `;
}
