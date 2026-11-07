import { Icons } from '../../../shared/Icons.js';

export function IssueRow(issue) {
  const priorityIcons = {
    urgent: Icons.priorityUrgent('w-3.5 h-3.5 text-rose-500 shrink-0'),
    high: Icons.priorityHigh('w-3.5 h-3.5 text-amber-500 shrink-0'),
    medium: Icons.priorityMedium('w-3.5 h-3.5 text-blue-500 shrink-0'),
    low: Icons.priorityLow('w-3.5 h-3.5 text-zinc-400 shrink-0')
  };
  const pIcon = priorityIcons[(issue.priority || 'none').toLowerCase()] || Icons.priorityLow('w-3.5 h-3.5 text-zinc-500 shrink-0');

  // Subtask progress
  const totalSubtasks = issue.subtasks_count || (issue.subtasks ? issue.subtasks.length : 0);
  const doneSubtasks = issue.subtasks_done || (issue.subtasks ? issue.subtasks.filter(s => s.status === 'done' || s.completed).length : 0);
  const percentSubtasks = totalSubtasks > 0 ? Math.round((doneSubtasks / totalSubtasks) * 100) : 0;

  return `
    <tr
      data-issue-id="${issue.id}"
      class="plane-issue-row group border-b border-zinc-800/40 hover:bg-zinc-900/70 transition-colors cursor-pointer select-none text-xs"
    >
      <!-- Priority & ID -->
      <td class="py-3 px-4 w-32">
        <div class="flex items-center gap-2.5">
          <span title="Prioridad: ${issue.priority || 'None'}">${pIcon}</span>
          <span class="font-mono font-bold text-indigo-400 group-hover:text-indigo-300">${issue.id}</span>
        </div>
      </td>

      <!-- Title & Badges -->
      <td class="py-3 px-4 min-w-[240px]">
        <div class="flex items-center gap-2">
          <button
            type="button"
            data-action="view-detail"
            data-id="${parseInt(String(issue.id || issue.sequence_id || '0').replace(/\D/g, ''), 10) || issue.id}"
            class="text-zinc-200 hover:text-indigo-400 font-medium truncate max-w-md text-left transition-colors cursor-pointer"
          >
            ${issue.title}
          </button>
          <span class="px-1.5 py-0.2 rounded bg-blue-900/30 border border-blue-500/20 text-blue-300 text-[10px] font-mono font-semibold">DEV</span>
          <span class="px-1.5 py-0.2 rounded bg-purple-900/30 border border-purple-500/20 text-purple-300 text-[10px] font-mono font-semibold">QA</span>
        </div>
      </td>

      <!-- Subtasks Jira Progress -->
      <td class="py-3 px-4 w-36 hidden sm:table-cell">
        ${totalSubtasks > 0 ? `
          <div class="flex items-center gap-2" title="Subtareas completadas: ${doneSubtasks}/${totalSubtasks}">
            <div class="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div class="h-full bg-emerald-500 rounded-full" style="width: ${percentSubtasks}%"></div>
            </div>
            <span class="text-[10px] text-zinc-400 font-mono">${doneSubtasks}/${totalSubtasks}</span>
          </div>
        ` : `
          <span class="text-[10px] text-zinc-500 font-mono">0 subtareas</span>
        `}
      </td>

      <!-- Module -->
      <td class="py-3 px-4 w-36 hidden md:table-cell">
        <span class="px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 text-[10px] text-zinc-300 font-mono truncate max-w-[120px] block">
          ${issue.module_name || 'Harness Core'}
        </span>
      </td>

      <!-- Assignee Agent -->
      <td class="py-3 px-4 w-32 hidden lg:table-cell">
        <span class="flex items-center gap-1 text-[11px] text-zinc-400 font-medium">
          ${Icons.user('w-3 h-3 text-indigo-400')}
          <span class="truncate">${issue.assignee_role || issue.assignee_name || 'leader'}</span>
        </span>
      </td>

      <!-- State Badge -->
      <td class="py-3 px-4 w-32 text-right">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
          issue.state_id === 'state-done'
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
            : issue.state_id === 'state-in-progress'
            ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
            : issue.state_id === 'state-in-review'
            ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
            : 'bg-zinc-800 border-zinc-700 text-zinc-400'
        }">
          ${issue.state_name || issue.state_id}
        </span>
      </td>
    </tr>
  `;
}
