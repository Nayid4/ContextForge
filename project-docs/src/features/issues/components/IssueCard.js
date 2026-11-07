import { Icons } from '../../../shared/Icons.js';

export function IssueCard(issue) {
  const priorityIcons = {
    urgent: Icons.priorityUrgent('w-3.5 h-3.5 text-rose-500 shrink-0'),
    high: Icons.priorityHigh('w-3.5 h-3.5 text-amber-500 shrink-0'),
    medium: Icons.priorityMedium('w-3.5 h-3.5 text-blue-500 shrink-0'),
    low: Icons.priorityLow('w-3.5 h-3.5 text-zinc-400 shrink-0')
  };
  const pIcon = priorityIcons[(issue.priority || 'none').toLowerCase()] || Icons.priorityLow('w-3.5 h-3.5 text-zinc-500 shrink-0');

  // Subtask metrics
  const totalSubtasks = issue.subtasks_count || (issue.subtasks ? issue.subtasks.length : 0);
  const doneSubtasks = issue.subtasks_done || (issue.subtasks ? issue.subtasks.filter(s => s.status === 'done' || s.completed).length : 0);
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
          <button data-action="quick-state" data-target-state="state-in-progress" data-issue-id="${issue.id}" class="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-amber-400" title="Pasar a En Progreso">
            ${Icons.play('w-3 h-3')}
          </button>
          <button data-action="quick-state" data-target-state="state-done" data-issue-id="${issue.id}" class="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-emerald-400" title="Marcar como Completado">
            ${Icons.check('w-3 h-3')}
          </button>
        </div>
      </div>

      <!-- Card Title -->
      <h4 class="text-xs font-medium text-zinc-100 group-hover:text-white line-clamp-2 leading-snug">
        ${issue.title}
      </h4>

      <!-- Subtasks Progress -->
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

      <!-- Card Footer: Module & Assignee -->
      <div class="pt-1 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-400">
        <span class="truncate max-w-[110px] font-mono text-zinc-400">
          ${issue.module_name || 'General'}
        </span>

        <span class="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/50 text-zinc-300 font-mono">
          ${Icons.user('w-2.5 h-2.5 text-indigo-400')}
          <span>${issue.assignee_role || 'Agent'}</span>
        </span>
      </div>
    </div>
  `;
}
