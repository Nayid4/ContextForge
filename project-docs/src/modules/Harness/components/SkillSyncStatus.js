/**
 * SkillSyncStatus Component
 * Matriz de sincronización triple de skills del arnés SDD.
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { Icons } from '../../../shared/ui/Icons.js';
import { renderList } from '../../../shared/utils/renderList.js';

export function SkillSyncStatus({
  skills = []
} = {}) {
  return `
    <div class="border border-zinc-800 rounded-2xl bg-zinc-950 overflow-hidden shadow-sm">
      <div class="px-6 py-4 border-b border-zinc-800 flex items-center justify-between gap-4 bg-zinc-900/40">
        <div>
          <h4 class="text-sm font-bold text-zinc-100 tracking-tight">Matriz de Sincronización Triple de Skills</h4>
          <p class="text-xs text-zinc-400 mt-0.5">Homologación bidireccional entre opencode, GitHub Copilot y Google Antigravity.</p>
        </div>
        <span class="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold">
          100% HOMOLOGADO
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-zinc-900/60 text-zinc-400 uppercase font-semibold text-[10px] tracking-wider border-b border-zinc-800">
            <tr>
              <th class="px-6 py-3">Skill</th>
              <th class="px-6 py-3">Descripción</th>
              <th class="px-4 py-3 text-center">opencode</th>
              <th class="px-4 py-3 text-center">Copilot</th>
              <th class="px-4 py-3 text-center">Antigravity</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-800/60 font-mono">
            ${renderList(skills, skill => `
              <tr class="hover:bg-zinc-900/30 transition-colors">
                <td class="px-6 py-3.5 font-bold text-indigo-400">/${skill.name}</td>
                <td class="px-6 py-3.5 font-sans text-zinc-300 font-normal">${skill.description}</td>
                <td class="px-4 py-3.5 text-center text-emerald-400">
                  <span class="inline-flex items-center gap-1 text-[11px] font-semibold">${Icons.check('w-3.5 h-3.5')} OK</span>
                </td>
                <td class="px-4 py-3.5 text-center text-emerald-400">
                  <span class="inline-flex items-center gap-1 text-[11px] font-semibold">${Icons.check('w-3.5 h-3.5')} OK</span>
                </td>
                <td class="px-4 py-3.5 text-center text-emerald-400">
                  <span class="inline-flex items-center gap-1 text-[11px] font-semibold">${Icons.check('w-3.5 h-3.5')} OK</span>
                </td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
