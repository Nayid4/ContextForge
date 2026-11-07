/**
 * PageNavigationPane Component (Plane Right Inspection Drawer)
 * Panel lateral derecho conmutable de 4 pestañas:
 *   1. Outline (Índice H1-H3 + Mini-barras flotantes)
 *   2. Info (4 KPI Cards: Palabras, Caracteres, Párrafos, Lectura + Actores Bot + PageLabels + Grafo PageLog)
 *   3. Assets (Diagramas Mermaid C4/UML e imágenes de evidencia con salto directo)
 *   4. Version History (Snapshots de page_versions agrupados por fecha con botón Restaurar)
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { Icons } from '../../../shared/ui/Icons.js';
import { renderList } from '../../../shared/utils/renderList.js';

export function renderFloatingOutlineBars(toc = []) {
  if (!toc || toc.length === 0) return '';
  return `
    <div
      id="plane-floating-outline-bars"
      data-action="toggle-page-nav-pane"
      title="Abrir Outline e Inspector de Página (Plane Navigation Pane)"
      class="fixed right-4 top-1/3 z-20 hidden lg:flex flex-col items-end gap-1.5 p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800/80 hover:border-indigo-500/50 cursor-pointer shadow-lg backdrop-blur-md transition-all group"
    >
      ${renderList(toc.slice(0, 18), item => {
        const widthPx = item.level === 1 ? '20px' : item.level === 2 ? '16px' : '11px';
        const tone = item.level === 1 ? 'bg-indigo-400 group-hover:bg-indigo-300' : item.level === 2 ? 'bg-zinc-400 group-hover:bg-zinc-200' : 'bg-zinc-600 group-hover:bg-zinc-400';
        return `<div class="h-0.5 rounded-full transition-colors ${tone}" style="width: ${widthPx};" title="${item.text}"></div>`;
      })}
      <span class="text-[9px] font-mono text-zinc-400 group-hover:text-indigo-300 pt-1">Outline</span>
    </div>
  `;
}

export function PageNavigationPane({
  page = {},
  content: rawContent = '',
  toc = [],
  activeTab = 'outline', // 'outline' | 'info' | 'assets' | 'version_history'
  isOpen = true
} = {}) {
  if (!isOpen) {
    return renderFloatingOutlineBars(toc);
  }

  const content = rawContent || page.content_markdown || '';
  const words = page.word_count || (content.trim().split(/\s+/).filter(Boolean).length) || 0;
  const chars = page.char_count || content.length || 0;
  const paragraphs = page.paragraph_count || Math.max(1, content.split(/\r?\n\s*\r?\n/).filter(Boolean).length);
  const readingTime = page.reading_time_min || Math.max(1, Math.ceil(words / 200));

  const logs = Array.isArray(page.logs) ? page.logs : [];
  const issueLogs = logs.filter(l => l.entity_type === 'issue' || l.entity_name === 'issue');
  const ruleLogs = logs.filter(l => l.entity_type === 'rule' || l.entity_name === 'business_rule' || l.entity_type === 'requirement' || l.entity_name === 'requirement' || l.entity_type === 'capability' || l.entity_type === 'adr');
  const pageLinkLogs = logs.filter(l => l.entity_type === 'page' || l.entity_name === 'back_link' || l.entity_name === 'forward_link');

  const labels = Array.isArray(page.labels) ? page.labels : [];
  const versions = Array.isArray(page.versions) && page.versions.length > 0
    ? page.versions
    : [{
        id: `pv-${page.id || 'doc'}-v1`,
        version_number: 1,
        owned_by_role: page.owned_by_role || 'spec-author',
        word_count: words,
        last_saved_at: page.updated_at || '2026-11-07 14:35:00'
      }];

  // Extract assets if not pre-populated
  let assets = Array.isArray(page.assets) ? page.assets : [];
  if (assets.length === 0 && content) {
    const extracted = [];
    const mermaidRegex = /```mermaid\s*([\s\S]*?)```/gi;
    let m;
    let idx = 0;
    while ((m = mermaidRegex.exec(content)) !== null) {
      idx++;
      const firstLine = ((m[1] || '').trim().split(/\r?\n/)[0] || 'flowchart').trim();
      const diagType = firstLine.split(/\s+/)[0] || 'flowchart';
      extracted.push({
        id: `asset-mermaid-${idx}`,
        type: 'mermaid',
        diagram_type: diagType,
        title: `Diagrama Mermaid #${idx} (${diagType})`,
        preview: firstLine.slice(0, 70)
      });
    }
    const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let im;
    let iIdx = 0;
    while ((im = imgRegex.exec(content)) !== null) {
      iIdx++;
      extracted.push({
        id: `asset-img-${iIdx}`,
        type: 'image',
        diagram_type: 'image',
        title: im[1] || `Evidencia Visual #${iIdx}`,
        src: im[2]
      });
    }
    assets = extracted;
  }

  const tabs = [
    { key: 'outline', label: 'Outline', count: toc.length },
    { key: 'info', label: 'Info', count: logs.length },
    { key: 'assets', label: 'Assets', count: assets.length },
    { key: 'version_history', label: 'Historial', count: versions.length }
  ];

  // Tab 1: Outline
  const renderOutlinePanel = () => {
    if (!toc || toc.length === 0) {
      return `
        <div class="p-6 text-center text-xs text-zinc-500 space-y-2">
          <div class="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
            ${Icons.fileText('w-4 h-4')}
          </div>
          <p>Este documento no contiene encabezados H1-H3 estructurados.</p>
        </div>
      `;
    }

    return `
      <div class="p-4 space-y-2">
        <div class="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-800/80">
          <span>En esta página</span>
          <span>${toc.length} secciones</span>
        </div>
        <nav class="space-y-1">
          ${renderList(toc, (item, idx) => {
            const indent = item.level === 1 ? 'pl-1 font-semibold text-zinc-200' : item.level === 2 ? 'pl-3 text-zinc-300' : 'pl-6 text-[11px] text-zinc-400';
            const barWidth = item.level === 1 ? 'w-3 bg-indigo-500' : item.level === 2 ? 'w-2 bg-zinc-500' : 'w-1.5 bg-zinc-700';
            return `
              <a
                href="#${item.id}"
                data-action="scroll-to-heading"
                data-heading-id="${item.id}"
                class="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-zinc-900 hover:text-indigo-300 transition-colors text-xs truncate ${indent}"
                title="${item.text}"
              >
                <span class="h-0.5 rounded-full shrink-0 ${barWidth}"></span>
                <span class="truncate">${item.text}</span>
              </a>
            `;
          })}
        </nav>
      </div>
    `;
  };

  // Tab 2: Info (4 KPI Cards + Actors + Labels + PageLog Graph)
  const renderInfoPanel = () => {
    const ownerRole = page.owned_by_role || 'spec-author';
    const editorId = page.updated_by_id || `user-${ownerRole}`;

    return `
      <div class="p-4 space-y-5 text-xs">
        <!-- 1. Cuadrícula 2x2 de Tarjetas KPI de Plane -->
        <div>
          <div class="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
            Métricas del Documento (Plane Info)
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800">
              <div class="text-sm font-bold font-mono text-zinc-100">${words}</div>
              <div class="text-[10px] text-zinc-400 mt-0.5">Palabras</div>
            </div>
            <div class="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800">
              <div class="text-sm font-bold font-mono text-zinc-100">${chars}</div>
              <div class="text-[10px] text-zinc-400 mt-0.5">Caracteres</div>
            </div>
            <div class="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800">
              <div class="text-sm font-bold font-mono text-zinc-100">${paragraphs}</div>
              <div class="text-[10px] text-zinc-400 mt-0.5">Párrafos</div>
            </div>
            <div class="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800">
              <div class="text-sm font-bold font-mono text-indigo-400">${readingTime}m</div>
              <div class="text-[10px] text-zinc-400 mt-0.5">Tiempo de Lectura</div>
            </div>
          </div>
        </div>

        <!-- 2. Ficha de Actores Bot IA (Created By / Edited By) -->
        <div class="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2.5">
          <div class="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            Autoría & Gobernanza Agéntica
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-[11px] text-zinc-400">Creado por:</span>
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-[10px]">
              ${Icons.bot('w-3 h-3')}
              <span>${ownerRole}</span>
              <span class="px-1 rounded bg-indigo-500/20 text-[9px] font-bold">BOT</span>
            </span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-[11px] text-zinc-400">Editado por:</span>
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-200 font-mono text-[10px]">
              ${Icons.user('w-3 h-3 text-emerald-400')}
              <span>${editorId.replace(/^user-/, '')}</span>
            </span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-[11px] text-zinc-400">Protección:</span>
            <span class="font-mono text-[10px] ${page.is_locked ? 'text-amber-400 font-bold' : 'text-emerald-400'}">
              ${page.is_locked ? 'Normativa Bloqueada (Locked)' : 'Abierta a Edición'}
            </span>
          </div>
        </div>

        <!-- 3. Etiquetas de Página (page_labels) -->
        <div class="space-y-2">
          <div class="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            Etiquetas (Plane PageLabels)
          </div>
          <div class="flex flex-wrap gap-1.5">
            ${labels.length > 0 ? renderList(labels, lbl => `
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border border-zinc-700 bg-zinc-900 text-zinc-200">
                <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${lbl.color || '#6366f1'}"></span>
                <span>${lbl.name}</span>
              </span>
            `) : `
              <span class="text-[11px] text-zinc-500 font-mono">sdd-spec, docs-as-code</span>
            `}
          </div>
        </div>

        <!-- 4. Grafo Transaccional de Relaciones (PageLog) -->
        <div class="space-y-3 pt-2 border-t border-zinc-800/80">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              Grafo PageLog & Trazabilidad
            </span>
            <span class="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">${logs.length}</span>
          </div>

          <!-- Tareas INT-XXX Vinculadas -->
          <div class="space-y-1.5">
            <div class="text-[10px] font-mono text-indigo-400">Tareas SDD Mencionadas (${issueLogs.length})</div>
            ${issueLogs.length > 0 ? `
              <div class="flex flex-wrap gap-1.5">
                ${renderList(issueLogs, l => `
                  <button
                    type="button"
                    data-action="view-detail"
                    data-id="${l.entity_identifier}"
                    class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 font-mono text-[10px] font-bold transition-colors cursor-pointer"
                    title="Abrir modal de detalle de ${l.entity_identifier}"
                  >
                    ${Icons.checkCircle('w-3 h-3')}
                    <span>${l.entity_identifier}</span>
                  </button>
                `)}
              </div>
            ` : `<p class="text-[11px] text-zinc-500">Sin menciones directas a INT-XXX.</p>`}
          </div>

          <!-- Reglas BR-*, Requisitos RF-*, Capacidades CAP-* y ADRs -->
          <div class="space-y-1.5">
            <div class="text-[10px] font-mono text-amber-400">Invariantes & Requisitos (${ruleLogs.length})</div>
            ${ruleLogs.length > 0 ? `
              <div class="flex flex-wrap gap-1">
                ${renderList(ruleLogs.slice(0, 24), l => {
                  const badgeTone = l.entity_type === 'rule'
                    ? 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                    : l.entity_type === 'requirement'
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                    : 'bg-purple-950/60 text-purple-300 border-purple-500/30';
                  return `
                    <span class="px-1.5 py-0.5 rounded text-[10px] font-mono border ${badgeTone}">
                      ${l.entity_identifier}
                    </span>
                  `;
                })}
              </div>
            ` : `<p class="text-[11px] text-zinc-500">Sin invariantes catalogadas en este archivo.</p>`}
          </div>

          <!-- Backlinks & Forward Links entre Páginas -->
          <div class="space-y-1.5">
            <div class="text-[10px] font-mono text-cyan-400">Backlinks & Enlaces Wiki (${pageLinkLogs.length})</div>
            ${pageLinkLogs.length > 0 ? `
              <div class="space-y-1">
                ${renderList(pageLinkLogs, l => `
                  <button
                    type="button"
                    data-action="open-article-read"
                    data-doc-key="${l.entity_identifier.replace(/^knowledge\//, '')}"
                    class="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-zinc-900/70 hover:bg-zinc-800 border border-zinc-800 text-left text-[10px] font-mono text-zinc-300 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    <span class="truncate">${l.entity_identifier}</span>
                    <span class="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 text-[9px] shrink-0">${l.entity_name === 'back_link' ? 'Backlink' : 'Link'}</span>
                  </button>
                `)}
              </div>
            ` : `<p class="text-[11px] text-zinc-500">Sin enlaces cruzados hacia otras páginas.</p>`}
          </div>
        </div>
      </div>
    `;
  };

  // Tab 3: Assets (Diagramas Mermaid C4/UML e Imágenes de Evidencia)
  const renderAssetsPanel = () => {
    if (assets.length === 0) {
      return `
        <div class="p-6 text-center text-xs text-zinc-500 space-y-2">
          <div class="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
            ${Icons.architecture('w-4 h-4')}
          </div>
          <p>No se detectaron diagramas Mermaid ni capturas de evidencia en esta página.</p>
        </div>
      `;
    }

    return `
      <div class="p-4 space-y-3">
        <div class="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-800/80">
          <span>Diagramas Mermaid & Evidencias</span>
          <span>${assets.length} activos</span>
        </div>
        <div class="space-y-2">
          ${renderList(assets, (asset, idx) => `
            <div class="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-indigo-500/40 transition-all space-y-1.5">
              <div class="flex items-center justify-between gap-2">
                <span class="inline-flex items-center gap-1.5 text-[11px] font-bold text-zinc-200 truncate">
                  ${asset.type === 'mermaid' ? Icons.architecture('w-3.5 h-3.5 text-indigo-400') : Icons.eye('w-3.5 h-3.5 text-emerald-400')}
                  <span class="truncate">${asset.title}</span>
                </span>
                <span class="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  ${asset.diagram_type || asset.type}
                </span>
              </div>
              ${asset.preview ? `
                <div class="text-[10px] font-mono text-zinc-500 truncate bg-zinc-950 px-2 py-1 rounded border border-zinc-800/60">
                  ${asset.preview}
                </div>
              ` : ''}
              <div class="flex justify-end pt-1">
                <button
                  type="button"
                  data-action="scroll-to-asset"
                  data-asset-index="${idx}"
                  class="inline-flex items-center gap-1 text-[10px] font-mono text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  <span>Localizar en documento</span>
                  ${Icons.arrowRight('w-3 h-3')}
                </button>
              </div>
            </div>
          `)}
        </div>
      </div>
    `;
  };

  // Tab 4: Version History (Snapshots de page_versions con botón Restaurar)
  const renderVersionHistoryPanel = () => {
    return `
      <div class="p-4 space-y-3">
        <div class="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-800/80">
          <span>Historial de Versiones (SQLite)</span>
          <span>${versions.length} snapshots</span>
        </div>
        <div class="space-y-2">
          ${renderList(versions, (ver, idx) => `
            <div class="p-3 rounded-xl border ${idx === 0 ? 'bg-indigo-950/20 border-indigo-500/40' : 'bg-zinc-900/70 border-zinc-800'} space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span class="font-mono text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                  ${Icons.history('w-3.5 h-3.5 text-indigo-400')}
                  <span>Versión v${ver.version_number || (versions.length - idx)}</span>
                </span>
                <div class="flex items-center gap-1.5">
                  ${idx === 0 ? `
                    <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Actual
                    </span>
                  ` : ''}
                  <button
                    type="button"
                    data-action="restore-page-version"
                    data-page-id="${page.id || ''}"
                    data-version-id="${ver.id}"
                    class="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-mono font-semibold transition-colors cursor-pointer"
                  >
                    Restaurar
                  </button>
                </div>
              </div>
              <div class="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span class="inline-flex items-center gap-1">
                  ${Icons.bot('w-3 h-3 text-purple-400')}
                  <span>${ver.owned_by_role || 'spec-author'}</span>
                </span>
                <span>${ver.word_count || words} palabras</span>
              </div>
              <div class="text-[10px] font-mono text-zinc-500">
                Guardado: ${(ver.last_saved_at || '').slice(0, 19) || 'Sincronizado'}
              </div>
            </div>
          `)}
        </div>
      </div>
    `;
  };

  return `
    <aside
      id="plane-page-navigation-pane"
      class="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-zinc-800/80 bg-zinc-950/90 flex flex-col shrink-0 select-none overflow-hidden"
    >
      <!-- Tabs Bar (Outline | Info | Assets | Historial) -->
      <div class="p-2 border-b border-zinc-800/80 bg-zinc-900/50 flex items-center justify-between gap-1">
        <div class="flex items-center gap-1 flex-1 overflow-x-auto">
          ${renderList(tabs, t => {
            const active = activeTab === t.key;
            return `
              <button
                type="button"
                data-action="switch-page-nav-tab"
                data-tab="${t.key}"
                data-nav-tab="${t.key}"
                class="px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                  active
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70'
                }"
              >
                <span>${t.label}</span>
                <span class="text-[9px] px-1 rounded ${active ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'}">${t.count}</span>
              </button>
            `;
          })}
        </div>
        <button
          type="button"
          data-action="toggle-page-nav-pane"
          title="Ocultar panel de inspección"
          class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
        >
          ${Icons.close('w-3.5 h-3.5')}
        </button>
      </div>

      <!-- Active Tab Body -->
      <div class="flex-1 overflow-y-auto">
        ${activeTab === 'info'
          ? renderInfoPanel()
          : activeTab === 'assets'
          ? renderAssetsPanel()
          : activeTab === 'version_history'
          ? renderVersionHistoryPanel()
          : renderOutlinePanel()
        }
      </div>
    </aside>
  `;
}
