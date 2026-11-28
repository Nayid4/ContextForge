// 3rd Editor Mode Mixin: Visual WYSIWYG <-> Canonical GFM Markdown (Selection-Safe + Spanish Styles + Color Palette + Full Round-Trip Sync)
window.cfEditorWysiwygMixin = function() {
  let tdInstance = null;
  let savedRange = null;
  let preservedFrontmatter = '';

  const FRONTMATTER_RE = /^(---\r?\n[\s\S]*?\r?\n---\r?\n*)/;

  function splitFrontmatter(md) {
    const raw = String(md || '');
    const m = raw.match(FRONTMATTER_RE);
    if (m) {
      return { fm: m[1], body: raw.slice(m[1].length) };
    }
    return { fm: '', body: raw };
  }

  function getTurndown() {
    if (tdInstance) return tdInstance;
    if (typeof window.TurndownService === 'function') {
      tdInstance = new window.TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
        bulletListMarker: '-',
        emDelimiter: '*',
        strongDelimiter: '**',
      });

      // Preserve Mermaid diagrams losslessly across Visual <-> Markdown <-> Bloques
      tdInstance.addRule('mermaidCard', {
        filter: (node) =>
          node.nodeType === 1 &&
          (node.hasAttribute('data-cf-mermaid-src') ||
            (node.nodeName === 'PRE' && Boolean(node.querySelector('code.language-mermaid, code.mermaid')))),
        replacement: (_, node) => {
          const src = node.hasAttribute('data-cf-mermaid-src')
            ? node.getAttribute('data-cf-mermaid-src')
            : (node.querySelector('code')?.textContent || node.textContent || '');
          return `\n\n\`\`\`mermaid\n${String(src || '').trim()}\n\`\`\`\n\n`;
        },
      });

      // Preserve interactive Attachment Cards losslessly
      tdInstance.addRule('attachmentCard', {
        filter: (node) => node.nodeType === 1 && node.hasAttribute('data-cf-att-url'),
        replacement: (_, node) => {
          const name = node.getAttribute('data-cf-att-name') || 'anexo';
          const url = node.getAttribute('data-cf-att-url') || '';
          return `\n\n> **Anexo:** [${name}](${url})\n\n`;
        },
      });

      // Preserve GFM Tables
      tdInstance.addRule('gfmTable', {
        filter: 'table',
        replacement: function(_, node) {
          const rows = Array.from(node.querySelectorAll('tr'));
          if (!rows.length) return '';
          const mdRows = rows.map(
            (tr) =>
              '| ' +
              Array.from(tr.children)
                .map((cell) => (cell.textContent || '').trim().replace(/\|/g, '\\|'))
                .join(' | ') +
              ' |'
          );
          const colCount = Math.max(1, rows[0].children.length);
          const sep = '| ' + Array(colCount).fill('---').join(' | ') + ' |';
          return '\n\n' + [mdRows[0], sep, ...mdRows.slice(1)].join('\n') + '\n\n';
        },
      });

      // Preserve Strikethrough
      tdInstance.addRule('strikethrough', {
        filter: ['del', 's', 'strike'],
        replacement: (content) => (content.trim() ? `~~${content}~~` : ''),
      });

      // Preserve Underline
      tdInstance.addRule('underline', {
        filter: ['u'],
        replacement: (content) => (content.trim() ? `<u>${content}</u>` : ''),
      });

      // Preserve Styled Spans & colored inline elements (color + fallback CSS bold/italic/underline/strike)
      tdInstance.addRule('styledInline', {
        filter: (node) =>
          (node.nodeName === 'SPAN' && Boolean(node.getAttribute('style'))) ||
          (node.nodeName === 'FONT' && Boolean(node.getAttribute('color'))) ||
          (['B', 'STRONG', 'I', 'EM', 'U', 'S', 'DEL', 'STRIKE'].includes(node.nodeName) && Boolean(node.style && node.style.color)),
        replacement: (content, node) => {
          if (!content) return '';
          let out = content;
          const tag = node.nodeName;
          const st = node.style || {};
          const fw = String(st.fontWeight || '').toLowerCase();
          if (tag === 'B' || tag === 'STRONG' || fw === 'bold' || parseInt(fw, 10) >= 600) out = `**${out}**`;
          if (tag === 'I' || tag === 'EM' || String(st.fontStyle || '').toLowerCase() === 'italic') out = `*${out}*`;
          const td = String(st.textDecoration || st.textDecorationLine || '').toLowerCase();
          if (tag === 'S' || tag === 'DEL' || tag === 'STRIKE' || td.includes('line-through')) out = `~~${out}~~`;
          if (tag === 'U' || td.includes('underline')) out = `<u>${out}</u>`;
          const col = st.color || node.getAttribute?.('color') || '';
          if (col) out = `<span style="color:${col}">${out}</span>`;
          return out;
        },
      });

      // Preserve explicit center/right text alignment blocks
      tdInstance.addRule('alignedBlock', {
        filter: (node) =>
          ['P', 'DIV', 'H1', 'H2', 'H3', 'H4'].includes(node.nodeName) &&
          ['center', 'right'].includes(String(node.style?.textAlign || '').toLowerCase()),
        replacement: (content, node) => {
          const align = String(node.style.textAlign).toLowerCase();
          const tag = node.nodeName.toLowerCase();
          return `\n\n<${tag} style="text-align:${align}">${content.trim()}</${tag}>\n\n`;
        },
      });

      return tdInstance;
    }
    return null;
  }

  function fallbackHtmlToMarkdown(rootEl) {
    const lines = [];
    Array.from(rootEl.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const txt = (node.textContent || '').trim();
        if (txt) lines.push(txt);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const tag = node.tagName.toLowerCase();
      const text = (node.innerText || node.textContent || '').trim();
      if (tag === 'h1') lines.push(`# ${text}`);
      else if (tag === 'h2') lines.push(`## ${text}`);
      else if (tag === 'h3') lines.push(`### ${text}`);
      else if (tag === 'h4') lines.push(`#### ${text}`);
      else if (tag === 'blockquote') lines.push(text.split('\n').map((l) => `> ${l}`).join('\n'));
      else if (tag === 'pre') lines.push('```\n' + text + '\n```');
      else if (tag === 'ul') Array.from(node.querySelectorAll('li')).forEach((li) => lines.push(`- ${(li.innerText || '').trim()}`));
      else if (tag === 'ol') Array.from(node.querySelectorAll('li')).forEach((li, i) => lines.push(`${i + 1}. ${(li.innerText || '').trim()}`));
      else if (tag === 'table') {
        const rows = Array.from(node.querySelectorAll('tr'));
        if (rows.length) {
          const toRow = (tr) => '| ' + Array.from(tr.children).map((c) => (c.innerText || '').trim()).join(' | ') + ' |';
          lines.push(toRow(rows[0]));
          lines.push('| ' + Array(Math.max(1, rows[0].children.length)).fill('---').join(' | ') + ' |');
          rows.slice(1).forEach((r) => lines.push(toRow(r)));
        }
      } else if (text) lines.push(text);
    });
    return lines.join('\n\n').trim();
  }

  function getSurface() {
    return document.getElementById('cf-wysiwyg-surface');
  }

  function placeCaretInside(el, collapseToEnd = true) {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(!collapseToEnd ? true : false);
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
      savedRange = range.cloneRange();
    }
  }

  return {
    wysiwygHeadingOpen: false,
    wysiwygColorOpen: false,
    wysiwygActiveBlockTag: 'p',
    wysiwygActiveBlockLabel: 'Texto normal',
    wysiwygActiveColor: '',
    wysiwygActiveColorLabel: 'Predeterminado',
    wysiwygCustomColor: '#4f46e5',
    wysiwygFormatState: { bold: false, italic: false, underline: false, strike: false, ul: false, ol: false },

    wysiwygTextStyles: [
      { tag: 'p', label: 'Texto normal', badge: 'P', previewClass: 'text-xs font-normal' },
      { tag: 'h1', label: 'Título 1', badge: 'H1', previewClass: 'text-base font-extrabold' },
      { tag: 'h2', label: 'Título 2', badge: 'H2', previewClass: 'text-sm font-bold' },
      { tag: 'h3', label: 'Título 3', badge: 'H3', previewClass: 'text-xs font-bold' },
      { tag: 'h4', label: 'Subtítulo', badge: 'H4', previewClass: 'text-xs font-semibold text-indigo-600 dark:text-indigo-400' },
      { tag: 'blockquote', label: 'Cita destacada', badge: '>', previewClass: 'text-xs italic border-l-2 border-indigo-500 pl-2' },
    ],

    wysiwygColorSwatches: [
      { hex: '', label: 'Predeterminado' },
      { hex: '#4f46e5', label: 'Índigo' },
      { hex: '#059669', label: 'Esmeralda' },
      { hex: '#d97706', label: 'Ámbar' },
      { hex: '#e11d48', label: 'Rojo / Rosa' },
      { hex: '#0284c7', label: 'Azul cielo' },
      { hex: '#7c3aed', label: 'Púrpura' },
      { hex: '#64748b', label: 'Gris pizarra' },
      { hex: '#0f172a', label: 'Negro' },
    ],

    wysiwygSaveSelection() {
      const surface = getSurface();
      const sel = window.getSelection();
      if (surface && sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (surface.contains(range.commonAncestorContainer)) {
          savedRange = range.cloneRange();
        }
      }
      this.wysiwygRefreshToolbarState();
    },

    wysiwygRestoreSelection() {
      const surface = getSurface();
      if (!surface) return null;
      surface.focus();
      const sel = window.getSelection();
      if (!sel) return surface;
      if (savedRange && surface.contains(savedRange.commonAncestorContainer)) {
        sel.removeAllRanges();
        sel.addRange(savedRange);
      } else if (sel.rangeCount === 0 || !surface.contains(sel.getRangeAt(0).commonAncestorContainer)) {
        placeCaretInside(surface, true);
      }
      return surface;
    },

    wysiwygRefreshToolbarState() {
      try {
        this.wysiwygFormatState = {
          bold: document.queryCommandState('bold'),
          italic: document.queryCommandState('italic'),
          underline: document.queryCommandState('underline'),
          strike: document.queryCommandState('strikeThrough'),
          ul: document.queryCommandState('insertUnorderedList'),
          ol: document.queryCommandState('insertOrderedList'),
        };
        const blk = String(document.queryCommandValue('formatBlock') || 'p').replace(/[<>]/g, '').toLowerCase();
        const found = this.wysiwygTextStyles.find((s) => s.tag === blk);
        if (found) {
          this.wysiwygActiveBlockTag = found.tag;
          this.wysiwygActiveBlockLabel = found.label;
        } else {
          this.wysiwygActiveBlockTag = 'p';
          this.wysiwygActiveBlockLabel = 'Texto normal';
        }
      } catch {}
    },

    syncMarkdownToWysiwyg() {
      const surface = getSurface();
      if (!surface) return;
      const { fm, body } = splitFrontmatter(this.doc.rawMarkdown || '');
      preservedFrontmatter = fm;
      const cleanBody = body.trim();
      if (!cleanBody) {
        surface.innerHTML = '';
        surface.dataset.empty = 'true';
        return;
      }
      surface.innerHTML = window.renderMarkdown ? window.renderMarkdown(cleanBody) : cleanBody;
      surface.dataset.empty = 'false';
      this.wysiwygEnhanceEmbeddedCards(surface);
    },

    wysiwygEnhanceEmbeddedCards(surface) {
      if (!surface) return;
      // 1. Convert <pre><code class="language-mermaid"> into editable, lossless Mermaid Cards
      const freshMermaidNodes = [];
      surface.querySelectorAll('pre code.language-mermaid, pre code.mermaid').forEach((codeEl) => {
        const pre = codeEl.parentElement;
        const src = (codeEl.textContent || '').trim();
        const card = this._buildMermaidCard(src);
        if (pre && pre.parentNode) {
          pre.parentNode.replaceChild(card, pre);
          const mNode = card.querySelector('.mermaid');
          if (mNode) freshMermaidNodes.push(mNode);
        }
      });
      if (freshMermaidNodes.length > 0 && typeof mermaid !== 'undefined') {
        try { mermaid.run({ nodes: freshMermaidNodes }); } catch (err) { console.warn('Mermaid card render:', err); }
      }
      // 2. Enhance attachments & images inside Visual sheet for instant FilePreviewModal
      if (window.enhanceDocumentAttachments) {
        window.enhanceDocumentAttachments(surface);
        surface.querySelectorAll('.cf-attachment-card').forEach((c) => c.setAttribute('contenteditable', 'false'));
      }
    },

    _buildMermaidCard(src) {
      const card = document.createElement('div');
      card.className = 'cf-wysiwyg-mermaid-card my-4 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-slate-50 dark:bg-[#0d0f15] overflow-hidden';
      card.setAttribute('contenteditable', 'false');
      card.setAttribute('data-cf-mermaid-src', src);

      const header = document.createElement('div');
      header.className = 'flex items-center justify-between px-3 py-1.5 bg-emerald-50/70 dark:bg-emerald-950/30 border-b border-emerald-200/70 dark:border-emerald-500/20 text-[11px]';
      header.innerHTML = `
        <span class="font-semibold text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1.5">
          <i class="fa-solid fa-diagram-project text-[10px]"></i><span>Diagrama Mermaid</span>
        </span>
        <div class="flex items-center gap-1.5">
          <button type="button" class="cf-m-edit px-2 py-0.5 rounded bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232738] text-slate-700 dark:text-zinc-200 hover:border-indigo-500 cursor-pointer font-medium">Editar código</button>
          <button type="button" class="cf-m-del px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white cursor-pointer font-medium">Quitar</button>
        </div>`;

      const diagramWrap = document.createElement('div');
      diagramWrap.className = 'mermaid p-4 flex justify-center overflow-x-auto';
      diagramWrap.setAttribute('data-cf-mermaid-src', src);
      diagramWrap.textContent = src;

      const editorWrap = document.createElement('div');
      editorWrap.className = 'hidden p-3 border-t border-slate-200 dark:border-[#232738] bg-slate-950 space-y-2';
      editorWrap.innerHTML = `
        <textarea rows="5" class="cf-m-ta w-full p-2.5 rounded-lg bg-[#0a0c12] text-emerald-300 font-mono text-xs border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"></textarea>
        <div class="flex justify-end gap-2">
          <button type="button" class="cf-m-apply px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold cursor-pointer">Aplicar diagrama</button>
        </div>`;
      const ta = editorWrap.querySelector('.cf-m-ta');
      ta.value = src;

      header.querySelector('.cf-m-edit').addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        editorWrap.classList.toggle('hidden');
        if (!editorWrap.classList.contains('hidden')) ta.focus();
      });
      header.querySelector('.cf-m-del').addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        card.remove();
        this.onWysiwygInput();
      });
      editorWrap.querySelector('.cf-m-apply').addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const nextSrc = ta.value.trim();
        card.setAttribute('data-cf-mermaid-src', nextSrc);
        diagramWrap.removeAttribute('data-processed');
        diagramWrap.setAttribute('data-cf-mermaid-src', nextSrc);
        diagramWrap.textContent = nextSrc;
        editorWrap.classList.add('hidden');
        if (typeof mermaid !== 'undefined' && nextSrc) {
          try { mermaid.run({ nodes: [diagramWrap] }); } catch {}
        }
        this.onWysiwygInput();
      });

      card.appendChild(header);
      card.appendChild(diagramWrap);
      card.appendChild(editorWrap);
      return card;
    },

    wysiwygInsertMermaid() {
      const surface = this.wysiwygRestoreSelection();
      if (!surface) return;
      const sample = 'flowchart LR\n  Usuario --> ContextForge\n  ContextForge --> AgenteIA';
      const card = this._buildMermaidCard(sample);
      const afterP = document.createElement('p');
      afterP.innerHTML = '<br>';
      surface.appendChild(card);
      surface.appendChild(afterP);
      const mNode = card.querySelector('.mermaid');
      if (mNode && typeof mermaid !== 'undefined') {
        try { mermaid.run({ nodes: [mNode] }); } catch {}
      }
      placeCaretInside(afterP, true);
      this.onWysiwygInput();
    },

    syncWysiwygToMarkdown() {
      const surface = getSurface();
      if (!surface) return;
      const plain = (surface.innerText || '').replace(/\u200B/g, '').trim();
      const hasRich = Boolean(surface.querySelector('table, img, pre, hr, [data-cf-mermaid-src], [data-cf-att-url]'));
      surface.dataset.empty = (plain || hasRich) ? 'false' : 'true';
      if (!plain && !hasRich) {
        this.doc.rawMarkdown = preservedFrontmatter ? preservedFrontmatter.trimEnd() + '\n' : '';
        return;
      }
      const td = getTurndown();
      const bodyMd = (td ? td.turndown(surface.innerHTML) : fallbackHtmlToMarkdown(surface)).replace(/\u200B/g, '').trim();
      this.doc.rawMarkdown = preservedFrontmatter ? `${preservedFrontmatter.trimEnd()}\n\n${bodyMd}` : bodyMd;
    },

    onWysiwygInput() {
      this.markDirty();
      this.syncWysiwygToMarkdown();
      this.wysiwygSaveSelection();
    },

    wysiwygCmd(cmd, value = null) {
      const surface = this.wysiwygRestoreSelection();
      if (!surface) return;
      const useCss = cmd.startsWith('justify') || cmd === 'foreColor';
      try { document.execCommand('styleWithCSS', false, useCss); } catch {}
      document.execCommand(cmd, false, value);
      this.onWysiwygInput();
    },

    wysiwygHeading(tag, label) {
      this.wysiwygHeadingOpen = false;
      const surface = this.wysiwygRestoreSelection();
      if (!surface) return;
      const cleanTag = String(tag || 'p').toLowerCase();
      const plain = (surface.innerText || '').replace(/\u200B/g, '').trim();
      if (!plain) {
        surface.innerHTML = `<${cleanTag}><br></${cleanTag}>`;
        const el = surface.firstElementChild;
        if (el) placeCaretInside(el, true);
      } else {
        try { document.execCommand('styleWithCSS', false, false); } catch {}
        const ok =
          document.execCommand('formatBlock', false, `<${cleanTag}>`) ||
          document.execCommand('formatBlock', false, cleanTag.toUpperCase());
        if (!ok) {
          const sel = window.getSelection();
          const txt = sel ? sel.toString() : '';
          document.execCommand('insertHTML', false, `<${cleanTag}>${txt || '<br>'}</${cleanTag}>`);
        }
      }
      this.wysiwygActiveBlockTag = cleanTag;
      if (label) this.wysiwygActiveBlockLabel = label;
      this.onWysiwygInput();
    },

    wysiwygApplyColor(hex, label, closeMenu = true) {
      if (closeMenu) this.wysiwygColorOpen = false;
      const surface = this.wysiwygRestoreSelection();
      if (!surface) return;
      this.wysiwygActiveColor = hex || '';
      this.wysiwygActiveColorLabel = label || (hex || 'Predeterminado');
      if (!hex) {
        try { document.execCommand('styleWithCSS', false, false); } catch {}
        document.execCommand('removeFormat', false, null);
        this.onWysiwygInput();
        return;
      }
      try { document.execCommand('styleWithCSS', false, true); } catch {}
      const sel = window.getSelection();
      if (sel && sel.isCollapsed) {
        // Insert a colored span anchor so newly typed text gets the chosen color immediately
        const span = document.createElement('span');
        span.style.color = hex;
        span.appendChild(document.createTextNode('\u200B'));
        const range = sel.getRangeAt(0);
        range.insertNode(span);
        const nextRange = document.createRange();
        nextRange.setStart(span.firstChild, 1);
        nextRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(nextRange);
        savedRange = nextRange.cloneRange();
      } else {
        document.execCommand('foreColor', false, hex);
      }
      this.onWysiwygInput();
    },

    wysiwygList(cmd) {
      const surface = this.wysiwygRestoreSelection();
      if (!surface) return;
      const plain = (surface.innerText || '').replace(/\u200B/g, '').trim();
      if (!plain) {
        const tag = cmd === 'insertOrderedList' ? 'ol' : 'ul';
        surface.innerHTML = `<${tag}><li><br></li></${tag}>`;
        const li = surface.querySelector('li');
        if (li) placeCaretInside(li, true);
        this.onWysiwygInput();
        return;
      }
      document.execCommand(cmd, false, null);
      this.onWysiwygInput();
    },

    wysiwygBlockquote() {
      this.wysiwygHeading('blockquote', 'Cita destacada');
    },

    wysiwygInsertCode() {
      const surface = this.wysiwygRestoreSelection();
      if (!surface) return;
      const sel = window.getSelection();
      const selectedTxt = sel ? sel.toString().trim() : '';
      const safe = (selectedTxt || '// escribe tu codigo aqui').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const html = `<pre><code>${safe}</code></pre><p><br></p>`;
      document.execCommand('insertHTML', false, html);
      this.onWysiwygInput();
    },

    wysiwygInsertTable() {
      const surface = this.wysiwygRestoreSelection();
      if (!surface) return;
      const html =
        '<table><thead><tr><th>Columna 1</th><th>Columna 2</th><th>Columna 3</th></tr></thead>' +
        '<tbody><tr><td>Valor A</td><td>Valor B</td><td>Valor C</td></tr></tbody></table><p><br></p>';
      document.execCommand('insertHTML', false, html);
      this.onWysiwygInput();
    },

    wysiwygClearFormat() {
      const surface = this.wysiwygRestoreSelection();
      if (!surface) return;
      try { document.execCommand('styleWithCSS', false, false); } catch {}
      document.execCommand('removeFormat', false, null);
      document.execCommand('formatBlock', false, '<p>');
      this.wysiwygActiveColor = '';
      this.wysiwygActiveColorLabel = 'Predeterminado';
      this.wysiwygActiveBlockTag = 'p';
      this.wysiwygActiveBlockLabel = 'Texto normal';
      this.onWysiwygInput();
    },
  };
};
