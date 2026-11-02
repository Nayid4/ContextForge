/**
 * Current Active Spec Tracker Card Component
 */
import { store } from '../../core/store.js';
import { Badge } from '../../shared/Badge.js';
import { Icons } from '../../shared/Icons.js';
import { openFeatureModal } from '../../shared/Modal.js';

export function CurrentSpecCard() {
  const { currentSpec, features } = store.getState();
  const hasSpec = currentSpec && currentSpec.feature && currentSpec.feature.name;

  const card = document.createElement('div');
  card.className = 'mb-6';

  if (!hasSpec) {
    card.innerHTML = `
      <div class="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
          <div>
            <div class="text-xs uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider">Spec Activo de la IA</div>
            <div class="text-sm text-slate-500 dark:text-slate-400">No hay ninguna tarea en proceso en este momento.</div>
          </div>
        </div>
        <span class="text-xs text-slate-400 dark:text-slate-600 font-mono">IDLE</span>
      </div>
    `;
    return card;
  }

  const specFeature = currentSpec.feature;
  const match = features.find(f => f.id === specFeature.id) || specFeature;
  const tasks = currentSpec.tasks || [];
  const completedTasks = tasks.filter(t => t.done).length;
  const totalTasks = tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const branchName = match.branch || `${match.type || 'feature'}/INT-${String(match.id).padStart(3, '0')}/${match.name}`;

  card.innerHTML = `
    <article class="p-5 rounded-xl border-2 border-blue-500/80 dark:border-blue-500 bg-white dark:bg-slate-900 shadow-md hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden" id="current-spec-trigger">
      <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
      
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div class="flex items-center gap-2">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
          <span class="text-xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">Spec Activo de la IA</span>
          ${Badge({ type: 'type', value: match.type || 'feature' })}
          ${Badge({ type: 'status', value: 'in_progress' })}
        </div>
        
        <div class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span>Ejecutado por: <strong class="text-slate-800 dark:text-slate-200">${currentSpec.responsable || 'leader'}</strong></span>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div class="space-y-1 max-w-2xl">
          <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            #${specFeature.id || match.id} — ${specFeature.title || match.title || specFeature.name}
          </h3>
          <p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
            ${match.description || 'En desarrollo por el agente implementer.'}
          </p>
          <div class="flex items-center gap-2 pt-1">
            <span class="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              ${branchName}
            </span>
            ${match.module ? Badge({ type: 'module', value: match.module }) : ''}
            ${match.priority ? Badge({ type: 'priority', value: match.priority }) : ''}
          </div>
        </div>

        <div class="sm:min-w-44 text-right">
          <div class="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Progreso de Tareas: ${completedTasks}/${totalTasks}
          </div>
          <div class="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
            <div class="bg-blue-600 h-full rounded-full transition-all duration-500" style="width: ${progressPercent}%"></div>
          </div>
          <div class="text-xs text-slate-400 dark:text-slate-500 mt-1.5 flex items-center justify-end gap-1">
            <span>Haz clic para ver detalles</span>
            <span class="group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </div>
      </div>
    </article>
  `;

  card.querySelector('#current-spec-trigger')?.addEventListener('click', () => {
    openFeatureModal({ ...match, tasks, _isCurrentSpec: true });
  });

  return card;
}
