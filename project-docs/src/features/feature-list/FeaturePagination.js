import { Icons } from '../../shared/Icons.js';

/**
 * FeaturePagination: Controles de navegación y tamaño de página para el listado.
 * @param {Object} props
 * @param {number} props.totalItems - Total de elementos tras aplicar filtros
 * @param {Object} props.pagination - { currentPage, pageSize, totalPages }
 * @returns {string} HTML markup
 */
export function renderFeaturePagination({ totalItems, pagination }) {
  const { currentPage, pageSize, totalPages } = pagination;

  if (totalItems === 0) return '';

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  // Páginas visibles (máx 5 botones de página)
  const pages = [];
  let minPage = Math.max(1, currentPage - 2);
  let maxPage = Math.min(totalPages, minPage + 4);
  if (maxPage - minPage < 4) {
    minPage = Math.max(1, maxPage - 4);
  }

  for (let p = minPage; p <= maxPage; p++) {
    pages.push(p);
  }

  const pageButtons = pages.map(p => {
    const isActive = p === currentPage;
    return `
      <button type="button" 
              data-page="${p}" 
              class="w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }">
        ${p}
      </button>
    `;
  }).join('');

  return `
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2 text-xs text-slate-400">
      <!-- Info & Page size selector -->
      <div class="flex items-center gap-3">
        <span>Mostrando <span class="font-semibold text-slate-200">${start}-${end}</span> de <span class="font-semibold text-slate-200">${totalItems}</span> tareas</span>
        <span class="text-slate-600">|</span>
        <div class="flex items-center gap-1.5">
          <label for="page-size-select" class="text-slate-400">Por página:</label>
          <select id="page-size-select" 
                  data-action="change-page-size" 
                  class="bg-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value="5" ${pageSize === 5 ? 'selected' : ''}>5</option>
            <option value="10" ${pageSize === 10 ? 'selected' : ''}>10</option>
            <option value="20" ${pageSize === 20 ? 'selected' : ''}>20</option>
            <option value="50" ${pageSize === 50 ? 'selected' : ''}>50</option>
          </select>
        </div>
      </div>

      <!-- Page navigation -->
      <div class="flex items-center gap-1.5" role="navigation" aria-label="Paginación de tareas">
        <button type="button" 
                data-page="${currentPage - 1}" 
                ${currentPage <= 1 ? 'disabled' : ''} 
                class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all"
                title="Página anterior"
                aria-label="Página anterior">
          ${Icons.chevronLeft}
        </button>

        ${pageButtons}

        <button type="button" 
                data-page="${currentPage + 1}" 
                ${currentPage >= totalPages ? 'disabled' : ''} 
                class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all"
                title="Página siguiente"
                aria-label="Página siguiente">
          ${Icons.chevronRight}
        </button>
      </div>
    </div>
  `;
}
