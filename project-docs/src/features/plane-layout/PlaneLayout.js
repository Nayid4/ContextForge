import { renderPlaneSidebar } from './PlaneSidebar.js';
import { renderPlaneTopBar } from './PlaneTopBar.js';
import { renderPlaneControlsBar } from './PlaneControlsBar.js';
import { renderIssueListView } from '../plane-issues/IssueListView.js';
import { renderIssueBoardView } from '../plane-issues/IssueBoardView.js';
import { renderIssueCalendarView } from '../plane-issues/IssueCalendarView.js';
import { renderIssueSpreadsheetView } from '../plane-issues/IssueSpreadsheetView.js';
import { renderIssueDetailModal } from '../plane-issues/IssueDetailModal.js';
import { renderCyclesView } from '../plane-cycles/CyclesView.js';
import { renderModulesView } from '../plane-modules/ModulesView.js';
import { renderPlanePagesView } from '../plane-pages/PlanePagesView.js';
import { renderAnalyticsView } from '../plane-analytics/AnalyticsView.js';

export function renderPlaneLayout({
  planeData = {},
  currentView = 'issues',
  currentViewMode = 'list',
  filterState = 'all',
  filterPriority = 'all',
  filterAssignee = 'all',
  groupBy = 'state',
  orderBy = 'sequence',
  searchQuery = '',
  pageSearchQuery = '',
  activePageId = null,
  activePageContent = '',
  selectedIssueId = null,
  isSidebarCollapsed = false,
  theme = 'dark',
  pageEditorMode = 'reader',
  activeSpec = null,
  legacyContentHtml = ''
}) {
  const issues = planeData.issues || [];
  const states = planeData.states || [];
  const cycles = planeData.cycles || [];
  const modules = planeData.modules || [];
  const pages = planeData.pages || [];
  const workspace = planeData.workspace || { name: 'Harness Engineering Workspace' };
  const project = planeData.project || { name: 'Arnés SDD Multi-Agente' };

  // Filtrado de Issues
  const filteredIssues = issues.filter(issue => {
    if (filterState !== 'all' && issue.state_id !== filterState) return false;
    if (filterPriority !== 'all' && (issue.priority || 'none').toLowerCase() !== filterPriority.toLowerCase()) return false;
    if (filterAssignee !== 'all' && (issue.assignee_role || '').toLowerCase() !== filterAssignee.toLowerCase()) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (issue.title || '').toLowerCase().includes(q);
      const matchId = (issue.id || '').toLowerCase().includes(q);
      const matchDesc = (issue.description || '').toLowerCase().includes(q);
      if (!matchTitle && !matchId && !matchDesc) return false;
    }
    return true;
  });

  // Título según la vista
  let viewTitle = 'Tareas (Issues)';
  if (currentView === 'cycles') viewTitle = 'Ciclos (Sprints)';
  if (currentView === 'modules') viewTitle = 'Módulos (Epics)';
  if (currentView === 'pages') viewTitle = 'Páginas (Docs / IA)';
  if (currentView === 'analytics') viewTitle = 'Métricas & Burn-down';
  if (currentView === 'space3d') viewTitle = 'Constelación 3D';
  if (currentView === 'depgraph') viewTitle = 'Grafo de Dependencias';

  // Renderizar contenido central según vista
  let mainContentHtml = '';
  if (currentView === 'issues') {
    const controlsHtml = renderPlaneControlsBar({
      currentViewMode,
      filterState,
      filterPriority,
      filterAssignee,
      groupBy,
      orderBy,
      searchQuery,
      totalIssues: issues.length,
      filteredIssues: filteredIssues.length
    });

    let viewComponentHtml = '';
    if (currentViewMode === 'list') {
      viewComponentHtml = renderIssueListView({ issues: filteredIssues, states, groupBy });
    } else if (currentViewMode === 'board') {
      viewComponentHtml = renderIssueBoardView({ issues: filteredIssues, states });
    } else if (currentViewMode === 'calendar') {
      viewComponentHtml = renderIssueCalendarView({ issues: filteredIssues, cycles });
    } else if (currentViewMode === 'spreadsheet') {
      viewComponentHtml = renderIssueSpreadsheetView({ issues: filteredIssues });
    }

    mainContentHtml = `
      ${controlsHtml}
      <div class="flex-1 overflow-y-auto">
        ${viewComponentHtml}
      </div>
    `;
  } else if (currentView === 'cycles') {
    mainContentHtml = `
      <div class="flex-1 overflow-y-auto">
        ${renderCyclesView({ cycles, issues })}
      </div>
    `;
  } else if (currentView === 'modules') {
    mainContentHtml = `
      <div class="flex-1 overflow-y-auto">
        ${renderModulesView({ modules, issues })}
      </div>
    `;
  } else if (currentView === 'pages') {
    mainContentHtml = renderPlanePagesView({
      pages,
      activePageId,
      activePageContent,
      searchQuery: pageSearchQuery,
      editorMode: pageEditorMode
    });
  } else if (currentView === 'analytics') {
    mainContentHtml = `
      <div class="flex-1 overflow-y-auto">
        ${renderAnalyticsView({ issues, states, cycles, modules })}
      </div>
    `;
  } else if (currentView === 'space3d' || currentView === 'depgraph') {
    mainContentHtml = `
      <div class="flex-1 overflow-y-auto p-6">
        ${legacyContentHtml}
      </div>
    `;
  }

  // Modal de Detalle de Issue si está seleccionado
  let modalHtml = '';
  if (selectedIssueId) {
    const selectedIssue = issues.find(i => i.id === selectedIssueId);
    if (selectedIssue) {
      modalHtml = renderIssueDetailModal({
        issue: selectedIssue,
        states,
        cycles,
        modules
      });
    }
  }

  return `
    <div class="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans antialiased">
      <!-- Left Sidebar -->
      ${renderPlaneSidebar({
        currentView,
        activeWorkspace: workspace.name,
        activeProject: project.name,
        issueCount: issues.length,
        cycleCount: cycles.length,
        moduleCount: modules.length,
        pageCount: pages.length,
        isCollapsed: isSidebarCollapsed
      })}

      <!-- Main Column -->
      <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <!-- TopBar -->
        ${renderPlaneTopBar({
          workspaceName: workspace.name,
          projectName: project.name,
          viewTitle,
          theme,
          activeSpec
        })}

        <!-- Main Dynamic View Container -->
        <main id="plane-main-view" class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          ${mainContentHtml}
        </main>
      </div>

      <!-- Modals Layer -->
      ${modalHtml}
    </div>
  `;
}
