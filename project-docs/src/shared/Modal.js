/**
 * Accessible Detail Modal Component con soporte de modo claro y oscuro,
 * especificación SCRUM (User Story, DoR, DoD), Subtareas Jira DEV/QA y Galería de Evidencias.
 */
import { Badge } from './Badge.js';
import { Icons } from './Icons.js';

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderModal(feature) {
  if (!feature) {
    return `<div id="modal-container"></div>`;
  }

  const branchName = feature.branch || `${feature.type || 'feature'}/INT-${String(feature.id).padStart(3, '0')}/${feature.name}`;
  const branchLength = branchName.length;
  const isBranchLengthOk = branchLength <= 80;

  // 1. User Story Scrum Card
  const userStoryHtml = feature.user_story
    ? `
      <div class="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs">
        <div class="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider">
          <span class="w-4 h-4 shrink-0">${Icons.sparkles}</span>
          <span>Historia de Usuario (Scrum)</span>
        </div>
        <div class="space-y-1 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
          <p><strong class="text-indigo-600 dark:text-indigo-400 font-bold uppercase text-[11px] mr-1">Como</strong> ${escapeHtml(feature.user_story.as_a)},</p>
          <p><strong class="text-indigo-600 dark:text-indigo-400 font-bold uppercase text-[11px] mr-1">Quiero</strong> ${escapeHtml(feature.user_story.i_want)},</p>
          <p><strong class="text-indigo-600 dark:text-indigo-400 font-bold uppercase text-[11px] mr-1">Para</strong> ${escapeHtml(feature.user_story.so_that)}.</p>
        </div>
      </div>`
    : '';

  // 2. Subtareas Jira DEV / QA
  const subtasksHtml = (feature.subtasks && feature.subtasks.length)
    ? `
      <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span class="text-indigo-600 dark:text-indigo-400 shrink-0">${Icons.layers}</span> Subtareas Jira (${feature.subtasks.length})
          </h4>
          <span class="text-[11px] text-slate-500 font-mono">Pistas DEV & QA</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${feature.subtasks.map(st => {
            const isDev = st.type === 'development';
            const isDone = st.status === 'done';
            const isInProgress = st.status === 'in_progress';
            const badgeClass = isDone 
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
              : (isInProgress
                ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700');
            const statusText = isDone ? 'Done' : (isInProgress ? 'In Progress' : 'To Do');
            const itemsList = isDev ? (st.tasks || []) : (st.test_cases || []);

            return `
              <div class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between gap-2 mb-1.5">
                    <span class="inline-flex items-center gap-1 font-mono text-[11px] font-bold ${isDev ? 'text-indigo-600 dark:text-indigo-400' : 'text-amber-600 dark:text-amber-400'}">
                      <span>${isDev ? '[DEV]' : '[QA]'}</span>
                      <span>${st.id}</span>
                    </span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${badgeClass}">
                      ${statusText}
                    </span>
                  </div>
                  <h5 class="text-xs font-semibold text-slate-900 dark:text-slate-200 mb-1.5 leading-snug">
                    ${escapeHtml(st.title)}
                  </h5>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                    <span>Responsable: <strong class="text-slate-700 dark:text-slate-300 font-mono">${st.assignee || (isDev ? 'implementer' : 'reviewer')}</strong></span>
                  </div>
                  ${itemsList.length ? `
                    <ul class="space-y-1 text-xs text-slate-600 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                      ${itemsList.map(item => {
                        const done = item.done || item.status === 'passed';
                        return `
                          <li class="flex items-start gap-1.5 ${done ? 'line-through opacity-75 text-emerald-600 dark:text-emerald-400' : ''}">
                            <span class="shrink-0 font-mono text-[11px] font-bold ${done ? 'text-emerald-600' : 'text-slate-400'}">${done ? Icons.check('w-3 h-3') : '○'}</span>
                            <span class="text-[11px] leading-tight">${escapeHtml(item.title)}</span>
                          </li>
                        `;
                      }).join('')}
                    </ul>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>`
    : '';

  // 3. Definition of Done (DoD)
  const dodHtml = (feature.definition_of_done && feature.definition_of_done.length)
    ? `
      <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
          <span class="text-emerald-600 dark:text-emerald-400 shrink-0">${Icons.shield}</span> Definition of Done (DoD - ${feature.definition_of_done.length})
        </h4>
        <ul class="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
          ${feature.definition_of_done.map(d => `
            <li class="flex items-start gap-2">
              <span class="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">${Icons.check('w-3.5 h-3.5')}</span>
              <span>${escapeHtml(d)}</span>
            </li>`).join('')}
        </ul>
      </div>`
    : '';

  // 4. Acceptance Criteria
  const acceptanceHtml = (feature.acceptance && feature.acceptance.length)
    ? `
      <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Criterios de Aceptación (${feature.acceptance.length})</h4>
        <ul class="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
          ${feature.acceptance.map(a => `
            <li class="flex items-start gap-2">
              <span class="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">${Icons.check('w-3.5 h-3.5')}</span>
              <span>${escapeHtml(a)}</span>
            </li>`).join('')}
        </ul>
      </div>`
    : '';

  // 5. Evidencias de Pruebas y Galería de Screenshots
  const evidenceHtml = feature.evidence
    ? `
      <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span class="text-indigo-600 dark:text-indigo-400 shrink-0">${Icons.terminal}</span> Evidencias de Pruebas y Cierre
          </h4>
          ${feature.evidence.completed_at ? `<span class="text-[11px] text-slate-500 font-mono">${escapeHtml(feature.evidence.completed_at)}</span>` : ''}
        </div>
        
        ${feature.evidence.dev_summary ? `
          <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 mb-2.5">
            <strong class="text-slate-900 dark:text-slate-200">Resumen de Implementación:</strong>
            <p class="mt-0.5 leading-relaxed">${escapeHtml(feature.evidence.dev_summary)}</p>
          </div>
        ` : ''}

        ${(feature.evidence.tests_executed && feature.evidence.tests_executed.length) ? `
          <div class="mb-3">
            <span class="text-[11px] font-semibold uppercase text-slate-500 block mb-1">Pruebas Ejecutadas:</span>
            <div class="flex flex-wrap gap-1.5">
              ${feature.evidence.tests_executed.map(t => `
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <span>${Icons.check('w-3 h-3')}</span>
                  <span>${escapeHtml(t)}</span>
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${(feature.evidence.screenshots && feature.evidence.screenshots.length) ? `
          <div>
            <span class="text-[11px] font-semibold uppercase text-slate-500 block mb-1.5">Capturas de Pantalla (${feature.evidence.screenshots.length}):</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              ${feature.evidence.screenshots.map(sc => `
                <div class="group relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-950 shadow-xs">
                  <a href="${sc.path}" target="_blank" rel="noopener noreferrer" class="block aspect-video overflow-hidden">
                    <img src="${sc.path}" alt="${escapeHtml(sc.caption || sc.name)}" class="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-200" loading="lazy" />
                  </a>
                  <div class="p-1.5 text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 truncate" title="${escapeHtml(sc.caption || sc.name)}">
                    ${escapeHtml(sc.caption || sc.name)}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>`
    : '';

  // 6. Dependencies
  const rawDeps = feature.depends_on || feature.dependencies || [];
  const depsHtml = rawDeps.length
    ? `
      <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Dependencias Directas (${rawDeps.length})</h4>
        <div class="flex flex-wrap gap-1.5">
          ${rawDeps.map(dId => `
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
              <span>INT-${String(dId).padStart(3, '0')}</span>
            </span>`).join('')}
        </div>
      </div>`
    : '';

  return `
    <div id="modal-container" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity cursor-pointer" data-action="close-modal"></div>

      <!-- Modal Card -->
      <div class="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150" role="dialog" aria-modal="true">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50 dark:bg-slate-950/50">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">INT-${String(feature.id).padStart(3, '0')}</span>
              ${Badge({ type: 'type', value: feature.type || 'feature' })}
              ${Badge({ type: 'status', value: feature.status || 'pending' })}
              ${Badge({ type: 'priority', value: feature.priority || 'P2' })}
              ${feature.module ? Badge({ type: 'module', value: feature.module }) : ''}
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white leading-snug">
              ${escapeHtml(feature.title || feature.name)}
            </h3>
          </div>
          <button type="button" data-action="close-modal" class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" title="Cerrar modal (Esc)">
            ${Icons.close('w-4 h-4')}
          </button>
        </div>

        <!-- Modal Body -->
        <div class="px-6 py-5 overflow-y-auto space-y-4 text-slate-700 dark:text-slate-300">
          <!-- Scrum User Story -->
          ${userStoryHtml}

          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Descripción</h4>
            <p class="text-sm leading-relaxed text-slate-800 dark:text-slate-200">${escapeHtml(feature.description || 'Sin descripción detallada.')}</p>
          </div>

          <!-- Branch Info (≤80c check) -->
          <div class="bg-slate-50 dark:bg-slate-950/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <div class="flex items-center justify-between text-xs mb-1">
              <span class="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <span class="text-indigo-600 dark:text-indigo-400 inline-block align-middle">${Icons.gitBranch}</span> Rama de trabajo SDD
              </span>
              <span class="font-mono text-xs ${isBranchLengthOk ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-600 dark:text-rose-400 font-bold'}">
                ${branchLength}/80 caracteres ${isBranchLengthOk ? '(Válida)' : '(Excede 80c)'}
              </span>
            </div>
            <code class="text-xs font-mono text-indigo-700 dark:text-indigo-300 select-all break-all block bg-white dark:bg-slate-900/90 p-2 rounded border border-slate-200 dark:border-slate-800">
              git checkout -b ${branchName}
            </code>
          </div>

          ${feature.spec_folder ? `
            <div>
              <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Carpeta de Especificación</h4>
              <p class="text-xs font-mono bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded-md inline-block text-slate-800 dark:text-slate-300">
                ${escapeHtml(feature.spec_folder)}
              </p>
            </div>` : ''}

          <!-- Subtareas Jira DEV / QA -->
          ${subtasksHtml}

          <!-- Definition of Done (DoD) -->
          ${dodHtml}

          <!-- Acceptance Criteria -->
          ${acceptanceHtml}

          <!-- Evidencias de Pruebas y Screenshots -->
          ${evidenceHtml}

          <!-- Dependencias -->
          ${depsHtml}

          ${feature.documentation && feature.documentation.length ? `
            <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Documentación</h4>
              <div class="flex flex-wrap gap-1 text-xs font-mono">
                ${feature.documentation.map(d => `<span class="bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-800">${escapeHtml(d)}</span>`).join('')}
              </div>
            </div>` : ''}
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-end">
          <button type="button" data-action="close-modal" class="px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-200/80 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl transition-all cursor-pointer">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  `;
}

export function openFeatureModal(feature) {
  const modalContainer = document.getElementById('modal-container');
  if (modalContainer && feature) {
    modalContainer.outerHTML = renderModal(feature);
  }
}
