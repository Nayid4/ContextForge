import { renderList } from '../../../shared/utils/renderList.js';

export function BurnDownChart({
  points = [],
  svgWidth = 600,
  svgHeight = 160,
  padding = 30,
  maxVal = 10,
  idealPath = '',
  realPath = '',
  getX = () => 0,
  getY = () => 0
}) {
  return `
    <div class="space-y-2 pt-2">
      <div class="flex items-center justify-between text-xs text-zinc-400">
        <span class="font-medium text-zinc-300">Gráfico de Burn-down de Tareas</span>
        <div class="flex items-center gap-4 text-[11px]">
          <span class="flex items-center gap-1.5"><span class="w-3 h-0.5 bg-zinc-600 border-dashed"></span> Ideal</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-0.5 bg-indigo-400"></span> Real</span>
        </div>
      </div>

      <div class="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 overflow-x-auto">
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="w-full h-40 max-w-full">
          <!-- Grid lines -->
          <line x1="${padding}" y1="${getY(0)}" x2="${svgWidth - padding}" y2="${getY(0)}" stroke="#27272a" stroke-width="1"/>
          <line x1="${padding}" y1="${getY(maxVal / 2)}" x2="${svgWidth - padding}" y2="${getY(maxVal / 2)}" stroke="#27272a" stroke-width="1" stroke-dasharray="2 2"/>
          <line x1="${padding}" y1="${getY(maxVal)}" x2="${svgWidth - padding}" y2="${getY(maxVal)}" stroke="#27272a" stroke-width="1"/>

          <!-- Ideal Line (Dashed) -->
          <path d="${idealPath}" fill="none" stroke="#52525b" stroke-width="2" stroke-dasharray="4 4"/>

          <!-- Real Line -->
          <path d="${realPath}" fill="none" stroke="#818cf8" stroke-width="2.5" stroke-linecap="round"/>

          <!-- Points -->
          ${renderList(points, (p, idx) => `
            <circle cx="${getX(idx)}" cy="${getY(p.remaining)}" r="4" fill="#818cf8" stroke="#1e1b4b" stroke-width="2"/>
            <text x="${getX(idx)}" y="${svgHeight - 8}" font-size="9" fill="#71717a" text-anchor="middle" font-family="monospace">${p.label}</text>
          `)}
        </svg>
      </div>
    </div>
  `;
}
