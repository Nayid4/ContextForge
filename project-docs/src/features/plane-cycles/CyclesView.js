import { Icons } from '../../shared/Icons.js';

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

  // Datos para gráfico SVG Burn-down
  // 6 puntos temporales
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
          <h1 class="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            ${Icons.cycle('w-5 h-5 text-indigo-400')}
            <span>Ciclos de Desarrollo (Sprints Plane)</span>
          </h1>
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
              <div class="text-xs font-mono font-bold text-zinc-200 mt-0.5">${activeCycle.start_date} al ${activeCycle.end_date}</div>
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

        <!-- Interactive SVG Burn-down Chart -->
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
              ${points.map((p, idx) => `
                <circle cx="${getX(idx)}" cy="${getY(p.remaining)}" r="4" fill="#818cf8" stroke="#1e1b4b" stroke-width="2"/>
                <text x="${getX(idx)}" y="${svgHeight - 8}" font-size="9" fill="#71717a" text-anchor="middle" font-family="monospace">${p.label}</text>
              `).join('')}
            </svg>
          </div>
        </div>
      </div>

      <!-- All Cycles Accordion -->
      <div class="space-y-4">
        <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Historial y Próximos Ciclos</h3>

        <div class="space-y-3">
          ${cycles.map(c => {
            const cIssues = issues.filter(i => i.cycle_id === c.id);
            const cTotal = cIssues.length;
            const cDone = cIssues.filter(i => i.state_id === 'state-done').length;
            const cPercent = cTotal > 0 ? Math.round((cDone / cTotal) * 100) : 0;

            return `
              <div class="border border-zinc-800/80 rounded-xl bg-zinc-950/60 p-4 space-y-3">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                      ${Icons.cycle('w-4 h-4')}
                    </div>
                    <div>
                      <h4 class="text-xs font-bold text-zinc-200">${c.name}</h4>
                      <p class="text-[11px] text-zinc-400">${c.description || ''}</p>
                    </div>
                  </div>

                  <div class="flex items-center gap-4 text-xs font-mono">
                    <span class="text-zinc-400">${c.start_date} al ${c.end_date}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${c.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : (c.status === 'active' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30' : 'bg-zinc-800 text-zinc-400')}">
                      ${c.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div class="space-y-1">
                  <div class="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>${cDone} de ${cTotal} tareas completadas</span>
                    <span>${cPercent}%</span>
                  </div>
                  <div class="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80">
                    <div class="h-full bg-emerald-500 rounded-full" style="width: ${cPercent}%"></div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}
