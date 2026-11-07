/**
 * ProjectCard Component
 * Tarjeta resumen de métricas operativas del proyecto / workspace.
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { Icons } from '../../../shared/ui/Icons.js';

export function ProjectCard({
  title = '',
  value = 0,
  subtitle = '',
  icon = 'activity',
  trend = '',
  colorClass = 'text-indigo-400',
  bgClass = 'bg-indigo-950/20 border-indigo-500/20'
} = {}) {
  const iconFn = Icons[icon] || Icons.activity;

  return `
    <div class="p-5 rounded-2xl border ${bgClass} flex flex-col justify-between space-y-4 shadow-sm hover:border-zinc-700 transition-all">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">${title}</span>
        <div class="p-2 rounded-xl bg-zinc-900 border border-zinc-800 ${colorClass}">
          ${iconFn('w-4 h-4')}
        </div>
      </div>
      <div>
        <div class="text-2xl font-bold font-mono tracking-tight text-zinc-100">${value}</div>
        ${subtitle ? `<p class="text-xs text-zinc-400 mt-1">${subtitle}</p>` : ''}
      </div>
      ${trend ? `
        <div class="pt-2 border-t border-zinc-800/60 flex items-center gap-1.5 text-[11px] text-zinc-400">
          <span class="text-emerald-400 font-semibold font-mono">${trend}</span>
          <span>vs ciclo anterior</span>
        </div>
      ` : ''}
    </div>
  `;
}
