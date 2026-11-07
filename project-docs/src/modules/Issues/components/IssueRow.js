/**
 * IssueRow Component (List / Table View Atomic Row)
 * Representación tabular de una tarea para vistas compactas tipo Plane y hojas de cálculo.
 * 100% Vectorial, sin dependencias externas ni emojis.
 */
import { Icons } from '../../../shared/ui/Icons.js';
import { Badge } from '../../../shared/ui/Badge.js';

export function IssueRow(issue) {
  if (!issue) return '';

  const priorityIcons = {
    urgent: Icons.priorityUrgent('w-3.5 h-3.5 text-rose-500 shrink-0'),
    high: Icons.priorityHigh('w-3.5 h-3.5 text-amber-500 shrink-0'),
    medium: Icons.priorityMedium('w-3.5 h-3.5 text-blue-500 shrink-0'),
    low: Icons.priorityLow('w-3.5 h-3.5 text-zinc-400 shrink-0')
  };
  const pIcon = priorityIcons[(issue.priority || 'none').toLowerCase()] || Icons.priorityLow('w-3.5 h-3.5 text-zinc-500 shrink-0');

  // Progreso de subtareas Jira
  const totalSubtasks = issue.subtasks_count || (issue.subtasks ? issue.subtasks.length : 0);
  const doneSubtasks = issue.subtasks_done || (issue.subtasks ? issue.subtasks.filter(s => s.status === 'done' || s.completed || s.status === 'passed').length : 0);
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

      <!-- Title & Badges DEV / QA -->
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
        <span class="text-[11px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded truncate max-w-[120px] inline-block">
          ${issue.module_name || 'Harness'}
        </span>
      </td>

      <!-- Assignee Agent -->
      <td class="py-3 px-4 w-32 hidden lg:table-cell">
        <div class="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px]">
          ${Icons.bot('w-3.5 h-3.5 text-indigo-400')}
          <span>${issue.assignee_role || 'implementer'}</span>
        </div>
      </td>

      <!-- State Badge -->
      <td class="py-3 px-4 w-32 text-right">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
          issue.state_id === 'state-done'
            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
            : (issue.state_id === 'state-in-progress' || issue.state_id === 'state-in-review')
              ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
              : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
        }">
          <span class="w-1.5 h-1.5 rounded-full ${
            issue.state_id === 'state-done'
              ? 'bg-emerald-400'
              : (issue.state_id === 'state-in-progress' || issue.state_id === 'state-in-review')
                ? 'bg-amber-400'
                : 'bg-zinc-500'
          }"></span>
          ${issue.state_name || 'Backlog'}
        </span>
      </td>
    </tr>
  `;
}
