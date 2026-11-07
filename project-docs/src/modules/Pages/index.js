/**
 * Pages Domain Module Barrel (Public API)
 * 100% Vectorial, sin dependencias externas ni emojis.
 */

// Services & Store
export { pageService, PageService } from './services/page.service.js';
export { pageStore, PageStore, initialPageState } from './store/page.store.js';

// Components
export { PageShelfTree } from './components/PageShelfTree.js';
export { PageReader } from './components/PageReader.js';
export { DualMarkdownEditor } from './components/DualMarkdownEditor.js';
export { renderKnowledgeBase } from './components/KnowledgeBase.js';

// Master Page
import { PagesPage } from './pages/PagesPage.js';
export { PagesPage };

// Backward compatibility helper
export function renderPlanePagesView(props = {}) {
  return PagesPage(props);
}
