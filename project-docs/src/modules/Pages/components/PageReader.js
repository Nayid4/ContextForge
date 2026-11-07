/**
 * PageReader Component (ContextForge Centered Reader)
 * Lector editorial centrado con tabla de contenidos flotante y metadatos de lectura.
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { Icons } from '../../../shared/ui/Icons.js';
import { renderList } from '../../../shared/utils/renderList.js';
import { renderMarkdown } from '../../../shared/utils/markdown.js';

export function PageReader({
  page = {},
  content = '',
  toc = []
} = {}) {
  const words = page.word_count || (content.trim().split(/\s+/).filter(Boolean).length) || 0;
  const readingTime = page.reading_time_min || Math.max(1, Math.ceil(words / 200));

  return `
    <div class="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
      <!-- Centered Reading Column -->
      <article class="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto max-w-4xl mx-auto w-full selection:bg-indigo-500/20 selection:text-indigo-200">
        <!-- Document Meta Badge -->
        <div class="flex items-center gap-3 text-xs text-zinc-400 font-mono mb-4 pb-4 border-b border-zinc-800/60">
          <span class="flex items-center gap-1.5 text-indigo-400">
            ${Icons.fileText('w-3.5 h-3.5')}
            <span class="truncate">${page.file_path || 'Documento Markdown'}</span>
          </span>
          <span class="text-zinc-600">·</span>
          <span>${words} palabras</span>
          <span class="text-zinc-600">·</span>
          <span>${readingTime} min de lectura</span>
        </div>

        <!-- Rendered Content Target -->
        <div class="prose prose-invert prose-indigo max-w-none text-zinc-200 leading-relaxed space-y-4">
          ${renderMarkdown(content || page.content_markdown || '# Documento Vacío')}
        </div>
      </article>

      <!-- Right Column: Table of Contents (TOC) -->
      ${toc && toc.length > 0 ? `
        <aside class="w-64 p-6 border-l border-zinc-800/80 bg-zinc-950/40 hidden xl:flex flex-col shrink-0 overflow-y-auto">
          <div class="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            En esta página
          </div>
          <nav class="space-y-1.5 text-xs text-zinc-400">
            ${renderList(toc, item => `
              <a
                href="#${item.id}"
                class="block hover:text-indigo-300 transition-colors truncate ${item.level === 3 ? 'pl-3 text-[11px] text-zinc-500' : ''}"
                title="${item.text}"
              >
                ${item.text}
              </a>
            `)}
          </nav>
        </aside>
      ` : ''}
    </div>
  `;
}
