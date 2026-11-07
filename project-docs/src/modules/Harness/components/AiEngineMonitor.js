/**
 * AiEngineMonitor Component
 * Panel de monitoreo de la integracion IA de Plane: ai_configs, api_tokens (is_bot=1) y ai_runs.
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { Icons } from '../../../shared/ui/Icons.js';
import { renderList } from '../../../shared/utils/renderList.js';

export function AiEngineMonitor({
  aiConfigs = [],
  aiRuns = [],
  apiTokens = []
} = {}) {
  return `
    <div class="space-y-6">
      <!-- AI Instance Configs & Bot API Tokens -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Plane InstanceConfig / LLMProvider -->
        <div class="border border-zinc-800 rounded-2xl bg-zinc-950 overflow-hidden">
          <div class="px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
            <div class="flex items-center gap-2">
              ${Icons.bot('w-4 h-4 text-indigo-400')}
              <h4 class="text-xs font-bold text-zinc-100 uppercase tracking-wider">Configuración IA (Plane InstanceConfig)</h4>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">ai_configs</span>
          </div>
          <div class="divide-y divide-zinc-800/60 text-xs">
            ${renderList(aiConfigs, cfg => `
              <div class="px-5 py-3 flex items-center justify-between gap-4">
                <div>
                  <span class="font-mono font-bold text-zinc-200">${cfg.key}</span>
                  <p class="text-[11px] text-zinc-400 mt-0.5">${cfg.value}</p>
                </div>
                <span class="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-[10px] text-emerald-400 shrink-0">
                  ${cfg.provider}
                </span>
              </div>
            `, () => `
              <div class="p-4 text-xs text-zinc-500 text-center">Configuración por defecto: Antigravity Gemini 2.5 Pro + SQLite WAL</div>
            `)}
          </div>
        </div>

        <!-- Plane Bot API Tokens -->
        <div class="border border-zinc-800 rounded-2xl bg-zinc-950 overflow-hidden">
          <div class="px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
            <div class="flex items-center gap-2">
              ${Icons.shield('w-4 h-4 text-emerald-400')}
              <h4 class="text-xs font-bold text-zinc-100 uppercase tracking-wider">Tokens de Agentes Bot (Plane APIToken)</h4>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">user_type = 1 (Bot)</span>
          </div>
          <div class="divide-y divide-zinc-800/60 text-xs">
            ${renderList(apiTokens, tok => `
              <div class="px-5 py-3 flex items-center justify-between gap-4">
                <div>
                  <span class="font-semibold text-zinc-200">${tok.label}</span>
                  <p class="font-mono text-[11px] text-zinc-400 mt-0.5">Usuario Bot: ${tok.user_id}</p>
                </div>
                <span class="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 font-mono text-[10px] text-emerald-400 shrink-0">
                  ACTIVO
                </span>
              </div>
            `, () => `
              <div class="p-4 text-xs text-zinc-500 text-center">4 Tokens de Subagentes Bot registrados en SQLite</div>
            `)}
          </div>
        </div>
      </div>

      <!-- AI Skill Execution Audit Log (ai_runs <-> knowledge/ai-runs-log.md) -->
      <div class="border border-zinc-800 rounded-2xl bg-zinc-950 overflow-hidden">
        <div class="px-6 py-4 border-b border-zinc-800 bg-zinc-900/40 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 class="text-sm font-bold text-zinc-100 tracking-tight">Bitácora Soberana de Ejecuciones de Skills e IA (${aiRuns.length})</h4>
            <p class="text-xs text-zinc-400 mt-0.5">Sincronizada en tiempo real entre la tabla relacional <code class="text-indigo-400">ai_runs</code> y el documento <code class="text-emerald-400">knowledge/ai-runs-log.md</code>.</p>
          </div>
          <span class="px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 font-mono text-xs font-semibold">
            PERSISTENCIA DUAL ACTIVA
          </span>
        </div>

        <div class="overflow-x-auto max-h-96 overflow-y-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-zinc-900/60 text-zinc-400 uppercase font-semibold text-[10px] tracking-wider border-b border-zinc-800 sticky top-0">
              <tr>
                <th class="px-5 py-3">ID Ejecución</th>
                <th class="px-4 py-3">Skill SDD</th>
                <th class="px-4 py-3">Agente Bot</th>
                <th class="px-4 py-3">Tarea / Destino</th>
                <th class="px-5 py-3">Resumen & Artefactos Enviados</th>
                <th class="px-4 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800/60">
              ${renderList(aiRuns.slice(0, 20), run => `
                <tr class="hover:bg-zinc-900/30 transition-colors">
                  <td class="px-5 py-3 font-mono text-[11px] text-zinc-400">${run.id}</td>
                  <td class="px-4 py-3 font-mono font-bold text-indigo-400">/${run.skill_name}</td>
                  <td class="px-4 py-3 font-mono text-zinc-300">${run.agent_role}</td>
                  <td class="px-4 py-3 font-mono text-cyan-400 font-semibold">${run.issue_id || run.page_id || 'GLOBAL'}</td>
                  <td class="px-5 py-3 text-zinc-300">${run.prompt_summary}</td>
                  <td class="px-4 py-3 text-center">
                    <span class="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] uppercase">
                      ${run.status || 'completed'}
                    </span>
                  </td>
                </tr>
              `, () => `
                <tr>
                  <td colspan="6" class="px-6 py-8 text-center text-zinc-500">
                    Ejecute cualquier skill SDD o <code class="text-indigo-400">node project-docs/cli.js ai log</code> para registrar trazabilidad IA.
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
