/**
 * PagesPage Component (Master View for Plane Pages Domain)
 * Incluye PageHeaderActions (Sync Badge, Favorite, Lock, Full Width, Copy Markdown,
 * Ask Harness AI Menu, Inspector Drawer Toggle), PageShelfTree y PageNavigationPane.
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { Icons } from '../../../shared/ui/Icons.js';
import { PageShelfTree } from '../components/PageShelfTree.js';
import { PageReader } from '../components/PageReader.js';
import { DualMarkdownEditor } from '../components/DualMarkdownEditor.js';
import { extractTableOfContents } from '../../../shared/utils/markdown.js';

/**
 * Renderiza la barra de acciones estilo Plane (PageHeaderActions) y el panel Ask Harness AI.
 */
export function renderPageHeaderActions({
  activePage = {},
  isFullWidth = false,
  showNavigationPane = true,
  showAiMenu = false
} = {}) {
  const isFavorite = Boolean(activePage.is_favorite);
  const isLocked = Boolean(activePage.is_locked);
  const isArchived = Boolean(activePage.archived_at);
  const isPrivate = Number(activePage.access || 0) === 1;
  const pageId = activePage.id || 'page-default';
  const logs = Array.isArray(activePage.logs) ? activePage.logs : [];
  const issueLinks = logs.filter(l => l.entity_name === 'issue' || l.entity_name === 'forward_issue');
  const ruleLinks = logs.filter(l => ['business_rule', 'requirement', 'adr', 'capability'].includes(l.entity_name));

  return `
    <div class="flex items-center gap-1.5 flex-wrap" id="plane-page-header-actions">
      <!-- Sync Status Badge -->
      <span
        id="plane-page-sync-badge"
        class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-300"
        title="Sincronizado bidireccionalmente entre SQLite (harness.db) y archivo físico .md"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span>SQLite + .md Synced</span>
      </span>

      <!-- Access Toggle: Public (0) vs Private (1) per Plane BR-PAGE-01 & BR-PAGE-04 -->
      <button
        type="button"
        data-action="toggle-page-access"
        data-page-id="${pageId}"
        ${isArchived ? 'disabled' : ''}
        class="h-7 inline-flex items-center gap-1 px-2 rounded-md border text-[11px] font-mono font-semibold transition-colors shadow-2xs ${
          isArchived
            ? 'bg-gray-100 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800/50 text-gray-400 dark:text-zinc-600 cursor-not-allowed'
            : isPrivate
              ? 'bg-violet-50 dark:bg-violet-500/15 border-violet-200 dark:border-violet-500/40 text-violet-700 dark:text-violet-300 cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-500/25'
              : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer'
        }"
        title="${isArchived ? 'Restaura la página para cambiar el acceso' : isPrivate ? 'Página Privada (Clic para hacer Pública)' : 'Página Pública (Clic para hacer Privada)'}"
      >
        ${isPrivate ? Icons.lock('w-3 h-3 text-violet-600 dark:text-violet-400') : Icons.globe('w-3 h-3 text-indigo-600 dark:text-indigo-400')}
        <span>${isPrivate ? 'Private' : 'Public'}</span>
      </button>

      <!-- Favorite Toggle (is_favorite) - Hidden when archived per Plane BR-PAGE-03 -->
      ${!isArchived ? `
        <button
          type="button"
          data-action="toggle-page-favorite"
          data-page-id="${pageId}"
          class="h-7 w-7 rounded-md border flex items-center justify-center transition-colors cursor-pointer shadow-2xs ${
            isFavorite
              ? 'bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/40 text-amber-600 dark:text-amber-300'
              : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800'
          }"
          title="${isFavorite ? 'Quitar de Favoritas' : 'Marcar como Página Favorita'}"
        >
          ${Icons.star(`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-500' : ''}`)}
        </button>
      ` : ''}

      <!-- Lock / Unlock Toggle (is_locked) -->
      <button
        type="button"
        data-action="toggle-page-lock"
        data-page-id="${pageId}"
        class="h-7 w-7 rounded-md border flex items-center justify-center transition-colors cursor-pointer shadow-2xs ${
          isLocked
            ? 'bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/40 text-amber-600 dark:text-amber-300'
            : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800'
        }"
        title="${isLocked ? 'Página Normativa Bloqueada (Clic para desbloquear edición)' : 'Bloquear edición (Página Normativa)'}"
      >
        ${isLocked ? Icons.lock('w-3.5 h-3.5 text-amber-500') : Icons.unlock('w-3.5 h-3.5')}
      </button>

      <!-- Full Width Toggle (view_props.full_width) -->
      <button
        type="button"
        data-action="toggle-page-fullwidth"
        data-page-id="${pageId}"
        class="h-7 w-7 rounded-md border flex items-center justify-center transition-colors cursor-pointer shadow-2xs ${
          isFullWidth
            ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-200 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-300'
            : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800'
        }"
        title="${isFullWidth ? 'Restaurar ancho centrado editorial' : 'Alternar Ancho Completo (Full Width)'}"
      >
        ${Icons.maximize('w-3.5 h-3.5')}
      </button>

      <!-- Copy Markdown Button -->
      <button
        type="button"
        data-action="copy-page-markdown"
        data-page-id="${pageId}"
        class="h-7 w-7 rounded-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
        title="Copiar código Markdown al portapapeles"
      >
        ${Icons.copy('w-3.5 h-3.5')}
      </button>

      <!-- Duplicate Page (Make a copy per Plane BR-PAGE-05) -->
      <button
        type="button"
        data-action="duplicate-page"
        data-page-id="${pageId}"
        class="h-7 w-7 rounded-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
        title="Hacer una copia de la página (Make a copy)"
      >
        ${Icons.plus('w-3.5 h-3.5')}
      </button>

      <!-- Archive / Restore Page (Plane BR-PAGE-03) -->
      <button
        type="button"
        data-action="toggle-page-archive"
        data-page-id="${pageId}"
        class="h-7 w-7 rounded-md border flex items-center justify-center transition-colors cursor-pointer shadow-2xs ${
          isArchived
            ? 'bg-rose-50 dark:bg-rose-500/15 border-rose-200 dark:border-rose-500/40 text-rose-600 dark:text-rose-300'
            : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800'
        }"
        title="${isArchived ? 'Restaurar página archivada (Restore)' : 'Archivar página (Archive)'}"
      >
        ${isArchived ? Icons.archiveRestore('w-3.5 h-3.5') : Icons.archive('w-3.5 h-3.5')}
      </button>

      <!-- Export Page Modal Trigger -->
      <button
        type="button"
        data-action="open-export-page-modal"
        data-page-id="${pageId}"
        class="h-7 w-7 rounded-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
        title="Exportar página (Markdown / HTML Report)"
      >
        ${Icons.download('w-3.5 h-3.5')}
      </button>

      <!-- Ask Harness AI Assistant Button (Plane AskPiMenu / EditorAIMenu) -->
      <div class="relative">
        <button
          type="button"
          data-action="toggle-page-ai-menu"
          data-page-id="${pageId}"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-all cursor-pointer shadow-2xs ${
            showAiMenu
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
              : 'bg-indigo-50 dark:bg-indigo-600/15 border-indigo-200 dark:border-indigo-500/35 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-600/25'
          }"
          title="Abrir Asistente IA de Página (Ask Harness AI)"
        >
          ${Icons.sparkles('w-3.5 h-3.5')}
          <span class="hidden md:inline">Ask Harness AI</span>
        </button>

        ${showAiMenu ? `
          <div
            id="plane-page-ai-popover"
            class="absolute right-0 top-9 z-50 w-80 sm:w-96 p-4 rounded-xl bg-white dark:bg-zinc-900/95 backdrop-blur-md border border-gray-200 dark:border-indigo-500/30 shadow-2xl space-y-3 text-left text-gray-900 dark:text-zinc-100"
          >
            <div class="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-2">
              <div class="flex items-center gap-2">
                <span class="p-1 rounded-md bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300">
                  ${Icons.sparkles('w-3.5 h-3.5')}
                </span>
                <div>
                  <div class="text-xs font-bold text-gray-900 dark:text-zinc-100">Ask Harness AI · Contexto de Página</div>
                  <div class="text-[10px] font-mono text-gray-500 dark:text-zinc-400">Agente: /project-knowledge + SQLite Graph</div>
                </div>
              </div>
              <button
                type="button"
                data-action="toggle-page-ai-menu"
                class="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                ${Icons.close('w-3.5 h-3.5')}
              </button>
            </div>

            <div class="p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-950/90 border border-gray-200 dark:border-zinc-800/80 space-y-1.5 text-[11px]">
              <div class="flex items-center justify-between text-gray-700 dark:text-zinc-300">
                <span class="font-semibold">Telemetría Semántica:</span>
                <span class="font-mono text-indigo-600 dark:text-indigo-300">${activePage.word_count || 0} palabras · ${activePage.diagrams_count || 0} diagramas</span>
              </div>
              <div class="flex items-center justify-between text-gray-600 dark:text-zinc-400">
                <span>Tareas vinculadas (PageLog):</span>
                <span class="font-mono text-emerald-600 dark:text-emerald-400">${issueLinks.length} INT-*</span>
              </div>
              <div class="flex items-center justify-between text-gray-600 dark:text-zinc-400">
                <span>Invariantes y Reglas (BR/RF/ADR):</span>
                <span class="font-mono text-amber-600 dark:text-amber-300">${ruleLinks.length} nodos</span>
              </div>
            </div>

            <div class="space-y-1.5">
              <div class="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Acciones de Agente IA (Plane AI Menu)</div>
              <button
                type="button"
                data-action="switch-page-nav-tab"
                data-tab="info"
                class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-950/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-gray-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-500/40 text-xs text-gray-800 dark:text-zinc-200 transition-colors cursor-pointer"
              >
                <span>Inspeccionar Grafo Relacional (PageLog)</span>
                <span class="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">${logs.length} vínculos</span>
              </button>
              <button
                type="button"
                data-action="switch-page-nav-tab"
                data-tab="assets"
                class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-950/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-gray-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-500/40 text-xs text-gray-800 dark:text-zinc-200 transition-colors cursor-pointer"
              >
                <span>Auditar Diagramas Mermaid & Assets</span>
                <span class="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">${activePage.diagrams_count || 0} diagramas</span>
              </button>
              <button
                type="button"
                data-action="switch-page-nav-tab"
                data-tab="version_history"
                class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-950/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-gray-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-500/40 text-xs text-gray-800 dark:text-zinc-200 transition-colors cursor-pointer"
              >
                <span>Consultar Historial de Versiones IA</span>
                <span class="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">${(activePage.versions || []).length || 1} snapshots</span>
              </button>
            </div>

            <div class="pt-1 border-t border-gray-200 dark:border-zinc-800/80">
              <div class="text-[10px] text-gray-500 dark:text-zinc-500 mb-1">Comando CLI para Skill <code class="text-indigo-600 dark:text-indigo-300">/project-knowledge</code>:</div>
              <code class="block p-2 rounded bg-gray-100 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-[10px] font-mono text-emerald-600 dark:text-emerald-300 break-all select-all">node project-docs/cli.js page upsert --id "${pageId}" --title "${(activePage.title || 'Doc').replace(/"/g, '')}" --shelf "${activePage.shelf || 'architecture'}" --file "project-docs/${activePage.file_path || 'knowledge/c4-model.md'}"</code>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Right Inspection Pane Toggle -->
      <button
        type="button"
        data-action="toggle-page-nav-pane"
        class="p-1.5 rounded-lg border transition-colors cursor-pointer shadow-2xs ${
          showNavigationPane
            ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-200 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-300'
            : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800'
        }"
        title="${showNavigationPane ? 'Ocultar Panel de Inspección Derecho' : 'Abrir Panel de Inspección Derecho (Outline, Info, Assets, Historial)'}"
      >
        ${Icons.sidebarRight('w-3.5 h-3.5')}
      </button>
    </div>
  `;
}

export function PagesPage({
  pages = [],
  issues = [],
  activePageId = null,
  activePageContent = '',
  searchQuery = '',
  filterTab = 'all',
  editorMode = 'reader', // 'reader' | 'editor'
  isFullWidth = false,
  showNavigationPane = true,
  activeNavTab = 'outline',
  showAiMenu = false,
  onSelectPage = () => {},
  onSaveMarkdown = () => {}
} = {}) {
  const activePage = pages.find(p => p.id === activePageId) || pages[0] || {};
  const currentContent = activePageContent || activePage.content_markdown || '';
  const isLocked = Boolean(activePage.is_locked);

  // Filtrar páginas por búsqueda
  const filteredPages = pages.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (p.title || '').toLowerCase().includes(q) || (p.file_path && p.file_path.toLowerCase().includes(q));
  });

  // Agrupar páginas por estante (shelf)
  const shelves = {
    architecture: { name: 'Arquitectura & Modelado C4', pages: [] },
    business_rules: { name: 'Reglas de Negocio & Invariantes', pages: [] },
    requirements: { name: 'Requerimientos & User Stories', pages: [] },
    adrs: { name: 'Decisiones de Arquitectura (ADRs)', pages: [] },
    standards: { name: 'Estándares & Servicios', pages: [] },
    modules: { name: 'Módulos & Bounded Contexts', pages: [] },
    specs: { name: 'Especificaciones Técnicas (Specs)', pages: [] }
  };

  for (const p of filteredPages) {
    const s = p.shelf || 'standards';
    if (shelves[s]) {
      shelves[s].pages.push(p);
    } else {
      shelves.standards.pages.push(p);
    }
  }

  // Generar TOC
  const toc = extractTableOfContents(currentContent);

  return `
    <div class="h-[calc(100vh-112px)] flex flex-col md:flex-row overflow-hidden bg-zinc-950">
      <!-- Left Sidebar: Pages Tree Component with Plane Filter Tabs -->
      ${PageShelfTree({
        shelves,
        activePageId: activePage.id,
        searchQuery,
        filterTab
      })}

      <!-- Main Pane: Page Reader / Editor -->
      <main class="flex-1 flex flex-col min-h-0 bg-zinc-950 overflow-hidden">
        <!-- Document Toolbar Header (Plane PageHeaderActions) -->
        <header class="min-h-12 py-2 border-b border-zinc-800/80 bg-zinc-900/30 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 shrink-0 select-none">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="p-1 rounded-md bg-zinc-800 text-indigo-400 shrink-0">
              ${Icons.page('w-4 h-4')}
            </span>
            <h3 class="text-xs font-bold text-zinc-100 truncate">${activePage.title || 'Selecciona una página'}</h3>
            ${activePage.reading_time_min ? `
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono hidden lg:inline-block">
                ${activePage.reading_time_min} min de lectura
              </span>
            ` : ''}
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            ${renderPageHeaderActions({
              activePage,
              isFullWidth,
              showNavigationPane,
              showAiMenu
            })}

            <!-- Mode Switcher: Reader vs Editor -->
            <div class="flex items-center p-0.5 rounded-lg bg-zinc-900 border border-zinc-800">
              <button
                data-action="set-page-mode"
                data-mode="reader"
                class="px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  editorMode === 'reader'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }"
              >
                Lector Editorial
              </button>
              <button
                data-action="set-page-mode"
                data-mode="editor"
                ${isLocked ? 'disabled title="Página Normativa Bloqueada — Desbloquéala primero para editar"' : ''}
                class="px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  isLocked
                    ? 'text-zinc-600 cursor-not-allowed'
                    : editorMode === 'editor'
                      ? 'bg-indigo-600 text-white shadow-xs cursor-pointer'
                      : 'text-zinc-400 hover:text-zinc-200 cursor-pointer'
                }"
              >
                Editor Dual
              </button>
            </div>

            <!-- Save Button (Only in Editor Mode) -->
            ${editorMode === 'editor' && !isLocked ? `
              <button
                id="plane-page-save-btn"
                data-action="save-page-markdown"
                data-page-id="${activePage.id}"
                class="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
              >
                ${Icons.save ? Icons.save('w-3.5 h-3.5') : Icons.check('w-3.5 h-3.5')}
                <span>Guardar</span>
              </button>
            ` : ''}
          </div>
        </header>

        <!-- Dynamic Content Body -->
        <div class="flex-1 flex min-h-0 overflow-hidden">
          ${editorMode === 'editor' && !isLocked
            ? DualMarkdownEditor({ pageId: activePage.id, content: currentContent })
            : PageReader({
                page: activePage,
                content: currentContent,
                toc,
                issues,
                pages,
                isFullWidth,
                showNavigationPane,
                activeNavTab
              })
          }
        </div>
      </main>
    </div>
  `;
}
