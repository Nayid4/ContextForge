import { Icons } from '../../shared/Icons.js';
import { renderMarkdown, extractTableOfContents } from '../../shared/MarkdownViewer.js';

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
    return p.title.toLowerCase().includes(q) || (p.file_path && p.file_path.toLowerCase().includes(q));
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
      <!-- Left Sidebar: Pages Tree -->
      <aside class="w-full md:w-80 border-b md:border-b-0 md:border-r border-zinc-800/80 bg-zinc-950/70 flex flex-col shrink-0">
        <!-- Search box -->
        <div class="p-3 border-b border-zinc-800/80">
          <div class="relative">
            <input
              id="plane-page-search"
              type="text"
              placeholder="Buscar documentos..."
              value="${searchQuery}"
              class="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-500 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <span class="absolute left-2.5 top-2 text-zinc-500 pointer-events-none">
              ${Icons.search('w-3.5 h-3.5')}
            </span>
          </div>
        </div>

        <!-- Shelf & Pages Tree List -->
        <div class="flex-1 p-2 space-y-3 overflow-y-auto">
          ${Object.keys(shelves).map(sKey => {
            const shelf = shelves[sKey];
            if (shelf.pages.length === 0) return '';

            return `
              <div class="space-y-1">
                <div class="px-2 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>${shelf.name}</span>
                  <span class="font-mono text-[9px] text-zinc-400">${shelf.pages.length}</span>
                </div>

                <div class="space-y-0.5">
                  ${shelf.pages.map(page => {
                    const isSelected = page.id === activePage.id;
                    return `
                      <button
                        data-page-id="${page.id}"
                        class="plane-page-item w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors text-left truncate ${isSelected ? 'bg-indigo-600/15 text-indigo-300 font-medium border border-indigo-500/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'}"
                        title="${page.title}"
                      >
                        ${Icons.fileText('w-3.5 h-3.5 shrink-0 text-zinc-400')}
                        <span class="truncate">${page.title}</span>
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </aside>

      <!-- Main Pane: Page Reader / Editor -->
      <main class="flex-1 flex flex-col overflow-hidden bg-zinc-950">
        <!-- Top Toolbar -->
        <div class="h-12 px-6 border-b border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between gap-4 shrink-0">
          <div class="flex items-center gap-3 truncate text-xs">
            <span class="font-mono text-zinc-400 truncate max-w-xs">${activePage.file_path || ''}</span>
            <span class="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-mono">
              ${activePage.word_count || 0} palabras · ${activePage.reading_time_min || 1} min
            </span>
          </div>

          <!-- Mode Toggle & Save Button -->
          <div class="flex items-center gap-2">
            <div class="flex items-center p-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
              <button id="toggle-reader-mode" class="px-2.5 py-1 rounded font-medium transition-colors ${editorMode === 'reader' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}">
                Lectura
              </button>
              <button id="toggle-editor-mode" class="px-2.5 py-1 rounded font-medium transition-colors ${editorMode === 'editor' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}">
                Editor Markdown
              </button>
            </div>

            ${editorMode === 'editor' ? `
              <button id="plane-save-page" data-page-id="${activePage.id}" class="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-sm">
                ${Icons.save('w-3.5 h-3.5')}
                <span>Guardar en SQLite & Disco</span>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Document Content Area -->
        <div class="flex-1 flex overflow-hidden">
          <!-- Reader / Editor Container -->
          <div class="flex-1 p-6 md:p-8 overflow-y-auto">
            ${editorMode === 'editor' ? `
              <div class="h-full flex flex-col space-y-2">
                <textarea
                  id="plane-page-editor-textarea"
                  class="flex-1 w-full bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-200 leading-relaxed focus:outline-none focus:border-indigo-500 resize-none"
                  placeholder="Escribe el contenido Markdown aquí..."
                >${currentContent}</textarea>
                <div class="text-[11px] text-zinc-400 flex items-center justify-between">
                  <span>Al guardar se actualiza la base de datos SQLite y el archivo .md original en disco para los agentes de IA.</span>
                  <span class="font-mono text-emerald-400">Markdown Nativo</span>
                </div>
              </div>
            ` : `
              <div class="max-w-4xl mx-auto space-y-6">
                <div>
                  <h1 class="text-2xl font-bold text-zinc-100 tracking-tight">${activePage.title}</h1>
                  <p class="text-xs text-zinc-400 mt-1">${activePage.summary || ''}</p>
                </div>

                <div class="prose prose-invert max-w-none text-xs text-zinc-300 leading-relaxed">
                  ${renderMarkdown(currentContent)}
                </div>
              </div>
            `}
          </div>

          <!-- Table of Contents Sidebar (Reader Mode) -->
          ${editorMode === 'reader' && toc && toc.length > 0 ? `
            <div class="hidden xl:block w-64 p-6 border-l border-zinc-800/80 overflow-y-auto shrink-0 text-xs">
              <span class="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">En este documento</span>
              <nav class="mt-3 space-y-1">
                ${toc.map(item => `
                  <a
                    href="#${item.id}"
                    class="block py-1 text-zinc-400 hover:text-indigo-400 transition-colors truncate"
                    style="padding-left: ${(item.level - 1) * 8}px"
                  >
                    ${item.text}
                  </a>
                `).join('')}
              </nav>
            </div>
          ` : ''}
        </div>
      </main>
    </div>
  `;
}
