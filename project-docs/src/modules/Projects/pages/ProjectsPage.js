/**
 * ProjectsPage Component (Master View for Projects Domain)
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { ProjectHeader } from '../components/ProjectHeader.js';
import { ProjectCard } from '../components/ProjectCard.js';
import { renderList } from '../../../shared/utils/renderList.js';

export function ProjectsPage({
  workspace = {},
  project = {},
  stats = {},
  modules = []
} = {}) {
  const cards = [
    {
      title: 'Tareas Activas',
      value: stats.totalIssues || 0,
      subtitle: `${stats.completedIssues || 0} completadas (${stats.progressPercent || 0}%)`,
      icon: 'kanban',
      trend: '+100%',
      colorClass: 'text-indigo-400',
      bgClass: 'bg-indigo-950/20 border-indigo-500/20'
    },
    {
      title: 'Ciclos de Sprint',
      value: stats.cycleCount || 0,
      subtitle: 'Sprints temporizados',
      icon: 'cycle',
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-950/20 border-emerald-500/20'
    },
    {
      title: 'Módulos Arquitectura',
      value: stats.moduleCount || 0,
      subtitle: 'Bounded contexts modelados',
      icon: 'moduleIcon',
      colorClass: 'text-amber-400',
      bgClass: 'bg-amber-950/20 border-amber-500/20'
    },
    {
      title: 'Páginas de Conocimiento',
      value: stats.pageCount || 0,
      subtitle: 'Documentos vivos Markdown',
      icon: 'page',
      colorClass: 'text-sky-400',
      bgClass: 'bg-sky-950/20 border-sky-500/20'
    }
  ];

  return `
    <div class="flex-1 flex flex-col bg-zinc-950 overflow-y-auto">
      ${ProjectHeader({ workspace, project, stats })}

      <div class="p-6 max-w-7xl mx-auto w-full space-y-8">
        <!-- KPI Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${renderList(cards, ProjectCard)}
        </div>

        <!-- Modules Section -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-zinc-100 uppercase tracking-wider">Módulos Soberanos del Arnés</h3>
            <span class="text-xs font-mono text-zinc-400">${modules.length} Bounded Contexts</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${renderList(modules, mod => `
              <div class="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition-colors space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 text-indigo-400 border border-zinc-700">
                    ${mod.id}
                  </span>
                  <span class="text-[10px] font-mono text-emerald-400 font-medium">100% OK</span>
                </div>
                <div>
                  <h4 class="text-sm font-bold text-zinc-200">${mod.name}</h4>
                  <p class="text-xs text-zinc-400 mt-1 leading-relaxed">${mod.description || ''}</p>
                </div>
              </div>
            `)}
          </div>
        </div>
      </div>
    </div>
  `;
}
