import { Icons } from './Icons.js';

/**
 * MarkdownViewer: Parser y renderizador editorial minimalista (Docs-as-Code).
 * Inspirado en la arquitectura visual de ContextForge, GitBook y Medium.
 *
 * Capacidades:
 * 1. Tipografía editorial de alta legibilidad (1.7em line-height, max-width optimizado).
 * 2. Generación automática de IDs de anclaje para Tabla de Contenidos (TOC).
 * 3. Alertas enriquecidas con iconos SVG (NOTE, TIP, WARNING, IMPORTANT, CAUTION, DANGER).
 * 4. Tablas interactivas con cabecera fija (sticky) y filtro rápido si tienen > 5 filas.
 * 5. Bloques de código con resaltado, botón de 1-clic para copiar y etiquetas de lenguaje.
 * 6. Diagramas Mermaid y Draw.io con barra de acción (Zoom, Copiar, Editar en diagrams.net).
 * 7. Parser bidireccional de bloques visuales (parseMarkdownToBlocks / blocksToMarkdown) estilo ContextForge.
 */

export function renderMarkdown(content = '') {
  if (!content) return '<p class="text-slate-400 italic">Documento vacío.</p>';
  return parseMarkdownNative(content);
}

/**
 * Extrae la Tabla de Contenidos (TOC) para la navegación flotante (On-This-Page)
 */
export function extractTableOfContents(md = '') {
  const lines = md.split(/\r?\n/);
  const toc = [];
  let inCode = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;

    if (trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      let level = 1;
      let text = '';
      if (trimmed.startsWith('### ')) {
        level = 3;
        text = trimmed.replace(/^###\s+/, '');
      } else if (trimmed.startsWith('## ')) {
        level = 2;
        text = trimmed.replace(/^##\s+/, '');
      } else if (trimmed.startsWith('# ')) {
        level = 1;
        text = trimmed.replace(/^#\s+/, '');
      }
      // Limpiar markdown del texto para la etiqueta
      const cleanText = text.replace(/`([^`]+)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
      const slug = slugify(cleanText);
      toc.push({ id: slug, level, text: cleanText });
    }
  }
  return toc;
}

export function slugify(text = '') {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || 'section';
}

function parseMarkdownNative(md) {
  const lines = md.split(/\r?\n/);
  let html = [];
  let inCodeBlock = false;
  let codeLang = '';
  let codeBuffer = [];
  let inTable = false;
  let tableHeaderParsed = false;
  let tableRows = [];
  let tableHeaders = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. Bloques de código ```
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // Cerrar bloque
        const codeText = codeBuffer.join('\n');
        const langLower = (codeLang || '').toLowerCase().trim();

        if (langLower === 'mermaid' || langLower === 'drawio') {
          const isDrawio = langLower === 'drawio';
          const diagId = 'diag_' + Math.random().toString(36).substring(2, 9);
          const encodedForDrawio = encodeURIComponent(codeText);
          const drawioUrl = `https://app.diagrams.net/?splash=0#R${encodedForDrawio}`;

          html.push(`
            <div class="my-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-md overflow-hidden transition-all duration-200" id="diag-card-${diagId}">
              <div class="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 text-[11px] font-mono">
                <span class="flex items-center gap-1.5 font-bold ${isDrawio ? 'text-amber-500' : 'text-indigo-500'}">
                  ${isDrawio ? `${Icons.layout('w-3.5 h-3.5')} <span>Draw.io / mxGraph</span>` : `${Icons.layers('w-3.5 h-3.5')} <span>Diagrama Mermaid</span>`}
                </span>
                
                <div class="flex items-center gap-1.5">
                  <button type="button" 
                          data-action="expand-diagram-code" 
                          data-diag-target="${diagId}"
                          class="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
                          title="Ver en pantalla completa con zoom y paneo">
                    ${Icons.search('w-3 h-3')} <span>Zoom</span>
                  </button>
                  <button type="button" 
                          data-copy-mermaid="${escapeAttr(codeText)}" 
                          class="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
                          title="Copiar código fuente del diagrama">
                    ${Icons.copy('w-3 h-3')} <span>Copiar</span>
                  </button>
                  <a href="${drawioUrl}" 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     class="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-colors font-semibold flex items-center gap-1"
                     title="Abrir este diagrama para editar interactivamente en diagrams.net">
                    ${Icons.edit('w-3 h-3')} <span>Draw.io</span>
                  </a>
                </div>
              </div>

              <div class="p-6 overflow-x-auto flex justify-center items-center bg-slate-50/40 dark:bg-slate-950/40 min-h-[160px]" id="${diagId}">
                <div class="mermaid-render-target w-full flex justify-center items-center" data-mermaid-code="${escapeAttr(codeText)}">
                  <pre class="mermaid text-xs font-mono text-slate-400">${escapeHtml(codeText)}</pre>
                </div>
              </div>
            </div>
          `);
        } else {
          // Bloque de código estándar con números de línea
          const codeLines = codeText.split('\n');
          html.push(`
            <div class="my-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 overflow-hidden shadow-md">
              <div class="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/80 text-[11px] font-mono text-slate-400">
                <span class="flex items-center gap-1.5 font-bold text-indigo-400">
                  ${Icons.terminal('w-3.5 h-3.5')} <span>${codeLang || 'text'}</span>
                </span>
                <button type="button" data-action="copy-code-block" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer text-[10px] font-semibold">
                  Copiar Código
                </button>
              </div>
              <div class="p-4 text-xs font-mono overflow-x-auto leading-relaxed">
                <pre><code>${codeLines.map((l, idx) => `<span class="inline-block w-6 select-none opacity-30 text-right mr-3">${idx + 1}</span>${escapeHtml(l)}`).join('\n')}</code></pre>
              </div>
            </div>
          `);
        }
        codeBuffer = [];
        inCodeBlock = false;
        codeLang = '';
        continue;
      } else {
        inCodeBlock = true;
        codeLang = line.trim().replace(/^```/, '').trim();
        continue;
      }
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // 2. Tablas Markdown | col | col |
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      
      // Separador |-|-|-|
      if (cells.every(c => /^:?-+:?$/.test(c))) {
        tableHeaderParsed = true;
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableHeaderParsed = false;
        tableHeaders = [];
        tableRows = [];
      }

      if (!tableHeaderParsed) {
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      html.push(renderInteractiveTableHtml(tableHeaders, tableRows));
      inTable = false;
      tableHeaderParsed = false;
      tableHeaders = [];
      tableRows = [];
    }

    // 3. Encabezados con slug para navegación TOC
    if (line.startsWith('# ')) {
      const text = line.slice(2);
      const slug = slugify(text);
      html.push(`<h1 id="${slug}" class="scroll-mt-24 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-10 mb-4 tracking-tight border-b border-slate-200 dark:border-slate-800/80 pb-3 flex items-center justify-between group">
        <span>${formatInline(text)}</span>
        <a href="#${slug}" class="opacity-0 group-hover:opacity-40 hover:!opacity-100 text-indigo-500 text-base transition-opacity">#</a>
      </h1>`);
      continue;
    }
    if (line.startsWith('## ')) {
      const text = line.slice(3);
      const slug = slugify(text);
      html.push(`<h2 id="${slug}" class="scroll-mt-24 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-3 tracking-tight border-b border-slate-100 dark:border-slate-800/40 pb-2 flex items-center justify-between group">
        <span>${formatInline(text)}</span>
        <a href="#${slug}" class="opacity-0 group-hover:opacity-40 hover:!opacity-100 text-indigo-500 text-sm transition-opacity">#</a>
      </h2>`);
      continue;
    }
    if (line.startsWith('### ')) {
      const text = line.slice(4);
      const slug = slugify(text);
      html.push(`<h3 id="${slug}" class="scroll-mt-24 text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 mt-6 mb-2 flex items-center justify-between group">
        <span>${formatInline(text)}</span>
        <a href="#${slug}" class="opacity-0 group-hover:opacity-40 hover:!opacity-100 text-indigo-500 text-xs transition-opacity">#</a>
      </h3>`);
      continue;
    }
    if (line.startsWith('#### ')) {
      const text = line.slice(5);
      const slug = slugify(text);
      html.push(`<h4 id="${slug}" class="scroll-mt-24 text-sm font-bold text-slate-800 dark:text-slate-200 mt-5 mb-1.5">${formatInline(text)}</h4>`);
      continue;
    }

    // 4. Reglas horizontales ---
    if (/^(\*\*\*|---|___)$/.test(line.trim())) {
      html.push('<hr class="my-8 border-slate-200 dark:border-slate-800/80" />');
      continue;
    }

    // 5. Alertas GitHub en blockquote (> [!NOTE], [!TIP], [!WARNING], [!IMPORTANT], [!CAUTION], [!DANGER])
    if (line.startsWith('> [!NOTE]') || line.startsWith('> [!TIP]') || line.startsWith('> [!WARNING]') || line.startsWith('> [!IMPORTANT]') || line.startsWith('> [!CAUTION]') || line.startsWith('> [!DANGER]')) {
      const alertType = line.match(/> \[!([A-Z]+)\]/)[1];
      const alertConfig = getAlertTheme(alertType);
      const rest = line.replace(/> \[![A-Z]+\]\s*/, '').trim();

      html.push(`
        <div class="my-4 p-4 rounded-2xl ${alertConfig.bg} border ${alertConfig.border} ${alertConfig.text} text-xs sm:text-sm flex items-start gap-3 shadow-xs">
          <span class="text-base shrink-0 mt-0.5">${alertConfig.icon}</span>
          <div class="leading-relaxed flex-1">
            <strong class="font-bold block mb-0.5">${alertConfig.title}</strong>
            ${formatInline(rest)}
          </div>
        </div>
      `);
      continue;
    }

    // 6. Blockquote genérico >
    if (line.startsWith('> ')) {
      html.push(`<blockquote class="my-4 pl-4 border-l-4 border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/10 py-1.5 pr-3 rounded-r-xl text-slate-600 dark:text-slate-400 italic text-xs sm:text-sm leading-relaxed">${formatInline(line.slice(2))}</blockquote>`);
      continue;
    }

    // 7. Listas desordenadas - o *
    if (/^[\*\-]\s/.test(line)) {
      if (!inList) {
        html.push('<ul class="my-3 space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">');
        inList = true;
      }
      const itemText = line.replace(/^[\*\-]\s/, '');
      html.push(`<li class="flex items-start gap-2.5"><span class="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2"></span><span>${formatInline(itemText)}</span></li>`);
      continue;
    } else if (inList) {
      html.push('</ul>');
      inList = false;
    }

    // 8. Línea vacía
    if (!line.trim()) {
      continue;
    }

    // 9. Párrafo editorial (con interlineado 1.7em y ritmo cómodo)
    html.push(`<p class="my-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-[1.75em]">${formatInline(line)}</p>`);
  }

  if (inTable) {
    html.push(renderInteractiveTableHtml(tableHeaders, tableRows));
  }
  if (inList) html.push('</ul>');

  return html.join('');
}

function renderInteractiveTableHtml(headers, rows) {
  const tableId = 'tbl_' + Math.random().toString(36).substring(2, 9);
  const showFilter = rows.length > 5;

  return `
    <div class="my-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs overflow-hidden" id="${tableId}-container">
      ${showFilter ? `
        <div class="px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span class="font-mono text-[11px] text-slate-500">Filas: ${rows.length}</span>
          <input type="text" 
                 placeholder="Filtrar tabla..." 
                 oninput="filterTableRows('${tableId}', this.value)"
                 class="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
      ` : ''}
      <div class="overflow-x-auto max-h-[500px]">
        <table class="w-full text-left text-xs border-collapse" id="${tableId}">
          <thead class="sticky top-0 z-10 bg-slate-100/95 dark:bg-slate-950/95 backdrop-blur-xs text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
            <tr>
              ${headers.map(h => `<th class="px-4 py-3 whitespace-nowrap">${formatInline(h)}</th>`).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900/50">
            ${rows.map(r => `
              <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                ${r.map(c => `<td class="px-4 py-3 text-slate-700 dark:text-slate-300 leading-relaxed">${formatInline(c)}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function getAlertTheme(type) {
  switch (type) {
    case 'NOTE':
      return { icon: Icons.info('w-4 h-4 text-indigo-600 dark:text-indigo-400'), title: 'Nota Informativa', bg: 'bg-indigo-50/80 dark:bg-indigo-950/30', border: 'border-indigo-200 dark:border-indigo-800/60', text: 'text-indigo-950 dark:text-indigo-200' };
    case 'TIP':
      return { icon: Icons.lightbulb('w-4 h-4 text-emerald-600 dark:text-emerald-400'), title: 'Recomendación / Tip', bg: 'bg-emerald-50/80 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800/60', text: 'text-emerald-950 dark:text-emerald-200' };
    case 'WARNING':
      return { icon: Icons.alertTriangle('w-4 h-4 text-amber-600 dark:text-amber-400'), title: 'Advertencia', bg: 'bg-amber-50/80 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800/60', text: 'text-amber-950 dark:text-amber-200' };
    case 'IMPORTANT':
      return { icon: Icons.zap('w-4 h-4 text-purple-600 dark:text-purple-400'), title: 'Requerimiento Importante', bg: 'bg-purple-50/80 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800/60', text: 'text-purple-950 dark:text-purple-200' };
    case 'CAUTION':
    case 'DANGER':
      return { icon: Icons.shield('w-4 h-4 text-rose-600 dark:text-rose-400'), title: 'Punto Crítico / Riesgo', bg: 'bg-rose-50/80 dark:bg-rose-950/30', border: 'border-rose-200 dark:border-rose-800/60', text: 'text-rose-950 dark:text-rose-200' };
    default:
      return { icon: Icons.info('w-4 h-4 text-slate-600 dark:text-slate-400'), title: 'Nota', bg: 'bg-slate-50 dark:bg-slate-900', border: 'border-slate-200 dark:border-slate-800', text: 'text-slate-800 dark:text-slate-200' };
  }
}

function formatInline(text = '') {
  return text
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-indigo-600 dark:text-indigo-400 text-[11px] border border-slate-200 dark:border-slate-700 font-semibold">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-500 font-semibold">$1</a>');
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

/**
 * PARSER BIDIRECCIONAL DE BLOQUES (ESTILO CONTEXTFORGE)
 * Fragmenta el markdown en bloques visuales estructurados.
 */
export function parseMarkdownToBlocks(md = '') {
  const lines = md.split(/\r?\n/);
  const blocks = [];
  let currentBlock = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Bloque de código / diagrama
    if (trimmed.startsWith('```')) {
      if (currentBlock && currentBlock.type === 'code') {
        blocks.push(currentBlock);
        currentBlock = null;
        continue;
      }
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      currentBlock = {
        id: 'blk_' + Math.random().toString(36).substring(2, 9),
        type: 'code',
        lang: trimmed.replace(/^```/, '').trim() || 'text',
        content: []
      };
      continue;
    }

    if (currentBlock && currentBlock.type === 'code') {
      currentBlock.content.push(line);
      continue;
    }

    // Encabezados
    if (trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      if (currentBlock) blocks.push(currentBlock);
      let level = 1;
      let text = trimmed.replace(/^#\s+/, '');
      if (trimmed.startsWith('### ')) {
        level = 3;
        text = trimmed.replace(/^###\s+/, '');
      } else if (trimmed.startsWith('## ')) {
        level = 2;
        text = trimmed.replace(/^##\s+/, '');
      }
      blocks.push({
        id: 'blk_' + Math.random().toString(36).substring(2, 9),
        type: 'header',
        level,
        text
      });
      currentBlock = null;
      continue;
    }

    // Alertas
    if (trimmed.startsWith('> [!')) {
      if (currentBlock) blocks.push(currentBlock);
      const match = trimmed.match(/> \[!([A-Z]+)\]\s*(.*)/);
      blocks.push({
        id: 'blk_' + Math.random().toString(36).substring(2, 9),
        type: 'callout',
        kind: match ? match[1] : 'NOTE',
        text: match ? match[2] : ''
      });
      currentBlock = null;
      continue;
    }

    // Detección de Reglas de Negocio BR-*
    if (trimmed.startsWith('### BR-') || (trimmed.startsWith('- **BR-') || trimmed.startsWith('**BR-'))) {
      if (currentBlock) blocks.push(currentBlock);
      const brIdMatch = trimmed.match(/BR-[A-Z]+-[0-9]+/);
      const brId = brIdMatch ? brIdMatch[0] : 'BR-GEN-001';
      blocks.push({
        id: 'blk_' + Math.random().toString(36).substring(2, 9),
        type: 'business_rule',
        ruleId: brId,
        text: trimmed
      });
      currentBlock = null;
      continue;
    }

    // Separadores
    if (/^(\*\*\*|---|___)$/.test(trimmed)) {
      if (currentBlock) blocks.push(currentBlock);
      blocks.push({
        id: 'blk_' + Math.random().toString(36).substring(2, 9),
        type: 'divider'
      });
      currentBlock = null;
      continue;
    }

    // Párrafos regulares agrupados
    if (trimmed) {
      if (!currentBlock || currentBlock.type !== 'paragraph') {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = {
          id: 'blk_' + Math.random().toString(36).substring(2, 9),
          type: 'paragraph',
          lines: [line]
        };
      } else {
        currentBlock.lines.push(line);
      }
    } else {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
    }
  }

  if (currentBlock) blocks.push(currentBlock);
  return blocks;
}

/**
 * Serializa de vuelta los bloques visuales al formato Markdown estándar
 */
export function blocksToMarkdown(blocks = []) {
  const parts = [];

  for (const b of blocks) {
    switch (b.type) {
      case 'header': {
        const prefix = '#'.repeat(b.level || 1);
        parts.push(`${prefix} ${b.text || ''}`);
        break;
      }
      case 'callout': {
        parts.push(`> [!${b.kind || 'NOTE'}]\n> ${b.text || ''}`);
        break;
      }
      case 'code': {
        const codeText = Array.isArray(b.content) ? b.content.join('\n') : (b.content || '');
        parts.push(`\`\`\`${b.lang || 'text'}\n${codeText}\n\`\`\``);
        break;
      }
      case 'business_rule': {
        parts.push(b.text || `### ${b.ruleId}\n${b.description || ''}`);
        break;
      }
      case 'divider': {
        parts.push('---');
        break;
      }
      case 'paragraph': {
        const text = Array.isArray(b.lines) ? b.lines.join('\n') : (b.text || '');
        parts.push(text);
        break;
      }
      default:
        if (b.raw) parts.push(b.raw);
        break;
    }
  }

  return parts.join('\n\n');
}

// Expone función de filtrado dinámico para tablas interactivas en window
if (typeof window !== 'undefined') {
  window.filterTableRows = function(tableId, query) {
    const table = document.getElementById(tableId);
    if (!table) return;
    const q = (query || '').toLowerCase().trim();
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(r => {
      const text = r.textContent.toLowerCase();
      if (!q || text.includes(q)) {
        r.style.display = '';
      } else {
        r.style.display = 'none';
      }
    });
  };
}
