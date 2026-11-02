/**
 * Accessible Detail Modal Component
 */
import { Badge } from './Badge.js';
import { Icons } from './Icons.js';
import { store } from '../core/store.js';

export function openFeatureModal(feature) {
  if (!feature) return;

  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;

  const isSpecCard = feature._isCurrentSpec;
  const depChain = store.getDepChain(feature);
  const blockedBy = store.getBlockedBy(feature);
  const branchName = feature.branch || `${feature.type || 'feature'}/INT-${String(feature.id).padStart(3, '0')}/${feature.name}`;

  const acceptanceHtml = (feature.acceptance && feature.acceptance.length)
    ? `
      <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Criterios de Aceptación (${feature.acceptance.length})</h4>
        <ul class="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
          ${feature.acceptance.map(a => `
            <li class="flex items-start gap-2">
              <span class="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
              <span>${a}</span>
            </li>`).join('')}
        </ul>
      </div>`
    : '';

  const tasksHtml = (feature.tasks && feature.tasks.length)
    ? `
      <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Tareas (${feature.tasks.filter(t => t.done).length}/${feature.tasks.length})</h4>
        <ul class="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
          ${feature.tasks.map(t => `
            <li class="flex items-start gap-2 ${t.done ? 'text-emerald-700 dark:text-emerald-400 line-through opacity-85' : ''}">
              <span class="${t.done ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} font-mono">${t.done ? '✓' : '○'}</span>
              <span>${t.title || t}</span>
            </li>`).join('')}
        </ul>
      </div>`
    : '';

  const depsHtml = (feature.dependencies && feature.dependencies.length)
    ? `
      <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Dependencias Directas</h4>
        <div class="flex flex-wrap gap-1.5">
          ${feature.dependencies.map(dId => {
            const dep = store.getState().features.find(f => f.id === dId);
            const isDone = dep && dep.status === 'done';
            return `
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${isDone ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-300' : 'bg-rose-50 text-rose-800 ring-1 ring-rose-300'}">
                <span>#${dId} ${dep ? dep.title || dep.name : ''}</span>
                <span class="font-bold">${isDone ? '✓' : '⏳'}</span>
              </span>`;
          }).join('')}
        </div>
      </div>`
    : '';

  const branchLength = branchName.length;
  const isBranchLengthOk = branchLength <= 80;

  overlay.innerHTML = `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity z-50 flex items-center justify-center p-4" id="modal-backdrop">
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150" role="dialog" aria-modal="true">
        
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="text-xs font-mono font-bold text-slate-500">ID #${feature.id}</span>
              ${Badge({ type: 'type', value: feature.type || 'feature' })}
              ${Badge({ type: 'status', value: feature.status || 'pending' })}
              ${Badge({ type: 'priority', value: feature.priority || 'media' })}
              ${feature.module ? Badge({ type: 'module', value: feature.module }) : ''}
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
              ${feature.title || feature.name}
            </h3>
          </div>
          <button id="modal-close-btn" class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors" title="Cerrar modal (Esc)">
            ${Icons.close()}
          </button>
        </div>

        <!-- Modal Body -->
        <div class="px-6 py-5 overflow-y-auto space-y-4 text-slate-700 dark:text-slate-300">
          
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Descripción</h4>
            <p class="text-sm leading-relaxed">${feature.description || 'Sin descripción detallada.'}</p>
          </div>

          <!-- Branch Information -->
          <div class="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <div class="flex items-center justify-between text-xs mb-1">
              <span class="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                ${Icons.branch('w-3.5 h-3.5 text-blue-600 dark:text-blue-400')} Rama de trabajo
              </span>
              <span class="font-mono text-xs ${isBranchLengthOk ? 'text-slate-500' : 'text-rose-600 font-bold'}">
                ${branchLength}/80 caracteres
              </span>
            </div>
            <code class="text-xs font-mono text-blue-700 dark:text-blue-300 select-all break-all">
              git checkout -b ${branchName}
            </code>
          </div>

          ${feature.spec_folder ? `
            <div>
              <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Carpeta de Especificación</h4>
              <p class="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-md inline-block text-slate-800 dark:text-slate-200">
                ${feature.spec_folder}
              </p>
            </div>` : ''}

          ${acceptanceHtml}
          ${tasksHtml}
          ${depsHtml}

          ${feature.documentation && feature.documentation.length ? `
            <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Documentación Relacionada</h4>
              <div class="flex flex-wrap gap-1 text-xs font-mono">
                ${feature.documentation.map(d => `<span class="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300">${d}</span>`).join('')}
              </div>
            </div>` : ''}
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-end">
          <button id="modal-footer-close-btn" class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  `;

  overlay.classList.remove('hidden');

  const closeModal = () => {
    overlay.innerHTML = '';
    overlay.classList.add('hidden');
    document.removeEventListener('keydown', handleKeyDown);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closeModal();
  };

  document.addEventListener('keydown', handleKeyDown);
  document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);
  document.getElementById('modal-footer-close-btn')?.addEventListener('click', closeModal);
  document.getElementById('modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  });
}
