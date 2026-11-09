/**
 * PageCard Component (Plane Card / Gallery View)
 * Renderiza la tarjeta de página conforme a las especificaciones visuales de Plane:
 * - Tarjetas limpias: bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-4 hover:border-zinc-700 hover:bg-zinc-900 transition-all shadow-sm
 * - Encabezado: Icono w-4 h-4 text-zinc-400, badge discreto de visibilidad a la derecha, título text-sm font-semibold text-zinc-100 line-clamp-1
 * - Cuerpo: Extracto tipográfico limpio text-xs text-zinc-400 line-clamp-3 leading-relaxed mt-2
 * - Footer: Avatar circular w-5 h-5 text-[10px], fecha relativa a la derecha text-[11px] text-zinc-400
 * 100% Vectorial, 0 emojis.
 */
import { Icons } from '../../../shared/Icons.js';
import { getMarkdownSnippet } from '../../../shared/MarkdownViewer.js';
import { formatTimeAgo } from '../../../shared/utils/dates.js';

export function getPageName(title = '') {
  return (!title || !String(title).trim()) ? 'Untitled' : String(title).trim();
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function renderPageCard({ key, docMetadata = {}, docs = {}, findPlanePage, shelvesData = {} }) {
  const meta = docMetadata[key] || {
    title: key,
    summary: 'Documento técnico.',
    readingTime: 2,
    wordCount: 300,
    ruleCount: 0,
    reqCount: 0,
    adrCount: 0
  };
  const matchedPage = findPlanePage(key, meta);
  const isFav = Boolean(matchedPage.is_favorite);
  const isLocked = Boolean(matchedPage.is_locked);
  const isArchived = Boolean(matchedPage.archived_at);
  const isPrivate = Number(matchedPage.access || 0) === 1;
  const ownerRole = matchedPage.owned_by_role || 'spec-author';
  const avatarInitials = ownerRole === 'reviewer' ? 'RV' : ownerRole === 'leader' ? 'LD' : ownerRole === 'implementer' ? 'IM' : 'SA';
  const displayTitle = getPageName(meta.title || matchedPage.title);
  const shelfId = meta.shelf || 'architecture';
  const rawContent = docs[key] || '';
  const snippet = getMarkdownSnippet(rawContent, 3);
  const relativeDate = formatTimeAgo(matchedPage.updated_at || matchedPage.created_at);

  return `
    <div
      class="plane-page-card kb-shelf-doc-card plane-page-item bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-4 hover:border-zinc-700 hover:bg-zinc-900 transition-all shadow-sm flex flex-col justify-between gap-3 group"
      data-page-id="${matchedPage.id}"
      data-doc-key="${escapeAttr(key)}"
      data-doc-shelf="${escapeAttr(shelfId)}"
      data-doc-title="${escapeAttr(displayTitle)}"
      data-doc-module="${escapeAttr(meta.moduleName || '')}"
      data-page-access="${isPrivate ? '1' : '0'}"
      data-page-archived="${isArchived ? '1' : '0'}"
      data-page-favorite="${isFav ? '1' : '0'}"
      data-page-locked="${isLocked ? '1' : '0'}"
      data-page-owner="${escapeAttr(ownerRole)}"
      data-page-words="${meta.wordCount || 300}"
      data-page-updated="${escapeAttr(matchedPage.updated_at || '2026-11-07T15:00:00Z')}"
      data-page-created="${escapeAttr(matchedPage.created_at || '2026-11-01T10:00:00Z')}"
    >
      <!-- Encabezado de Tarjeta Plane -->
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <span class="w-6 h-6 rounded-md bg-zinc-800/90 border border-zinc-700/60 flex items-center justify-center text-zinc-400 group-hover:text-indigo-400 transition-colors shrink-0">
              ${Icons.page('w-3.5 h-3.5')}
            </span>
            <button
              type="button"
              data-action="open-article-read"
              data-doc-key="${escapeAttr(key)}"
              class="text-sm font-semibold text-zinc-100 line-clamp-1 hover:text-indigo-300 transition-colors text-left cursor-pointer truncate"
              title="${escapeAttr(displayTitle)}"
            >
              ${escapeHtml(displayTitle)}
            </button>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <!-- Badge discreto de visibilidad a la derecha -->
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded ${isPrivate ? 'bg-violet-950/60 text-violet-300 border border-violet-500/30' : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700/50'}">
              ${isPrivate ? 'Private' : 'Public'}
            </span>

            ${!isArchived ? `
              <button
                type="button"
                data-action="toggle-page-favorite"
                data-page-id="${matchedPage.id}"
                class="w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer ${
                  isFav ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
                }"
                title="${isFav ? 'Remove from favorites' : 'Add to favorites'}"
              >
                ${Icons.star(`w-3 h-3 ${isFav ? 'fill-amber-400' : ''}`)}
              </button>
            ` : ''}

            <button
              type="button"
              data-action="toggle-page-row-menu"
              data-page-id="${matchedPage.id}"
              class="w-5 h-5 rounded flex items-center justify-center text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
              title="More actions"
            >
              ${Icons.dotsHorizontal('w-3 h-3')}
            </button>
          </div>
        </div>

        <!-- Extracto tipográfico limpio mt-2 -->
        <p class="text-xs text-zinc-400 line-clamp-3 leading-relaxed mt-2 min-h-[2.8rem]">
          ${escapeHtml(snippet)}
        </p>
      </div>

      <!-- Footer Plane: Avatar + Fecha relativa + Open Button -->
      <div class="pt-2 border-t border-zinc-800/60 flex items-center justify-between gap-2 text-xs">
        <div class="flex items-center gap-2 min-w-0">
          <div
            class="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center text-[10px] font-bold shrink-0"
            title="Owned by: ${ownerRole} (BOT)"
          >
            ${avatarInitials}
          </div>
          <span class="text-[11px] text-zinc-400 truncate" title="Updated ${relativeDate}">
            ${relativeDate}
          </span>
        </div>

        <button
          type="button"
          data-action="open-article-read"
          data-doc-key="${escapeAttr(key)}"
          class="h-6 px-2.5 rounded bg-zinc-800 hover:bg-indigo-600 text-zinc-300 hover:text-white text-[11px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1 shrink-0"
        >
          ${Icons.bookOpen('w-3 h-3')}
          <span>Open</span>
        </button>
      </div>
    </div>
  `;
}
