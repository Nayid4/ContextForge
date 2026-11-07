import { Icons } from '../../shared/Icons.js';
import { renderMarkdown } from '../../shared/MarkdownViewer.js';

export function renderIssueDetailModal({
  issue = null,
  states = [],
  cycles = [],
  modules = [],
  onClose = () => {},
  onUpdateState = () => {},
  onUpdatePriority = () => {}
}) {
  if (!issue) return '';

  const subtotal = issue.subtasks ? issue.subtasks.length : 0;
  const completed = issue.subtasks ? issue.subtasks.filter(s => s.status === 'done' || s.status === 'passed').length : 0;
  const percent = subtotal > 0 ? Math.round((completed / subtotal) * 100) : 0;

  return `
    <div id="plane-issue-modal-backdrop" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
      <div id="plane-issue-modal-card" class="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-zinc-800 flex items-center justify-between gap-4 bg-zinc-900/50">
          <div class="flex items-center gap-3">
            <span class="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-zinc-800 text-indigo-400 border border-zinc-700/60">
              ${issue.id}
            </span>
            <span class="text-zinc-500">/</span>
            <span class="text-xs text-zinc-400 font-medium truncate max-w-sm">
              ${issue.module_name || 'Harness'}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button id="plane-modal-close" class="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
              ${Icons.close('w-4 h-4')}
            </button>
          </div>
        </div>

        <!-- Modal Body (Two Columns: Main Details + Metadata Sidebar) -->
        <div class="flex-1 flex flex-col lg:flex-row overflow-y-auto">
          <!-- Main Content (Left) -->
          <div class="flex-1 p-6 space-y-6 lg:border-r border-zinc-800 overflow-y-auto">
            <!-- Title -->
            <div>
              <h2 class="text-lg font-bold text-zinc-100 tracking-tight leading-snug">
                ${issue.title}
              </h2>
            </div>

            <!-- User Story Callout -->
            ${issue.user_story_i_want ? `
              <div class="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5 text-xs">
                <div class="font-semibold text-zinc-300 flex items-center gap-1.5">
                  ${Icons.lightbulb('w-3.5 h-3.5 text-amber-400')}
                  <span>Historia de Usuario (User Story)</span>
                </div>
                <div class="text-zinc-400 pl-5 space-y-0.5">
                  <p><strong class="text-zinc-300">Como:</strong> ${issue.user_story_as_a || 'Desarrollador'}</p>
                  <p><strong class="text-zinc-300">Quiero:</strong> ${issue.user_story_i_want}</p>
                  <p><strong class="text-zinc-300">Para:</strong> ${issue.user_story_so_that}</p>
                </div>
              </div>
            ` : ''}

            <!-- Description / Specification -->
            <div class="space-y-2">
              <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Descripción & Alcance</h3>
              <div class="text-xs text-zinc-300 leading-relaxed bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/80">
                ${issue.description || 'Sin descripción detallada.'}
              </div>
            </div>

            <!-- Acceptance Criteria -->
            ${issue.acceptance && issue.acceptance.length > 0 ? `
              <div class="space-y-2">
                <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Criterios de Aceptación (EARS)</h3>
                <div class="space-y-2">
                  ${issue.acceptance.map((crit, idx) => `
                    <div class="flex items-start gap-2.5 p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/60 text-xs text-zinc-300">
                      <span class="p-0.5 rounded text-emerald-400 mt-0.5">${Icons.check('w-3.5 h-3.5')}</span>
                      <span>${crit}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Subtasks Section (Jira DEV & QA) -->
            ${issue.subtasks && issue.subtasks.length > 0 ? `
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Subtareas Jira DEV / QA</h3>
                  <span class="text-xs font-mono text-zinc-400">${completed} de ${subtotal} (${percent}%)</span>
                </div>

                <div class="space-y-2">
                  ${issue.subtasks.map(sub => {
                    const isPassed = sub.status === 'done' || sub.status === 'passed';
                    const isQa = sub.type === 'qa';

                    return `
                      <div class="p-3 rounded-xl border ${isPassed ? 'border-emerald-500/20 bg-emerald-950/10' : 'border-zinc-800 bg-zinc-900/40'} flex items-start justify-between gap-3 text-xs">
                        <div class="flex items-start gap-2.5">
                          <span class="p-0.5 rounded ${isPassed ? 'text-emerald-400' : 'text-zinc-500'} mt-0.5">
                            ${isPassed ? Icons.checkCircle('w-4 h-4') : Icons.clock('w-4 h-4')}
                          </span>
                          <div>
                            <div class="flex items-center gap-2">
                              <span class="font-mono text-[11px] font-semibold text-zinc-300">${sub.id}</span>
                              <span class="text-[10px] px-1.5 py-0.2 rounded font-medium ${isQa ? 'bg-purple-900/40 text-purple-300' : 'bg-blue-900/40 text-blue-300'}">
                                ${isQa ? 'QA Subtask' : 'DEV Subtask'}
                              </span>
                            </div>
                            <p class="text-zinc-200 mt-1">${sub.title}</p>
                          </div>
                        </div>

                        <span class="px-2 py-0.5 rounded text-[10px] font-mono font-medium ${isPassed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'}">
                          ${sub.status.toUpperCase()}
                        </span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Evidence Section if completed -->
            ${issue.evidence_summary ? `
              <div class="p-4 rounded-xl bg-emerald-950/10 border border-emerald-500/20 space-y-1 text-xs">
                <span class="font-semibold text-emerald-400 flex items-center gap-1.5">
                  ${Icons.shield('w-3.5 h-3.5')} Resumen de Cierre & Verificación
                </span>
                <p class="text-zinc-300 mt-1">${issue.evidence_summary}</p>
              </div>
            ` : ''}
          </div>

          <!-- Metadata Sidebar (Right) -->
          <div class="w-full lg:w-72 p-6 bg-zinc-950/90 space-y-5 text-xs shrink-0">
            <!-- State Selector -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Estado (Workflow)</label>
              <select
                id="modal-state-select"
                data-issue-id="${issue.id}"
                class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              >
                ${states.map(s => `
                  <option value="${s.id}" ${s.id === issue.state_id ? 'selected' : ''}>
                    ${s.name}
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- Priority Selector -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Prioridad</label>
              <select
                id="modal-priority-select"
                data-issue-id="${issue.id}"
                class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors capitalize"
              >
                <option value="urgent" ${issue.priority === 'urgent' ? 'selected' : ''}>Urgente</option>
                <option value="high" ${issue.priority === 'high' ? 'selected' : ''}>Alta</option>
                <option value="medium" ${issue.priority === 'medium' ? 'selected' : ''}>Media</option>
                <option value="low" ${issue.priority === 'low' ? 'selected' : ''}>Baja</option>
                <option value="none" ${issue.priority === 'none' ? 'selected' : ''}>Ninguna</option>
              </select>
            </div>

            <!-- Assignee -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Agente Asignado</label>
              <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200">
                ${Icons.bot('w-4 h-4 text-indigo-400')}
                <span class="font-medium">${issue.assignee_role || 'leader'}</span>
              </div>
            </div>

            <!-- Cycle (Sprint) -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Ciclo (Sprint)</label>
              <div class="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs truncate">
                ${issue.cycle_name || 'Sin ciclo'}
              </div>
            </div>

            <!-- Module (Epic) -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Módulo (Epic)</label>
              <div class="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs truncate">
                ${issue.module_name || 'Harness Core'}
              </div>
            </div>

            <!-- Branch -->
            ${issue.branch ? `
              <div class="space-y-1.5">
                <label class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Rama Git (INT-*)</label>
                <div class="p-2 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-[11px] text-zinc-300 break-all select-all">
                  ${issue.branch}
                </div>
              </div>
            ` : ''}

            <!-- Spec Folder -->
            ${issue.spec_folder ? `
              <div class="space-y-1.5">
                <label class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Especificación Formal</label>
                <div class="p-2 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-[11px] text-indigo-400 break-all truncate">
                  ${issue.spec_folder}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}
