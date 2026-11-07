/**
 * IssuesPage Component (Master Domain Page)
 * Ensamblador maestro del dominio Issues: monta la barra de controles, filtros y la vista activa (Board / List / etc.).
 * 100% Vectorial, sin dependencias externas ni emojis.
 */
import { IssueControlsBar } from '../components/IssueControlsBar.js';
import { IssueFilters } from '../components/IssueFilters.js';
import { IssueBoard } from '../components/IssueBoard.js';
import { IssueList } from '../components/IssueList.js';
import { IssueDetailModal } from '../components/IssueDetailModal.js';

export function IssuesPage({
  issues = [],
  states = [],
  viewMode = 'board',
  filters = {},
  groupBy = 'state',
  selectedIssue = null,
  cycles = [],
  modules = []
} = {}) {
  // Renderizado condicional según el modo de vista seleccionado
  let activeViewHtml = '';
  if (viewMode === 'list') {
    activeViewHtml = IssueList({ issues, states, groupBy });
  } else if (viewMode === 'spreadsheet') {
    activeViewHtml = IssueList({ issues, states, groupBy: 'none' });
  } else {
    // Por defecto modo Board (Kanban)
    activeViewHtml = IssueBoard({ issues, states });
  }

  return `
    <div id="plane-issues-page" class="flex-1 flex flex-col min-h-0">
      <!-- 1. Top Controls Bar (View switcher & GroupBy) -->
      ${IssueControlsBar({
        currentViewMode: viewMode,
        groupBy,
        issueCount: issues.length
      })}

      <!-- 2. Filters Bar -->
      ${IssueFilters({
        filters,
        states,
        modules
      })}

      <!-- 3. Active Presentation View -->
      <div id="plane-active-issues-view" class="flex-1 overflow-y-auto min-h-0">
        ${activeViewHtml}
      </div>

      <!-- 4. Detail Flyout Modal (Conditional) -->
      ${selectedIssue ? IssueDetailModal({ issue: selectedIssue, states, cycles, modules }) : ''}
    </div>
  `;
}
