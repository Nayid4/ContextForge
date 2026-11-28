// Agent Studio AlpineJS App (Visibility, Egress Chip, Live Doc Count, Versioning/Rollback, Playground & Deploy)
function agentsStudioApp() {
  const boot = window.__CF_AGENTS_BOOT__ || {};
  const initialAgents = boot.agents || [];
  const first = initialAgents[0] || null;
  return {
    projectSlug: boot.projectSlug || 'default',
    baseUrl: boot.baseUrl || window.location.origin,
    agents: initialAgents,
    providers: boot.providers || [],
    templatesCatalog: boot.templatesCatalog || [],
    allowPublicCliAgents: Boolean(boot.allowPublicCliAgents),
    tab: 'config',
    isNew: !first,
    saving: false,
    playQuestion: '',
    playLoading: false,
    playResult: null,
    versions: [],
    evalCases: [],
    evalRunning: false,
    evalReport: null,
    newEval: { question: '', expected_citation_path: '', expected_substring: '' },
    docCount: 0,
    widgetColor: '#4f46e5',
    widgetOriginInput: window.location.origin,
    issuedPubKey: '',
    form: first
      ? { visibility: 'internal', daily_quota_requests: 500, ...first }
      : {
          slug: '',
          name: '',
          description: '',
          system_prompt: 'Eres un agente especialista del proyecto. Cita siempre [ruta.md].',
          llm_provider: '',
          llm_model: '',
          temperature: 0.2,
          max_tokens: 2048,
          top_k: 6,
          min_grounding_score: 0.15,
          allowed_modules: [],
          allowed_statuses: ['published'],
          welcome_message: '¡Hola! ¿En qué puedo ayudarte con este proyecto?',
          topic_boundaries: '',
          visibility: 'internal',
          daily_quota_requests: 500,
          current_version: 1,
        },

    init() {
      this.refreshDocCount();
    },

    get selectedProviderMeta() {
      const target = (this.form.llm_provider || '').trim();
      if (target) {
        return this.providers.find((p) => p.provider === target) || null;
      }
      return this.providers.find((p) => p.is_active) || this.providers[0] || null;
    },

    get resolvedEgress() {
      return this.selectedProviderMeta ? this.selectedProviderMeta.egress : 'local';
    },

    get resolvedEngineType() {
      return this.selectedProviderMeta ? this.selectedProviderMeta.engine_type : 'extractive_fallback';
    },

    get selectedProviderHasKey() {
      return this.selectedProviderMeta ? Boolean(this.selectedProviderMeta.has_api_key) : false;
    },

    get selectedProviderKeySource() {
      return this.selectedProviderMeta ? (this.selectedProviderMeta.key_source || 'missing') : 'missing';
    },

    async refreshDocCount() {
      try {
        const mods = (this.form.allowed_modules || []).join(',');
        const sts = (this.form.allowed_statuses || ['published']).join(',');
        const res = await fetch(
          `/api/v1/projects/${encodeURIComponent(this.projectSlug)}/agents/preview-doc-count?modules=${encodeURIComponent(mods)}&statuses=${encodeURIComponent(sts)}`
        );
        if (res.ok) {
          const data = await res.json();
          this.docCount = data.matched_documents ?? 0;
        }
      } catch (_) {}
    },

    selectAgent(a) {
      this.isNew = false;
      this.form = {
        visibility: 'internal',
        daily_quota_requests: 500,
        ...a,
        allowed_statuses: [...(a.allowed_statuses || ['published'])],
      };
      this.playResult = null;
      this.versions = [];
      this.issuedPubKey = '';
      this.refreshDocCount();
      if (this.tab === 'versions') this.loadVersions();
    },

    startNewAgent() {
      this.isNew = true;
      this.tab = 'config';
      this.playResult = null;
      this.issuedPubKey = '';
      this.form = {
        slug: '',
        name: '',
        description: '',
        system_prompt: 'Eres un agente especialista del proyecto. Responde con citas [ruta.md].',
        llm_provider: '',
        llm_model: '',
        temperature: 0.2,
        max_tokens: 2048,
        top_k: 6,
        min_grounding_score: 0.15,
        allowed_modules: [],
        allowed_statuses: ['published'],
        welcome_message: '¡Hola! ¿En qué puedo ayudarte?',
        topic_boundaries: '',
        visibility: 'internal',
        daily_quota_requests: 500,
        current_version: 1,
      };
      this.refreshDocCount();
    },

    async saveAgent() {
      if (!this.form.name || !this.form.name.trim()) {
        window.$toast?.warning?.('Ingresa un nombre para el agente.');
        return;
      }
      this.saving = true;
      try {
        const url = this.isNew
          ? `/api/v1/projects/${encodeURIComponent(this.projectSlug)}/agents`
          : `/api/v1/projects/${encodeURIComponent(this.projectSlug)}/agents/${encodeURIComponent(this.form.slug)}`;
        const method = this.isNew ? 'POST' : 'PUT';
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Error al guardar agente');
        const idx = this.agents.findIndex((a) => a.slug === data.slug);
        if (idx >= 0) this.agents.splice(idx, 1, data);
        else this.agents.push(data);
        this.selectAgent(data);
        window.$toast?.success?.(`Agente "${data.name}" guardado (v${data.current_version}).`, 'Agent Studio');
      } catch (err) {
        window.$toast?.error?.(err.message);
      } finally {
        this.saving = false;
      }
    },

    async issueWidgetPublishableKey() {
      if (this.isNew) return;
      try {
        const origins = (this.widgetOriginInput || '')
          .split(',')
          .map((o) => o.trim())
          .filter(Boolean);
        const res = await fetch('/api/v1/auth/api-keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `Widget ${this.projectSlug}/${this.form.slug}`,
            role_scope: 'AgentClient',
            allowed_projects: [this.projectSlug],
            allowed_agents: [`${this.projectSlug}/${this.form.slug}`],
            is_publishable: true,
            allowed_origins: origins,
            daily_quota_requests: this.form.daily_quota_requests || 500,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'No se pudo emitir la clave publicable');
        this.issuedPubKey = data.api_key || '';
        window.$toast?.success?.('Clave publicable ligada al agente generada.', 'Widget Seguro');
      } catch (err) {
        window.$toast?.error?.(err.message);
      }
    },

    async askPlayground() {
      const q = (this.playQuestion || '').trim();
      if (!q || this.isNew) return;
      this.playLoading = true;
      try {
        const res = await fetch(
          `/api/v1/projects/${encodeURIComponent(this.projectSlug)}/agents/${encodeURIComponent(this.form.slug)}/chat`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: q }),
          }
        );
        this.playResult = await res.json();
      } catch (err) {
        window.$toast?.error?.('Error en playground: ' + err.message);
      } finally {
        this.playLoading = false;
      }
    },

    async loadVersions() {
      if (this.isNew) return;
      const res = await fetch(
        `/api/v1/projects/${encodeURIComponent(this.projectSlug)}/agents/${encodeURIComponent(this.form.slug)}/versions`
      );
      if (res.ok) {
        const data = await res.json();
        this.versions = data.versions || [];
      }
    },

    async rollbackAgent(targetVersion) {
      const res = await fetch(
        `/api/v1/projects/${encodeURIComponent(this.projectSlug)}/agents/${encodeURIComponent(this.form.slug)}/rollback`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target_version: targetVersion, reason: 'Restauración desde Agent Studio' }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        const idx = this.agents.findIndex((a) => a.slug === data.slug);
        if (idx >= 0) this.agents.splice(idx, 1, data);
        this.selectAgent(data);
        this.loadVersions();
        window.$toast?.success?.(`Agente restaurado a v${targetVersion}.`, 'Rollback');
      }
    },

    applyTemplate(tpl) {
      this.form = {
        ...this.form,
        name: tpl.name,
        slug: tpl.slug,
        description: tpl.description,
        system_prompt: tpl.system_prompt,
        topic_boundaries: tpl.topic_boundaries,
        welcome_message: tpl.welcome_message,
        visibility: tpl.visibility || 'internal',
        temperature: tpl.temperature ?? 0.2,
        top_k: tpl.top_k ?? 6,
        min_grounding_score: tpl.min_grounding_score ?? 0.15,
      };
      this.refreshDocCount();
      window.$toast?.info?.(`Plantilla "${tpl.name}" cargada.`, 'Plantillas');
    },

    async loadEvals() {
      if (this.isNew) return;
      const res = await fetch(`/api/v1/projects/${encodeURIComponent(this.projectSlug)}/agents/${encodeURIComponent(this.form.slug)}/evals`);
      if (res.ok) this.evalCases = (await res.json()).items || [];
    },

    async addEvalCase() {
      if (!this.newEval.question.trim() || this.isNew) return;
      const res = await fetch(`/api/v1/projects/${encodeURIComponent(this.projectSlug)}/agents/${encodeURIComponent(this.form.slug)}/evals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.newEval),
      });
      if (res.ok) {
        this.newEval = { question: '', expected_citation_path: '', expected_substring: '' };
        await this.loadEvals();
        window.$toast?.success?.('Caso de evaluación guardado.', 'Evaluación');
      }
    },

    async deleteEvalCase(caseId) {
      const res = await fetch(`/api/v1/projects/${encodeURIComponent(this.projectSlug)}/agents/${encodeURIComponent(this.form.slug)}/evals/${encodeURIComponent(caseId)}`, { method: 'DELETE' });
      if (res.ok) await this.loadEvals();
    },

    async runEvals() {
      if (this.isNew) return;
      this.evalRunning = true;
      try {
        const res = await fetch(`/api/v1/projects/${encodeURIComponent(this.projectSlug)}/agents/${encodeURIComponent(this.form.slug)}/evals/run`, { method: 'POST' });
        if (res.ok) this.evalReport = await res.json();
      } finally {
        this.evalRunning = false;
      }
    },

    launchWidgetPreview() {
      if (this.isNew) return;
      const openConfigured = () => {
        if (!window.ContextForgeChat) return;
        window.ContextForgeChat.configure({
          project: this.projectSlug,
          agent: this.form.slug,
          endpoint: this.baseUrl,
          title: this.form.name || this.form.slug,
          primaryColor: this.widgetColor || '#4f46e5',
          publishableKey: this.form.visibility === 'public' ? (this.issuedPubKey || '') : '',
          welcomeMessage: this.form.welcome_message || `Hola, soy ${this.form.name}.`,
          suggestedQuestions: this.form.suggested_questions || [],
        });
        window.ContextForgeChat.open();
        window.$toast?.info?.(`Widget en vivo conectado a ${this.projectSlug}/${this.form.slug}.`, 'Vista previa Widget');
      };
      if (window.ContextForgeChat) {
        openConfigured();
        return;
      }
      const s = document.createElement('script');
      s.src = '/static/js/contextforge-chat-widget.js?v=12';
      s.setAttribute('data-project', this.projectSlug);
      s.setAttribute('data-agent', this.form.slug);
      s.setAttribute('data-endpoint', this.baseUrl);
      s.setAttribute('data-color', this.widgetColor || '#4f46e5');
      s.setAttribute('data-title', this.form.name || this.form.slug);
      s.onload = () => openConfigured();
      document.body.appendChild(s);
    },
  };
}
