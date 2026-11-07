/**
 * ProjectSelector Component
 * Menú selector de proyectos y workspaces disponibles.
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { Icons } from '../../../shared/ui/Icons.js';

export function ProjectSelector({
  currentProject = 'Arnés de Ingeniería SDD',
  projects = [
    { id: 'harness', name: 'Arnés de Ingeniería SDD', active: true },
    { id: 'plane-sync', name: 'Plane SQLite Sync Bridge', active: false }
  ]
} = {}) {
  return `
    <div class="relative inline-block text-left">
      <button data-action="toggle-project-menu" class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-200 hover:border-zinc-700 transition-colors">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="truncate max-w-[140px]">${currentProject}</span>
        ${Icons.chevronDown('w-3.5 h-3.5 text-zinc-400')}
      </button>
    </div>
  `;
}
