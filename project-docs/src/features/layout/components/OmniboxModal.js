import { Icons } from '../../../shared/Icons.js';
import { renderList } from '../../../shared/utils/renderList.js';

export function renderOmniboxModal({
  isOpen = false,
  query = '',
  issues = [],
  pages = []
}) {
  if (!isOpen) return '';

  const q = (query || '').toLowerCase().trim();
  const matchedIssues = issues.filter(i =>
    (i.title || '').toLowerCase().includes(q) ||
    (i.id || '').toLowerCase().includes(q) ||
    (i.description || '').toLowerCase().includes(q)
  ).slice(0, 5);

  const matchedPages = pages.filter(p =>
    (p.title || '').toLowerCase().includes(q) ||
    (p.id || '').toLowerCase().includes(q) ||
    (p.file_path || '').toLowerCase().includes(q) ||
    (p.slug || '').toLowerCase().includes(q)
  ).slice(0, 5);

  const renderIssueResult = (issue) => `
    <div data-action="omnibox-select-issue" data-issue-id="${issue.id}" class="omnibox-item flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800/80 cursor-pointer transition-colors group">
      <div class="flex items-center gap-2.5 min-w-0">
        <span class="text-xs font-mono font-bold text-indigo-400 shrink-0">${issue.id}</span>
        <span class="text-xs text-zinc-200 truncate group-hover:text-white font-medium">${issue.title}</span>
      </div>
      <span class="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono shrink-0">${issue.state_name || issue.state_id}</span>
    </div>
  `;

  const renderPageResult = (page) => `
    <div data-action="omnibox-select-page" data-page-id="${page.id}" class="omnibox-item flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800/80 cursor-pointer transition-colors group">
      <div class="flex items-center gap-2.5 min-w-0">
        ${Icons.page('w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-400 shrink-0')}
        <span class="text-xs text-zinc-200 truncate group-hover:text-white font-medium">${page.title}</span>
        <span class="text-[10px] text-zinc-500 font-mono">${page.file_path ? page.file_path.split(/[\\/]/).pop() : (page.id ? page.id.replace('page-', '') : '')}</span>
      </div>
      <span class="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono shrink-0">${page.shelf_id || 'doc'}</span>
    </div>
  `;

  return `
    <div id="omnibox-modal" data-backdrop="plane-omnibox" class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
      <div class="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <!-- Input Header -->
        <div class="p-4 border-b border-zinc-800 flex items-center gap-3">
          ${Icons.search('w-5 h-5 text-indigo-400 shrink-0')}
          <input
            type="text"
            id="omnibox-input"
            value="${query}"
            placeholder="Escribe para buscar tareas, ciclos, módulos o páginas..."
            class="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
            autofocus
          />
          <kbd class="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-zinc-400">ESC</kbd>
        </div>

        <!-- Results Body -->
        <div id="omnibox-results" class="max-h-96 overflow-y-auto p-3 space-y-4">
          <!-- Issues Section -->
          <div>
            <div class="px-2 py-1 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
              Tareas Encontradas (${matchedIssues.length})
            </div>
            <div class="space-y-1 mt-1">
              ${renderList(matchedIssues, renderIssueResult, 'No se encontraron tareas coincidentes')}
            </div>
          </div>

          <!-- Pages Section -->
          <div>
            <div class="px-2 py-1 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
              Páginas de Conocimiento (${matchedPages.length})
            </div>
            <div class="space-y-1 mt-1">
              ${renderList(matchedPages, renderPageResult, 'No se encontraron documentos coincidentes')}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-3 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Navega con las flechas, pulsa Enter para abrir</span>
          <span class="font-mono">Plane Omnibox</span>
        </div>
      </div>
    </div>
  `;
}
