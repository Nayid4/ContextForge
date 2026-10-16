/**
 * ContextForge Universal Embeddable Chatbot Widget
 * 
 * Drop-in standalone JavaScript assistant with Shadow DOM isolation,
 * multi-tenant project scoping, real-time SSE streaming, and zero external dependencies.
 *
 * Usage:
 * <script 
 *   src="http://localhost:8000/static/js/contextforge-chat-widget.js" 
 *   data-project="default" 
 *   data-endpoint="http://localhost:8000"
 *   defer>
 * </script>
 */

(function () {
  if (window.__CF_CHAT_WIDGET_LOADED__) return;
  window.__CF_CHAT_WIDGET_LOADED__ = true;

  // 1. Resolve configuration from current script tag
  const scriptTag = document.currentScript || (function () {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  const defaultEndpoint = scriptTag && scriptTag.src ? new URL(scriptTag.src).origin : 'http://localhost:8000';
  let projectSlug = (scriptTag && scriptTag.getAttribute('data-project')) || 'default';
  const apiEndpoint = (scriptTag && scriptTag.getAttribute('data-endpoint')) || defaultEndpoint;
  const widgetTitle = (scriptTag && scriptTag.getAttribute('data-title')) || 'ContextForge Assistant';
  const primaryColor = (scriptTag && scriptTag.getAttribute('data-primary-color')) || '#6366f1';
  const position = (scriptTag && scriptTag.getAttribute('data-position')) || 'right'; // 'right' or 'left'
  const greetingText = (scriptTag && scriptTag.getAttribute('data-greeting')) || 
    '¡Hola! Soy tu asistente de ingeniería. Pregúntame sobre especificaciones, flujos, reglas técnicas o arquitectura de este proyecto.';

  // 2. Mount Shadow DOM container to prevent host CSS conflicts
  const hostDiv = document.createElement('div');
  hostDiv.id = 'contextforge-chat-widget-root';
  hostDiv.style.position = 'fixed';
  hostDiv.style.zIndex = '2147483647';
  hostDiv.style.bottom = '24px';
  if (position === 'left') {
    hostDiv.style.left = '24px';
  } else {
    hostDiv.style.right = '24px';
  }
  document.body.appendChild(hostDiv);

  const shadow = hostDiv.attachShadow({ mode: 'open' });

  // 3. Shadow DOM Stylesheet
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    
    /* Launcher Bubble Button */
    .cf-launcher {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${primaryColor}, #4338ca);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 10px 25px rgba(99, 102, 241, 0.45), 0 2px 6px rgba(0,0,0,0.2);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      user-select: none;
    }
    .cf-launcher:hover {
      transform: scale(1.08) translateY(-2px);
      box-shadow: 0 14px 30px rgba(99, 102, 241, 0.6);
    }
    .cf-launcher svg {
      width: 28px;
      height: 28px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .cf-launcher-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #10b981;
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 10px;
      border: 2px solid #0f172a;
      letter-spacing: 0.5px;
    }
    .cf-pulse-ring {
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 2px solid rgba(99, 102, 241, 0.5);
      animation: cf-ripple 2.5s infinite cubic-bezier(0.25, 1, 0.5, 1);
      pointer-events: none;
    }
    @keyframes cf-ripple {
      0% { transform: scale(0.95); opacity: 0.8; }
      100% { transform: scale(1.4); opacity: 0; }
    }

    /* Floating Chat Window */
    .cf-window {
      position: absolute;
      bottom: 74px;
      ${position === 'left' ? 'left: 0;' : 'right: 0;'}
      width: 380px;
      height: 560px;
      max-width: calc(100vw - 32px);
      max-height: calc(100vh - 100px);
      background: #0f131f;
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 20px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65), 0 4px 12px rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: scale(0.92) translateY(20px);
      transform-origin: ${position === 'left' ? 'bottom left' : 'bottom right'};
      pointer-events: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .cf-window.open {
      opacity: 1;
      transform: scale(1) translateY(0);
      pointer-events: auto;
    }

    /* Window Header */
    .cf-header {
      padding: 14px 16px;
      background: linear-gradient(180deg, #181d30, #131726);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #ffffff;
    }
    .cf-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .cf-avatar {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(99, 102, 241, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    .cf-header-title {
      font-size: 13px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.2;
    }
    .cf-header-sub {
      font-size: 10px;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 2px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .cf-status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
    }
    .cf-header-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .cf-icon-btn {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .cf-icon-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }

    /* Messages Area */
    .cf-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
    }
    .cf-messages::-webkit-scrollbar {
      width: 5px;
    }
    .cf-messages::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.12);
      border-radius: 4px;
    }

    .cf-msg {
      max-width: 86%;
      font-size: 12px;
      line-height: 1.5;
      padding: 10px 14px;
      border-radius: 14px;
      word-break: break-word;
    }
    .cf-msg-bot {
      align-self: flex-start;
      background: #1c2237;
      color: #e2e8f0;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-bottom-left-radius: 4px;
    }
    .cf-msg-user {
      align-self: flex-end;
      background: linear-gradient(135deg, ${primaryColor}, #4338ca);
      color: #ffffff;
      border-bottom-right-radius: 4px;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
    }

    .cf-msg code {
      background: rgba(0, 0, 0, 0.35);
      padding: 2px 5px;
      border-radius: 4px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      color: #a5b4fc;
    }
    .cf-msg pre {
      background: #090c15;
      padding: 8px 10px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 6px 0;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .cf-msg pre code {
      background: transparent;
      padding: 0;
      color: #38bdf8;
    }
    
    .cf-citation-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 6px;
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #818cf8;
      font-size: 10px;
      font-family: ui-monospace, monospace;
    }

    /* Prompt Suggestions */
    .cf-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
    }
    .cf-chip {
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid rgba(99, 102, 241, 0.25);
      color: #c7d2fe;
      font-size: 11px;
      padding: 5px 10px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .cf-chip:hover {
      background: rgba(99, 102, 241, 0.28);
      border-color: #818cf8;
      color: #ffffff;
      transform: translateY(-1px);
    }

    /* Input Footer */
    .cf-footer {
      padding: 12px 14px;
      background: #131726;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .cf-input-box {
      display: flex;
      align-items: center;
      background: #090c15;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 4px 6px 4px 12px;
      transition: border-color 0.2s;
    }
    .cf-input-box:focus-within {
      border-color: #6366f1;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }
    .cf-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #ffffff;
      font-size: 12px;
      resize: none;
      height: 24px;
      line-height: 24px;
      max-height: 80px;
    }
    .cf-input::placeholder {
      color: #64748b;
    }
    .cf-send-btn {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      border: none;
      background: ${primaryColor};
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: opacity 0.15s, transform 0.15s;
      flex-shrink: 0;
    }
    .cf-send-btn:hover:not(:disabled) {
      opacity: 0.9;
      transform: scale(1.05);
    }
    .cf-send-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .cf-send-btn svg {
      width: 14px;
      height: 14px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
    }

    .cf-watermark {
      font-size: 9px;
      color: #475569;
      text-align: center;
      margin-top: 6px;
      font-family: ui-monospace, monospace;
    }
    .cf-watermark strong {
      color: #64748b;
    }

    /* Typing cursor effect */
    .cf-cursor {
      display: inline-block;
      width: 4px;
      height: 12px;
      background: #818cf8;
      vertical-align: middle;
      margin-left: 2px;
      animation: cf-blink 0.8s infinite;
    }
    @keyframes cf-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
  `;
  shadow.appendChild(styleEl);

  // 4. HTML Elements
  const container = document.createElement('div');
  container.innerHTML = `
    <!-- Floating Launcher -->
    <div class="cf-launcher" id="cf-launcher-btn" title="Preguntar al Asistente ContextForge (${projectSlug})">
      <div class="cf-pulse-ring"></div>
      <svg viewBox="0 0 24 24"><path d="M12 2a2 2 0 0 1 2 2v2h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4V4a2 2 0 0 1 2-2zM9 13v2m6-2v2M9 4h6"></path></svg>
      <div class="cf-launcher-badge">AI</div>
    </div>

    <!-- Chat Window Container -->
    <div class="cf-window" id="cf-chat-window">
      <!-- Header -->
      <div class="cf-header">
        <div class="cf-header-left">
          <div class="cf-avatar">🤖</div>
          <div>
            <div class="cf-header-title">${widgetTitle}</div>
            <div class="cf-header-sub">
              <span class="cf-status-dot"></span>
              <span id="cf-project-indicator">Librería: ${projectSlug}</span>
            </div>
          </div>
        </div>
        <div class="cf-header-actions">
          <button type="button" class="cf-icon-btn" id="cf-clear-btn" title="Limpiar conversación">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
          </button>
          <button type="button" class="cf-icon-btn" id="cf-close-btn" title="Cerrar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
          </button>
        </div>
      </div>

      <!-- Messages Body -->
      <div class="cf-messages" id="cf-messages-container">
        <!-- Initial Greeting Message -->
        <div class="cf-msg cf-msg-bot">
          <p>${greetingText}</p>
          <div class="cf-chips">
            <div class="cf-chip" data-query="¿Cuál es la política de reintentos y webhooks?">¿Política de reintentos?</div>
            <div class="cf-chip" data-query="Explica la arquitectura y flujos principales">Arquitectura del proyecto</div>
            <div class="cf-chip" data-query="¿Qué endpoints REST y MCP existen?">Endpoints y Servicios</div>
          </div>
        </div>
      </div>

      <!-- Footer Bar -->
      <div class="cf-footer">
        <div class="cf-input-box">
          <textarea class="cf-input" id="cf-input-field" placeholder="Pregunta sobre ${projectSlug}..." rows="1"></textarea>
          <button type="button" class="cf-send-btn" id="cf-send-button" title="Enviar pregunta">
            <svg viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
          </button>
        </div>
        <div class="cf-watermark">Grounded RAG • <strong>ContextForge Multi-Tenant</strong></div>
      </div>
    </div>
  `;
  shadow.appendChild(container);

  // 5. DOM References
  const launcherBtn = shadow.getElementById('cf-launcher-btn');
  const chatWindow = shadow.getElementById('cf-chat-window');
  const closeBtn = shadow.getElementById('cf-close-btn');
  const clearBtn = shadow.getElementById('cf-clear-btn');
  const messagesContainer = shadow.getElementById('cf-messages-container');
  const inputField = shadow.getElementById('cf-input-field');
  const sendBtn = shadow.getElementById('cf-send-button');
  const projectIndicator = shadow.getElementById('cf-project-indicator');

  let isStreaming = false;

  // 6. Toggle Open/Close
  function toggleChat(force) {
    const shouldOpen = typeof force === 'boolean' ? force : !chatWindow.classList.contains('open');
    if (shouldOpen) {
      chatWindow.classList.add('open');
      setTimeout(() => inputField.focus(), 150);
    } else {
      chatWindow.classList.remove('open');
    }
  }

  launcherBtn.addEventListener('click', () => toggleChat());
  closeBtn.addEventListener('click', () => toggleChat(false));

  clearBtn.addEventListener('click', () => {
    messagesContainer.innerHTML = `
      <div class="cf-msg cf-msg-bot">
        <p>${greetingText}</p>
        <div class="cf-chips">
          <div class="cf-chip" data-query="¿Cuál es la política de reintentos y webhooks?">¿Política de reintentos?</div>
          <div class="cf-chip" data-query="Explica la arquitectura y flujos principales">Arquitectura del proyecto</div>
          <div class="cf-chip" data-query="¿Qué endpoints REST y MCP existen?">Endpoints y Servicios</div>
        </div>
      </div>
    `;
    attachChipListeners();
  });

  // 7. Chip Suggestions
  function attachChipListeners() {
    shadow.querySelectorAll('.cf-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query');
        if (query && !isStreaming) {
          sendUserMessage(query);
        }
      });
    });
  }
  attachChipListeners();

  // 8. Markdown Helper
  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function renderFormattedMessage(rawText) {
    let parsed = escapeHtml(rawText);
    // Bold
    parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Inline code
    parsed = parsed.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Multiline code blocks
    parsed = parsed.replace(/```([a-zA-Z]*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    // Line breaks
    parsed = parsed.replace(/\n/g, '<br/>');
    return parsed;
  }

  // 9. Send Message & Stream Response
  async function sendUserMessage(questionText) {
    const q = (questionText || inputField.value).trim();
    if (!q || isStreaming) return;

    inputField.value = '';
    isStreaming = true;
    sendBtn.disabled = true;

    // Append User Message
    const userDiv = document.createElement('div');
    userDiv.className = 'cf-msg cf-msg-user';
    userDiv.textContent = q;
    messagesContainer.appendChild(userDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Append Bot Message Placeholder with blinking cursor
    const botDiv = document.createElement('div');
    botDiv.className = 'cf-msg cf-msg-bot';
    botDiv.innerHTML = '<span class="cf-content"></span><span class="cf-cursor"></span>';
    messagesContainer.appendChild(botDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    const contentSpan = botDiv.querySelector('.cf-content');
    const cursorSpan = botDiv.querySelector('.cf-cursor');

    let fullAnswer = '';
    let citations = [];

    const streamUrl = `${apiEndpoint.replace(/\/+$/, '')}/api/v1/rag/stream?q=${encodeURIComponent(q)}&project=${encodeURIComponent(projectSlug)}&top_k=4`;

    let isDone = false;

    try {
      const sse = new EventSource(streamUrl);

      const handleTokenData = (raw) => {
        if (!raw) return;
        try {
          const payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
          const token = payload.content || payload.token || payload.text || '';
          if (token) {
            fullAnswer += token;
            contentSpan.innerHTML = renderFormattedMessage(fullAnswer);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
          if (payload.citations && Array.isArray(payload.citations)) {
            citations = payload.citations;
          } else if (payload.sources && Array.isArray(payload.sources)) {
            citations = payload.sources;
          }
        } catch {
          // Plain text token fallback
          fullAnswer += raw;
          contentSpan.innerHTML = renderFormattedMessage(fullAnswer);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      };

      // 1. Listen to named SSE events sent by ContextForge /api/v1/rag/stream
      sse.addEventListener('token', function (event) {
        handleTokenData(event.data);
      });

      sse.addEventListener('citations', function (event) {
        try {
          const meta = JSON.parse(event.data);
          if (meta.citations && Array.isArray(meta.citations)) {
            citations = meta.citations;
          } else if (meta.sources && Array.isArray(meta.sources)) {
            citations = meta.sources;
          }
        } catch {
          // ignore
        }
      });

      sse.addEventListener('done', function () {
        isDone = true;
        sse.close();
        finishStream();
      });

      // 2. Generic fallback for unnamed SSE messages
      sse.onmessage = function (event) {
        if (event.data === '[DONE]') {
          isDone = true;
          sse.close();
          finishStream();
          return;
        }
        handleTokenData(event.data);
      };

      // 3. Error / Disconnection handler
      sse.onerror = function () {
        sse.close();
        if (!fullAnswer && !isDone) {
          contentSpan.textContent = 'No se pudo conectar al endpoint RAG de ContextForge. Verifica que el servidor esté activo en ' + apiEndpoint;
        }
        finishStream();
      };
    } catch (err) {
      contentSpan.textContent = 'Error al inicializar SSE: ' + err.message;
      finishStream();
    }

    function finishStream() {
      if (cursorSpan) cursorSpan.remove();
      if (citations && citations.length > 0) {
        const citeBox = document.createElement('div');
        citeBox.style.marginTop = '8px';
        citeBox.style.display = 'flex';
        citeBox.style.flexWrap = 'wrap';
        citeBox.style.gap = '4px';

        citations.forEach(src => {
          const badge = document.createElement('span');
          badge.className = 'cf-citation-badge';
          badge.textContent = '📄 ' + (src.file_path || src);
          citeBox.appendChild(badge);
        });
        botDiv.appendChild(citeBox);
      }
      isStreaming = false;
      sendBtn.disabled = false;
      inputField.focus();
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  // 10. Event Listeners for Input
  sendBtn.addEventListener('click', () => sendUserMessage());

  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendUserMessage();
    }
  });

  // Auto-resize textarea
  inputField.addEventListener('input', () => {
    inputField.style.height = 'auto';
    inputField.style.height = Math.min(inputField.scrollHeight, 80) + 'px';
  });

  // 11. Public Global API
  window.ContextForgeChat = {
    open: () => toggleChat(true),
    close: () => toggleChat(false),
    toggle: () => toggleChat(),
    setProject: (newSlug) => {
      projectSlug = newSlug || 'default';
      if (projectIndicator) {
        projectIndicator.textContent = `Librería: ${projectSlug}`;
      }
      if (launcherBtn) {
        launcherBtn.setAttribute('title', `Preguntar al Asistente ContextForge (${projectSlug})`);
      }
    },
    getProject: () => projectSlug,
    ask: (q) => {
      toggleChat(true);
      sendUserMessage(q);
    }
  };

})();

