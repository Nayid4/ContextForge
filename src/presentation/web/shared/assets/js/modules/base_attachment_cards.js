// FilePreviewModal Controller & Interactive Document Attachment Cards (PDF, DOCX, XLSX, CSV, Images, Text/MD)
(function() {
  function inferMime(fileName, providedMime) {
    if (providedMime && providedMime !== 'application/octet-stream') return providedMime;
    const lower = (fileName || '').toLowerCase();
    if (lower.endsWith('.pdf')) return 'application/pdf';
    if (lower.endsWith('.png')) return 'image/png';
    if (/\.(jpg|jpeg)$/.test(lower)) return 'image/jpeg';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.gif')) return 'image/gif';
    if (lower.endsWith('.svg')) return 'image/svg+xml';
    if (lower.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (lower.endsWith('.xlsx')) return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (lower.endsWith('.csv')) return 'text/csv';
    return 'text/plain';
  }

  function normalizeAssetUrl(rawHref, projectSlug) {
    if (!rawHref) return '';
    if (rawHref.startsWith('/api/v1/assets/') || rawHref.startsWith('http://') || rawHref.startsWith('https://')) {
      return rawHref;
    }
    const clean = rawHref.replace(/^\/+/, '');
    const slug = projectSlug || (document.cookie.match(/cf_active_project=([^;]+)/)?.[1] ? decodeURIComponent(document.cookie.match(/cf_active_project=([^;]+)/)[1]) : 'default');
    return `/api/v1/assets/${encodeURIComponent(slug)}/${clean}`;
  }

  function iconForFile(fileName) {
    const l = (fileName || '').toLowerCase();
    if (l.endsWith('.pdf')) return 'fa-solid fa-file-pdf text-rose-500';
    if (/\.(png|jpg|jpeg|gif|webp|svg)$/.test(l)) return 'fa-regular fa-file-image text-emerald-500';
    if (l.endsWith('.docx') || l.endsWith('.doc')) return 'fa-solid fa-file-word text-sky-500';
    if (/\.(xlsx|xls|csv)$/.test(l)) return 'fa-solid fa-file-excel text-emerald-600';
    return 'fa-regular fa-file-lines text-indigo-500';
  }

  window.normalizeCfAssetUrl = normalizeAssetUrl;

  window.openFilePreview = async function(fileName, url, mimeType) {
    const modal = document.getElementById('cf-file-preview-modal');
    const titleEl = document.getElementById('cf-preview-title');
    const bodyEl = document.getElementById('cf-preview-body');
    const dlEl = document.getElementById('cf-preview-download');
    if (!modal || !bodyEl) return;

    const resolvedUrl = normalizeAssetUrl(url);
    const effMime = inferMime(fileName, mimeType);
    titleEl.textContent = fileName || 'Archivo adjunto';
    dlEl.href = resolvedUrl;
    dlEl.setAttribute('download', fileName || 'archivo');
    modal.classList.remove('hidden');
    bodyEl.innerHTML = '<div class="py-12 text-center text-xs text-slate-400"><i class="fa-solid fa-spinner fa-spin mr-2 text-indigo-500"></i>Cargando vista previa...</div>';

    const lower = (fileName || resolvedUrl || '').toLowerCase();
    try {
      if (effMime.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp|svg)$/.test(lower)) {
        bodyEl.innerHTML = `<div class="flex justify-center"><img src="${resolvedUrl}" alt="${(fileName || '').replace(/"/g, '&quot;')}" class="max-h-[72vh] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"></div>`;
      } else if (lower.endsWith('.pdf') || effMime === 'application/pdf') {
        bodyEl.innerHTML = `<iframe src="${resolvedUrl}" class="w-full h-[72vh] rounded-xl border border-slate-200 dark:border-slate-700 bg-white"></iframe>`;
      } else if (lower.endsWith('.docx') && window.mammoth) {
        const resp = await fetch(resolvedUrl);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const buf = await resp.arrayBuffer();
        const res = await window.mammoth.convertToHtml({ arrayBuffer: buf });
        bodyEl.innerHTML = `<div class="prose-dark">${res.value}</div>`;
      } else if (/\.(xlsx|xls|csv)$/.test(lower) && window.XLSX) {
        const resp = await fetch(resolvedUrl);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const buf = await resp.arrayBuffer();
        const wb = window.XLSX.read(buf, { type: 'array' });
        const html = window.XLSX.utils.sheet_to_html(wb.Sheets[wb.SheetNames[0]]);
        bodyEl.innerHTML = `<div class="cf-table-wrap prose-dark overflow-auto">${html}</div>`;
      } else {
        const resp = await fetch(resolvedUrl);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const txt = await resp.text();
        if (lower.endsWith('.md') && window.renderMarkdown) {
          bodyEl.innerHTML = `<div class="prose-dark">${window.renderMarkdown(txt)}</div>`;
        } else {
          bodyEl.innerHTML = `<pre class="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-auto whitespace-pre-wrap">${txt.replace(/</g, '&lt;')}</pre>`;
        }
      }
    } catch (err) {
      bodyEl.innerHTML = `<div class="p-6 text-center text-xs text-rose-500 space-y-2"><p>No se pudo previsualizar este archivo (${err.message}).</p><a href="${resolvedUrl}" download class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold"><i class="fa-solid fa-download"></i>Descargar archivo</a></div>`;
    }
  };

  window.closeFilePreview = function() {
    document.getElementById('cf-file-preview-modal')?.classList.add('hidden');
  };

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') window.closeFilePreview();
  });

  window.enhanceDocumentAttachments = function(container) {
    if (!container) return;

    // 1. Transform "> **Anexo:** [file](url)" blockquotes into interactive preview cards
    container.querySelectorAll('blockquote').forEach(function(bq) {
      if (bq.dataset.cfAttEnhanced === '1') return;
      const link = bq.querySelector('a[href]');
      if (!link) return;
      const rawText = (bq.textContent || '').trim();
      const rawHref = link.getAttribute('href') || '';
      const isAttachment = /anexo:/i.test(rawText) || rawHref.includes('/api/v1/assets/') || rawHref.startsWith('attachments/');
      if (!isAttachment) return;

      bq.dataset.cfAttEnhanced = '1';
      const fileName = (link.textContent || rawHref.split('/').pop() || 'Archivo').trim();
      const resolvedUrl = normalizeAssetUrl(rawHref);
      const card = document.createElement('div');
      card.className = 'cf-attachment-card my-3 p-3 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-[#131726] flex items-center justify-between gap-3 not-prose';
      card.setAttribute('data-cf-att-name', fileName);
      card.setAttribute('data-cf-att-url', resolvedUrl);
      card.innerHTML = `
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-8 h-8 rounded-lg bg-white dark:bg-[#1c2135] border border-slate-200 dark:border-[#2a3048] flex items-center justify-center shrink-0">
            <i class="${iconForFile(fileName)} text-sm"></i>
          </span>
          <div class="min-w-0">
            <div class="text-xs font-semibold text-slate-900 dark:text-white truncate">${fileName.replace(/</g, '&lt;')}</div>
            <div class="text-[10px] font-mono text-slate-500 dark:text-slate-400">Archivo adjunto</div>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <button type="button" class="cf-att-preview-btn px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition">
            <i class="fa-solid fa-eye text-[10px]"></i><span>Vista previa</span>
          </button>
          <a href="${resolvedUrl}" download="${fileName.replace(/"/g, '&quot;')}" class="px-2 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] transition" title="Descargar">
            <i class="fa-solid fa-download text-[10px]"></i>
          </a>
        </div>`;
      card.querySelector('.cf-att-preview-btn')?.addEventListener('click', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        window.openFilePreview(fileName, resolvedUrl, '');
      });
      bq.parentNode?.replaceChild(card, bq);
    });

    // 2. Make inline images pointing to stored assets clickable for full preview
    container.querySelectorAll('img').forEach(function(img) {
      if (img.dataset.cfImgEnhanced === '1') return;
      const src = img.getAttribute('src') || '';
      if (src.startsWith('attachments/')) {
        img.setAttribute('src', normalizeAssetUrl(src));
      }
      img.dataset.cfImgEnhanced = '1';
      img.classList.add('cursor-zoom-in', 'rounded-xl', 'border', 'border-slate-200', 'dark:border-slate-700', 'max-h-[420px]');
      img.title = 'Clic para ampliar imagen';
      img.addEventListener('click', function() {
        window.openFilePreview(img.alt || 'Imagen adjunta', img.getAttribute('src') || '', 'image/png');
      });
    });

    // 3. Intercept plain links to /api/v1/assets/ so clicking them previews instead of navigating away
    container.querySelectorAll('a[href*="/api/v1/assets/"], a[href^="attachments/"]').forEach(function(a) {
      if (a.hasAttribute('download') || a.dataset.cfLinkEnhanced === '1') return;
      a.dataset.cfLinkEnhanced = '1';
      const resolved = normalizeAssetUrl(a.getAttribute('href') || '');
      a.setAttribute('href', resolved);
      a.addEventListener('click', function(ev) {
        ev.preventDefault();
        window.openFilePreview((a.textContent || 'Archivo').trim(), resolved, '');
      });
    });
  };
})();
