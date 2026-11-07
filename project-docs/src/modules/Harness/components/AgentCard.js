/**
 * AgentCard Component
 * Tarjeta de inspección de rol y configuración de agente de IA soberano.
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { Icons } from '../../../shared/ui/Icons.js';
import { renderList } from '../../../shared/utils/renderList.js';

export function AgentCard({
  agent = {},
  isSelected = false
} = {}) {
  const isMaster = agent.id === 'leader';
  const roleBadge = isMaster
    ? '<span class="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 font-mono text-[10px] font-semibold">MASTER LEADER</span>'
    : '<span class="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono text-[10px] font-semibold">SUBAGENTE</span>';

  return `
    <div
      data-agent-id="${agent.id}"
      class="p-5 rounded-2xl border ${
        isSelected
          ? 'border-indigo-500/50 bg-indigo-950/20 shadow-lg'
          : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
      } flex flex-col justify-between space-y-4 transition-all"
    >
      <div class="space-y-3">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0 shadow-sm">
              ${agent.id ? agent.id.slice(0, 2).toUpperCase() : 'AG'}
            </div>
            <div>
              <h4 class="text-sm font-bold text-zinc-100 tracking-tight">${agent.name}</h4>
              <p class="text-[11px] text-zinc-400 font-medium">${agent.role}</p>
            </div>
          </div>
          ${roleBadge}
        </div>

        <p class="text-xs text-zinc-300 leading-relaxed">${agent.description}</p>

        <!-- Responsabilidades -->
        <div class="space-y-1.5 pt-2 border-t border-zinc-800/60">
          <span class="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Responsabilidades</span>
          <div class="space-y-1">
            ${renderList(agent.responsibilities || [], resp => `
              <div class="flex items-start gap-2 text-xs text-zinc-300">
                <span class="p-0.5 text-emerald-400 mt-0.5 shrink-0">${Icons.check('w-3 h-3')}</span>
                <span class="leading-snug">${resp}</span>
              </div>
            `)}
          </div>
        </div>
      </div>

      <!-- Footer: Tools -->
      <div class="pt-3 border-t border-zinc-800/60 flex flex-wrap items-center gap-1.5">
        <span class="text-[10px] text-zinc-400 uppercase font-semibold mr-1">Tools:</span>
        ${renderList(agent.tools || [], tool => `
          <span class="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400">
            ${tool}
          </span>
        `)}
      </div>
    </div>
  `;
}
