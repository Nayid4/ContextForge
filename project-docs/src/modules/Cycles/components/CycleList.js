/**
 * CycleList Component
 * Grid / lista de ciclos de desarrollo.
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { CycleCard } from './CycleCard.js';
import { renderList } from '../../../shared/utils/renderList.js';

export function CycleList({
  cycles = [],
  issues = [],
  activeCycleId = null,
  calculateMetrics = () => ({})
} = {}) {
  if (!cycles || cycles.length === 0) {
    return `
      <div class="p-8 text-center border border-dashed border-zinc-800 rounded-2xl text-xs text-zinc-500">
        No hay ciclos registrados en el proyecto
      </div>
    `;
  }

  return `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      ${renderList(cycles, cycle => {
        const metrics = calculateMetrics(cycle, issues);
        return CycleCard({
          cycle,
          metrics,
          isActive: cycle.id === activeCycleId
        });
      })}
    </div>
  `;
}
