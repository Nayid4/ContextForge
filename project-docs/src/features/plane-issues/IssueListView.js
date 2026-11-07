import { Icons } from '../../shared/Icons.js';

function getPriorityBadge(priority) {
  switch ((priority || '').toLowerCase()) {
    case 'urgent':
      return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">${Icons.priorityUrgent('w-3 h-3')} Urgente</span>`;
    case 'high':
      return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">${Icons.priorityHigh('w-3 h-3')} Alta</span>`;
    case 'medium':
      return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">${Icons.priorityMedium('w-3 h-3')} Media</span>`;
    case 'low':
      return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">${Icons.priorityLow('w-3 h-3')} Baja</span>`;
    default:
      return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-normal text-zinc-400">Ninguna</span>`;
  }
}

function getAssigneeBadge(role) {
  const r = (role || 'leader').toLowerCase();
  let bg = 'bg-zinc-800 text-zinc-300';
  if (r.includes('lead')) bg = 'bg-purple-900/40 text-purple-300 border border-purple-700/50';
  if (r.includes('impl')) bg = 'bg-blue-900/40 text-blue-300 border border-blue-700/50';
  if (r.includes('review') || r.includes('qa')) bg = 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50';
  if (r.includes('author') || r.includes('spec')) bg = 'bg-amber-900/40 text-amber-300 border border-amber-700/50';

  return `
    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${bg}">
      ${Icons.bot('w-3 h-3 shrink-0')}
      <span>${role || 'leader'}</span>
    </span>
  `;
}

export function renderIssueListView({
  issues = [],
  states = [],
  groupBy = 'state',
  onSelectIssue = () => {}
}) {
  if (!issues || issues.length === 0) {
    return `
      <div class="p-12 text-center text-zinc-400">
        <div class="inline-flex p-3 rounded-full bg-zinc-900 border border-zinc-800 mb-3 text-zinc-400">
          ${Icons.kanban('w-6 h-6')}
        </div>
        <h3 class="text-sm font-medium text-zinc-200">No hay tareas que coincidan con los filtros</h3>
        <p class="text-xs text-zinc-400 mt-1">Modifica los filtros o añade nuevas tareas al proyecto.</p>
      </div>
    `;
  }

  // Agrupación
  const groups = {};
  if (groupBy === 'state') {
    for (const s of states) {
      groups[s.id] = { id: s.id, name: s.name, color: s.color, items: [] };
    }
    for (const issue of issues) {
      if (!groups[issue.state_id]) {
        groups[issue.state_id] = { id: issue.state_id, name: issue.state_name || 'Sin Estado', color: '#71717a', items: [] };
      }
      groups[issue.state_id].items.push(issue);
    }
  } else if (groupBy === 'priority') {
    const pKeys = ['urgent', 'high', 'medium', 'low', 'none'];
    const pNames = { urgent: 'Urgente', high: 'Alta', medium: 'Media', low: 'Baja', none: 'Sin Prioridad' };
    const pColors = { urgent: '#f43f5e', high: '#f59e0b', medium: '#3b82f6', low: '#10b981', none: '#71717a' };
    for (const pk of pKeys) {
      groups[pk] = { id: pk, name: pNames[pk], color: pColors[pk], items: [] };
    }
    for (const issue of issues) {
      const p = (issue.priority || 'none').toLowerCase();
      if (!groups[p]) groups[p] = { id: p, name: p, color: '#71717a', items: [] };
      groups[p].items.push(issue);
    }
  } else if (groupBy === 'assignee') {
    for (const issue of issues) {
      const a = issue.assignee_role || 'Sin Asignar';
      if (!groups[a]) groups[a] = { id: a, name: a, color: '#8b5cf6', items: [] };
      groups[a].items.push(issue);
    }
  }

  let html = `<div class="p-6 space-y-6">`;

  for (const groupKey of Object.keys(groups)) {
    const group = groups[groupKey];
    if (group.items.length === 0 && groupBy !== 'state') continue;

    html += `
      <div class="border border-zinc-800/80 rounded-xl bg-zinc-950/60 overflow-hidden shadow-sm">
        <!-- Group Header -->
        <div class="px-4 py-2.5 bg-zinc-900/80 border-b border-zinc-800/80 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${group.color}"></span>
            <span class="text-xs font-semibold text-zinc-200 tracking-tight">${group.name}</span>
            <span class="px-2 py-0.2 rounded-full bg-zinc-800 text-[11px] font-mono text-zinc-400">
              ${group.items.length}
            </span>
          </div>
        </div>

        <!-- Issue Rows -->
        <div class="divide-y divide-zinc-800/50">
          ${group.items.length === 0 ? `
            <div class="px-4 py-3 text-xs text-zinc-400 italic">No hay tareas en esta categoría.</div>
          ` : group.items.map(issue => {
            const subtotal = issue.subtasks ? issue.subtasks.length : 0;
            const completed = issue.subtasks ? issue.subtasks.filter(s => s.status === 'done' || s.status === 'passed').length : 0;
            const percent = subtotal > 0 ? Math.round((completed / subtotal) * 100) : (issue.state_id === 'state-done' ? 100 : 0);

            return `
              <div
                data-issue-id="${issue.id}"
                class="plane-issue-row px-4 py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-zinc-900/60 transition-colors cursor-pointer group"
              >
                <!-- Left: State dot, Key & Title -->
                <div class="flex items-center gap-3 min-w-0 flex-1">
                  <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${issue.state_color || group.color}" title="${issue.state_name}"></span>
                  <span class="text-xs font-mono font-medium text-zinc-400 group-hover:text-indigo-400 shrink-0 transition-colors">
                    ${issue.id}
                  </span>
                  <span class="text-xs font-medium text-zinc-100 truncate group-hover:text-white transition-colors">
                    ${issue.title}
                  </span>
                </div>

                <!-- Right: Metadata Badges -->
                <div class="flex items-center gap-3 shrink-0">
                  <!-- Subtasks Progress -->
                  ${subtotal > 0 ? `
                    <div class="flex items-center gap-2 text-[11px] text-zinc-400">
                      <div class="w-14 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div class="h-full bg-emerald-500 rounded-full" style="width: ${percent}%"></div>
                      </div>
                      <span class="font-mono text-[10px] text-zinc-400">${completed}/${subtotal}</span>
                    </div>
                  ` : ''}

                  <!-- Priority Badge -->
                  ${getPriorityBadge(issue.priority)}

                  <!-- Assignee Avatar / Role -->
                  ${getAssigneeBadge(issue.assignee_role)}

                  <!-- Module Tag -->
                  ${issue.module_name ? `
                    <span class="hidden md:inline-block px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 truncate max-w-[120px]">
                      ${issue.module_name}
                    </span>
                  ` : ''}

                  <!-- Cycle Tag -->
                  ${issue.cycle_name ? `
                    <span class="hidden lg:inline-block px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 truncate max-w-[120px]">
                      ${issue.cycle_name.split(':')[0]}
                    </span>
                  ` : ''}

                  ${Icons.chevronRight('w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  html += `</div>`;
  return html;
}
