/**
 * ProjectHeader Component
 * Encabezado de proyecto con selector de contexto, badges de metodología y estado de salud.
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { Icons } from '../../../shared/ui/Icons.js';

export function ProjectHeader({
  workspace = {},
  project = {},
  stats = {}
} = {}) {
  const wsName = workspace.name || 'Harness Engineering';
  const projName = project.name || 'Arnés SDD Multi-Agente';
  const identifier = project.identifier || 'INT';
  const percent = stats.progressPercent || 0;

  return `
    <div class="border-b border-zinc-800/80 bg-zinc-950 px-6 py-6 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 flex items-center justify-center text-white font-bold text-base shadow-lg ring-1 ring-white/10">
            ${identifier}
          </div>
          <div>
            <div class="flex items-center gap-2.5">
              <span class="text-xs font-medium text-zinc-400">${wsName}</span>
              <span class="text-zinc-600">/</span>
              <h2 class="text-lg font-bold text-zinc-100 tracking-tight">${projName}</h2>
              <span class="px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 font-mono text-[10px] font-semibold">
                SDD v4.2
              </span>
            </div>
            <p class="text-xs text-zinc-400 mt-1 max-w-2xl">
              ${project.description || 'Gestión dirigida por especificaciones técnicas, trazabilidad Scrum y persistencia dual SQLite.'}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex flex-col items-end">
            <span class="text-[10px] text-zinc-400 uppercase font-semibold">Avance General</span>
            <div class="flex items-center gap-2 mt-0.5">
              <div class="w-24 h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                <div class="h-full bg-emerald-500 rounded-full transition-all duration-300" style="width: ${percent}%"></div>
              </div>
              <span class="text-xs font-mono font-bold text-emerald-400">${percent}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
