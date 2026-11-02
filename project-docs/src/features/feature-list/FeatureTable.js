import { renderBadge } from '../../shared/Badge.js';
import { Icons } from '../../shared/Icons.js';

/**
 * FeatureTable: Renderiza la tabla de características y bugfixes con soporte reactivo.
 * @param {Object} props
 * @param {Array} props.features - Lista filtrada de features
 * @param {Object} props.pagination - { currentPage, pageSize, totalPages }
 * @param {Function} props.onSelect - Callback al seleccionar/ver detalle
 * @returns {string} HTML markup
 */
export function renderFeatureTable({ features, pagination, onSelect }) {
  const { currentPage, pageSize } = pagination;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedFeatures = features.slice(startIndex, startIndex + pageSize);

  if (features.length === 0) {
    return `
      <div class="p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800">
        <div class="w-16 h-16 mx-auto mb-4 text-slate-600">
          ${Icons.search}
        </div>
        <h4 class="text-lg font-semibold text-slate-300 mb-1">No se encontraron tareas</h4>
        <p class="text-sm text-slate-500">Intenta ajustar los filtros de búsqueda o restablecer los criterios.</p>
      </div>
    `;
  }

  const rowsHtml = paginatedFeatures.map(f => {
    const idFormatted = `INT-${String(f.id).padStart(3, '0')}`;
    const branchName = f.branch || `${f.type || 'feature'}/INT-${String(f.id).padStart(3, '0')}/${f.name}`;
    const depsCount = (f.depends_on && f.depends_on.length) || 0;

    return `
      <tr class="border-b border-slate-800/80 hover:bg-slate-800/40 transition-colors group cursor-pointer"
          data-feature-id="${f.id}"
          tabindex="0"
          role="row">
        <!-- ID -->
        <td class="py-3.5 px-4 font-mono text-xs font-semibold text-indigo-400">
          ${idFormatted}
        </td>

        <!-- Type -->
        <td class="py-3.5 px-4 whitespace-nowrap">
          ${renderBadge('type', f.type || 'feature')}
        </td>

        <!-- Title & Description -->
        <td class="py-3.5 px-4">
          <div class="font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">
            ${escapeHtml(f.title || f.name)}
          </div>
          ${f.description ? `<p class="text-xs text-slate-400 line-clamp-1 mt-0.5">${escapeHtml(f.description)}</p>` : ''}
        </td>

        <!-- Module -->
        <td class="py-3.5 px-4 whitespace-nowrap">
          ${renderBadge('module', f.module || 'Core')}
        </td>

        <!-- Priority -->
        <td class="py-3.5 px-4 whitespace-nowrap">
          ${renderBadge('priority', f.priority || 'P2')}
        </td>

        <!-- Status -->
        <td class="py-3.5 px-4 whitespace-nowrap">
          ${renderBadge('status', f.status || 'pending')}
        </td>

        <!-- Branch (≤80 chars) -->
        <td class="py-3.5 px-4 font-mono text-xs text-slate-400 max-w-xs truncate" title="${branchName}">
          <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300 font-mono text-[11px]">
            <span class="text-indigo-400">${Icons.gitBranch}</span>
            <span class="truncate max-w-[200px]">${branchName}</span>
          </span>
        </td>

        <!-- Dependencies -->
        <td class="py-3.5 px-4 whitespace-nowrap text-xs text-slate-400">
          ${depsCount > 0 
            ? `<span class="inline-flex items-center gap-1 text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                ${depsCount} dep${depsCount > 1 ? 's' : ''}
              </span>`
            : `<span class="text-slate-600">—</span>`
          }
        </td>

        <!-- Action -->
        <td class="py-3.5 px-4 text-right whitespace-nowrap">
          <button type="button" 
                  data-action="view-detail" 
                  data-id="${f.id}" 
                  class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all shadow-sm">
            ${Icons.eye}
            <span>Detalle</span>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl">
      <table class="w-full text-left text-sm text-slate-300">
        <thead class="bg-slate-950/70 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <tr>
            <th scope="col" class="py-3.5 px-4">Ticket</th>
            <th scope="col" class="py-3.5 px-4">Tipo</th>
            <th scope="col" class="py-3.5 px-4">Título / Descripción</th>
            <th scope="col" class="py-3.5 px-4">Módulo</th>
            <th scope="col" class="py-3.5 px-4">Prioridad</th>
            <th scope="col" class="py-3.5 px-4">Estado</th>
            <th scope="col" class="py-3.5 px-4">Rama Git (máx 80c)</th>
            <th scope="col" class="py-3.5 px-4">Bloqueos</th>
            <th scope="col" class="py-3.5 px-4 text-right">Acción</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/40 font-normal">
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Escapes HTML characters for security
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
