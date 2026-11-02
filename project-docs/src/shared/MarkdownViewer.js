/**
 * MarkdownViewer: Parser y renderizador editorial minimalista (Docs-as-Code).
 * Inspirado en la experiencia de usuario y legibilidad de ContextForge & Claude AI.
 *
 * Características:
 * - Tipografía editorial (prose minimalista con espaciado óptimo).
 * - GitHub-style Alerts (> [!NOTE], [!TIP], [!WARNING], [!IMPORTANT], [!CAUTION]).
 * - Tablas fluidas con cabeceras estilizadas y badges de severidad.
 * - Bloques de código con etiqueta de lenguaje y botón de 1-clic para copiar.
 * - Checklists y listas semánticas.
 * - Detección y delegación de bloques ```mermaid para renderizado interactivo.
 */

export function renderMarkdown(content = '') {
  if (!content) return '<p class="text-slate-400 italic">Documento vacío.</p>';

  // Si existe window.marked, usarlo como base y procesar alertas y bloques
  if (typeof window !== 'undefined' && window.marked && typeof window.marked.parse === 'function') {
    try {
      const rawHtml = window.marked.parse(content);
      return postProcessMarkdownHtml(rawHtml);
    } catch (_) {
      // Fallback a parser propio si marked falla
    }
  }

  // Parser nativo editorial integrado (Cero dependencias, 100% offline)
  return parseMarkdownNative(content);
}

function postProcessMarkdownHtml(html) {
  // 1. Transformar GitHub alerts en contenedores estilizados
  return html
    .replace(/<blockquote>\s*<p>\s*\[!NOTE\]\s*([\s\S]*?)<\/p>\s*<\/blockquote>/gi, (_, text) => `
      <div class="my-4 p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-950 dark:text-indigo-200 flex items-start gap-3 shadow-xs">
        <span class="text-indigo-600 dark:text-indigo-400 text-base shrink-0 mt-0.5">ℹ️</span>
        <div class="leading-relaxed flex-1">${text}</div>
      </div>
    `)
    .replace(/<blockquote>\s*<p>\s*\[!TIP\]\s*([\s\S]*?)<\/p>\s*<\/blockquote>/gi, (_, text) => `
      <div class="my-4 p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-3 shadow-xs">
        <span class="text-emerald-600 dark:text-emerald-400 text-base shrink-0 mt-0.5">💡</span>
        <div class="leading-relaxed flex-1">${text}</div>
      </div>
    `)
    .replace(/<blockquote>\s*<p>\s*\[!WARNING\]\s*([\s\S]*?)<\/p>\s*<\/blockquote>/gi, (_, text) => `
      <div class="my-4 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3 shadow-xs">
        <span class="text-amber-600 dark:text-amber-400 text-base shrink-0 mt-0.5">⚠️</span>
        <div class="leading-relaxed flex-1">${text}</div>
      </div>
    `)
    .replace(/<blockquote>\s*<p>\s*\[!IMPORTANT\]\s*([\s\S]*?)<\/p>\s*<\/blockquote>/gi, (_, text) => `
      <div class="my-4 p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 text-xs text-purple-950 dark:text-purple-200 flex items-start gap-3 shadow-xs">
        <span class="text-purple-600 dark:text-purple-400 text-base shrink-0 mt-0.5">⚡</span>
        <div class="leading-relaxed flex-1">${text}</div>
      </div>
    `)
    .replace(/<blockquote>\s*<p>\s*\[!CAUTION\]\s*([\s\S]*?)<\/p>\s*<\/blockquote>/gi, (_, text) => `
      <div class="my-4 p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-950 dark:text-rose-200 flex items-start gap-3 shadow-xs">
        <span class="text-rose-600 dark:text-rose-400 text-base shrink-0 mt-0.5">🛑</span>
        <div class="leading-relaxed flex-1">${text}</div>
      </div>
    `);
}

function parseMarkdownNative(md) {
  const lines = md.split(/\r?\n/);
  let html = [];
  let inCodeBlock = false;
  let codeLang = '';
  let codeBuffer = [];
  let inTable = false;
  let tableHeaderParsed = false;
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. Bloques de código ```
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // Cerrar bloque
        const codeText = codeBuffer.join('\n');
        if (codeLang.toLowerCase() === 'mermaid') {
          html.push(`
            <div class="my-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 overflow-hidden shadow-xs">
              <div class="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-[11px] font-mono font-semibold text-slate-500">
                <span class="flex items-center gap-1.5 text-indigo-500">📊 Diagrama Mermaid</span>
                <button type="button" data-copy-mermaid="${escapeAttr(codeText)}" class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer">Copiar</button>
              </div>
              <div class="p-4 overflow-x-auto flex justify-center">
                <pre class="mermaid text-xs font-mono text-slate-300">${escapeHtml(codeText)}</pre>
              </div>
            </div>
          `);
        } else {
          html.push(`
            <div class="my-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 overflow-hidden shadow-xs">
              <div class="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400">
                <span>${codeLang || 'text'}</span>
                <button type="button" data-action="copy-code-block" class="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer text-[10px]">Copiar</button>
              </div>
              <pre class="p-4 text-xs font-mono overflow-x-auto leading-relaxed"><code>${escapeHtml(codeText)}</code></pre>
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
        html.push('<div class="my-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs"><table class="w-full text-left text-xs border-collapse">');
      }

      if (!tableHeaderParsed) {
        html.push('<thead class="bg-slate-100 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800"><tr>');
        cells.forEach(c => html.push(`<th class="px-3.5 py-2.5">${formatInline(c)}</th>`));
        html.push('</tr></thead><tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-950/50">');
      } else {
        html.push('<tr class="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">');
        cells.forEach(c => html.push(`<td class="px-3.5 py-2.5 text-slate-700 dark:text-slate-300 leading-relaxed">${formatInline(c)}</td>`));
        html.push('</tr>');
      }
      continue;
    } else if (inTable) {
      html.push('</tbody></table></div>');
      inTable = false;
      tableHeaderParsed = false;
    }

    // 3. Encabezados #
    if (line.startsWith('# ')) {
      html.push(`<h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-8 mb-4 tracking-tight border-b border-slate-200 dark:border-slate-800 pb-2">${formatInline(line.slice(2))}</h1>`);
      continue;
    }
    if (line.startsWith('## ')) {
      html.push(`<h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-6 mb-3 tracking-tight">${formatInline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith('### ')) {
      html.push(`<h3 class="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 mt-5 mb-2">${formatInline(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith('#### ')) {
      html.push(`<h4 class="text-sm font-bold text-slate-800 dark:text-slate-200 mt-4 mb-1.5">${formatInline(line.slice(5))}</h4>`);
      continue;
    }

    // 4. Reglas horizontales ---
    if (/^(\*\*\*|---|___)$/.test(line.trim())) {
      html.push('<hr class="my-6 border-slate-200 dark:border-slate-800" />');
      continue;
    }

    // 5. Alertas GitHub en blockquote (> [!NOTE])
    if (line.startsWith('> [!NOTE]')) {
      const rest = line.replace('> [!NOTE]', '').trim();
      html.push(`
        <div class="my-3 p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-950 dark:text-indigo-200 flex items-start gap-2.5">
          <span class="text-indigo-500 font-bold shrink-0 mt-0.5">ℹ️</span>
          <div class="leading-relaxed flex-1">${formatInline(rest)}</div>
        </div>
      `);
      continue;
    }
    if (line.startsWith('> [!TIP]')) {
      const rest = line.replace('> [!TIP]', '').trim();
      html.push(`
        <div class="my-3 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2.5">
          <span class="text-emerald-500 font-bold shrink-0 mt-0.5">💡</span>
          <div class="leading-relaxed flex-1">${formatInline(rest)}</div>
        </div>
      `);
      continue;
    }
    if (line.startsWith('> [!WARNING]')) {
      const rest = line.replace('> [!WARNING]', '').trim();
      html.push(`
        <div class="my-3 p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2.5">
          <span class="text-amber-500 font-bold shrink-0 mt-0.5">⚠️</span>
          <div class="leading-relaxed flex-1">${formatInline(rest)}</div>
        </div>
      `);
      continue;
    }

    // 6. Blockquote genérico >
    if (line.startsWith('> ')) {
      html.push(`<blockquote class="my-3 pl-4 border-l-2 border-indigo-500 text-slate-600 dark:text-slate-400 italic text-xs leading-relaxed">${formatInline(line.slice(2))}</blockquote>`);
      continue;
    }

    // 7. Listas desordenadas - o *
    if (/^[\*\-]\s/.test(line)) {
      if (!inList) {
        html.push('<ul class="my-3 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">');
        inList = true;
      }
      const itemText = line.replace(/^[\*\-]\s/, '');
      html.push(`<li class="flex items-start gap-2"><span class="text-indigo-500 font-bold shrink-0 mt-0.5">▪</span><span>${formatInline(itemText)}</span></li>`);
      continue;
    } else if (inList) {
      html.push('</ul>');
      inList = false;
    }

    // 8. Línea vacía
    if (!line.trim()) {
      continue;
    }

    // 9. Párrafo normal
    html.push(`<p class="my-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">${formatInline(line)}</p>`);
  }

  if (inTable) html.push('</tbody></table></div>');
  if (inList) html.push('</ul>');

  return html.join('');
}

function formatInline(text = '') {
  return text
    // Código en línea `code`
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-indigo-600 dark:text-indigo-400 text-[11px] border border-slate-200 dark:border-slate-700">$1</code>')
    // Negrita **bold**
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
    // Cursiva *italic*
    .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
    // Enlaces [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-500 font-medium">$1</a>');
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
