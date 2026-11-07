import { Icons } from '../../../shared/Icons.js';
import { renderList } from '../../../shared/utils/renderList.js';
import { renderMarkdown, extractTableOfContents } from '../../../shared/MarkdownViewer.js';
import { PageShelfTree } from '../components/PageShelfTree.js';
import { DualMarkdownEditor } from '../components/DualMarkdownEditor.js';

export function renderPlanePagesView({
  pages = [],
  activePageId = null,
  activePageContent = '',
  searchQuery = '',
  editorMode = 'reader', // 'reader' | 'editor'
  onSelectPage = () => {},
  onSaveMarkdown = () => {}
}) {
  const activePage = pages.find(p => p.id === activePageId) || pages[0] || {};
  const currentContent = activePageContent || activePage.content_markdown || '';

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
      <!-- Left Sidebar: Pages Tree Component -->
      ${PageShelfTree({
        shelves,
        activePageId: activePage.id,
        searchQuery
      })}

      <!-- Main Pane: Page Reader / Editor -->
      <main class="flex-1 flex flex-col min-h-0 bg-zinc-950 overflow-hidden">
        <!-- Document Toolbar Header -->
        <div class="h-12 px-6 border-b border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between gap-4 shrink-0">
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-indigo-400 font-bold shrink-0">
              ${activePage.shelf || 'doc'}
            </span>
            <span class="text-xs font-bold text-zinc-100 truncate">${activePage.title || 'Selecciona un documento'}</span>
          </div>

          <div class="flex items-center gap-2">
            <!-- Mode Toggle (Lector / Editor) -->
            <button
              id="plane-page-toggle-mode"
              class="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
            >
              ${editorMode === 'reader' ? Icons.edit('w-3.5 h-3.5') : Icons.book('w-3.5 h-3.5')}
              <span>${editorMode === 'reader' ? 'Modo Editor' : 'Modo Lectura'}</span>
            </button>

            <!-- Save button in Editor mode -->
            ${editorMode === 'editor' ? `
              <button
                id="plane-page-save-btn"
                data-page-id="${activePage.id}"
                class="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
              >
                ${Icons.save('w-3.5 h-3.5')}
                <span>Guardar en SQLite y Disco</span>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Document Body Container -->
        <div class="flex-1 flex overflow-hidden">
          ${editorMode === 'editor' ? `
            <!-- Live Dual Editor Component -->
            ${DualMarkdownEditor({ pageId: activePage.id, content: currentContent })}
          ` : `
            <!-- Reader Mode with Floating TOC -->
            <div class="flex-1 p-6 md:p-10 overflow-y-auto max-w-4xl mx-auto space-y-6">
              <div class="space-y-2 border-b border-zinc-800 pb-4">
                <div class="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                  <span>${activePage.file_path || 'project-docs/knowledge/'}</span>
                  <span>·</span>
                  <span>${activePage.word_count || 0} palabras</span>
                  <span>·</span>
                  <span>${activePage.reading_time || 1} min lectura</span>
                </div>
                <h1 class="text-2xl font-black text-zinc-100 tracking-tight">${activePage.title || ''}</h1>
              </div>

              <!-- Rendered Article -->
              <article class="prose prose-invert prose-zinc max-w-none text-zinc-300 leading-relaxed text-sm">
                ${renderMarkdown(currentContent)}
              </article>
            </div>

            <!-- Right: Dynamic Table of Contents (TOC) -->
            ${toc && toc.length > 0 ? `
              <aside class="hidden xl:block w-64 p-6 border-l border-zinc-800/80 bg-zinc-950/40 overflow-y-auto shrink-0 space-y-3">
                <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">En este documento</span>
                <nav class="space-y-1">
                  ${renderList(toc, h => `
                    <a
                      href="#${h.id}"
                      class="block text-xs text-zinc-400 hover:text-indigo-400 transition-colors truncate ${h.level === 3 ? 'pl-3 text-[11px]' : ''}"
                    >
                      ${h.text}
                    </a>
                  `)}
                </nav>
              </aside>
            ` : ''}
          `}
        </div>
      </main>
    </div>
  `;
}
