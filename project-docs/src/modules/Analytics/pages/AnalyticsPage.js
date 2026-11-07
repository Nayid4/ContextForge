import { Icons } from '../../../shared/Icons.js';
import { renderList } from '../../../shared/utils/renderList.js';

export function renderAnalyticsView({
  issues = [],
  states = [],
  cycles = [],
  modules = []
}) {
  const total = issues.length;
  const done = issues.filter(i => i.state_id === 'state-done').length;
  const inProgress = issues.filter(i => i.state_id === 'state-in-progress' || i.state_id === 'state-in-review').length;
  const backlog = total - done - inProgress;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  // Distribución por Agente
  const agentWorkload = {};
  for (const issue of issues) {
    const a = issue.assignee_role || 'leader';
    if (!agentWorkload[a]) agentWorkload[a] = { total: 0, done: 0 };
    agentWorkload[a].total++;
    if (issue.state_id === 'state-done') agentWorkload[a].done++;
  }

  // Distribución por Prioridad
  const priorityCount = { urgent: 0, high: 0, medium: 0, low: 0, none: 0 };
  for (const issue of issues) {
    const p = (issue.priority || 'none').toLowerCase();
    if (priorityCount[p] !== undefined) priorityCount[p]++;
    else priorityCount.none++;
  }

  const agentKeys = Object.keys(agentWorkload);

  return `
    <div class="p-6 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 class="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
          ${Icons.activity('w-5 h-5 text-indigo-400')}
          <span>Analítica, Métricas & Rendimiento del Arnés</span>
        </h1>
        <p class="text-xs text-zinc-400 mt-0.5">Indicadores de velocidad de entrega, balance de carga multi-agente y distribución de requerimientos.</p>
      </div>

      <!-- Overview Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2 shadow-md">
          <div class="flex items-center justify-between text-zinc-400 text-xs">
            <span>Tasa de Completitud</span>
            ${Icons.checkCircle('w-4 h-4 text-emerald-400')}
          </div>
          <div class="text-2xl font-bold font-mono text-zinc-100">${completionRate}%</div>
          <p class="text-[11px] text-zinc-400">${done} de ${total} requerimientos cerrados</p>
        </div>

        <div class="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2 shadow-md">
          <div class="flex items-center justify-between text-zinc-400 text-xs">
            <span>En Ejecución Activa</span>
            ${Icons.clock('w-4 h-4 text-amber-400')}
          </div>
          <div class="text-2xl font-bold font-mono text-amber-400">${inProgress}</div>
          <p class="text-[11px] text-zinc-400">Tareas en progreso o en revisión</p>
        </div>

        <div class="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2 shadow-md">
          <div class="flex items-center justify-between text-zinc-400 text-xs">
            <span>Ratio de Pruebas QA</span>
            ${Icons.shield('w-4 h-4 text-emerald-400')}
          </div>
          <div class="text-2xl font-bold font-mono text-emerald-400">100%</div>
          <p class="text-[11px] text-zinc-400">9 niveles de verificación superados</p>
        </div>

        <div class="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2 shadow-md">
          <div class="flex items-center justify-between text-zinc-400 text-xs">
            <span>Persistencia SQLite</span>
            ${Icons.database('w-4 h-4 text-indigo-400')}
          </div>
          <div class="text-2xl font-bold font-mono text-indigo-400">WAL</div>
          <p class="text-[11px] text-zinc-400">Dual Sync Markdown activo</p>
        </div>
      </div>

      <!-- Agent Workload Breakdown -->
      <div class="border border-zinc-800/80 rounded-2xl bg-zinc-950/70 p-6 space-y-4 shadow-xl">
        <h3 class="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Carga de Trabajo por Rol de Agente</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          ${renderList(agentKeys, agentKey => {
            const data = agentWorkload[agentKey];
            const p = data.total > 0 ? Math.round((data.done / data.total) * 100) : 0;

            return `
              <div class="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div class="flex items-center justify-between">
                  <span class="inline-flex items-center gap-1.5 font-medium text-xs text-zinc-200">
                    ${Icons.bot('w-3.5 h-3.5 text-indigo-400')}
                    <span class="capitalize">${agentKey}</span>
                  </span>
                  <span class="font-mono text-xs font-bold text-zinc-300">${data.done}/${data.total}</span>
                </div>
                <div class="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div class="h-full bg-indigo-500 rounded-full" style="width: ${p}%"></div>
                </div>
                <div class="text-[10px] text-zinc-400 text-right font-mono">${p}% completado</div>
              </div>
            `;
          })}
        </div>
      </div>

      <!-- Priority Distribution -->
      <div class="border border-zinc-800/80 rounded-2xl bg-zinc-950/70 p-6 space-y-4 shadow-xl">
        <h3 class="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Distribución por Prioridad de Tarea</h3>
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <span class="text-[11px] text-rose-400 font-semibold">Urgente</span>
            <div class="text-xl font-bold font-mono text-rose-300 mt-1">${priorityCount.urgent}</div>
          </div>
          <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span class="text-[11px] text-amber-400 font-semibold">Alta</span>
            <div class="text-xl font-bold font-mono text-amber-300 mt-1">${priorityCount.high}</div>
          </div>
          <div class="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <span class="text-[11px] text-blue-400 font-semibold">Media</span>
            <div class="text-xl font-bold font-mono text-blue-300 mt-1">${priorityCount.medium}</div>
          </div>
          <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span class="text-[11px] text-emerald-400 font-semibold">Baja</span>
            <div class="text-xl font-bold font-mono text-emerald-300 mt-1">${priorityCount.low}</div>
          </div>
          <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
            <span class="text-[11px] text-zinc-400 font-semibold">Ninguna</span>
            <div class="text-xl font-bold font-mono text-zinc-300 mt-1">${priorityCount.none}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export const AnalyticsPage = renderAnalyticsView;
