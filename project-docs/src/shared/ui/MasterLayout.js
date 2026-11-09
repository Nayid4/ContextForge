/**
 * MasterLayout Component (Shared UI)
 * Shell estructural principal inspirado en Plane: sidebar a la izquierda, barra superior,
 * contenedor de vistas de dominio, paleta de comandos Omnibox (Ctrl+K) y flyouts.
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { renderPlaneSidebar } from './PlaneSidebar.js';
import { renderPlaneTopBar } from './PlaneTopBar.js';
import { renderOmniboxModal } from './OmniboxModal.js';

export function renderMasterLayout({
  sidebarProps = {},
  topBarProps = {},
  omniboxProps = {},
  mainContentHtml = '',
  modalHtml = ''
} = {}) {
  return `
    <div id="plane-app-root" class="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-row font-sans selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:text-indigo-200">
      <!-- 1. Left Sidebar -->
      ${renderPlaneSidebar(sidebarProps)}

      <!-- 2. Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <!-- Top Navigation Bar -->
        ${renderPlaneTopBar(topBarProps)}

        <!-- Domain Feature View Container -->
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
