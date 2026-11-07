import { Icons } from '../../../shared/Icons.js';
import { renderList } from '../../../shared/utils/renderList.js';
import { BurnDownChart } from '../components/BurnDownChart.js';
import { CycleCard } from '../components/CycleCard.js';

export function renderCyclesView({
  cycles = [],
  issues = [],
  onSelectIssue = () => {}
}) {
  const activeCycle = cycles.find(c => c.status === 'active') || cycles[cycles.length - 1] || {};
  const activeIssues = issues.filter(i => i.cycle_id === activeCycle.id);

  const total = activeIssues.length;
  const done = activeIssues.filter(i => i.state_id === 'state-done').length;
  const inProgress = activeIssues.filter(i => i.state_id === 'state-in-progress' || i.state_id === 'state-in-review').length;
  const backlog = total - done - inProgress;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  // Datos para gráfico SVG Burn-down (6 puntos)
  const points = [
    { label: 'Día 1', remaining: total, ideal: total },
    { label: 'Día 4', remaining: Math.max(0, total - Math.round(done * 0.3)), ideal: Math.round(total * 0.8) },
    { label: 'Día 7', remaining: Math.max(0, total - Math.round(done * 0.6)), ideal: Math.round(total * 0.6) },
    { label: 'Día 10', remaining: Math.max(0, total - done), ideal: Math.round(total * 0.4) },
    { label: 'Día 14', remaining: Math.max(0, total - done), ideal: 0 }
  ];

  const svgWidth = 600;
  const svgHeight = 160;
  const padding = 30;

  const maxVal = Math.max(total, 5);
  const getX = (idx) => padding + (idx * ((svgWidth - (padding * 2)) / (points.length - 1)));
  const getY = (val) => svgHeight - padding - ((val / maxVal) * (svgHeight - (padding * 2)));

  const idealPath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.ideal)}`).join(' ');
  const realPath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.remaining)}`).join(' ');

  return `
    <div class="p-6 space-y-8 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            ${Icons.cycle('w-5 h-5 text-indigo-400')}
            <span>Ciclos de Desarrollo (Sprints Plane)</span>
          </h2>
          <p class="text-xs text-zinc-400 mt-0.5">Seguimiento temporal de iteraciones ágiles, burn-down y velocidad de entrega.</p>
        </div>
      </div>

      <!-- Active Cycle Hero Card -->
      <div class="border border-indigo-500/30 rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900/60 to-indigo-950/20 p-6 space-y-6 shadow-xl">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2.5">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 class="text-base font-bold text-white tracking-tight">${activeCycle.name || 'Ciclo Activo'}</h2>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-semibold">
                ACTIVO
              </span>
            </div>
            <p class="text-xs text-zinc-400 max-w-xl">${activeCycle.description || ''}</p>
          </div>

          <div class="flex items-center gap-6">
            <div class="text-right">
              <span class="text-[11px] text-zinc-400 uppercase font-semibold">Rango del Ciclo</span>
              <div class="text-xs font-mono font-bold text-zinc-200 mt-0.5">${activeCycle.start_date || 'N/A'} al ${activeCycle.end_date || 'N/A'}</div>
            </div>
            <div class="text-right">
              <span class="text-[11px] text-zinc-400 uppercase font-semibold">Progreso</span>
              <div class="text-xs font-mono font-bold text-emerald-400 mt-0.5">${percent}%</div>
            </div>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center space-y-1">
            <span class="text-[11px] text-zinc-400">Total Tareas</span>
            <div class="text-lg font-bold text-zinc-100 font-mono">${total}</div>
          </div>
          <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center space-y-1">
            <span class="text-[11px] text-emerald-400">Completadas</span>
            <div class="text-lg font-bold text-emerald-400 font-mono">${done}</div>
          </div>
          <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center space-y-1">
            <span class="text-[11px] text-amber-400">En Progreso</span>
            <div class="text-lg font-bold text-amber-400 font-mono">${inProgress}</div>
          </div>
          <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center space-y-1">
            <span class="text-[11px] text-zinc-400">Pendientes</span>
            <div class="text-lg font-bold text-zinc-400 font-mono">${backlog}</div>
          </div>
        </div>

        <!-- Interactive SVG Burn-down Chart Component -->
        ${BurnDownChart({
          points,
          svgWidth,
          svgHeight,
          padding,
          maxVal,
          idealPath,
          realPath,
          getX,
          getY
        })}
      </div>

      <!-- All Cycles List -->
      <div class="space-y-4">
        <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Historial de Ciclos (${cycles.length})</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${renderList(cycles, c => CycleCard({ cycle: c, issues }))}
        </div>
      </div>
    </div>
  `;
}
