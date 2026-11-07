/**
 * Cycles Domain Module Barrel (Public API)
 * 100% Vectorial, sin dependencias externas ni emojis.
 */

// Services & Store
export { cycleService, CycleService } from './services/cycle.service.js';
export { cycleStore, CycleStore, initialCycleState } from './store/cycle.store.js';

// Components
export { BurnDownChart } from './components/BurnDownChart.js';
export { CycleCard } from './components/CycleCard.js';
export { CycleList } from './components/CycleList.js';

// Master Page
import { CyclesPage } from './pages/CyclesPage.js';
export { CyclesPage };

// Backward compatibility helper
export function renderCyclesView(props = {}) {
  return CyclesPage(props);
}
