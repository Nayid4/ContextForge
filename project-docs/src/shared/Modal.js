/**
 * Accessible Detail Modal Component
 */
import { Badge } from './Badge.js';
import { Icons } from './Icons.js';

export function renderModal(feature) {
  if (!feature) {
    return `<div id="modal-container"></div>`;
  }

  const branchName = feature.branch || `${feature.type || 'feature'}/INT-${String(feature.id).padStart(3, '0')}/${feature.name}`;
  const branchLength = branchName.length;
  const isBranchLengthOk = branchLength <= 80;

  const acceptanceHtml = (feature.acceptance && feature.acceptance.length)
    ? `
      <div class="mt-4 pt-4 border-t border-slate-800">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Criterios de Aceptación (${feature.acceptance.length})</h4>
        <ul class="space-y-1.5 text-xs text-slate-300">
          ${feature.acceptance.map(a => `
            <li class="flex items-start gap-2">
              <span class="text-emerald-400 font-bold shrink-0">✓</span>
              <span>${a}</span>
            </li>`).join('')}
        </ul>
      </div>`
    : '';

  const tasksHtml = (feature.tasks && feature.tasks.length)
    ? `
      <div class="mt-4 pt-4 border-t border-slate-800">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Tareas (${feature.tasks.filter(t => t.done).length}/${feature.tasks.length})</h4>
        <ul class="space-y-1.5 text-xs text-slate-300">
          ${feature.tasks.map(t => `
            <li class="flex items-start gap-2 ${t.done ? 'text-emerald-400 line-through opacity-80' : ''}">
              <span class="${t.done ? 'text-emerald-400' : 'text-slate-500'} font-mono">${t.done ? '✓' : '○'}</span>
              <span>${t.title || t}</span>
            </li>`).join('')}
        </ul>
      </div>`
    : '';

  const depsHtml = (feature.dependencies && feature.dependencies.length)
    ? `
      <div class="mt-4 pt-4 border-t border-slate-800">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Dependencias Directas (${feature.dependencies.length})</h4>
        <div class="flex flex-wrap gap-1.5">
          ${feature.dependencies.map(dId => `
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              <span>INT-${String(dId).padStart(3, '0')}</span>
            </span>`).join('')}
        </div>
      </div>`
    : '';

  return `
    <div id="modal-container" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" data-action="close-modal"></div>

      <!-- Modal Card -->
      <div class="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150" role="dialog" aria-modal="true">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/50">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="text-xs font-mono font-bold text-indigo-400">INT-${String(feature.id).padStart(3, '0')}</span>
              ${Badge({ type: 'type', value: feature.type || 'feature' })}
              ${Badge({ type: 'status', value: feature.status || 'pending' })}
              ${Badge({ type: 'priority', value: feature.priority || 'P2' })}
              ${feature.module ? Badge({ type: 'module', value: feature.module }) : ''}
            </div>
            <h3 class="text-lg font-bold text-white leading-snug">
              ${feature.title || feature.name}
            </h3>
          </div>
          <button type="button" data-action="close-modal" class="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors" title="Cerrar modal (Esc)">
            ✕
          </button>
        </div>

        <!-- Modal Body -->
        <div class="px-6 py-5 overflow-y-auto space-y-4 text-slate-300">
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Descripción</h4>
            <p class="text-sm leading-relaxed text-slate-200">${feature.description || 'Sin descripción detallada.'}</p>
          </div>

          <!-- Branch Info (≤80c check) -->
          <div class="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <div class="flex items-center justify-between text-xs mb-1">
              <span class="font-semibold text-slate-400 flex items-center gap-1.5">
                <span class="text-indigo-400">${Icons.gitBranch}</span> Rama de trabajo SDD
              </span>
              <span class="font-mono text-xs ${isBranchLengthOk ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-bold'}">
                ${branchLength}/80 caracteres ${isBranchLengthOk ? '(Válida)' : '(Excede 80c)'}
              </span>
            </div>
            <code class="text-xs font-mono text-indigo-300 select-all break-all block bg-slate-900/90 p-2 rounded border border-slate-800">
              git checkout -b ${branchName}
            </code>
          </div>

          ${feature.spec_folder ? `
            <div>
              <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Carpeta de Especificación</h4>
              <p class="text-xs font-mono bg-slate-950/80 border border-slate-800 px-2.5 py-1.5 rounded-md inline-block text-slate-300">
                ${feature.spec_folder}
              </p>
            </div>` : ''}

          ${acceptanceHtml}
          ${tasksHtml}
          ${depsHtml}

          ${feature.documentation && feature.documentation.length ? `
            <div class="mt-4 pt-4 border-t border-slate-800">
              <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Documentación</h4>
              <div class="flex flex-wrap gap-1 text-xs font-mono">
                ${feature.documentation.map(d => `<span class="bg-slate-950 px-2 py-1 rounded text-slate-400 border border-slate-800">${d}</span>`).join('')}
              </div>
            </div>` : ''}
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button type="button" data-action="close-modal" class="px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  `;
}

export function openFeatureModal(feature) {
  // Helper de compatibilidad si se llama imperativamente
  const modalContainer = document.getElementById('modal-container');
  if (modalContainer && feature) {
    modalContainer.outerHTML = renderModal(feature);
  }
}
