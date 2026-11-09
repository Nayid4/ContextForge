/**
 * PageModals Component (Plane Dialogs & Modals)
 * Implementa los diálogos modales para la biblioteca de páginas:
 *  - new-doc-modal: Creación de nueva página (.md + SQLite)
 *  - export-page-modal: Exportador de páginas en Markdown o HTML
 *  - ai-context-modal: Bundler dinámico de contexto canónico para IA (System Prompt anti-sesgo)
 *  - diagram-modal: Visor expandido a pantalla completa para diagramas Mermaid
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { Icons } from '../../../shared/Icons.js';

function escapeHtml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderPageModals({ dynamicAiPrompt = '' }) {
  return `
    <!-- ============================================================== -->
    <!-- MODAL: CREAR NUEVA PÁGINA EN LIBRARY (Plane CreatePageModal)   -->
    <!-- ============================================================== -->
    <div id="new-doc-modal" class="fixed inset-0 z-50 bg-zinc-950/75 backdrop-blur-xs hidden items-center justify-center p-4">
      <div class="w-full max-w-xl bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 class="text-xs font-bold text-zinc-100 flex items-center gap-2">
            ${Icons.page('w-4 h-4 text-indigo-400')} <span>Create New Library Page (.md + SQLite)</span>
          </h3>
          <button type="button" data-action="close-new-doc-modal" class="w-6 h-6 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-100 flex items-center justify-center cursor-pointer">
            ${Icons.close('w-3.5 h-3.5')}
          </button>
        </div>

        <form id="new-doc-form" class="space-y-3 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-mono text-[11px] text-zinc-400 mb-1">Module or Shelf:</label>
              <input type="text" id="new-doc-module" placeholder="general, backend, billing, infra..." value="general" class="w-full px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-xs focus:border-indigo-500 focus:outline-none" required />
            </div>
            <div>
              <label class="block font-mono text-[11px] text-zinc-400 mb-1">Page Access (Plane Visibility):</label>
              <select id="new-doc-access" class="w-full px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-xs focus:border-indigo-500 focus:outline-none">
                <option value="0">Public (Visible in Library)</option>
                <option value="1">Private (Personal / Draft)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block font-mono text-[11px] text-zinc-400 mb-1">Filename (.md):</label>
            <input type="text" id="new-doc-filename" placeholder="my-specification.md" class="w-full px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-xs focus:border-indigo-500 focus:outline-none" required />
          </div>

          <div>
            <label class="block font-mono text-[11px] text-zinc-400 mb-1">Initial Markdown Content:</label>
            <textarea id="new-doc-content" rows="8" placeholder="# Page Title&#10;&#10;Specification and requirements..." class="w-full p-3 font-mono text-xs rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 resize-none focus:border-indigo-500 focus:outline-none" required></textarea>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" data-action="close-new-doc-modal" class="h-7 px-3 rounded-md text-zinc-400 hover:bg-zinc-800 font-medium cursor-pointer">
              Cancel
            </button>
            <button type="submit" class="h-7 px-3.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors cursor-pointer">
              Create Page
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL: EXPORTAR PÁGINA (Plane ExportPageModal)                 -->
    <!-- ============================================================== -->
    <div id="export-page-modal" class="fixed inset-0 z-50 bg-zinc-950/75 backdrop-blur-xs hidden items-center justify-center p-4">
      <div class="w-full max-w-md bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl p-5 space-y-4 text-xs">
        <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 class="text-xs font-bold text-zinc-100 flex items-center gap-2">
            ${Icons.download('w-4 h-4 text-indigo-400')} <span>Export Page (Plane Library Exporter)</span>
          </h3>
          <button type="button" data-action="close-export-page-modal" class="w-6 h-6 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-100 flex items-center justify-center cursor-pointer">
            ${Icons.close('w-3.5 h-3.5')}
          </button>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block font-mono text-[11px] text-zinc-400 mb-1">Export Scope:</label>
            <select id="export-page-scope" class="w-full px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-xs focus:border-indigo-500 focus:outline-none">
              <option value="active">Active / Selected Page</option>
              <option value="all">Full Sovereign Library Bundle (All Pages)</option>
            </select>
          </div>

          <div>
            <label class="block font-mono text-[11px] text-zinc-400 mb-1">Format:</label>
            <select id="export-page-format" class="w-full px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-xs focus:border-indigo-500 focus:outline-none">
              <option value="md">Markdown (.md)</option>
              <option value="html">Standalone HTML Report (.html)</option>
            </select>
          </div>

          <label class="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 cursor-pointer">
            <span class="text-zinc-300">Include Mermaid Diagrams & Assets</span>
            <input type="checkbox" id="export-page-include-assets" checked class="accent-indigo-500 rounded cursor-pointer" />
          </label>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
          <button type="button" data-action="close-export-page-modal" class="h-7 px-3 rounded-md text-zinc-400 hover:bg-zinc-800 font-medium cursor-pointer">
            Cancel
          </button>
          <button
            type="button"
            data-action="confirm-export-page"
            class="h-7 px-3.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            ${Icons.download('w-3.5 h-3.5')}
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL: PROMPT BUNDLER DINÁMICO PARA IA (SYSTEM PROMPT)          -->
    <!-- ============================================================== -->
    <div id="ai-context-modal" class="fixed inset-0 z-50 bg-zinc-950/75 backdrop-blur-xs hidden items-center justify-center p-4">
      <div class="w-full max-w-2xl bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 class="text-xs font-bold text-zinc-100 flex items-center gap-2">
            ${Icons.sparkles('w-4 h-4 text-indigo-400')} <span>Canonical AI System Prompt (Zero-Bias Context)</span>
          </h3>
          <button type="button" data-action="close-ai-context-modal" class="w-6 h-6 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-100 flex items-center justify-center cursor-pointer">
            ${Icons.close('w-3.5 h-3.5')}
          </button>
        </div>
        <p class="text-xs text-zinc-400">
          Copy this live-generated context from the harness SQLite + Markdown Library to initialize any LLM agent without bias:
        </p>
        <div class="relative">
          <textarea id="ai-context-prompt-text" readonly rows="13" class="w-full p-3.5 font-mono text-[11px] rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-200 resize-none focus:outline-none leading-relaxed">${escapeHtml(dynamicAiPrompt)}</textarea>
        </div>
        <div class="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            id="copy-context-btn"
            class="h-7 px-3.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL: EXPANDIR DIAGRAMAS A PANTALLA COMPLETA                   -->
    <!-- ============================================================== -->
    <div id="diagram-modal" class="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-xs hidden items-center justify-center p-4">
      <div class="w-full max-w-6xl max-h-[92vh] bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
        <div class="px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-indigo-400">${Icons.architecture('w-4 h-4')}</span>
            <h3 id="diagram-modal-title" class="font-bold text-xs text-zinc-100">Expanded Diagram</h3>
          </div>
          <button type="button" data-action="close-diagram-modal" class="w-6 h-6 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-100 flex items-center justify-center cursor-pointer">
            ${Icons.close('w-3.5 h-3.5')}
          </button>
        </div>
        <div id="diagram-modal-content" class="p-6 overflow-auto flex-1 flex justify-center items-center bg-zinc-950"></div>
      </div>
    </div>
  `;
}
