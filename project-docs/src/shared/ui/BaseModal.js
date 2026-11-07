/**
 * Accessible Base Modal Dialog Component
 * Cumple con WAI-ARIA (role="dialog", aria-modal="true", foco accesible y cierre con ESC).
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { Icons } from './Icons.js';

/**
 * Renderiza el contenedor HTML de un modal accesible.
 * @param {Object} props
 * @param {string} [props.id='base-modal'] - Identificador DOM del modal.
 * @param {string} [props.title=''] - Título del modal.
 * @param {string} [props.contentHtml=''] - Contenido HTML interno.
 * @param {string} [props.footerHtml=''] - Acciones o botones de pie opcionales.
 * @param {string} [props.maxWidth='max-w-2xl'] - Ancho máximo del diálogo.
 * @param {boolean} [props.isOpen=false] - Visibilidad inicial.
 * @returns {string}
 */
export function renderBaseModal({
  id = 'base-modal',
  title = '',
  contentHtml = '',
  footerHtml = '',
  maxWidth = 'max-w-2xl',
  isOpen = false
} = {}) {
  if (!isOpen) return `<div id="${id}-container"></div>`;

  return `
    <div
      id="${id}"
      role="dialog"
      aria-modal="true"
      aria-labelledby="${id}-title"
      data-modal-backdrop="${id}"
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        class="w-full ${maxWidth} bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]"
        onclick="event.stopPropagation()"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between gap-4 bg-zinc-950/50">
          <h2 id="${id}-title" class="text-sm font-semibold text-zinc-100 tracking-tight truncate">
            ${title}
          </h2>
          <button
            data-action="close-modal"
            data-modal-id="${id}"
            class="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Cerrar modal (ESC)"
            aria-label="Cerrar"
          >
            ${Icons.close('w-4 h-4')}
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 overflow-y-auto flex-1 text-xs text-zinc-300 leading-relaxed space-y-4">
          ${contentHtml}
        </div>

        <!-- Optional Footer -->
        ${footerHtml ? `
          <div class="px-6 py-3.5 bg-zinc-950/80 border-t border-zinc-800/80 flex items-center justify-end gap-3">
            ${footerHtml}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}
