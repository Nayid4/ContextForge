import { renderBadge } from '../../shared/Badge.js';
import { Icons } from '../../shared/Icons.js';

/**
 * DependencyGraph: Matriz interactiva de dependencias, bloqueos y ruta crítica.
 * @param {Object} props
 * @param {Array} props.features - Todas las features
 * @param {Function} props.onSelect - Callback al clickear una feature
 * @returns {string} HTML markup
 */
export function renderDependencyGraph({ features }) {
  if (!features || features.length === 0) {
    return `<div class="p-8 text-center text-slate-500">No hay datos de dependencias disponibles.</div>`;
  }

  // Mapa de features por ID para resolución rápida
  const featureMap = new Map();
  features.forEach(f => featureMap.set(f.id, f));

  // Análisis de dependencias
  const analyzed = features.map(f => {
    const deps = (f.depends_on || []).map(depId => featureMap.get(depId)).filter(Boolean);
    const pendingDeps = deps.filter(d => d.status !== 'done');
    const isBlocked = f.status !== 'done' && pendingDeps.length > 0;
    const isReady = f.status === 'pending' && pendingDeps.length === 0;

    return {
      feature: f,
      deps,
      pendingDeps,
      isBlocked,
      isReady,
      dependents: features.filter(other => (other.depends_on || []).includes(f.id))
    };
  });

  const blockedCount = analyzed.filter(a => a.isBlocked).length;
  const readyCount = analyzed.filter(a => a.isReady).length;
  const doneCount = analyzed.filter(a => a.feature.status === 'done').length;

  const cardsHtml = analyzed.map(({ feature, deps, pendingDeps, isBlocked, isReady, dependents }) => {
    const branchName = feature.branch || `${feature.type || 'feature'}/INT-${String(feature.id).padStart(3, '0')}/${feature.name}`;
    
    let borderStatus = 'border-slate-800';
    let statusPill = '';
    if (feature.status === 'done') {
      borderStatus = 'border-emerald-500/40 bg-emerald-950/10';
      statusPill = `<span class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-emerald-500/20 text-emerald-300 uppercase">Completada</span>`;
    } else if (isBlocked) {
      borderStatus = 'border-rose-500/50 bg-rose-950/10';
      statusPill = `<span class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-rose-500/20 text-rose-300 uppercase">Bloqueada (${pendingDeps.length})</span>`;
    } else if (isReady) {
      borderStatus = 'border-cyan-500/50 bg-cyan-950/10 shadow-lg shadow-cyan-950/30';
      statusPill = `<span class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-cyan-500/20 text-cyan-300 uppercase">Lista para iniciar</span>`;
    } else {
      borderStatus = 'border-indigo-500/40 bg-indigo-950/10';
      statusPill = `<span class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-indigo-500/20 text-indigo-300 uppercase">${feature.status}</span>`;
    }

    // Chips de requerimientos previos (dependencias)
    const depsHtml = deps.length > 0 ? `
      <div class="mt-3 pt-3 border-t border-slate-800/80">
        <div class="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
          <span>Depende de (${deps.length}):</span>
          ${isBlocked ? '<span class="text-rose-400 font-normal">Faltan predecesores</span>' : '<span class="text-emerald-400 font-normal">Requisitos listos</span>'}
        </div>
        <div class="flex flex-wrap gap-1.5">
          ${deps.map(dep => {
            const isDepDone = dep.status === 'done';
            return `
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono ${
                isDepDone 
                  ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/60' 
                  : 'bg-rose-950/50 text-rose-300 border border-rose-800/60'
              }">
                <span>${isDepDone ? '✓' : '✗'}</span>
                <span>INT-${String(dep.id).padStart(3, '0')}</span>
              </span>
            `;
          }).join('')}
        </div>
      </div>
    ` : `
      <div class="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 italic">
        Sin dependencias previas (Nodo raíz)
      </div>
    `;

    // Dependientes (quién depende de esta feature)
    const dependentsHtml = dependents.length > 0 ? `
      <div class="mt-2 text-[11px] text-slate-400">
        <span class="text-slate-500">Desbloquea:</span>
        <span class="font-mono text-slate-300">${dependents.map(d => `INT-${String(d.id).padStart(3, '0')}`).join(', ')}</span>
      </div>
    ` : '';

    return `
      <div class="rounded-2xl border ${borderStatus} p-4 transition-all hover:scale-[1.01] hover:border-slate-700 bg-slate-900/60 backdrop-blur-md flex flex-col justify-between">
        <div>
          <!-- Header Card -->
          <div class="flex items-center justify-between gap-2 mb-2">
            <div class="flex items-center gap-2">
              <span class="font-mono text-xs font-bold text-indigo-400">INT-${String(feature.id).padStart(3, '0')}</span>
              ${renderBadge('type', feature.type || 'feature')}
            </div>
            ${statusPill}
          </div>

          <!-- Title -->
          <h4 class="font-semibold text-slate-100 text-sm mb-1 line-clamp-2">
            ${feature.title || feature.name}
          </h4>

          <!-- Branch -->
          <div class="font-mono text-[11px] text-slate-400 truncate mb-2" title="${branchName}">
            <span class="text-indigo-400">${Icons.gitBranch}</span> ${branchName}
          </div>

          <!-- Badges Module & Priority -->
          <div class="flex items-center gap-2 mb-2">
            ${renderBadge('module', feature.module || 'Core')}
            ${renderBadge('priority', feature.priority || 'P2')}
          </div>
        </div>

        <div>
          ${depsHtml}
          ${dependentsHtml}

          <div class="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-end">
            <button type="button" 
                    data-action="view-detail" 
                    data-id="${feature.id}" 
                    class="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all">
              Ver detalle
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="space-y-6">
      <!-- Resumen de estado de dependencias -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <div class="text-xs text-slate-400">Tareas listas para ejecutar</div>
            <div class="text-2xl font-bold text-cyan-400 mt-0.5">${readyCount}</div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            ${Icons.check}
          </div>
        </div>

        <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <div class="text-xs text-slate-400">Tareas bloqueadas</div>
            <div class="text-2xl font-bold text-rose-400 mt-0.5">${blockedCount}</div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            ${Icons.clock}
          </div>
        </div>

        <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <div class="text-xs text-slate-400">Completadas en el grafo</div>
            <div class="text-2xl font-bold text-emerald-400 mt-0.5">${doneCount}</div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            ${Icons.checkCircle}
          </div>
        </div>
      </div>

      <!-- Grid de Nodos de Dependencia -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${cardsHtml}
      </div>
    </div>
  `;
}
