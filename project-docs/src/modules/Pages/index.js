/**
 * Pages Domain Module Barrel (Public API)
 * 100% Vectorial, sin dependencias externas ni emojis.
 */

// Services & Store
export { pageService, PageService } from './services/page.service.js';
export { pageStore, PageStore, initialPageState } from './store/page.store.js';

// Components
export { PageShelfTree } from './components/PageShelfTree.js';
export { PageReader, enrichMarkdownWithSmartChips } from './components/PageReader.js';
export { PageNavigationPane, renderFloatingOutlineBars } from './components/PageNavigationPane.js';
export { DualMarkdownEditor } from './components/DualMarkdownEditor.js';
export { renderKnowledgeBase, getPageName, renderPageCard } from './components/KnowledgeBase.js';
export { renderPagesHeader } from './components/PagesHeader.js';
export { renderPageListRow } from './components/PageListBlock.js';
export { renderPageReaderCanvas } from './components/PageReaderCanvas.js';
export { renderPagePerspectives } from './components/PagePerspectives.js';
export { renderPageModals } from './components/PageModals.js';

// Controller
export { PagesController } from './controllers/PagesController.js';

// Master Page
import { PagesPage, renderPageHeaderActions } from './pages/PagesPage.js';
export { PagesPage, renderPageHeaderActions };

// Backward compatibility helper
export function renderPlanePagesView(props = {}) {
  return PagesPage(props);
}
