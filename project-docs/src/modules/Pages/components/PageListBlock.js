/**
 * PageListBlock Component (Plane List View Item & Groups)
 * Implementa las filas compactas de alta fidelidad visual de Plane (block.tsx / list-item.tsx):
 * - Altura compacta: py-2.5 px-3 con esquinas rounded-md y borde border-b border-zinc-800/60
 * - Hover: hover:bg-zinc-800/40 transition-colors duration-150 group
 * - Botones de acción rápida: opacity-0 group-hover:opacity-100 transition-opacity duration-150
 * - Jerarquía tipográfica:
 *     * Título: text-[13px] font-medium text-zinc-200 truncate
 *     * Ruta o snippet: text-xs text-zinc-500
 *     * Fecha relativa y autor: text-[11px] text-zinc-400 font-normal
 * 100% Vectorial, 0 emojis.
 */
import { Icons } from '../../../shared/Icons.js';
import { formatTimeAgo } from '../../../shared/utils/dates.js';

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

export function renderPageListRow({
  key,
  docMetadata = {},
  findPlanePage,
  shelfId = 'architecture'
}) {
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
  const displayTitle = (!meta.title || !String(meta.title).trim()) ? 'Untitled' : String(meta.title).trim();
  const relativeDate = formatTimeAgo(matchedPage.updated_at || matchedPage.created_at);

  return `
    <div
      class="kb-shelf-doc-card plane-page-item group relative flex items-center justify-between gap-3 py-2.5 px-3 border-b border-zinc-800/60 hover:bg-zinc-800/40 transition-colors duration-150 rounded-md"
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
      <!-- Left: Icono + Título + Ruta + Badges semánticos -->
      <div class="flex items-center gap-2.5 min-w-0 flex-1">
        <span class="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800/90 group-hover:border-indigo-500/30 flex items-center justify-center text-zinc-400 group-hover:text-indigo-400 transition-colors shrink-0">
          ${Icons.page('w-3.5 h-3.5')}
        </span>

        <div class="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            data-action="open-article-read"
            data-doc-key="${escapeAttr(key)}"
            class="text-[13px] font-medium text-zinc-200 group-hover:text-indigo-300 truncate text-left cursor-pointer transition-colors"
          >
            ${escapeHtml(displayTitle)}
          </button>
          <span class="text-xs text-zinc-500 truncate hidden lg:inline font-mono">
            ${escapeHtml(key)}
          </span>
        </div>

        <!-- Badges semánticos compactos -->
        <div class="hidden sm:flex items-center gap-1.5 shrink-0">
          ${isArchived ? `
            <span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-950/70 text-rose-300 border border-rose-500/30">
              Archived
            </span>
          ` : ''}
          ${isPrivate ? `
            <span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-violet-950/70 text-violet-300 border border-violet-500/30">
              Private
            </span>
          ` : ''}
          ${meta.moduleName ? `
            <span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-950/60 text-purple-300 border border-purple-500/30">
              ${escapeHtml(meta.moduleName)}
            </span>
          ` : ''}
          ${meta.ruleCount ? `
            <span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-500/30" title="${meta.ruleCount} Reglas BR">
              ${meta.ruleCount} BR
            </span>
          ` : ''}
        </div>
      </div>

      <!-- Right: Acciones rápidas (Encapsuladas con opacity-0 group-hover:opacity-100) + Autor + Fecha -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Acciones Rápidas en Hover -->
        <div class="action-buttons-group flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <!-- Visibilidad Toggle (Public/Private) -->
          <button
            type="button"
            data-action="toggle-page-access"
            data-page-id="${matchedPage.id}"
            ${isArchived ? 'disabled' : ''}
            class="w-6 h-6 rounded flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="${isArchived ? 'Página archivada' : isPrivate ? 'Hacer pública' : 'Hacer privada'}"
          >
            ${isPrivate ? Icons.lock('w-3.5 h-3.5 text-violet-400') : Icons.globe('w-3.5 h-3.5 text-zinc-500 group-hover:text-indigo-400')}
          </button>

          <!-- Lock Toggle -->
          <button
            type="button"
            data-action="toggle-page-lock"
            data-page-id="${matchedPage.id}"
            class="w-6 h-6 rounded flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="${isLocked ? 'Desbloquear' : 'Bloquear'}"
          >
            ${isLocked ? Icons.lock('w-3.5 h-3.5 text-amber-400') : Icons.unlock('w-3.5 h-3.5 text-zinc-500')}
          </button>

          <!-- Favorite Star (si no está archivada) -->
          ${!isArchived ? `
            <button
              type="button"
              data-action="toggle-page-favorite"
              data-page-id="${matchedPage.id}"
              class="w-6 h-6 rounded flex items-center justify-center transition-colors cursor-pointer ${
                isFav ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
              }"
              title="${isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}"
            >
              ${Icons.star(`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`)}
            </button>
          ` : ''}

          <!-- Botones Leer y Editar -->
          <button
            type="button"
            data-action="open-article-read"
            data-doc-key="${escapeAttr(key)}"
            class="h-6 px-2 rounded bg-zinc-900 hover:bg-indigo-600 text-zinc-300 hover:text-white border border-zinc-800 text-[11px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            ${Icons.bookOpen('w-3 h-3')}
            <span>Leer</span>
          </button>

          <button
            type="button"
            data-action="open-article-edit"
            data-doc-key="${escapeAttr(key)}"
            class="h-6 w-6 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Editar documento"
          >
            ${Icons.edit('w-3 h-3')}
          </button>

          <!-- Menú contextual (...) -->
          <div class="relative">
            <button
              type="button"
              data-action="toggle-page-row-menu"
              data-page-id="${matchedPage.id}"
              class="h-6 w-6 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
              title="Más acciones"
            >
              ${Icons.dotsHorizontal('w-3.5 h-3.5')}
            </button>

            <div
              id="page-row-menu-${matchedPage.id}"
              class="plane-row-actions-menu hidden absolute right-0 top-7 z-40 w-48 py-1 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl text-xs font-sans"
            >
              <button
                type="button"
                data-action="open-article-read"
                data-doc-key="${escapeAttr(key)}"
                class="w-full px-3 py-1.5 flex items-center gap-2 text-zinc-200 hover:bg-zinc-800 text-left cursor-pointer"
              >
                ${Icons.bookOpen('w-3.5 h-3.5 text-indigo-400')}
                <span>Open page</span>
              </button>
              <button
                type="button"
                data-action="copy-page-markdown"
                data-page-id="${matchedPage.id}"
                class="w-full px-3 py-1.5 flex items-center gap-2 text-zinc-200 hover:bg-zinc-800 text-left cursor-pointer"
              >
                ${Icons.copy('w-3.5 h-3.5 text-zinc-400')}
                <span>Copy markdown</span>
              </button>
              <button
                type="button"
                data-action="copy-page-link"
                data-doc-key="${escapeAttr(key)}"
                class="w-full px-3 py-1.5 flex items-center gap-2 text-zinc-200 hover:bg-zinc-800 text-left cursor-pointer"
              >
                ${Icons.link('w-3.5 h-3.5 text-zinc-400')}
                <span>Copy page link</span>
              </button>
              <button
                type="button"
                data-action="duplicate-page"
                data-page-id="${matchedPage.id}"
                class="w-full px-3 py-1.5 flex items-center gap-2 text-zinc-200 hover:bg-zinc-800 text-left cursor-pointer"
              >
                ${Icons.plus('w-3.5 h-3.5 text-emerald-400')}
                <span>Make a copy</span>
              </button>

              <div class="my-1 border-t border-zinc-800"></div>

              ${!isArchived ? `
                <button
                  type="button"
                  data-action="toggle-page-lock"
                  data-page-id="${matchedPage.id}"
                  class="w-full px-3 py-1.5 flex items-center gap-2 text-zinc-200 hover:bg-zinc-800 text-left cursor-pointer"
                >
                  ${isLocked ? Icons.unlock('w-3.5 h-3.5 text-amber-400') : Icons.lock('w-3.5 h-3.5 text-amber-400')}
                  <span>${isLocked ? 'Unlock page' : 'Lock page'}</span>
                </button>
                <button
                  type="button"
                  data-action="toggle-page-access"
                  data-page-id="${matchedPage.id}"
                  class="w-full px-3 py-1.5 flex items-center gap-2 text-zinc-200 hover:bg-zinc-800 text-left cursor-pointer"
                >
                  ${isPrivate ? Icons.globe('w-3.5 h-3.5 text-indigo-400') : Icons.lock('w-3.5 h-3.5 text-violet-400')}
                  <span>${isPrivate ? 'Make public' : 'Make private'}</span>
                </button>
              ` : ''}

              <button
                type="button"
                data-action="open-export-page-modal"
                data-page-id="${matchedPage.id}"
                data-doc-key="${escapeAttr(key)}"
                class="w-full px-3 py-1.5 flex items-center gap-2 text-zinc-200 hover:bg-zinc-800 text-left cursor-pointer"
              >
                ${Icons.download('w-3.5 h-3.5 text-cyan-400')}
                <span>Export page</span>
              </button>

              <div class="my-1 border-t border-zinc-800"></div>

              <button
                type="button"
                data-action="toggle-page-archive"
                data-page-id="${matchedPage.id}"
                class="w-full px-3 py-1.5 flex items-center gap-2 ${isArchived ? 'text-emerald-400' : 'text-rose-400'} hover:bg-zinc-800 text-left cursor-pointer"
              >
                ${isArchived ? Icons.archiveRestore('w-3.5 h-3.5') : Icons.archive('w-3.5 h-3.5')}
                <span>${isArchived ? 'Restore page' : 'Archive page'}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Autor y Fecha Relativa en reposo -->
        <div class="flex items-center gap-2 text-[11px] text-zinc-400 font-normal">
          <div
            class="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center text-[10px] font-bold"
            title="Owned by: ${ownerRole} (BOT)"
          >
            ${avatarInitials}
          </div>
          <span class="w-16 text-right truncate hidden sm:inline" title="Updated ${relativeDate}">
            ${relativeDate}
          </span>
        </div>
      </div>
    </div>
  `;
}
