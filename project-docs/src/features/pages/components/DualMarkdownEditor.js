import { Icons } from '../../../shared/Icons.js';
import { renderMarkdown } from '../../../shared/MarkdownViewer.js';

export function DualMarkdownEditor({
  pageId = '',
  content = ''
}) {
  return `
    <div class="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-zinc-800">
      <!-- Editor Textarea -->
      <div class="flex-1 flex flex-col min-h-0 bg-zinc-950/60 p-4">
        <textarea
          id="plane-page-editor-input"
          data-page-id="${pageId}"
          class="w-full flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed transition-all shadow-inner"
          placeholder="Escribe el contenido en Markdown aquí..."
        >${content}</textarea>
      </div>

      <!-- Live Preview Pane -->
      <div class="flex-1 flex flex-col min-h-0 bg-zinc-950 p-6 overflow-y-auto">
        <div class="px-2 py-1 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase border-b border-zinc-800/80 pb-2 mb-4">
          Previsualización en Vivo
        </div>
        <div id="plane-page-preview-target" class="prose prose-invert prose-xs max-w-none">
          ${renderMarkdown(content)}
        </div>
      </div>
    </div>
  `;
}
