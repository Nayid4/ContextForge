/**
 * Harness Domain Module Barrel (Public API)
 * 100% Vectorial, sin dependencias externas ni emojis.
 */

// Services & Store
export { harnessService, HarnessService, CANONICAL_AGENTS, CANONICAL_SKILLS } from './services/harness.service.js';
export { harnessStore, HarnessStore, initialHarnessState } from './store/harness.store.js';

// Components
export { AgentCard } from './components/AgentCard.js';
export { AgentList } from './components/AgentList.js';
export { SkillSyncStatus } from './components/SkillSyncStatus.js';
export { HarnessOverview } from './components/HarnessOverview.js';
export { AiEngineMonitor } from './components/AiEngineMonitor.js';

// Master Page
import { HarnessPage } from './pages/HarnessPage.js';
export { HarnessPage };

// Backward compatibility helper
export function renderHarnessView(props = {}) {
  return HarnessPage(props);
}
