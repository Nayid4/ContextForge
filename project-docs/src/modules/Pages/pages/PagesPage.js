/**
 * PagesPage Component (Master View for Pages Domain)
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { Icons } from '../../../shared/ui/Icons.js';
import { PageShelfTree } from '../components/PageShelfTree.js';
import { PageReader } from '../components/PageReader.js';
import { DualMarkdownEditor } from '../components/DualMarkdownEditor.js';
import { extractTableOfContents } from '../../../shared/utils/markdown.js';

export function PagesPage({
  pages = [],
  activePageId = null,
  activePageContent = '',
  searchQuery = '',
  editorMode = 'reader', // 'reader' | 'editor'
  onSelectPage = () => {},
  onSaveMarkdown = () => {}
} = {}) {
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
        <header class="h-12 border-b border-zinc-800/80 bg-zinc-900/30 px-6 flex items-center justify-between gap-4 shrink-0 select-none">
          <div class="flex items-center gap-3 min-w-0">
            <span class="p-1 rounded-md bg-zinc-800 text-indigo-400 shrink-0">
              ${Icons.page('w-4 h-4')}
            </span>
            <h3 class="text-xs font-bold text-zinc-100 truncate">${activePage.title || 'Selecciona una página'}</h3>
            ${activePage.reading_time_min ? `
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono hidden sm:inline-block">
                ${activePage.reading_time_min} min de lectura
              </span>
            ` : ''}
          </div>

          <div class="flex items-center gap-2">
            <!-- Mode Switcher: Reader vs Editor -->
            <div class="flex items-center p-0.5 rounded-lg bg-zinc-900 border border-zinc-800">
              <button
                data-action="set-page-mode"
                data-mode="reader"
                class="px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
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
                class="px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  editorMode === 'editor'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }"
              >
                Editor Dual
              </button>
            </div>

            <!-- Save Button (Only in Editor Mode) -->
            ${editorMode === 'editor' ? `
              <button
                id="plane-page-save-btn"
                data-action="save-page-markdown"
                data-page-id="${activePage.id}"
                class="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                ${Icons.save ? Icons.save('w-3.5 h-3.5') : Icons.check('w-3.5 h-3.5')}
                <span>Guardar</span>
              </button>
            ` : ''}
          </div>
        </header>

        <!-- Dynamic Content Body -->
        <div class="flex-1 flex min-h-0 overflow-hidden">
          ${editorMode === 'editor'
            ? DualMarkdownEditor({ pageId: activePage.id, content: currentContent })
            : PageReader({ page: activePage, content: currentContent, toc })
          }
        </div>
      </main>
    </div>
  `;
}
