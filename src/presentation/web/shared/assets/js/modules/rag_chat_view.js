// Grounded RAG Chat SSE Stream Controller (Auto-resize textarea, Stop, Reset & Actionable Errors)
(function() {
  const messagesContainer = document.getElementById('chat-messages');
  const promptInput = document.getElementById('prompt-input');
  const sendButton = document.getElementById('send-button');
  const stopButton = document.getElementById('stop-button');
  const welcomeHtml = document.getElementById('chat-welcome-block')?.outerHTML || '';

  let activeEventSource = null;
  let lastQuery = '';

  function scrollToBottom() {
    if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
  }

  function getActiveProjectSlug() {
    const match = document.cookie.match(/cf_active_project=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : (window.__CF_CHAT_PROJECT__ || 'default');
  }

  function setStreamingState(isStreaming) {
    if (promptInput) promptInput.disabled = isStreaming;
    if (sendButton) {
      sendButton.disabled = isStreaming;
      sendButton.classList.toggle('hidden', isStreaming);
    }
    if (stopButton) {
      stopButton.classList.toggle('hidden', !isStreaming);
      stopButton.classList.toggle('inline-flex', isStreaming);
    }
  }

  function autoResizeInput() {
    if (!promptInput) return;
    promptInput.style.height = 'auto';
    promptInput.style.height = Math.min(promptInput.scrollHeight, 144) + 'px';
  }

  if (promptInput) {
    promptInput.addEventListener('input', autoResizeInput);
    promptInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendButton.disabled && promptInput.value.trim()) window.handleSend(new Event('submit'));
      }
    });
  }

  function downloadChatAsMarkdown(queryTitle, content) {
    const match = content.match(/```(?:markdown|md)?\s*([\s\S]*?)```/);
    const clean = match ? match[1].trim() : content;
    const safeName = (queryTitle || 'respuesta').toLowerCase().replace(/[^a-z0-9_-]+/g, '_').substring(0, 40);
    const blob = new Blob([clean], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function openChatInEditor(content) {
    const match = content.match(/```(?:markdown|md)?\s*([\s\S]*?)```/);
    sessionStorage.setItem('cf_draft_markdown', match ? match[1].trim() : content);
    window.location.href = '/books/editor';
  }

  function copyChatResponse(content) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(content).then(() => window.$toast?.success?.('Respuesta copiada.', 'Listo'));
    }
  }

  window.stopChatStreaming = function() {
    if (activeEventSource) {
      activeEventSource.close();
      activeEventSource = null;
    }
    setStreamingState(false);
    window.$toast?.info?.('Generación detenida.', 'Chat IA');
    if (promptInput) promptInput.focus();
  };

  window.resetChatConversation = function() {
    if (activeEventSource) {
      activeEventSource.close();
      activeEventSource = null;
    }
    setStreamingState(false);
    if (messagesContainer) messagesContainer.innerHTML = welcomeHtml;
    if (promptInput) { promptInput.value = ''; autoResizeInput(); promptInput.focus(); }
  };

  window.askQuestion = function(q) {
    if (!promptInput) return;
    promptInput.value = q;
    autoResizeInput();
    window.handleSend(new Event('submit'));
  };

  window.handleSend = function(e) {
    if (e) e.preventDefault();
    const query = promptInput.value.trim();
    if (!query) return;
    lastQuery = query;

    promptInput.value = '';
    autoResizeInput();
    setStreamingState(true);

    messagesContainer.insertAdjacentHTML('beforeend', `
      <div class="flex items-start justify-end space-x-3">
        <div class="p-3.5 rounded-2xl rounded-tr-none bg-indigo-600 text-sm text-white shadow-xs max-w-xl whitespace-pre-wrap">${escapeHtml(query)}</div>
      </div>`);
    scrollToBottom();

    const assistantId = 'resp-' + Date.now();
    const citationsId = 'cit-' + Date.now();
    messagesContainer.insertAdjacentHTML('beforeend', `
      <div class="flex items-start space-x-3">
        <div class="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shrink-0 text-sm mt-1">
          <i class="fa-solid fa-robot"></i>
        </div>
        <div class="space-y-2 max-w-2xl w-full">
          <div id="${citationsId}" class="flex flex-wrap items-center gap-2 pb-0.5"></div>
          <div id="${assistantId}" class="p-4 rounded-2xl rounded-tl-none bg-white dark:bg-[#12151e] border border-slate-200 dark:border-[#232738] text-sm text-slate-800 dark:text-slate-200 leading-relaxed chat-markdown shadow-xs">
            <span class="inline-flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400"><i class="fa-solid fa-spinner fa-spin"></i>Buscando en documentos y generando respuesta...</span>
          </div>
          <div id="actions-${assistantId}" class="hidden pt-1 flex flex-wrap items-center gap-2 text-xs"></div>
        </div>
      </div>`);
    scrollToBottom();

    const assistantElem = document.getElementById(assistantId);
    const citationsElem = document.getElementById(citationsId);
    let fullText = '';
    let firstToken = true;

    const agentSelect = document.getElementById('chat-agent-select');
    const selectedAgent = agentSelect ? agentSelect.value.trim() : '';
    const agentParam = selectedAgent ? `&agent=${encodeURIComponent(selectedAgent)}` : '';
    const eventSource = new EventSource(`/chat/stream?q=${encodeURIComponent(query)}&project=${encodeURIComponent(getActiveProjectSlug())}${agentParam}`);
    activeEventSource = eventSource;

    let lastCitations = [];
    eventSource.addEventListener('citations', function(event) {
      try {
        const data = JSON.parse(event.data);
        if (data.citations && data.citations.length > 0) {
          lastCitations = data.citations;
          const grouped = new Map();
          data.citations.forEach(c => {
            const cleanPath = (c.file_path || '').replace(/^\.\//, '').replace(/^docs\//, '');
            if (!grouped.has(cleanPath)) {
              grouped.set(cleanPath, {
                cleanPath,
                pill: c.pill || cleanPath,
                headers: [],
                count: 0,
                last_reviewed_at: c.last_reviewed_at || '',
                freshness_status: c.freshness_status || 'fresh',
                steward_name: c.steward_name || '',
                steward_email: c.steward_email || '',
              });
            }
            const g = grouped.get(cleanPath);
            g.count += 1;
            if (c.header && !g.headers.includes(c.header)) g.headers.push(c.header);
          });
          let pills = '<span class="text-[11px] font-medium text-slate-500 dark:text-slate-400 self-center mr-1 inline-flex items-center gap-1"><i class="fa-solid fa-book-bookmark text-indigo-500 text-[10px]"></i>Fuentes:</span>';
          grouped.forEach(g => {
            const countBadge = g.count > 1 ? `<span class="px-1 rounded bg-indigo-500/20 text-[9px]">${g.count}</span>` : '';
            const revBadge = g.last_reviewed_at ? `<span class="px-1 rounded ${g.freshness_status === 'expired' ? 'bg-amber-500/25 text-amber-700 dark:text-amber-300' : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'} text-[9px]" title="Última revisión">${g.last_reviewed_at}</span>` : '';
            const tip = (g.headers.join(' | ') + (g.steward_name ? ` · Responsable: ${g.steward_name}` : '') || g.cleanPath).replace(/"/g, '&quot;');
            pills += `<a href="/docs/view/${g.cleanPath}" class="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] hover:bg-indigo-100 transition" title="${tip}"><i class="fa-solid fa-file-code text-[10px]"></i><span>${g.pill}</span>${revBadge}${countBadge}</a>`;
          });
          citationsElem.innerHTML = pills;
        }
      } catch (err) { console.error('Error parsing citations', err); }
    });

    eventSource.addEventListener('token', function(event) {
      try {
        const data = JSON.parse(event.data);
        if (firstToken) { assistantElem.innerHTML = ''; firstToken = false; }
        fullText += data.content;
        assistantElem.innerHTML = window.renderMarkdown ? window.renderMarkdown(fullText) : escapeHtml(fullText);
        scrollToBottom();
      } catch (err) { console.error('Error parsing token', err); }
    });

    eventSource.addEventListener('done', function() {
      eventSource.close();
      activeEventSource = null;
      if (window.renderMarkdown) assistantElem.innerHTML = window.renderMarkdown(fullText);
      if (window.enhanceRenderedMarkdown) window.enhanceRenderedMarkdown(assistantElem);
      else if (window.hljs) assistantElem.querySelectorAll('pre code').forEach(b => hljs.highlightElement(b));
      const actionsElem = document.getElementById(`actions-${assistantId}`);
      if (actionsElem) {
        actionsElem.classList.remove('hidden');
        actionsElem.innerHTML = `
          <button type="button" class="btn-cp-resp px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 dark:bg-[#141722] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-[#232738] text-[11px] font-medium inline-flex items-center gap-1.5 cursor-pointer"><i class="fa-regular fa-copy text-[10px]"></i><span>Copiar</span></button>
          <button type="button" class="btn-open-ed px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-[#141722] text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-[11px] font-medium inline-flex items-center gap-1.5 cursor-pointer"><i class="fa-solid fa-pen-to-square text-[10px]"></i><span>Abrir en Editor</span></button>
          <button type="button" class="btn-dl-md px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-[#141722] text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-[11px] font-medium inline-flex items-center gap-1.5 cursor-pointer"><i class="fa-solid fa-download text-[10px]"></i><span>Descargar .md</span></button>
          <button type="button" class="btn-vote-up px-2 py-1 rounded-lg bg-white hover:bg-emerald-50 dark:bg-[#141722] text-slate-600 hover:text-emerald-600 dark:text-zinc-400 border border-slate-200 dark:border-[#232738] text-[11px] inline-flex items-center gap-1 cursor-pointer" title="Respuesta útil"><i class="fa-regular fa-thumbs-up text-[10px]"></i><span>Útil</span></button>
          <button type="button" class="btn-vote-down px-2 py-1 rounded-lg bg-white hover:bg-rose-50 dark:bg-[#141722] text-slate-600 hover:text-rose-600 dark:text-zinc-400 border border-slate-200 dark:border-[#232738] text-[11px] inline-flex items-center gap-1 cursor-pointer" title="Respuesta incompleta o incorrecta"><i class="fa-regular fa-thumbs-down text-[10px]"></i><span>No útil</span></button>
          <button type="button" class="btn-report-gap px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-[#141722] text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 text-[11px] inline-flex items-center gap-1 cursor-pointer" title="Registrar pregunta como vacío documental"><i class="fa-solid fa-flag text-[10px]"></i><span>Reportar vacío</span></button>
          <button type="button" class="btn-ask-steward px-2 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-[#141722] text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30 text-[11px] inline-flex items-center gap-1 cursor-pointer" title="Escalar esta duda al responsable del documento o del proyecto"><i class="fa-solid fa-user-check text-[10px]"></i><span>Preguntar al responsable</span></button>`;
        const capturedQuery = query, capturedText = fullText;
        const proj = getActiveProjectSlug();
        const sendFeedback = async (vote) => {
          await fetch(`/api/v1/projects/${encodeURIComponent(proj)}/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agent_slug: selectedAgent, question: capturedQuery, answer_excerpt: capturedText.slice(0, 300), vote }),
          });
          window.$toast?.success?.(vote === 'up' ? 'Gracias por tu valoración.' : 'Feedback registrado para mejorar la base de conocimiento.', 'Feedback');
        };
        actionsElem.querySelector('.btn-dl-md')?.addEventListener('click', () => downloadChatAsMarkdown(capturedQuery, capturedText));
        actionsElem.querySelector('.btn-open-ed')?.addEventListener('click', () => openChatInEditor(capturedText));
        actionsElem.querySelector('.btn-cp-resp')?.addEventListener('click', () => copyChatResponse(capturedText));
        actionsElem.querySelector('.btn-vote-up')?.addEventListener('click', () => sendFeedback('up'));
        actionsElem.querySelector('.btn-vote-down')?.addEventListener('click', () => sendFeedback('down'));
        actionsElem.querySelector('.btn-report-gap')?.addEventListener('click', async () => {
          await fetch(`/api/v1/projects/${encodeURIComponent(proj)}/knowledge-gaps/report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agent_slug: selectedAgent, question: capturedQuery }),
          });
          window.$toast?.info?.('Vacío documental registrado en el panel de Salud y Vacíos.', 'Vacíos Documentales');
        });
        actionsElem.querySelector('.btn-ask-steward')?.addEventListener('click', async () => {
          const primaryCit = (lastCitations || []).find(c => c.steward_name || c.steward_email);
          await fetch(`/api/v1/projects/${encodeURIComponent(proj)}/knowledge-gaps/report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agent_slug: selectedAgent, question: `[Escalado a responsable] ${capturedQuery}` }),
          });
          if (primaryCit && primaryCit.steward_email) {
            window.$toast?.info?.(`Responsable: ${primaryCit.steward_name} (${primaryCit.steward_email}). Se registró en Vacíos para seguimiento.`, 'Preguntar al responsable');
          } else if (primaryCit && primaryCit.steward_name) {
            window.$toast?.info?.(`Responsable asignado: ${primaryCit.steward_name}. Se registró en Vacíos para seguimiento.`, 'Preguntar al responsable');
          } else {
            window.$toast?.info?.('Consulta escalada al Owner del proyecto en el panel de Salud y Vacíos.', 'Preguntar al responsable');
          }
        });
      }
      setStreamingState(false);
      promptInput.focus();
      scrollToBottom();
      if (window.renderMermaidDiagrams) window.renderMermaidDiagrams();
    });

    eventSource.onerror = function() {
      eventSource.close();
      activeEventSource = null;
      if (firstToken) {
        assistantElem.innerHTML = `
          <div class="space-y-2.5 text-xs">
            <p class="text-rose-500 dark:text-rose-400 font-medium flex items-center gap-1.5">
              <i class="fa-solid fa-circle-exclamation"></i>
              <span>No se pudo conectar con el motor de IA configurado.</span>
            </p>
            <div class="flex flex-wrap items-center gap-2">
              <a href="/settings" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition">
                <i class="fa-solid fa-sliders text-[10px]"></i><span>Ir a Configuración</span>
              </a>
              <button type="button" onclick="window.askQuestion(${JSON.stringify(lastQuery)})" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium cursor-pointer transition">
                <i class="fa-solid fa-rotate-right text-[10px]"></i><span>Reintentar</span>
              </button>
            </div>
          </div>`;
      }
      setStreamingState(false);
      scrollToBottom();
    };
  };
})();
