/**
 * IssueDetailModal Component (Flyout Drawer / Modal Dialog)
 * Modal accesible de especificacion tecnica y trazabilidad Scrum / Jira / DoD / Evidencias / IA.
 * 100% Vectorial, sin dependencias externas ni emojis.
 */
import { Icons } from '../../../shared/ui/Icons.js';
import { renderList } from '../../../shared/utils/renderList.js';
import { CANONICAL_STATES } from '../services/issue.service.js';

export function IssueDetailModal({
  issue = null,
  states = [],
  cycles = [],
  modules = []
} = {}) {
  if (!issue) return '';

  const activeStates = states && states.length > 0 ? states : CANONICAL_STATES;
  const rawSubtasks = Array.isArray(issue.subtasks) ? issue.subtasks : [];
  const subtotal = rawSubtasks.length;
  const completed = rawSubtasks.filter(s => s.status === 'done' || s.status === 'passed' || s.completed).length;
  const percent = subtotal > 0 ? Math.round((completed / subtotal) * 100) : 0;

  const acceptanceCriteria = Array.isArray(issue.acceptance_criteria)
    ? issue.acceptance_criteria
    : (Array.isArray(issue.acceptance) ? issue.acceptance : []);

  const labels = Array.isArray(issue.labels) ? issue.labels : [];
  const relations = Array.isArray(issue.relations) ? issue.relations : [];
  const evidences = Array.isArray(issue.evidences) ? issue.evidences : [];
  const aiRuns = Array.isArray(issue.ai_runs) ? issue.ai_runs : [];
  const activities = Array.isArray(issue.activities) ? issue.activities : [];
  const comments = Array.isArray(issue.comments) ? issue.comments : [];

  const renderAcceptanceCriterion = (crit) => `
    <div class="flex items-start gap-2.5 p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/60 text-xs text-zinc-300">
      <span class="p-0.5 rounded text-emerald-400 mt-0.5 shrink-0">${Icons.check('w-3.5 h-3.5')}</span>
      <span class="leading-relaxed">${crit}</span>
    </div>
  `;

  const renderSubtaskItem = (sub) => {
    const isPassed = sub.status === 'done' || sub.status === 'passed';
    const isQa = sub.type === 'qa';

    return `
      <div class="p-3 rounded-xl border ${isPassed ? 'border-emerald-500/20 bg-emerald-950/10' : 'border-zinc-800 bg-zinc-900/40'} flex items-start justify-between gap-3 text-xs">
        <div class="flex items-start gap-2.5 min-w-0">
          <span class="p-0.5 rounded ${isPassed ? 'text-emerald-400' : 'text-zinc-500'} mt-0.5 shrink-0">
            ${isPassed ? Icons.checkCircle('w-4 h-4') : Icons.clock('w-4 h-4')}
          </span>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-mono text-[11px] font-semibold text-zinc-300">${sub.id}</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded font-medium ${isQa ? 'bg-purple-900/40 text-purple-300' : 'bg-blue-900/40 text-blue-300'}">
                ${isQa ? 'QA Subtask' : 'DEV Subtask'}
              </span>
            </div>
            <p class="text-zinc-200 mt-1 leading-snug">${sub.title}</p>
          </div>
        </div>

        <span class="px-2 py-0.5 rounded text-[10px] font-mono font-medium shrink-0 ${isPassed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'}">
          ${String(sub.status || 'pending').toUpperCase()}
        </span>
      </div>
    `;
  };

  const renderEvidenceItem = (ev) => `
    <div class="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex items-start justify-between gap-3 text-xs">
      <div class="flex items-start gap-2.5 min-w-0">
        <span class="p-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 mt-0.5">
          ${Icons.shield('w-3.5 h-3.5')}
        </span>
        <div class="min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-semibold text-zinc-200">${ev.title}</span>
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 uppercase">${ev.type}</span>
            <span class="text-[10px] font-mono text-indigo-400">/${ev.created_by_skill || 'verify-spec'}</span>
          </div>
          ${ev.file_path ? `<p class="font-mono text-[11px] text-zinc-400 mt-1 break-all">${ev.file_path}</p>` : ''}
        </div>
      </div>
      <span class="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-mono shrink-0">VERIFIED</span>
    </div>
  `;

  const renderAiRunItem = (run) => `
    <div class="p-3 rounded-xl bg-zinc-900/40 border border-indigo-500/20 flex items-start justify-between gap-3 text-xs">
      <div class="flex items-start gap-2.5 min-w-0">
        <span class="p-1 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shrink-0 mt-0.5">
          ${Icons.bot('w-3.5 h-3.5')}
        </span>
        <div class="min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-mono font-bold text-indigo-400">/${run.skill_name}</span>
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">${run.agent_role}</span>
            <span class="text-[10px] font-mono text-zinc-500">${run.model || 'gemini-2.5-pro'}</span>
          </div>
          <p class="text-zinc-300 mt-1 leading-relaxed">${run.prompt_summary}</p>
        </div>
      </div>
      <span class="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-mono shrink-0 uppercase">${run.status || 'completed'}</span>
    </div>
  `;

  const dodItems = [
    'Especificación técnica y trazabilidad R-to-Tests 100% aprobada',
    'Tests unitarios y pruebas de aceptación pasando en verde',
    'Cero emojis unicode en código fuente, interfaz y pruebas',
    'Rama semántica INT-* verificada (máximo 80 caracteres)',
    'Evidencia de verificación y capturas de pantalla documentadas'
  ];

  const renderDodItem = (item) => `
    <div class="flex items-center gap-2.5 text-xs text-zinc-300">
      <span class="text-emerald-400 shrink-0">${Icons.checkCircle('w-3.5 h-3.5')}</span>
      <span>${item}</span>
    </div>
  `;

  return `
    <div id="plane-issue-modal-backdrop" data-action="close-modal-backdrop" class="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div id="plane-issue-modal-card" role="dialog" aria-modal="true" aria-labelledby="plane-modal-issue-title" class="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-zinc-800 flex items-center justify-between gap-4 bg-zinc-900/50">
          <div class="flex items-center gap-3 flex-wrap">
            <span class="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-zinc-800 text-indigo-400 border border-zinc-700/60">
              ${issue.id}
            </span>
            <span class="text-zinc-600">/</span>
            <span class="text-xs text-zinc-400 font-medium truncate max-w-sm">
              ${issue.module_name || 'Harness'}
            </span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
              ${issue.type_name || 'Feature'} · ${issue.point || 3} pts
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button id="plane-modal-close" data-action="close-modal" class="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors" title="Cerrar modal (ESC)" aria-label="Cerrar">
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
              <h2 id="plane-modal-issue-title" class="text-lg font-bold text-zinc-100 tracking-tight leading-snug">
                ${issue.title}
              </h2>
            </div>

            <!-- User Story Scrum Callout -->
            <div class="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs">
              <div class="font-semibold text-zinc-300 flex items-center gap-2">
                ${Icons.lightbulb('w-4 h-4 text-amber-400')}
                <span>Historia de Usuario (Scrum)</span>
              </div>
              <div class="text-zinc-400 pl-6 space-y-1">
                <p><strong class="text-indigo-400 uppercase text-[11px] mr-1">Como:</strong> ${issue.user_story_as_a || issue.user_story?.as_a || 'Desarrollador / Agente'}</p>
                <p><strong class="text-indigo-400 uppercase text-[11px] mr-1">Quiero:</strong> ${issue.user_story_i_want || issue.user_story?.i_want || issue.title}</p>
                <p><strong class="text-indigo-400 uppercase text-[11px] mr-1">Para:</strong> ${issue.user_story_so_that || issue.user_story?.so_that || 'garantizar la calidad y trazabilidad integral del software'}</p>
              </div>
            </div>

            <!-- Description / Scope -->
            <div class="space-y-2">
              <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Descripción & Alcance</h3>
              <div class="text-xs text-zinc-300 leading-relaxed bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/80">
                ${issue.description || 'Sin descripción adicional para esta tarea.'}
              </div>
            </div>

            <!-- Acceptance Criteria (EARS) -->
            ${acceptanceCriteria.length > 0 ? `
              <div class="space-y-3">
                <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Criterios de Aceptación (EARS / DoR)
                </h3>
                <div class="space-y-2">
                  ${renderList(acceptanceCriteria, renderAcceptanceCriterion)}
                </div>
              </div>
            ` : ''}

            <!-- Subtasks Jira (DEV & QA) -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Subtareas Jira · Subtareas Técnicas Jira (${subtotal})
                </h4>
                <span class="text-xs font-mono text-zinc-400">${completed}/${subtotal} completadas (${percent}%)</span>
              </div>

              <!-- Progress Bar -->
              <div class="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                <div class="h-full bg-emerald-500 rounded-full transition-all duration-300" style="width: ${percent}%"></div>
              </div>

              <div class="space-y-2 pt-1">
                ${renderList(rawSubtasks, renderSubtaskItem, () => `
                  <div class="p-4 text-center rounded-xl border border-dashed border-zinc-800 text-xs text-zinc-500">
                    No hay subtareas registradas para esta tarea
                  </div>
                `)}
              </div>
            </div>

            <!-- Evidences & QA Verification Reports -->
            ${evidences.length > 0 ? `
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Evidencias QA & Reportes de Verificación (${evidences.length})
                  </h4>
                  <span class="text-[11px] font-mono text-cyan-400">Plane FileAssets & QA</span>
                </div>
                <div class="space-y-2">
                  ${renderList(evidences, renderEvidenceItem)}
                </div>
              </div>
            ` : ''}

            <!-- AI Skill Runs & Activity Log -->
            ${aiRuns.length > 0 ? `
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Trazabilidad de Skills IA Ejecutadas (${aiRuns.length})
                  </h4>
                  <span class="text-[11px] font-mono text-indigo-400">SQLite ai_runs + .md</span>
                </div>
                <div class="space-y-2">
                  ${renderList(aiRuns, renderAiRunItem)}
                </div>
              </div>
            ` : ''}

            ${comments.length > 0 ? `
              <div class="space-y-3">
                <h4 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Comentarios de Agentes & Skills (${comments.length})
                </h4>
                <div class="space-y-2">
                  ${renderList(comments, c => `
                    <div class="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs space-y-1">
                      <div class="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span class="text-indigo-400 font-semibold">${c.actor_role} (/${c.source_skill || 'cli'})</span>
                        <span>${(c.created_at || '').slice(0, 19)}</span>
                      </div>
                      <p class="text-zinc-200 leading-relaxed">${c.body_markdown}</p>
                    </div>
                  `)}
                </div>
              </div>
            ` : ''}

            <!-- Definition of Done (DoD) Checklist -->
            <div class="space-y-3 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
              <h4 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                ${Icons.shield('w-4 h-4 text-emerald-400')}
                <span>Definition of Done (DoD)</span>
              </h4>
              <div class="space-y-2 pl-2">
                ${renderList(dodItems, renderDodItem)}
              </div>
            </div>
          </div>

          <!-- Metadata Sidebar (Right) -->
          <div class="w-full lg:w-80 p-6 bg-zinc-900/30 space-y-6 text-xs">
            <!-- Properties Section -->
            <div class="space-y-4">
              <h4 class="font-semibold text-zinc-400 uppercase tracking-wider text-[11px]">Propiedades Plane</h4>

              <!-- State Field -->
              <div class="space-y-1.5">
                <label class="text-[11px] text-zinc-400 font-medium">Estado</label>
                <div class="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span class="w-2.5 h-2.5 rounded-full ${issue.state_id === 'state-done' ? 'bg-emerald-400' : 'bg-amber-400'}"></span>
                  <span class="font-medium text-zinc-200">${issue.state_name || 'En Progreso'}</span>
                </div>
              </div>

              <!-- Priority Field -->
              <div class="space-y-1.5">
                <label class="text-[11px] text-zinc-400 font-medium">Prioridad</label>
                <div class="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-zinc-200 uppercase">
                  ${Icons.priorityHigh('w-3.5 h-3.5 text-amber-500')}
                  <span>${issue.priority || 'P0'}</span>
                </div>
              </div>

              <!-- Estimate Points Field -->
              <div class="space-y-1.5">
                <label class="text-[11px] text-zinc-400 font-medium">Estimación (Fibonacci Points)</label>
                <div class="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-zinc-200">
                  <span>${issue.point || 3} puntos</span>
                  <span class="text-[10px] text-zinc-400">${issue.type_name || 'Feature'}</span>
                </div>
              </div>

              <!-- Assignee Field -->
              <div class="space-y-1.5">
                <label class="text-[11px] text-zinc-400 font-medium">Agente Bot Asignado</label>
                <div class="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  ${Icons.bot('w-4 h-4 text-indigo-400')}
                  <span class="font-mono text-zinc-200">${issue.assignee_role || 'implementer'}</span>
                </div>
              </div>

              <!-- Module Field -->
              <div class="space-y-1.5">
                <label class="text-[11px] text-zinc-400 font-medium">Módulo</label>
                <div class="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200">
                  ${Icons.moduleIcon('w-4 h-4 text-purple-400')}
                  <span>${issue.module_name || 'Harness SDD'}</span>
                </div>
              </div>

              <!-- Labels -->
              ${labels.length > 0 ? `
                <div class="space-y-1.5">
                  <label class="text-[11px] text-zinc-400 font-medium">Etiquetas Plane (${labels.length})</label>
                  <div class="flex flex-wrap gap-1.5 p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                    ${renderList(labels, l => `
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-200 border border-zinc-700">
                        <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${l.color || '#6366f1'}"></span>
                        ${l.name}
                      </span>
                    `)}
                  </div>
                </div>
              ` : ''}

              <!-- Relations / Dependencies -->
              ${relations.length > 0 ? `
                <div class="space-y-1.5">
                  <label class="text-[11px] text-zinc-400 font-medium">Relaciones & Dependencias (${relations.length})</label>
                  <div class="space-y-1 p-2 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-[11px]">
                    ${renderList(relations, r => `
                      <div class="flex items-center justify-between text-zinc-300">
                        <span class="text-amber-400">${r.relation_type}</span>
                        <span class="text-indigo-400 font-bold">${r.related_issue_id}</span>
                      </div>
                    `)}
                  </div>
                </div>
              ` : ''}

              <!-- Git Branch -->
              <div class="space-y-1.5">
                <label class="text-[11px] text-zinc-400 font-medium">Rama Git de Trabajo</label>
                <div class="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[11px] break-all flex items-center justify-between gap-2">
                  <div class="flex items-center gap-1.5 min-w-0">
                    ${Icons.gitBranch('w-3.5 h-3.5 text-indigo-400 shrink-0')}
                    <span class="truncate">${issue.branch || `feature/INT-${String(issue.sequence_id || '001').padStart(3, '0')}/${issue.name || 'task'}`}</span>
                  </div>
                  <span class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-emerald-400 shrink-0 font-mono">&le;80c</span>
                </div>
              </div>

              <!-- Audit Activity Count -->
              ${activities.length > 0 ? `
                <div class="space-y-1.5">
                  <label class="text-[11px] text-zinc-400 font-medium">Eventos de Auditoría (${activities.length})</label>
                  <div class="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 space-y-1 max-h-32 overflow-y-auto">
                    ${renderList(activities.slice(0, 5), act => `
                      <div class="truncate">
                        <span class="font-mono text-indigo-400">${act.actor_role}</span>: ${act.verb} (${act.new_value || ''})
                      </div>
                    `)}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
