function initMermaidTheme() {
  if (typeof mermaid === 'undefined') return;
  const isDark = document.documentElement.classList.contains('dark');
  mermaid.initialize({
    startOnLoad: false,
    theme: isDark ? 'dark' : 'default',
    securityLevel: 'loose',
    themeVariables: isDark ? {
      darkMode: true, background: '#0d0f15', primaryColor: '#6366f1', primaryTextColor: '#f8fafc',
      primaryBorderColor: '#4f46e5', lineColor: '#94a3b8', secondaryColor: '#161922', tertiaryColor: '#1e1b4b'
    } : {
      darkMode: false, background: '#ffffff', primaryColor: '#e0e7ff', primaryTextColor: '#0f172a',
      primaryBorderColor: '#6366f1', lineColor: '#4f46e5', secondaryColor: '#f1f5f9', tertiaryColor: '#f8fafc'
    }
  });
}

function renderMermaidDiagrams(rootEl) {
  if (typeof mermaid === 'undefined') return;
  initMermaidTheme();
  const scope = rootEl || document;
  const freshNodes = [];
  scope.querySelectorAll('pre code.language-mermaid, pre code.mermaid').forEach(function(el) {
    // Skip raw pre inside Visual WYSIWYG (handled as dedicated editable Mermaid cards)
    if (el.closest('#cf-wysiwyg-surface')) return;
    // Skip diagrams inside hidden Alpine/display:none tabs until their tab is shown
    if (el.offsetParent === null) return;
    const pre = el.parentElement;
    const rawCode = (el.textContent || '').trim();
    const container = document.createElement('div');
    container.className = 'mermaid my-5 flex justify-center bg-white dark:bg-[#0d0f15] p-5 rounded-xl border border-slate-200 dark:border-[#232738] shadow-xs overflow-x-auto';
    container.setAttribute('data-cf-mermaid-src', rawCode);
    container.textContent = rawCode;
    const wrapper = pre && pre.parentElement && pre.parentElement.classList.contains('cf-code-block') ? pre.parentElement : pre;
    if (wrapper && wrapper.parentNode) {
      wrapper.parentNode.replaceChild(container, wrapper);
      freshNodes.push(container);
    }
  });
  scope.querySelectorAll('.mermaid[data-cf-mermaid-src]:not([data-processed="true"])').forEach(function(node) {
    if (!freshNodes.includes(node)) freshNodes.push(node);
  });
  if (freshNodes.length > 0) {
    try {
      mermaid.run({ nodes: freshNodes });
    } catch (err) {
      console.warn('Mermaid rendering error:', err);
    }
  }
}
window.renderMermaidDiagrams = renderMermaidDiagrams;

function syncTopbarContext() {
  const slugEl = document.getElementById('topbar-project-slug');
  if (slugEl) {
    const sel = document.getElementById('global-project-select');
    const cookieMatch = document.cookie.match(/cf_active_project=([^;]+)/);
    const activeSlug = (sel && sel.value) || (cookieMatch ? decodeURIComponent(cookieMatch[1]) : 'default');
    slugEl.textContent = activeSlug;
  }
  const sectionEl = document.getElementById('topbar-section-label');
  if (sectionEl && sectionEl.textContent.trim() === 'Documentos') {
    const path = window.location.pathname;
    const map = [
      ['/docs/integration-guide', 'Integración'],
      ['/docs/view', 'Lectura'],
      ['/docs/browser', 'Documentos'],
      ['/books/editor', 'Editor'],
      ['/chat', 'Chat IA'],
      ['/agents', 'Agentes IA'],
      ['/bundles', 'Context Bundler'],
      ['/projects', 'Proyectos'],
      ['/settings', 'Configuración'],
    ];
    const hit = map.find(([prefix]) => path.startsWith(prefix));
    if (hit) sectionEl.textContent = hit[1];
  }
}

document.addEventListener('DOMContentLoaded', function() {
  renderMermaidDiagrams();
  syncTopbarContext();
});

// Global HTMX Progress Bar & Post-Swap Enhancements (Nielsen H#1)
(function() {
  const bar = document.getElementById('cf-global-progress');
  let inflight = 0;
  document.body.addEventListener('htmx:beforeRequest', function() {
    inflight += 1;
    if (bar) bar.classList.remove('opacity-0');
  });
  function doneRequest() {
    inflight = Math.max(0, inflight - 1);
    if (inflight === 0 && bar) bar.classList.add('opacity-0');
  }
  document.body.addEventListener('htmx:afterRequest', doneRequest);
  document.body.addEventListener('htmx:responseError', function() {
    doneRequest();
    window.$toast?.error?.('No se pudo completar la operación. Intenta nuevamente.', 'Error de conexión');
  });
  document.body.addEventListener('htmx:afterSwap', function(evt) {
    renderMermaidDiagrams();
    syncTopbarContext();
    if (window.enhanceDocumentAttachments && evt.detail && evt.detail.target) {
      window.enhanceDocumentAttachments(evt.detail.target);
    }
  });
})();

// Command Palette Logic (Ctrl+K)
(function() {
  const modal = document.getElementById('command-palette-modal');
  const input = document.getElementById('command-palette-input');
  const defaultLinks = document.getElementById('cp-default-links');
  const searchItems = document.getElementById('cp-search-items');
  if (!modal || !input) return;
  let searchTimeout = null;

  function openModal() {
    modal.classList.remove('hidden');
    input.value = '';
    defaultLinks.classList.remove('hidden');
    searchItems.classList.add('hidden');
    searchItems.innerHTML = '';
    input.focus();
  }
  function closeModal() { modal.classList.add('hidden'); }

  window.toggleCommandPalette = function() {
    modal.classList.contains('hidden') ? openModal() : closeModal();
  };

  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      window.toggleCommandPalette();
    } else if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(); });

  function getActiveProjectSlug() {
    const sel = document.getElementById('global-project-select');
    if (sel && sel.value) return sel.value;
    const match = document.cookie.match(/cf_active_project=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : 'default';
  }

  input.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    const query = input.value.trim();
    if (query.length < 2) {
      defaultLinks.classList.remove('hidden');
      searchItems.classList.add('hidden');
      searchItems.innerHTML = '';
      return;
    }
    defaultLinks.classList.add('hidden');
    searchItems.classList.remove('hidden');
    searchItems.innerHTML = '<div class="p-4 text-center text-xs text-slate-400"><i class="fa-solid fa-spinner fa-spin mr-2 text-indigo-500"></i>Buscando en la base de conocimiento...</div>';

    searchTimeout = setTimeout(async function() {
      const proj = getActiveProjectSlug();
      try {
        const resp = await fetch(`/api/v1/search/hybrid?q=${encodeURIComponent(query)}&top_k=6&project=${encodeURIComponent(proj)}`);
        if (!resp.ok) return;
        const data = await resp.json();
        searchItems.innerHTML = '';
        if (data.length === 0) {
          searchItems.innerHTML = `<div class="p-4 text-center text-xs text-slate-500">Sin resultados para "<span class="font-mono">${query.replace(/</g, '&lt;')}</span>" en <strong>${proj}</strong>.</div>`;
          return;
        }
        data.forEach(function(item) {
          const a = document.createElement('a');
          a.href = `/docs/view/${item.file_path}`;
          a.className = 'block p-3 rounded-xl bg-slate-50 dark:bg-[#0c0e14] hover:bg-slate-100 dark:hover:bg-[#1a1d29] border border-slate-200 dark:border-[#232738] hover:border-indigo-500/50 transition group space-y-1';
          const header = (item.header_hierarchy && item.header_hierarchy.length > 0) ? item.header_hierarchy.join(' > ') : item.file_path;
          a.innerHTML = `
            <div class="flex items-center justify-between text-xs gap-2">
              <span class="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition truncate flex items-center space-x-1.5">
                <i class="fa-regular fa-file-code text-indigo-500 dark:text-indigo-400 shrink-0"></i>
                <span class="truncate">${header}</span>
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-50 dark:bg-[#11131a] text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-[#232738] shrink-0">${item.file_path}</span>
            </div>
            <p class="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2">${item.text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
          searchItems.appendChild(a);
        });
      } catch (err) {
        searchItems.innerHTML = '<div class="p-4 text-center text-xs text-rose-500">Error buscando documentos.</div>';
      }
    }, 200);
  });
})();
