import { renderPlaneSidebar } from '../components/PlaneSidebar.js';
import { renderPlaneTopBar } from '../components/PlaneTopBar.js';
import { renderOmniboxModal } from '../components/OmniboxModal.js';

export function renderMasterLayout({
  sidebarProps = {},
  topBarProps = {},
  omniboxProps = {},
  mainContentHtml = '',
  modalHtml = ''
}) {
  return `
    <div id="plane-app-root" class="min-h-screen bg-zinc-950 text-zinc-100 flex flex-row font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <!-- 1. Left Sidebar -->
      ${renderPlaneSidebar(sidebarProps)}

      <!-- 2. Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <!-- Top Navigation Bar -->
        ${renderPlaneTopBar(topBarProps)}

        <!-- Feature View Container -->
        <main id="tab-content" class="flex-1 flex flex-col min-h-0 overflow-y-auto">
          ${mainContentHtml}
        </main>
      </div>

      <!-- 3. Omnibox Modal (Ctrl+K) -->
      ${renderOmniboxModal(omniboxProps)}

      <!-- 4. Flyout Detail Modal / Overlays -->
      ${modalHtml}
    </div>
  `;
}
