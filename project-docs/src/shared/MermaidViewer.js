import { Icons } from './Icons.js';

/**
 * MermaidViewer: Visualizador interactivo de diagramas de arquitectura y UML.
 * Inspirado en la elegancia visual de ContextForge y diagramas interactivos modernos.
 *
 * Ofrece:
 * - Renderizado visual directo como SVG interactivo (no volcado de texto plano).
 * - Conmutador entre "Diagrama Visual" y "Código Mermaid".
 * - Botón de pantalla completa / modal ampliado con zoom.
 * - Botón de 1-clic para copiar el código Mermaid.
 */

export function renderMermaidViewer(diagram) {
  const { id, title, type, level, description, mermaid: code } = diagram;

  return `
    <div class="mermaid-viewer-card rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 shadow-sm overflow-hidden transition-all duration-200" 
         id="mermaid-card-${id}">
      
      <!-- 1. Barra de Herramientas Superior -->
      <div class="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            ${type || 'Diagrama'}
          </span>
          <span class="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
            ${level || ''}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <!-- Switcher Vista Visual / Código -->
          <div class="inline-flex rounded-xl p-0.5 bg-slate-200/70 dark:bg-slate-800/80 text-xs font-medium">
            <button type="button" 
                    data-diagram-toggle="visual" 
                    data-diagram-id="${id}"
                    class="diagram-view-btn active px-3 py-1 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold shadow-xs transition-all cursor-pointer">
              🎨 Visual
            </button>
            <button type="button" 
                    data-diagram-toggle="code" 
                    data-diagram-id="${id}"
                    class="diagram-view-btn px-3 py-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer">
              📝 Código
            </button>
          </div>

          <!-- Botón Pantalla Completa / Zoom -->
          <button type="button" 
                  data-action="expand-diagram" 
                  data-diagram-id="${id}"
                  class="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  title="Expandir a Pantalla Completa">
            ${Icons.eye('w-3.5 h-3.5')}
          </button>

          <!-- Botón Copiar Código -->
          <button type="button" 
                  data-copy-mermaid="${escapeAttr(code)}"
                  class="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  title="Copiar código Mermaid">
            <span class="text-xs">📋</span>
          </button>
        </div>
      </div>

      <!-- 2. Información del Diagrama -->
      <div class="px-5 pt-4 pb-2">
        <h4 class="font-bold text-sm sm:text-base text-slate-900 dark:text-white">${escapeHtml(title)}</h4>
        <p class="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">${escapeHtml(description)}</p>
      </div>

      <!-- 3. Contenedores de Vista -->
      
      <!-- 3.1 VISTA VISUAL (RENDER SVG MERMAID) -->
      <div id="diagram-view-visual-${id}" class="diagram-visual-panel p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/60 overflow-x-auto min-h-[320px] flex items-center justify-center">
        <div class="mermaid-render-container w-full max-w-4xl flex justify-center" 
             id="mermaid-target-${id}" 
             data-mermaid-src="${escapeAttr(code)}">
          <div class="mermaid text-xs font-mono text-slate-500 animate-pulse text-center p-8">
            ${escapeHtml(code)}
          </div>
        </div>
      </div>

      <!-- 3.2 VISTA DE CÓDIGO FUENTE (OCULTA POR DEFECTO) -->
      <div id="diagram-view-code-${id}" class="diagram-code-panel hidden p-4 bg-slate-900 border-t border-slate-800">
        <pre class="text-xs font-mono text-indigo-300 leading-relaxed overflow-x-auto p-2 select-all"><code>${escapeHtml(code)}</code></pre>
      </div>

    </div>
  `;
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(text) {
  if (!text) return '';
  return String(text).replace(/"/g, '&quot;');
}
