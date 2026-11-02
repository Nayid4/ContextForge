import { renderBadge } from '../../shared/Badge.js';
import { Icons } from '../../shared/Icons.js';

/**
 * DependencyGraph: Matriz interactiva de dependencias, bloqueos y ruta crítica con soporte claro/oscuro.
 * @param {Object} props
 * @param {Array} props.features - Todas las features
 * @param {Function} props.onSelect - Callback al clickear una feature
 * @returns {string} HTML markup
 */
export function renderDependencyGraph({ features }) {
  if (!features || features.length === 0) {
    return `<div class="p-8 text-center text-slate-500">No hay datos de dependencias disponibles.</div>`;
  }

  const featureMap = new Map();
  features.forEach(f => featureMap.set(f.id, f));

  const analyzed = features.map(f => {
    const rawDeps = f.depends_on || f.dependencies || [];
    const deps = rawDeps.map(depId => featureMap.get(depId)).filter(Boolean);
    const pendingDeps = deps.filter(d => d.status !== 'done');
    const isBlocked = f.status !== 'done' && pendingDeps.length > 0;
    const isReady = f.status === 'pending' && pendingDeps.length === 0;

    return {
      feature: f,
      deps,
      pendingDeps,
      isBlocked,
      isReady,
      dependents: features.filter(other => {
        const otherDeps = other.depends_on || other.dependencies || [];
        return otherDeps.includes(f.id);
      })
    };
  });

  const blockedCount = analyzed.filter(a => a.isBlocked).length;
  const readyCount = analyzed.filter(a => a.isReady).length;
  const doneCount = analyzed.filter(a => a.feature.status === 'done').length;

  const cardsHtml = analyzed.map(({ feature, deps, pendingDeps, isBlocked, isReady, dependents }) => {
    const branchName = feature.branch || `${feature.type || 'feature'}/INT-${String(feature.id).padStart(3, '0')}/${feature.name}`;
    
    let borderStatus = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60';
    let statusPill = '';
    if (feature.status === 'done') {
      borderStatus = 'border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/10';
      statusPill = `<span class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 uppercase">Completada</span>`;
    } else if (isBlocked) {
      borderStatus = 'border-rose-300 dark:border-rose-500/50 bg-rose-50/40 dark:bg-rose-950/10';
      statusPill = `<span class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 uppercase">Bloqueada (${pendingDeps.length})</span>`;
    } else if (isReady) {
      borderStatus = 'border-cyan-300 dark:border-cyan-500/50 bg-cyan-50/40 dark:bg-cyan-950/10 shadow-sm';
      statusPill = `<span class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 uppercase">Lista para iniciar</span>`;
    } else {
      borderStatus = 'border-indigo-300 dark:border-indigo-500/40 bg-indigo-50/40 dark:bg-indigo-950/10';
      statusPill = `<span class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 uppercase">${feature.status}</span>`;
    }

    const depsHtml = deps.length > 0 ? `
      <div class="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80">
        <div class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
          <span>Depende de (${deps.length}):</span>
          ${isBlocked ? '<span class="text-rose-600 dark:text-rose-400 font-normal">Faltan predecesores</span>' : '<span class="text-emerald-600 dark:text-emerald-400 font-normal">Requisitos listos</span>'}
        </div>
        <div class="flex flex-wrap gap-1.5">
          ${deps.map(dep => {
            const isDepDone = dep.status === 'done';
            return `
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono ${
                isDepDone 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60' 
                  : 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60'
              }">
                <span>${isDepDone ? '✓' : '✗'}</span>
                <span>INT-${String(dep.id).padStart(3, '0')}</span>
              </span>
            `;
          }).join('')}
        </div>
      </div>
    ` : `
      <div class="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-400 dark:text-slate-500 italic">
        Sin dependencias previas (Nodo raíz)
      </div>
    `;

    const dependentsHtml = dependents.length > 0 ? `
      <div class="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
        <span class="text-slate-400 dark:text-slate-500">Desbloquea:</span>
        <span class="font-mono text-slate-700 dark:text-slate-300">${dependents.map(d => `INT-${String(d.id).padStart(3, '0')}`).join(', ')}</span>
      </div>
    ` : '';

    return `
      <div class="rounded-2xl border ${borderStatus} p-4 transition-all hover:scale-[1.01] hover:shadow-md backdrop-blur-md flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <div class="flex items-center gap-2">
              <span class="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">INT-${String(feature.id).padStart(3, '0')}</span>
              ${renderBadge('type', feature.type || 'feature')}
            </div>
            ${statusPill}
          </div>

          <h4 class="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1 line-clamp-2">
            ${feature.title || feature.name}
          </h4>

          <div class="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate mb-2" title="${branchName}">
            <span class="text-indigo-600 dark:text-indigo-400 inline-block align-middle">${Icons.gitBranch}</span> ${branchName}
          </div>

          <div class="flex items-center gap-2 mb-2">
            ${renderBadge('module', feature.module || 'Core')}
            ${renderBadge('priority', feature.priority || 'P2')}
          </div>
        </div>

        <div>
          ${depsHtml}
          ${dependentsHtml}

          <div class="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-end">
            <button type="button" 
                    data-action="view-detail" 
                    data-id="${feature.id}" 
                    class="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-all cursor-pointer">
              Ver detalle
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div class="text-xs text-slate-500 dark:text-slate-400">Tareas listas para ejecutar</div>
            <div class="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">${readyCount}</div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            ${Icons.check}
          </div>
        </div>

        <div class="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div class="text-xs text-slate-500 dark:text-slate-400">Tareas bloqueadas</div>
            <div class="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">${blockedCount}</div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            ${Icons.clock}
          </div>
        </div>

        <div class="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div class="text-xs text-slate-500 dark:text-slate-400">Completadas en el grafo</div>
            <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">${doneCount}</div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            ${Icons.checkCircle}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${cardsHtml}
      </div>
    </div>
  `;
}
