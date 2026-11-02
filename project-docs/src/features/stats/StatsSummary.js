/**
 * Stats Summary Component (KPIs)
 */
import { store } from '../../core/store.js';

export function StatsSummary() {
  const stats = store.getStats();

  const container = document.createElement('div');
  container.className = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6';

  const items = [
    {
      label: 'Total Tareas',
      value: stats.total,
      sub: `${stats.featuresCount} feat · ${stats.bugfixesCount} fix`,
      color: 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'
    },
    {
      label: 'Pendientes',
      value: stats.pending,
      sub: 'Por iniciar',
      color: 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
    },
    {
      label: 'Spec Listo',
      value: stats.specReady,
      sub: 'Esperando aprobación',
      color: 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300'
    },
    {
      label: 'En Progreso',
      value: stats.inProgress,
      sub: 'Implementando',
      color: 'border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300'
    },
    {
      label: 'Completados',
      value: stats.done,
      sub: `${stats.percentage}% del total`,
      color: 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300'
    },
    {
      label: 'Bloqueados',
      value: stats.blocked,
      sub: 'Requieren atención',
      color: 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300'
    }
  ];

  container.innerHTML = items.map(item => `
    <div class="p-4 rounded-xl border ${item.color} shadow-xs flex flex-col justify-between transition-all hover:shadow-sm">
      <div class="text-xs uppercase tracking-wider font-semibold opacity-70 mb-1">${item.label}</div>
      <div class="text-2xl sm:text-3xl font-extrabold tracking-tight">${item.value}</div>
      <div class="text-xs opacity-60 mt-1 truncate">${item.sub}</div>
    </div>
  `).join('');

  return container;
}
