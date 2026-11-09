/**
 * Markdown Utilities for Docs-as-Code & Plane Pages Architecture
 * 100% Vectorial, accesible, 0 emojis.
 */
import { Icons } from '../ui/Icons.js';

export function slugify(text = '') {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || 'section';
}

export function stripFrontmatter(md = '') {
  if (!md || typeof md !== 'string') return '';
  return md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

export function extractTableOfContents(md = '') {
  const cleanMd = stripFrontmatter(md);
  const lines = (cleanMd || '').split(/\r?\n/);
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
      const cleanText = text
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .trim();
      const slug = slugify(cleanText);
      toc.push({ id: slug, level, text: cleanText });
    }
  }
  return toc;
}

export function getMarkdownSnippet(markdown = '', maxLines = 3) {
  if (!markdown || typeof markdown !== 'string') return 'No preview text available.';
  const clean = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/^>\s*\[!.*\]\s*/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/[*_~]{1,3}/g, '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .slice(0, maxLines)
    .join(' ');
  return clean || 'No preview text available.';
}

export function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderInline(text = '') {
  return text
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-zinc-800 text-indigo-300 font-mono text-[11px]">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-zinc-100">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="italic text-zinc-300">$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">$1</a>');
}

export function renderMarkdown(content = '') {
  if (!content || typeof content !== 'string') {
    return '<p class="text-zinc-500 italic">Documento vacío.</p>';
  }

  const lines = stripFrontmatter(content).split(/\r?\n/);
  const out = [];
  let inCode = false;
  let codeLang = '';
  let codeBuffer = [];
  let inTable = false;
  let tableRows = [];

  const flushTable = () => {
    if (!inTable || tableRows.length === 0) return;
    const [header, , ...body] = tableRows;
    if (header) {
      const headerCols = header.split('|').map(c => c.trim()).filter(Boolean);
      const rowsHtml = body.map(r => {
        const cols = r.split('|').map(c => c.trim()).filter(Boolean);
        return `<tr class="border-b border-zinc-800/80 hover:bg-zinc-900/50 transition-colors">${cols.map(c => `<td class="px-4 py-2 text-xs text-zinc-300">${renderInline(c)}</td>`).join('')}</tr>`;
      }).join('');

      out.push(`
        <div class="my-4 overflow-x-auto rounded-lg border border-zinc-800">
          <table class="w-full text-left border-collapse">
            <thead class="bg-zinc-900 sticky top-0 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              <tr>${headerCols.map(c => `<th class="px-4 py-2.5">${renderInline(c)}</th>`).join('')}</tr>
            </thead>
            <tbody class="divide-y divide-zinc-800/50">${rowsHtml}</tbody>
          </table>
        </div>
      `);
    }
    tableRows = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Bloques de código
    if (trimmed.startsWith('```')) {
      if (inTable) flushTable();
      if (!inCode) {
        inCode = true;
        codeLang = trimmed.replace(/^```/, '').trim();
        codeBuffer = [];
      } else {
        inCode = false;
        const codeText = codeBuffer.join('\n');
        out.push(`
          <div class="my-4 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 font-mono text-xs">
            <div class="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[10px] text-zinc-400">
              <span>${codeLang || 'text'}</span>
              <button data-action="copy-code" class="text-zinc-400 hover:text-white transition-colors" title="Copiar código">${Icons.copy('w-3.5 h-3.5')}</button>
            </div>
            <pre class="p-3.5 overflow-x-auto text-zinc-200"><code>${escapeHtml(codeText)}</code></pre>
          </div>
        `);
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    // Tablas Markdown
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      inTable = true;
      tableRows.push(trimmed);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Encabezados
    if (trimmed.startsWith('### ')) {
      const text = trimmed.replace(/^###\s+/, '');
      const id = slugify(text);
      out.push(`<h3 id="${id}" class="text-sm font-semibold text-zinc-200 mt-5 mb-2 flex items-center gap-2 group"><a href="#${id}" class="text-zinc-600 group-hover:text-zinc-400">#</a>${renderInline(text)}</h3>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      const text = trimmed.replace(/^##\s+/, '');
      const id = slugify(text);
      out.push(`<h2 id="${id}" class="text-base font-bold text-zinc-100 mt-6 mb-3 border-b border-zinc-800/80 pb-1.5 flex items-center gap-2 group"><a href="#${id}" class="text-zinc-600 group-hover:text-zinc-400">#</a>${renderInline(text)}</h2>`);
      continue;
    }
    if (trimmed.startsWith('# ')) {
      const text = trimmed.replace(/^#\s+/, '');
      const id = slugify(text);
      out.push(`<h1 id="${id}" class="text-lg font-extrabold text-zinc-100 mt-6 mb-4 flex items-center gap-2 group"><a href="#${id}" class="text-zinc-600 group-hover:text-zinc-400">#</a>${renderInline(text)}</h1>`);
      continue;
    }

    // Alertas GitHub
    if (trimmed.startsWith('> [!NOTE]') || trimmed.startsWith('> [!TIP]') || trimmed.startsWith('> [!IMPORTANT]') || trimmed.startsWith('> [!WARNING]') || trimmed.startsWith('> [!CAUTION]')) {
      const type = trimmed.replace(/^>\s+\[!/, '').replace(/\]$/, '').toLowerCase();
      let alertClass = 'border-blue-500/30 bg-blue-950/20 text-blue-300';
      let icon = Icons.info;
      if (type === 'tip') {
        alertClass = 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300';
        icon = Icons.lightbulb;
      } else if (type === 'warning' || type === 'caution') {
        alertClass = 'border-amber-500/30 bg-amber-950/20 text-amber-300';
        icon = Icons.alertTriangle;
      } else if (type === 'important') {
        alertClass = 'border-purple-500/30 bg-purple-950/20 text-purple-300';
        icon = Icons.zap;
      }

      const alertBody = [];
      let j = i + 1;
      while (j < lines.length && lines[j].trim().startsWith('>')) {
        alertBody.push(lines[j].trim().replace(/^>\s*/, ''));
        j++;
      }
      i = j - 1;

      out.push(`
        <div class="my-4 p-3.5 rounded-xl border ${alertClass} flex items-start gap-3 text-xs leading-relaxed">
          <div class="shrink-0 mt-0.5">${icon('w-4 h-4')}</div>
          <div class="flex-1 space-y-1">${alertBody.map(b => `<p>${renderInline(b)}</p>`).join('')}</div>
        </div>
      `);
      continue;
    }

    // Listas
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const itemText = trimmed.replace(/^[-*]\s+/, '');
      out.push(`<li class="ml-4 list-disc text-xs text-zinc-300 my-1">${renderInline(itemText)}</li>`);
      continue;
    }

    // Párrafos regulares
    if (trimmed.length > 0) {
      out.push(`<p class="text-xs text-zinc-300 leading-relaxed my-2">${renderInline(trimmed)}</p>`);
    }
  }

  if (inTable) flushTable();
  return out.join('\n');
}

export function parseMarkdownToBlocks(md = '') {
  if (!md) return [];
  const lines = md.split(/\r?\n/);
  const blocks = [];
  let currentBlock = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      if (currentBlock) blocks.push(currentBlock);
      const level = trimmed.startsWith('# ') ? 1 : (trimmed.startsWith('## ') ? 2 : 3);
      currentBlock = { type: 'heading', level, content: trimmed.replace(/^#{1,3}\s+/, '') };
    } else if (trimmed.startsWith('```')) {
      if (currentBlock && currentBlock.type === 'code') {
        blocks.push(currentBlock);
        currentBlock = null;
      } else {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: 'code', lang: trimmed.replace(/^```/, ''), lines: [] };
      }
    } else if (currentBlock && currentBlock.type === 'code') {
      currentBlock.lines.push(line);
    } else if (trimmed.length > 0) {
      if (!currentBlock || currentBlock.type !== 'paragraph') {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: 'paragraph', content: trimmed };
      } else {
        currentBlock.content += `\n${trimmed}`;
      }
    }
  }
  if (currentBlock) blocks.push(currentBlock);
  return blocks;
}

export function blocksToMarkdown(blocks = []) {
  if (!Array.isArray(blocks)) return '';
  return blocks.map(b => {
    if (b.type === 'heading') return `${'#'.repeat(b.level || 1)} ${b.content}\n`;
    if (b.type === 'code') return `\`\`\`${b.lang || ''}\n${(b.lines || []).join('\n')}\n\`\`\`\n`;
    if (b.type === 'paragraph') return `${b.content}\n`;
    return '';
  }).join('\n');
}

export function htmlToMarkdown(html = '') {
  if (!html || typeof html !== 'string') return '';
  if (typeof document !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return nodeToMarkdown(doc.body).trim();
  }
  return html
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*')
    .replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, '<u>$1</u>')
    .replace(/<(strike|s|del)[^>]*>([\s\S]*?)<\/\1>/gi, '~~$2~~')
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '> $1\n\n')
    .replace(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n')
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n')
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, '$1\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function nodeToMarkdown(node) {
  if (!node) return '';
  if (node.nodeType === 3) return node.nodeValue;
  if (node.nodeType !== 1) return '';

  const tag = node.tagName.toLowerCase();
  const childrenMd = Array.from(node.childNodes).map(nodeToMarkdown).join('');

  switch (tag) {
    case 'h1': return `# ${childrenMd.trim()}\n\n`;
    case 'h2': return `## ${childrenMd.trim()}\n\n`;
    case 'h3': return `### ${childrenMd.trim()}\n\n`;
    case 'h4': return `#### ${childrenMd.trim()}\n\n`;
    case 'p': return `${childrenMd.trim()}\n\n`;
    case 'strong':
    case 'b': return `**${childrenMd}**`;
    case 'em':
    case 'i': return `*${childrenMd}*`;
    case 'u': return `<u>${childrenMd}</u>`;
    case 'strike':
    case 's':
    case 'del': return `~~${childrenMd}~~`;
    case 'code':
      if (node.parentElement && node.parentElement.tagName.toLowerCase() === 'pre') return childrenMd;
      return `\`${childrenMd}\``;
    case 'pre': return `\`\`\`\n${childrenMd.trim()}\n\`\`\`\n\n`;
    case 'blockquote': return `> ${childrenMd.trim()}\n\n`;
    case 'ul':
    case 'ol': return `${childrenMd}\n`;
    case 'li': {
      const isOl = node.parentElement && node.parentElement.tagName.toLowerCase() === 'ol';
      const index = Array.from(node.parentElement ? node.parentElement.children : []).indexOf(node) + 1;
      return `${isOl ? `${index}.` : '-'} ${childrenMd.trim()}\n`;
    }
    case 'table': {
      const rows = Array.from(node.querySelectorAll('tr'));
      if (rows.length === 0) return '';
      return rows.map((tr, rIdx) => {
        const cells = Array.from(tr.querySelectorAll('th, td')).map(c => c.textContent.trim());
        const rowStr = `| ${cells.join(' | ')} |`;
        if (rIdx === 0) {
          const sep = `| ${cells.map(() => '---').join(' | ')} |`;
          return `${rowStr}\n${sep}`;
        }
        return rowStr;
      }).join('\n') + '\n\n';
    }
    case 'hr': return `---\n\n`;
    case 'br': return '\n';
    case 'div': return `${childrenMd}\n`;
    default: return childrenMd;
  }
}
