// Scoped Document Chat Drawer Controller
(function() {
  let scopedCtx = { title: '', projectSlug: 'default', path: '', contentMarkdown: '' };

  window.openScopedChat = function(title, projectSlug, path, contentMarkdown) {
    scopedCtx = { title: title || 'Documento', projectSlug: projectSlug || 'default', path: path || '', contentMarkdown: contentMarkdown || '' };
    const drawer = document.getElementById('cf-scoped-chat-drawer');
    const titleEl = document.getElementById('cf-scoped-doc-title');
    if (titleEl) titleEl.textContent = scopedCtx.title;
    if (drawer) drawer.classList.remove('translate-x-full');
    setTimeout(() => document.getElementById('cf-scoped-input')?.focus(), 120);
  };

  window.closeScopedChat = function() {
    document.getElementById('cf-scoped-chat-drawer')?.classList.add('translate-x-full');
  };

  window.submitScopedChat = async function(evt) {
    evt.preventDefault();
    const input = document.getElementById('cf-scoped-input');
    const sendBtn = document.getElementById('cf-scoped-send');
    const list = document.getElementById('cf-scoped-messages');
    const q = (input?.value || '').trim();
    if (!q || !list) return;
    input.value = '';
    if (sendBtn) sendBtn.disabled = true;
    const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    list.insertAdjacentHTML('beforeend', `<div class="p-3 rounded-xl bg-indigo-600 text-white ml-8">${esc(q)}</div>`);
    const loadId = 'sc-' + Date.now();
    list.insertAdjacentHTML(
      'beforeend',
      `<div id="${loadId}" class="p-3 rounded-xl bg-slate-100 dark:bg-[#161922] border border-slate-200 dark:border-[#232738] text-slate-700 dark:text-zinc-300 mr-4 space-y-1">` +
        `<div><i class="fa-solid fa-spinner fa-spin mr-1.5 text-indigo-500"></i>Redactando con el motor IA activo...</div>` +
        `<div class="text-[10px] text-slate-400">En documentos extensos con diagramas, los motores CLI pueden tardar entre 30s y 90s.</div>` +
      `</div>`
    );
    list.scrollTop = list.scrollHeight;
    try {
      const res = await fetch('/api/v1/rag/scoped', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          document_title: scopedCtx.title,
          document_path: scopedCtx.path,
          content_markdown: scopedCtx.contentMarkdown,
          project_slug: scopedCtx.projectSlug,
        }),
      });
      const data = await res.json();
      const box = document.getElementById(loadId);
      const ans = data.answer || data.detail || 'Sin respuesta.';
      const canInsert = typeof window.insertMarkdownIntoEditor === 'function';
      const latSec = data.latency_ms ? `${(Number(data.latency_ms) / 1000).toFixed(1)}s` : '';
      let banner = '';
      if (data.degraded_fallback) {
        banner =
          `<div class="mb-2 p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-[11px] space-y-1">` +
            `<div class="font-semibold"><i class="fa-solid fa-triangle-exclamation mr-1"></i>Modo de respaldo extractivo (el motor IA principal falló)</div>` +
            `<div class="font-mono text-[10px] break-words">${esc(data.fallback_reason || 'Error de conexión o tiempo de espera agotado')}</div>` +
            `<div><a href="/settings" class="underline font-semibold">Revisar o cambiar motor en Configuración</a></div>` +
          `</div>`;
      } else if (data.provider) {
        banner = `<div class="mb-1.5 text-[10px] font-mono text-slate-400 flex items-center gap-1.5"><i class="fa-solid fa-microchip text-indigo-400"></i><span>${esc(data.provider)}</span>${latSec ? `<span>· ${esc(latSec)}</span>` : ''}</div>`;
      }
      if (box) {
        box.innerHTML =
          banner +
          `<div class="chat-markdown">${window.renderMarkdown ? window.renderMarkdown(ans) : esc(ans)}</div>` +
          (canInsert && !data.degraded_fallback
            ? `<button type="button" class="mt-2 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold cursor-pointer btn-insert-md"><i class="fa-solid fa-plus mr-1"></i>Insertar en Editor</button>`
            : canInsert
              ? `<button type="button" class="mt-2 px-2.5 py-1 rounded-lg bg-slate-600 hover:bg-slate-500 text-white text-[11px] font-semibold cursor-pointer btn-insert-md"><i class="fa-solid fa-plus mr-1"></i>Insertar borrador base</button>`
              : '');
        if (window.enhanceRenderedMarkdown) window.enhanceRenderedMarkdown(box);
        box.querySelector('.btn-insert-md')?.addEventListener('click', () => window.insertMarkdownIntoEditor(ans));
      }
    } catch (err) {
      const box = document.getElementById(loadId);
      if (box) box.textContent = 'Error consultando asistente: ' + err.message;
    } finally {
      if (sendBtn) sendBtn.disabled = false;
    }
    list.scrollTop = list.scrollHeight;
  };
})();
