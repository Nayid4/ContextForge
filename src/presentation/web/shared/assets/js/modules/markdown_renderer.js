// Enhanced GFM Markdown Renderer (Documents, Live Preview, RAG Chat & Scoped Chat)
(function() {
  const ALERT_LABELS = {
    NOTE: 'Nota',
    TIP: 'Consejo',
    IMPORTANT: 'Importante',
    WARNING: 'Advertencia',
    CAUTION: 'Precaución',
  };

  function postProcessMarkdownHtml(html) {
    if (!html) return '';
    // GitHub-style Alert callouts (> [!NOTE], [!TIP], [!IMPORTANT], [!WARNING], [!CAUTION])
    html = html.replace(
      /<blockquote>\s*<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(?:<br\s*\/?>|\n)?([\s\S]*?)<\/p>([\s\S]*?)<\/blockquote>/gi,
      (_, kindRaw, firstPara, rest) => {
        const kind = kindRaw.toUpperCase();
        const label = ALERT_LABELS[kind] || kind;
        const body = (firstPara && firstPara.trim() ? `<p>${firstPara.trim()}</p>` : '') + (rest || '');
        return `<div class="cf-callout cf-callout-${kind.toLowerCase()}"><div class="cf-callout-title">${label}</div><div class="cf-callout-body">${body}</div></div>`;
      }
    );
    // Wrap tables in responsive scrollable container
    html = html.replace(/(<table\b[^>]*>[\s\S]*?<\/table>)/gi, '<div class="cf-table-wrap">$1</div>');
    return html;
  }

  if (window.marked) {
    marked.use({ gfm: true, breaks: true });
  }

  window.renderMarkdown = function(md) {
    if (!md) return '';
    try {
      const rawHtml = window.marked ? marked.parse(String(md)) : String(md);
      return postProcessMarkdownHtml(rawHtml);
    } catch (e) {
      return String(md);
    }
  };

  window.enhanceRenderedMarkdown = function(rootEl) {
    if (!rootEl) return;
    // Highlight code blocks + add copy buttons (skip mermaid blocks)
    rootEl.querySelectorAll('pre').forEach((pre) => {
      if (pre.dataset.cfEnhanced === '1') return;
      const code = pre.querySelector('code');
      if (!code) return;
      const cls = code.className || '';
      if (cls.includes('language-mermaid')) return;
      pre.dataset.cfEnhanced = '1';

      if (window.hljs && !code.classList.contains('hljs')) {
        try { window.hljs.highlightElement(code); } catch {}
      }

      const langMatch = cls.match(/language-([a-z0-9_+-]+)/i);
      const lang = langMatch ? langMatch[1] : 'text';
      const wrapper = document.createElement('div');
      wrapper.className = 'cf-code-block';
      const header = document.createElement('div');
      header.className = 'cf-code-header';
      header.innerHTML = `<span class="cf-code-lang">${lang}</span><button type="button" class="cf-code-copy-btn"><i class="fa-regular fa-copy"></i><span>Copiar</span></button>`;
      const btn = header.querySelector('.cf-code-copy-btn');
      btn.addEventListener('click', () => {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(code.innerText || code.textContent || '').then(() => {
          btn.innerHTML = '<i class="fa-solid fa-check"></i><span>Copiado</span>';
          setTimeout(() => { btn.innerHTML = '<i class="fa-regular fa-copy"></i><span>Copiar</span>'; }, 1500);
        });
      });
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(header);
      wrapper.appendChild(pre);
    });

    if (window.renderMermaidDiagrams) {
      window.renderMermaidDiagrams();
    }
  };
})();
