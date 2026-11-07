/**
 * IssueCard Component (Kanban Board Card)
 * Representación atómica de una tarea dentro de una columna de estado.
 * 100% Vectorial, sin dependencias externas ni emojis.
 */
import { Icons } from '../../../shared/ui/Icons.js';

export function IssueCard(issue) {
  if (!issue) return '';

  const priorityIcons = {
    urgent: Icons.priorityUrgent('w-3.5 h-3.5 text-rose-500 shrink-0'),
    high: Icons.priorityHigh('w-3.5 h-3.5 text-amber-500 shrink-0'),
    medium: Icons.priorityMedium('w-3.5 h-3.5 text-blue-500 shrink-0'),
    low: Icons.priorityLow('w-3.5 h-3.5 text-zinc-400 shrink-0')
  };
  const pIcon = priorityIcons[(issue.priority || 'none').toLowerCase()] || Icons.priorityLow('w-3.5 h-3.5 text-zinc-500 shrink-0');

  // Métricas de subtareas Jira
  const totalSubtasks = issue.subtasks_count || (issue.subtasks ? issue.subtasks.length : 0);
  const doneSubtasks = issue.subtasks_done || (issue.subtasks ? issue.subtasks.filter(s => s.status === 'done' || s.completed || s.status === 'passed').length : 0);
  const percentSubtasks = totalSubtasks > 0 ? Math.round((doneSubtasks / totalSubtasks) * 100) : 0;

  return `
    <div
      data-issue-id="${issue.id}"
      class="plane-issue-card group p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60 shadow-md hover:shadow-lg transition-all cursor-pointer select-none space-y-2.5"
    >
      <!-- Card Header: ID, Priority & Action Menu -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span title="Prioridad: ${issue.priority || 'None'}">
            ${pIcon}
          </span>
          <span class="text-xs font-mono font-bold text-indigo-400">
            ${issue.id}
          </span>
        </div>

        <!-- Quick move state buttons -->
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            data-action="quick-state"
            data-target-state="state-in-progress"
            data-issue-id="${issue.id}"
            class="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-amber-400 transition-colors"
            title="Mover a En Progreso"
          >
            ${Icons.play('w-3 h-3')}
          </button>
          <button
            data-action="quick-state"
            data-target-state="state-done"
            data-issue-id="${issue.id}"
            class="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-emerald-400 transition-colors"
            title="Marcar como Completado"
          >
            ${Icons.check('w-3 h-3')}
          </button>
        </div>
      </div>

      <!-- Card Title -->
      <h4 class="text-xs font-medium text-zinc-100 group-hover:text-white line-clamp-2 leading-snug">
        ${issue.title}
      </h4>

      <!-- Subtasks Jira Progress -->
      ${totalSubtasks > 0 ? `
        <div class="space-y-1 pt-1">
          <div class="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
            <span>Subtareas Jira</span>
            <span>${doneSubtasks}/${totalSubtasks} (${percentSubtasks}%)</span>
          </div>
          <div class="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full" style="width: ${percentSubtasks}%"></div>
          </div>
        </div>
      ` : ''}

      <!-- Footer: Module Tag & Assignee Role -->
      <div class="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-[10px] text-zinc-400">
        <span class="px-2 py-0.5 rounded bg-zinc-800/80 font-mono truncate max-w-[120px]" title="Módulo">
          ${issue.module_name || 'Harness'}
        </span>
        <div class="flex items-center gap-1.5 font-mono text-zinc-400">
          ${Icons.bot('w-3 h-3 text-indigo-400')}
          <span>${issue.assignee_role || 'implementer'}</span>
        </div>
      </div>
    </div>
  `;
}
