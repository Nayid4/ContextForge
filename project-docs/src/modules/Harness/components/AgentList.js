/**
 * AgentList Component
 * Grid de agentes especializados del arnés SDD.
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { AgentCard } from './AgentCard.js';
import { renderList } from '../../../shared/utils/renderList.js';

export function AgentList({
  agents = [],
  selectedAgentId = 'leader'
} = {}) {
  return `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      ${renderList(agents, agent => AgentCard({
        agent,
        isSelected: agent.id === selectedAgentId
      }))}
    </div>
  `;
}
