/**
 * Issues Domain Module Barrel (Public API)
 * 100% Vectorial, accesible, sin dependencias externas ni emojis.
 */

// Services & Store
export { issueService, IssueService, CANONICAL_STATES } from './services/issue.service.js';
export { issueStore, IssueStore, initialIssueState } from './store/issue.store.js';

import { IssueCard } from './components/IssueCard.js';
import { IssueRow } from './components/IssueRow.js';
import { IssueBoard } from './components/IssueBoard.js';
import { IssueList } from './components/IssueList.js';
import { IssueDetailModal } from './components/IssueDetailModal.js';
import { IssueControlsBar } from './components/IssueControlsBar.js';
import { IssueFilters } from './components/IssueFilters.js';

export {
  IssueCard,
  IssueRow,
  IssueBoard,
  IssueList,
  IssueDetailModal,
  IssueControlsBar,
  IssueFilters
};

// Master Page
export { IssuesPage } from './pages/IssuesPage.js';

// Legacy compatibility helpers
export function renderIssueListView(props = {}) {
  return IssueList(props);
}

export function renderIssueBoardView(props = {}) {
  return IssueBoard(props);
}

export function renderIssueCalendarView(props = {}) {
  return IssueBoard(props);
}

export function renderIssueSpreadsheetView(props = {}) {
  return IssueList({ ...props, groupBy: 'none' });
}
