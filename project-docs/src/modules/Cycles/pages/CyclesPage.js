/**
 * CyclesPage Component (Master View for Cycles Domain)
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { Icons } from '../../../shared/ui/Icons.js';
import { BurnDownChart } from '../components/BurnDownChart.js';
import { CycleList } from '../components/CycleList.js';
import { cycleService } from '../services/cycle.service.js';

export function CyclesPage({
  cycles = [],
  issues = []
} = {}) {
  const activeCycle = cycles.find(c => c.status === 'active') || cycles[cycles.length - 1] || {};
  const metrics = cycleService.calculateCycleMetrics(activeCycle, issues);
  const points = cycleService.calculateBurnDownPoints(activeCycle, issues);

  return `
    <div class="flex-1 flex flex-col bg-zinc-950 overflow-y-auto">
      <div class="p-6 space-y-8 max-w-7xl mx-auto w-full">
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
                <h3 class="text-base font-bold text-white tracking-tight">${activeCycle.name || 'Ciclo Activo'}</h3>
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
                <div class="text-xs font-mono font-bold text-emerald-400 mt-0.5">${metrics.done}/${metrics.total} (${metrics.percent}%)</div>
              </div>
            </div>
          </div>

          <!-- Burn-down Chart Component -->
          <div class="bg-zinc-950/70 p-4 rounded-xl border border-zinc-800/80 space-y-3">
            <div class="flex items-center justify-between text-xs">
              <span class="font-semibold text-zinc-300">Gráfico de Burn-down de Tareas</span>
              <div class="flex items-center gap-4 text-[11px] text-zinc-400">
                <span class="flex items-center gap-1.5">
                  <span class="w-3 h-0.5 bg-zinc-500 border-dashed inline-block"></span>
                  <span>Línea Ideal</span>
                </span>
                <span class="flex items-center gap-1.5">
                  <span class="w-3 h-0.5 bg-indigo-500 inline-block"></span>
                  <span>Avance Real</span>
                </span>
              </div>
            </div>

            ${BurnDownChart({ points })}
          </div>
        </div>

        <!-- All Sprints / Cycles Section -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-zinc-100 uppercase tracking-wider">Historial de Ciclos (${cycles.length})</h3>
            <span class="text-xs font-mono text-zinc-400">Sprints & Entregas</span>
          </div>

          ${CycleList({
            cycles,
            issues,
            activeCycleId: activeCycle.id,
            calculateMetrics: (c, iss) => cycleService.calculateCycleMetrics(c, iss)
          })}
        </div>
      </div>
    </div>
  `;
}
