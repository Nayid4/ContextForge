/**
 * Stats Summary Component (KPIs) con soporte de modo claro y oscuro
 */

export function renderStatsSummary(stats = {}) {
  const s = {
    total: stats.total || 0,
    featuresCount: stats.featuresCount || 0,
    bugfixesCount: stats.bugfixesCount || 0,
    pending: stats.pending || 0,
    specReady: stats.specReady || 0,
    inProgress: stats.inProgress || 0,
    done: stats.done || 0,
    blocked: stats.blocked || 0,
    percentage: stats.percentage || 0
  };

  const items = [
    {
      label: 'Total Tareas',
      value: s.total,
      sub: `${s.featuresCount} feat · ${s.bugfixesCount} fix`,
      color: 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-900 dark:text-slate-100'
    },
    {
      label: 'Pendientes',
      value: s.pending,
      sub: 'Por iniciar',
      color: 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300'
    },
    {
      label: 'Spec Listo',
      value: s.specReady,
      sub: 'Esperando aprobación',
      color: 'border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300'
    },
    {
      label: 'En Progreso',
      value: s.inProgress,
      sub: 'Implementando',
      color: 'border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300'
    },
    {
      label: 'Completados',
      value: s.done,
      sub: `${s.percentage}% del total`,
      color: 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300'
    },
    {
      label: 'Bloqueados',
      value: s.blocked,
      sub: 'Requieren atención',
      color: 'border-rose-200 dark:border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300'
    }
  ];

  return `
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      ${items.map(item => `
        <div class="p-4 rounded-2xl border ${item.color} shadow-sm backdrop-blur-md flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div class="text-[11px] uppercase tracking-wider font-semibold opacity-70 mb-1">${item.label}</div>
          <div class="text-2xl sm:text-3xl font-extrabold tracking-tight">${item.value}</div>
          <div class="text-[11px] opacity-60 mt-1 truncate">${item.sub}</div>
        </div>
      `).join('')}
    </div>
  `;
}
