// Embeddable Zero-Dependency Floating RAG Chat Widget (Publishable Key -> Ephemeral JWT + Agent Scoping + Live Preview API + Feedback)
(function() {
  if (window.ContextForgeChat) return;
  const scriptEl = document.currentScript;
  let currentProject = (scriptEl && scriptEl.getAttribute('data-project')) || 'default';
  let currentAgent = (scriptEl && scriptEl.getAttribute('data-agent')) || '';
  let endpoint = ((scriptEl && scriptEl.getAttribute('data-endpoint')) || window.location.origin).replace(/\/$/, '');
  let title = (scriptEl && scriptEl.getAttribute('data-title')) || 'ContextForge Assistant';
  let primaryColor = (scriptEl && scriptEl.getAttribute('data-color')) || '#4f46e5';
  let publishableKey = (scriptEl && scriptEl.getAttribute('data-publishable-key')) || '';
  let welcomeText = (scriptEl && scriptEl.getAttribute('data-welcome')) || 'Hola. Pregunta sobre los documentos publicados de este proyecto.';
  let suggestedQuestions = [];
  let ephemeralToken = '';

  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderSimpleMarkdown(md) {
    if (window.renderMarkdown) return window.renderMarkdown(md);
    return escapeHtml(md)
      .replace(/```([\s\S]*?)```/g, '<pre style="background:#0a0c12;padding:8px;border-radius:8px;overflow:auto;font-family:monospace;font-size:11px;margin:6px 0;">$1</pre>')
      .replace(/`([^`]+)`/g, '<code style="background:rgba(99,102,241,0.2);padding:1px 4px;border-radius:4px;font-family:monospace;">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  async function ensureSessionToken() {
    if (!publishableKey || publishableKey.includes('REEMPLAZAR') || ephemeralToken) return ephemeralToken;
    const r = await fetch(`${endpoint}/api/v1/widget/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        publishable_key: publishableKey,
        project_slug: currentProject,
        agent_slug: currentAgent || 'assistant',
      }),
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw new Error(err.detail || `Error de sesión widget (${r.status})`);
    }
    const data = await r.json();
    ephemeralToken = data.session_token || '';
    return ephemeralToken;
  }

  const root = document.createElement('div');
  root.id = 'cf-embed-widget-root';
  root.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;font-family:Inter,system-ui,sans-serif;';
  root.innerHTML = `
    <div id="cf-w-panel" role="dialog" aria-label="Chat del agente" style="display:none;width:370px;max-width:92vw;height:490px;background:#11131a;color:#f1f5f9;border:1px solid #232738;border-radius:16px;box-shadow:0 20px 50px rgba(0,0,0,.45);flex-direction:column;overflow:hidden;margin-bottom:12px;">
      <div style="padding:12px 16px;background:#0d0f15;border-bottom:1px solid #232738;display:flex;justify-content:space-between;align-items:center;">
        <div style="display:flex;flex-direction:column;">
          <span id="cf-w-title" style="font-weight:700;font-size:13px;">${escapeHtml(title)}</span>
          <span id="cf-w-proj" style="font-size:10px;color:#818cf8;font-family:monospace;">${escapeHtml(currentAgent ? `${currentProject}/${currentAgent}` : `proyecto: ${currentProject}`)}</span>
        </div>
        <button id="cf-w-close" type="button" aria-label="Cerrar widget" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:16px;">x</button>
      </div>
      <div id="cf-w-msgs" aria-live="polite" style="flex:1;overflow-y:auto;padding:12px;font-size:12px;line-height:1.55;">
        <div id="cf-w-welcome" style="margin:4px 0;padding:8px 10px;border-radius:10px;background:#161922;border:1px solid #232738;color:#cbd5e1;">
          ${escapeHtml(welcomeText)}
        </div>
      </div>
      <form id="cf-w-form" style="padding:10px;border-top:1px solid #232738;display:flex;gap:8px;background:#0d0f15;">
        <input id="cf-w-input" placeholder="Pregunta sobre la documentación..." style="flex:1;background:#161922;border:1px solid #232738;color:#fff;padding:8px 10px;border-radius:10px;font-size:12px;outline:none;">
        <button id="cf-w-send" type="submit" style="background:${escapeHtml(primaryColor)};color:#fff;border:none;padding:8px 12px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;">Enviar</button>
      </form>
    </div>
    <button id="cf-w-fab" type="button" style="background:${escapeHtml(primaryColor)};color:#fff;border:none;padding:12px 16px;border-radius:999px;font-weight:700;font-size:12px;box-shadow:0 10px 25px rgba(79,70,229,.4);cursor:pointer;">${escapeHtml(title)}</button>
  `;
  document.body.appendChild(root);

  const panel = root.querySelector('#cf-w-panel');
  const msgs = root.querySelector('#cf-w-msgs');
  const input = root.querySelector('#cf-w-input');
  const sendBtn = root.querySelector('#cf-w-send');
  const fabBtn = root.querySelector('#cf-w-fab');
  const titleEl = root.querySelector('#cf-w-title');
  const projBadge = root.querySelector('#cf-w-proj');

  function openPanel() { panel.style.display = 'flex'; input.focus(); }
  function closePanel() { panel.style.display = 'none'; }

  fabBtn.addEventListener('click', () => (panel.style.display === 'none' ? openPanel() : closePanel()));
  root.querySelector('#cf-w-close').addEventListener('click', closePanel);

  async function sendWidgetFeedback(question, answer, vote, btn) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      const tok = await ensureSessionToken();
      if (tok) headers['Authorization'] = `Bearer ${tok}`;
      await fetch(`${endpoint}/api/v1/projects/${encodeURIComponent(currentProject)}/feedback`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ agent_slug: currentAgent, question, answer_excerpt: (answer || '').slice(0, 300), vote }),
      });
      if (btn) btn.textContent = vote === 'up' ? 'Guardado' : 'Reportado';
    } catch (_) {}
  }

  root.querySelector('#cf-w-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    input.disabled = true;
    sendBtn.disabled = true;

    msgs.insertAdjacentHTML('beforeend', `<div style="margin:6px 0;padding:8px 10px;border-radius:10px;background:${escapeHtml(primaryColor)};color:#fff;margin-left:24px;">${escapeHtml(q)}</div>`);
    const loadId = 'cf-w-load-' + Date.now();
    msgs.insertAdjacentHTML('beforeend', `<div id="${loadId}" style="margin:6px 0;padding:8px 10px;border-radius:10px;background:#161922;border:1px solid #232738;color:#94a3b8;font-style:italic;">Consultando base de conocimiento...</div>`);
    msgs.scrollTop = msgs.scrollHeight;

    try {
      const headers = { 'Content-Type': 'application/json' };
      const tok = await ensureSessionToken();
      if (tok) headers['Authorization'] = `Bearer ${tok}`;
      const targetUrl = currentAgent
        ? `${endpoint}/api/v1/projects/${encodeURIComponent(currentProject)}/agents/${encodeURIComponent(currentAgent)}/chat`
        : `${endpoint}/api/v1/chat/project`;
      const payload = currentAgent ? { question: q } : { project_slug: currentProject, question: q };
      const r = await fetch(targetUrl, { method: 'POST', headers, body: JSON.stringify(payload) });
      const data = await r.json();
      const box = document.getElementById(loadId);
      if (box) {
        if (!r.ok) {
          box.style.color = '#fb7185';
          box.style.fontStyle = 'normal';
          box.textContent = data.detail || `Error HTTP ${r.status}`;
        } else {
          box.style.color = '#f1f5f9';
          box.style.fontStyle = 'normal';
          const cits = Array.isArray(data.citations) && data.citations.length > 0
            ? `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #232738;font-size:10px;color:#818cf8;font-family:monospace;">Fuentes: ${[...new Set(data.citations.map((c) => escapeHtml(c.path)))].join(', ')}</div>`
            : '';
          const fbBar = `<div style="margin-top:6px;display:flex;gap:6px;font-size:10px;">
            <button type="button" class="cf-w-up" style="background:#1e293b;color:#cbd5e1;border:1px solid #334155;border-radius:6px;padding:2px 7px;cursor:pointer;">Útil</button>
            <button type="button" class="cf-w-down" style="background:#1e293b;color:#cbd5e1;border:1px solid #334155;border-radius:6px;padding:2px 7px;cursor:pointer;">No útil</button>
          </div>`;
          box.innerHTML = `<div class="chat-markdown">${renderSimpleMarkdown(data.answer || 'Sin respuesta')}</div>${cits}${fbBar}`;
          box.querySelector('.cf-w-up')?.addEventListener('click', (ev) => sendWidgetFeedback(q, data.answer, 'up', ev.currentTarget));
          box.querySelector('.cf-w-down')?.addEventListener('click', (ev) => sendWidgetFeedback(q, data.answer, 'down', ev.currentTarget));
        }
      }
    } catch (err) {
      const box = document.getElementById(loadId);
      if (box) {
        box.style.color = '#fb7185';
        box.style.fontStyle = 'normal';
        box.textContent = `Error: ${err.message}`;
      }
    } finally {
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
      msgs.scrollTop = msgs.scrollHeight;
    }
  });

  window.ContextForgeChat = {
    open: openPanel,
    close: closePanel,
    configure: (opts = {}) => {
      if (opts.project !== undefined) currentProject = opts.project || 'default';
      if (opts.agent !== undefined) currentAgent = opts.agent || '';
      if (opts.endpoint) endpoint = String(opts.endpoint).replace(/\/$/, '');
      if (opts.title) {
        title = opts.title;
        if (titleEl) titleEl.textContent = title;
        if (fabBtn) fabBtn.textContent = title;
      }
      if (opts.primaryColor) {
        primaryColor = opts.primaryColor;
        if (sendBtn) sendBtn.style.background = primaryColor;
        if (fabBtn) fabBtn.style.background = primaryColor;
      }
      if (opts.publishableKey !== undefined) {
        publishableKey = opts.publishableKey || '';
      }
      if (opts.welcomeMessage) {
        welcomeText = opts.welcomeMessage;
      }
      if (Array.isArray(opts.suggestedQuestions)) {
        suggestedQuestions = opts.suggestedQuestions;
      }
      ephemeralToken = '';
      if (projBadge) projBadge.textContent = currentAgent ? `${currentProject}/${currentAgent}` : `proyecto: ${currentProject}`;
      const chipsHtml = suggestedQuestions.length > 0
        ? `<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;">` +
          suggestedQuestions.slice(0, 3).map((sq) => `<button type="button" class="cf-w-suggest" style="text-align:left;background:#1e293b;color:#c7d2fe;border:1px solid #334155;border-radius:8px;padding:4px 8px;font-size:11px;cursor:pointer;">${escapeHtml(sq)}</button>`).join('') +
          `</div>`
        : '';
      msgs.innerHTML = `<div style="margin:4px 0;padding:8px 10px;border-radius:10px;background:#161922;border:1px solid #232738;color:#cbd5e1;">${escapeHtml(welcomeText)}${chipsHtml}</div>`;
      msgs.querySelectorAll('.cf-w-suggest').forEach((btn) => {
        btn.addEventListener('click', () => {
          input.value = btn.textContent || '';
          root.querySelector('#cf-w-form').dispatchEvent(new Event('submit', { cancelable: true }));
        });
      });
    },
    setProject: (slug, agentSlug = '') => {
      window.ContextForgeChat.configure({ project: slug, agent: agentSlug });
    },
  };
})();
