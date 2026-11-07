/**
 * PageReader Component (Plane Editorial Reader + Smart Entity Chips + Navigation Pane)
 * Lector editorial con chips interactivos (INT-XXX, BR-XXX, RF-XXX, ADR-XXX, CAP-XXX),
 * soporte Full-Width y Panel de Inspección Derecho de 4 pestañas.
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { Icons } from '../../../shared/ui/Icons.js';
import { renderList } from '../../../shared/utils/renderList.js';
import { renderMarkdown } from '../../../shared/utils/markdown.js';
import { PageNavigationPane, renderFloatingOutlineBars } from './PageNavigationPane.js';

/**
 * Transforma referencias técnicas (INT-XXX, BR-XXX, RF-XXX, ADR-XXX, CAP-XXX) en Smart Entity Chips
 * respetando bloques <pre>, <code> y diagramas Mermaid.
 * @param {string} html
 * @param {Array<Record<string, any>>} [issues]
 * @returns {string}
 */
export function enrichMarkdownWithSmartChips(html = '', issues = []) {
  if (!html || typeof html !== 'string') return '';

  const issueMap = new Map();
  if (Array.isArray(issues)) {
    for (const iss of issues) {
      if (iss && iss.id) issueMap.set(String(iss.id).toUpperCase(), iss);
    }
  }

  // Separar bloques protegidos (<pre>...</pre>, <code...>...</code>, <div class="mermaid...">...</div>)
  const protectedBlocks = [];
  const placeholderHtml = html.replace(
    /(<pre[\s\S]*?<\/pre>|<code[\s\S]*?<\/code>|<div[^>]*class="[^"]*mermaid[^"]*"[\s\S]*?<\/div>)/gi,
    (match) => {
      const idx = protectedBlocks.length;
      protectedBlocks.push(match);
      return `___PROTECTED_BLOCK_${idx}___`;
    }
  );

  // Dividir por etiquetas HTML para modificar únicamente nodos de texto
  const tokens = placeholderHtml.split(/(<[^>]+>)/g);
  const enrichedTokens = tokens.map(token => {
    if (token.startsWith('<')) return token;

    return token
      // INT-XXX -> Plane Issue Embed Chip interactivo que abre IssueDetailModal
      .replace(/\b(INT-\d{3})\b/g, (match, issueId) => {
        const issue = issueMap.get(issueId);
        const isDone = issue && (issue.status === 'completed' || issue.state_id === 'state-done');
        const isProgress = issue && (issue.status === 'in_progress' || issue.state_id === 'state-progress');
        const colorClasses = isDone
          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
          : isProgress
            ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/25'
            : 'bg-zinc-800/90 border-zinc-700 text-zinc-200 hover:border-indigo-500/40';
        const dotColor = isDone ? 'bg-emerald-400' : isProgress ? 'bg-indigo-400' : 'bg-zinc-400';
        const titleAttr = issue ? `${issueId}: ${issue.name || ''} (${issue.status || 'completed'})` : `Abrir detalle de tarea ${issueId}`;

        return `<button type="button" data-action="view-detail" data-id="${issueId}" title="${titleAttr.replace(/"/g, '&quot;')}" class="plane-issue-chip inline-flex items-center gap-1.5 px-2 py-0.5 mx-0.5 rounded-md border font-mono text-[11px] font-semibold transition-all cursor-pointer align-baseline ${colorClasses}"><span class="w-1.5 h-1.5 rounded-full ${dotColor}"></span><span>${issueId}</span></button>`;
      })
      // BR-XXX -> Business Rule Badge
      .replace(/\b(BR-\d{2,3})\b/g, '<span class="plane-smart-chip inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-semibold" title="Regla de Negocio Invariante $1">$1</span>')
      // RF-XXX -> Functional Requirement Badge
      .replace(/\b(RF-\d{2,3})\b/g, '<span class="plane-smart-chip inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] font-semibold" title="Requisito Funcional $1">$1</span>')
      // ADR-XXX -> Architectural Decision Record Badge
      .replace(/\b(ADR-\d{2,3})\b/g, '<span class="plane-smart-chip inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded bg-violet-500/10 border border-violet-500/30 text-violet-300 font-mono text-[11px] font-semibold" title="Decisión Arquitectónica $1">$1</span>')
      // CAP-XXX -> Capability Badge
      .replace(/\b(CAP-\d{2,3})\b/g, '<span class="plane-smart-chip inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] font-semibold" title="Capacidad del Sistema $1">$1</span>');
  });

  let result = enrichedTokens.join('');
  result = result.replace(/___PROTECTED_BLOCK_(\d+)___/g, (_, idx) => protectedBlocks[Number(idx)] || '');
  return result;
}

export function PageReader({
  page = {},
  content = '',
  toc = [],
  issues = [],
  pages = [],
  isFullWidth = false,
  showNavigationPane = true,
  activeNavTab = 'outline'
} = {}) {
  const rawMarkdown = content || page.content_markdown || '# Documento Vacío';
  const words = page.word_count || (rawMarkdown.trim().split(/\s+/).filter(Boolean).length) || 0;
  const readingTime = page.reading_time_min || Math.max(1, Math.ceil(words / 200));
  const labels = Array.isArray(page.labels) ? page.labels : [];
  const isLocked = Boolean(page.is_locked);
  const isFavorite = Boolean(page.is_favorite);

  let viewPropsFullWidth = isFullWidth;
  if (!viewPropsFullWidth && page.view_props) {
    try {
      const parsed = typeof page.view_props === 'string' ? JSON.parse(page.view_props) : page.view_props;
      if (parsed && parsed.full_width) viewPropsFullWidth = true;
    } catch (_) { /* ignore */ }
  }

  const renderedHtml = enrichMarkdownWithSmartChips(renderMarkdown(rawMarkdown), issues);

  return `
    <div class="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative">
      <!-- Reading Column (Centered or Full Width per Plane view_props) -->
      <article class="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto ${viewPropsFullWidth ? 'max-w-none w-full' : 'max-w-4xl mx-auto w-full'} selection:bg-indigo-500/20 selection:text-indigo-200 transition-all">
        <!-- Document Meta Badge & Plane Labels -->
        <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400 font-mono mb-4 pb-4 border-b border-zinc-800/60">
          <div class="flex flex-wrap items-center gap-2.5">
            <span class="flex items-center gap-1.5 text-indigo-400">
              ${Icons.fileText('w-3.5 h-3.5')}
              <span class="truncate">${page.file_path || 'Documento Markdown'}</span>
            </span>
            <span class="text-zinc-600">·</span>
            <span>${words} palabras</span>
            <span class="text-zinc-600">·</span>
            <span>${readingTime} min de lectura</span>
            ${isLocked ? `
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-semibold">
                ${Icons.lock('w-3 h-3')}
                <span>Normativa Bloqueada</span>
              </span>
            ` : ''}
            ${isFavorite ? `
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-semibold">
                ${Icons.star('w-3 h-3 fill-amber-400')}
                <span>Favorita</span>
              </span>
            ` : ''}
          </div>

          ${labels.length > 0 ? `
            <div class="flex flex-wrap items-center gap-1.5">
              ${renderList(labels, lbl => `
                <span class="px-2 py-0.5 rounded-md text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
                  ${lbl.name}
                </span>
              `)}
            </div>
          ` : ''}
        </div>

        <!-- Rendered Content Target with Smart Entity Chips -->
        <div class="prose prose-invert prose-indigo max-w-none text-zinc-200 leading-relaxed space-y-4">
          ${renderedHtml}
        </div>
      </article>

      <!-- Right Column: Plane 4-Tab PageNavigationPane or Floating Mini-Bars -->
      ${showNavigationPane
        ? PageNavigationPane({
            page,
            content: rawMarkdown,
            toc,
            activeTab: activeNavTab,
            issues,
            pages
          })
        : renderFloatingOutlineBars(toc)
      }
    </div>
  `;
}
