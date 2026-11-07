/**
 * HarnessOverview Component
 * Panel ejecutivo de gobernanza y directrices del arnés SDD.
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { Icons } from '../../../shared/ui/Icons.js';

export function HarnessOverview({
  governance = {}
} = {}) {
  return `
    <div class="space-y-6">
      <div class="border border-indigo-500/30 rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900/60 to-indigo-950/20 p-6 space-y-4 shadow-xl">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            ${Icons.shield('w-5 h-5')}
          </div>
          <div>
            <h3 class="text-base font-bold text-white tracking-tight">Gobernanza del Arnés SDD Multi-Agente</h3>
            <p class="text-xs text-zinc-400">Invariantes estrictas de calidad, control de ramas y arquitectura anti-sesgo.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          <div class="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1">
            <span class="text-[10px] uppercase font-semibold text-zinc-400">Ramas Semánticas (&le;80c)</span>
            <p class="text-xs font-mono text-indigo-300 font-medium">${governance.branchingConvention || '{feature|bugfix}/INT-*'}</p>
          </div>

          <div class="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1">
            <span class="text-[10px] uppercase font-semibold text-zinc-400">Formato de Commits</span>
            <p class="text-xs font-mono text-emerald-300 font-medium">${governance.commitFormat || 'feat(scope): desc'}</p>
          </div>

          <div class="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1">
            <span class="text-[10px] uppercase font-semibold text-zinc-400">Pureza Anti-Emoji</span>
            <p class="text-xs font-mono text-amber-300 font-medium">${governance.zeroEmojiInvariant || '0 emojis en todo el código'}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}
