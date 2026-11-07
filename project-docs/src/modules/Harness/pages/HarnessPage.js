/**
 * HarnessPage Component (Master View for Harness & Agents Domain)
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { Icons } from '../../../shared/ui/Icons.js';
import { AgentList } from '../components/AgentList.js';
import { SkillSyncStatus } from '../components/SkillSyncStatus.js';
import { HarnessOverview } from '../components/HarnessOverview.js';
import { harnessService } from '../services/harness.service.js';

export function HarnessPage({
  agents = [],
  skills = [],
  selectedAgentId = 'leader'
} = {}) {
  const activeAgents = agents && agents.length > 0 ? agents : harnessService.getAgents();
  const activeSkills = skills && skills.length > 0 ? skills : harnessService.getSkills();
  const governance = harnessService.getGovernanceOverview();

  return `
    <div class="flex-1 flex flex-col bg-zinc-950 overflow-y-auto">
      <div class="p-6 space-y-8 max-w-7xl mx-auto w-full">
        <!-- Header -->
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
              ${Icons.bot('w-5 h-5 text-indigo-400')}
              <span>Orquestación de Agentes & Gobernanza SDD</span>
            </h2>
            <p class="text-xs text-zinc-400 mt-0.5">Control de subagentes especializados, habilidades homologadas y verificación de reglas.</p>
          </div>
        </div>

        <!-- Governance Overview Banner -->
        ${HarnessOverview({ governance })}

        <!-- Agents Grid -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-zinc-100 uppercase tracking-wider">
              Equipo de Agentes Especializados (${activeAgents.length})
            </h3>
            <span class="text-xs font-mono text-zinc-400">Arquitectura Multi-Agente SDD</span>
          </div>

          ${AgentList({ agents: activeAgents, selectedAgentId })}
        </div>

        <!-- Skills Triple Sync Section -->
        <div class="space-y-4">
          ${SkillSyncStatus({ skills: activeSkills })}
        </div>
      </div>
    </div>
  `;
}
