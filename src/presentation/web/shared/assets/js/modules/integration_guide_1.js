// Interactive Integration Guide Alpine App (OpenAI Gateway, MCP by Client, Public-Only Widget, Webhooks HMAC & Live Test)
function integrationDocsApp() {
  const boot = window.__CF_INT_BOOT__ || {};
  const projects = boot.projects || [{ slug: boot.activeProject || 'default', name: boot.activeProject || 'default' }];
  const agents = boot.agents || [];
  const initialProject = boot.activeProject || (projects[0] && projects[0].slug) || 'default';
  const initialProjAgents = agents.filter(a => a.project_slug === initialProject);
  const initialAgent = (initialProjAgents[0] && initialProjAgents[0].slug) || 'assistant';

  return {
    activeSection: 'openai',
    openaiLang: 'python',
    mcpClient: 'cursor',
    restLang: 'curl',
    authMode: boot.authMode || 'local',
    projects,
    agents,
    selectedProject: initialProject,
    selectedAgent: initialAgent,
    baseUrl: boot.baseUrl || window.location.origin,
    testingConnection: false,
    liveTestResult: null,

    projectAgents() {
      return this.agents.filter(a => a.project_slug === this.selectedProject);
    },
    publicProjectAgents() {
      return this.projectAgents().filter(a => a.visibility === 'public');
    },
    selectedAgentObj() {
      return this.projectAgents().find(a => a.slug === this.selectedAgent) || null;
    },
    isSelectedAgentPublic() {
      const a = this.selectedAgentObj();
      return Boolean(a && a.visibility === 'public');
    },
    syncAgentForProject() {
      const list = this.projectAgents();
      this.selectedAgent = list.length ? list[0].slug : 'assistant';
    },

    switchSection(sec) {
      this.activeSection = sec;
      if (sec === 'arch' && window.renderMermaidDiagrams) {
        this.$nextTick(() => {
          setTimeout(() => {
            const host = document.getElementById('cf-arch-diagram-panel');
            if (host) window.renderMermaidDiagrams(host);
          }, 80);
        });
      }
    },

    async testLiveConnection() {
      this.testingConnection = true;
      this.liveTestResult = null;
      const t0 = performance.now();
      try {
        const [hRes, mRes] = await Promise.all([
          fetch('/health/ready'),
          fetch('/v1/models'),
        ]);
        const ms = Math.round(performance.now() - t0);
        if (hRes.ok && mRes.ok) {
          const mData = await mRes.json();
          const count = Array.isArray(mData.data) ? mData.data.length : 0;
          this.liveTestResult = { ok: true, latencyMs: ms, message: `Conexión verificada con ${this.baseUrl}: servicio saludable y ${count} agente(s) accesibles en /v1/models.` };
        } else if (mRes.status === 401 || mRes.status === 403) {
          this.liveTestResult = { ok: true, latencyMs: ms, message: `Servidor saludable en ${this.baseUrl} (modo ${this.authMode}: /v1/models exige Bearer JWT o X-API-Key).` };
        } else {
          this.liveTestResult = { ok: false, latencyMs: ms, message: `El servidor respondió HTTP ${hRes.status} / ${mRes.status}.` };
        }
      } catch {
        this.liveTestResult = { ok: false, latencyMs: 0, message: `No se pudo conectar con ${this.baseUrl}.` };
      } finally {
        this.testingConnection = false;
      }
    },

    getOpenAiSnippet() {
      const modelId = `${this.selectedProject}/${this.selectedAgent}`;
      if (this.openaiLang === 'node') {
        return `import OpenAI from "openai";\n\nconst client = new OpenAI({\n  baseURL: "${this.baseUrl}/v1",\n  apiKey: process.env.CONTEXTFORGE_API_KEY || "cf_live_tu_clave",\n});\n\nconst stream = await client.chat.completions.create({\n  model: "${modelId}",\n  stream: true,\n  messages: [{ role: "user", content: "¿Cuáles son las reglas clave de este proyecto?" }],\n});\nfor await (const chunk of stream) {\n  process.stdout.write(chunk.choices[0]?.delta?.content || "");\n}`;
      }
      if (this.openaiLang === 'curl') {
        return `curl -N -X POST ${this.baseUrl}/v1/chat/completions \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer cf_live_tu_clave" \\\n  -d '{"model":"${modelId}","stream":true,"messages":[{"role":"user","content":"¿Cuáles son las reglas clave de este proyecto?"}]}'`;
      }
      return `from openai import OpenAI\n\nclient = OpenAI(\n    base_url="${this.baseUrl}/v1",\n    api_key="cf_live_tu_clave",\n)\nresp = client.chat.completions.create(\n    model="${modelId}",\n    messages=[{"role": "user", "content": "¿Cuáles son las reglas clave de este proyecto?"}],\n)\nprint(resp.choices[0].message.content)`;
    },

    getMcpSnippet() {
      const needsKey = this.authMode === 'enterprise_rbac';
      if (this.mcpClient === 'claude_desktop') {
        return `{\n  "mcpServers": {\n    "contextforge-${this.selectedProject}": {\n      "command": "python",\n      "args": ["run_mcp.py"],\n      "env": {\n        "CONTEXTFORGE_PROJECT": "${this.selectedProject}"${needsKey ? ',\n        "CONTEXTFORGE_API_KEY": "cf_live_tu_clave"' : ''}\n      }\n    }\n  }\n}`;
      }
      if (this.mcpClient === 'claude_cli') {
        return `claude mcp add --transport sse contextforge-${this.selectedProject} ${this.baseUrl}/mcp/sse --header "X-API-Key: cf_live_tu_clave"`;
      }
      return `{\n  "mcpServers": {\n    "contextforge-${this.selectedProject}": {\n      "url": "${this.baseUrl}/mcp/sse",\n      "headers": {\n        "X-API-Key": "cf_live_tu_clave"\n      }\n    }\n  }\n}`;
    },

    getWidgetSnippet() {
      return `<script\n  src="${this.baseUrl}/static/js/contextforge-chat-widget.js"\n  data-project="${this.selectedProject}"\n  data-agent="${this.selectedAgent}"\n  data-endpoint="${this.baseUrl}"\n  data-publishable-key="cf_pub_generar_en_configuracion"\n  data-title="Asistente ${this.selectedProject}"\n  defer></script>`;
    },

    getWebhookVerifySnippet() {
      return `import hashlib, hmac, time\n\ndef verify_contextforge_webhook(raw_body: bytes, timestamp: str, signature: str, secret: str) -> bool:\n    # 1. Ventana anti-replay (5 minutos)\n    if abs(time.time() - int(timestamp)) > 300:\n        return False\n    # 2. Verificar HMAC-SHA256 sobre "{timestamp}.{raw_body}"\n    expected = "sha256=" + hmac.new(\n        secret.encode("utf-8"),\n        f"{timestamp}.".encode("utf-8") + raw_body,\n        hashlib.sha256,\n    ).hexdigest()\n    return hmac.compare_digest(expected, signature)`;
    },

    getRestSnippet() {
      if (this.restLang === 'python') {
        return `import httpx\n\nr = httpx.post(\n    "${this.baseUrl}/api/v1/projects/${this.selectedProject}/agents/${this.selectedAgent}/chat",\n    headers={"X-API-Key": "cf_live_tu_clave"},\n    json={"question": "Resume la arquitectura del proyecto"},\n)\nprint(r.json()["answer"])`;
      }
      if (this.restLang === 'js') {
        return `const res = await fetch("${this.baseUrl}/api/v1/projects/${this.selectedProject}/agents/${this.selectedAgent}/chat", {\n  method: "POST",\n  headers: { "Content-Type": "application/json", "X-API-Key": "cf_live_tu_clave" },\n  body: JSON.stringify({ question: "Resume la arquitectura del proyecto" }),\n});\nconsole.log((await res.json()).answer);`;
      }
      return `curl -X POST ${this.baseUrl}/api/v1/projects/${this.selectedProject}/agents/${this.selectedAgent}/chat \\\n  -H "Content-Type: application/json" \\\n  -H "X-API-Key: cf_live_tu_clave" \\\n  -d '{"question": "Resume la arquitectura del proyecto"}'`;
    },

    testWidgetInPage() {
      if (!this.isSelectedAgentPublic()) return;
      const openConfigured = () => {
        window.ContextForgeChat.configure({
          project: this.selectedProject,
          agent: this.selectedAgent,
          endpoint: this.baseUrl,
          title: `Asistente ${this.selectedProject}`,
        });
        window.ContextForgeChat.open();
      };
      if (!window.ContextForgeChat) {
        const s = document.createElement('script');
        s.src = `${this.baseUrl}/static/js/contextforge-chat-widget.js?v=11`;
        s.onload = () => setTimeout(openConfigured, 120);
        document.body.appendChild(s);
      } else {
        openConfigured();
      }
    },

    copyCode(code, label) {
      if (window.cfCopyText) { window.cfCopyText(code, label); return; }
      if (navigator.clipboard && code) {
        navigator.clipboard.writeText(code).then(() => window.$toast?.success?.(`${label || 'Fragmento'} copiado.`, 'Copiado'));
      }
    },
  };
}
