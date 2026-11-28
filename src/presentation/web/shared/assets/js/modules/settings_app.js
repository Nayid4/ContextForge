// Settings Alpine App (Multi-LLM, Searchable Models, CLI Discovery, RAG Parameters, DB/Storage & Paginated Security Audit)
function llmSettingsApp() {
  const boot = window.__CF_BOOT__ || {};
  return {
    settingsTab: 'llm',
    activeCategory: 'all',
    activeProject: boot.activeProject || 'default',
    authMode: boot.authMode || 'local',
    bindHost: boot.bindHost || '127.0.0.1',
    bindWarning: Boolean(boot.bindWarning),
    configs: boot.configs || [],
    activeProvider: boot.activeProvider || 'ollama',
    selectedProvider: boot.activeProvider || 'ollama',
    modelComboOpen: false,
    modelSearch: '',
    discoveringModels: false,
    discoveredModelsCache: {},
    modelDiscoveryNote: '',
    modelDiscoverySource: '',
    discoveringCli: false,
    detectedCliMap: {},
    testing: false,
    testResult: null,
    saving: false,
    savingSystemSettings: false,
    embeddingStatus: null,
    reindexingEmbeddings: false,
    systemSettings: {
      docs_path: boot.docsPath || './docs',
      ollama_url: boot.ollamaUrl || 'http://127.0.0.1:11434',
      embedding_model: boot.embeddingModel || 'nomic-embed-text',
      temperature: boot.temperature ?? 0.2,
      min_grounding_score: boot.minGroundingScore ?? 0.15,
      enable_dlp_redaction: boot.enableDlpRedaction ?? true,
      enable_extractive_fallback: boot.enableExtractiveFallback ?? true,
    },
    dbConfigs: boot.dbConfigs || [],
    activeDatabase: boot.activeDatabase || 'sqlite',
    selectedDatabase: boot.activeDatabase || 'sqlite',
    testingDb: false,
    dbTestResult: null,
    storageConfigs: boot.storageConfigs || [],
    activeStorage: boot.activeStorage || 'local_fs',
    selectedStorage: boot.activeStorage || 'local_fs',
    testingStorage: false,
    storageTestResult: null,
    securityForbidden: false,
    verifyingAudit: false,
    auditVerifyReport: null,
    auditLogs: [],
    auditChainValid: true,
    auditPage: 1,
    auditPageSize: 10,
    auditTotal: 0,
    auditTotalPages: 1,
    auditHasPrev: false,
    auditHasNext: false,
    apiKeys: [],
    apiKeysPage: 1,
    apiKeysPageSize: 5,
    apiKeysTotal: 0,
    apiKeysTotalPages: 1,
    apiKeysHasPrev: false,
    apiKeysHasNext: false,
    newKeyName: '',
    newKeyRole: 'AgentClient',
    newKeyPublishable: false,
    newKeyProjectsCsv: boot.activeProject || 'default',
    newKeyAgentsCsv: '*',
    newKeyOriginsCsv: '',
    newKeyDailyQuota: 1000,
    issuedPlainKey: '',
    dlqJobs: [],
    projectWebhooks: [],
    newWebhookUrl: '',
    newWebhookSecret: '',

    init() { this.discoverCliEngines(true); },
    filteredConfigs() {
      if (this.activeCategory === 'all') return this.configs;
      return this.configs.filter(c => c.engine_type === this.activeCategory);
    },
    selectProvider(cfg) {
      this.selectedProvider = cfg.provider;
      this.testResult = null;
      this.modelComboOpen = false;
      this.modelSearch = '';
      const cached = this.discoveredModelsCache[cfg.provider];
      this.modelDiscoveryNote = cached ? cached.message : '';
      this.modelDiscoverySource = cached ? cached.source : '';
    },
    getCurrentConfig() { return this.configs.find(c => c.provider === this.selectedProvider) || this.configs[0] || {}; },
    getActiveConfig() { return this.configs.find(c => c.provider === this.activeProvider) || this.configs[0] || {}; },
    async openModelCombo() {
      this.modelComboOpen = !this.modelComboOpen;
      if (this.modelComboOpen) {
        this.$nextTick(() => this.$refs.modelSearchInput?.focus());
        const cfg = this.getCurrentConfig();
        if (cfg && cfg.provider && !this.discoveredModelsCache[cfg.provider]) {
          this.discoverModelsForCurrent(true);
        }
      }
    },
    async discoverModelsForCurrent(silent = false) {
      const cfg = this.getCurrentConfig();
      if (!cfg || !cfg.provider) return;
      this.discoveringModels = true;
      try {
        const cleanKey = (cfg.api_key || '').includes('*') ? '' : (cfg.api_key || '').trim();
        const res = await fetch('/api/v1/settings/llm/models', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: cfg.provider,
            engine_type: cfg.engine_type || 'local_http',
            base_url: cfg.base_url || '',
            api_key: cleanKey,
            cli_command: cfg.cli_command || '',
            default_model: cfg.default_model || '',
          }),
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.models)) {
          this.discoveredModelsCache[cfg.provider] = data;
          this.modelDiscoveryNote = data.message || '';
          this.modelDiscoverySource = data.source || '';
          if (!silent) {
            window.$toast?.success?.(data.message || `${data.count} modelos encontrados.`, 'Modelos detectados');
          }
        }
      } catch {
        if (!silent) window.$toast?.error?.('No se pudieron consultar los modelos en vivo.');
      } finally {
        this.discoveringModels = false;
      }
    },
    filteredModels() {
      const cfg = this.getCurrentConfig();
      const cached = cfg && cfg.provider ? this.discoveredModelsCache[cfg.provider] : null;
      let items = [];
      if (cached && Array.isArray(cached.models) && cached.models.length > 0) {
        items = cached.models;
      } else {
        const base = Array.isArray(cfg.recommended_models) ? cfg.recommended_models : [];
        items = base.map((m) => (typeof m === 'string' ? { id: m, label: m } : m));
      }
      const q = (this.modelSearch || '').trim().toLowerCase();
      return q
        ? items.filter((m) => String(m.id).toLowerCase().includes(q) || String(m.label || '').toLowerCase().includes(q))
        : items;
    },

    async discoverCliEngines(silent = false) {
      this.discoveringCli = true;
      try {
        const data = await (await fetch('/api/v1/settings/llm/discover-cli')).json();
        if (data && Array.isArray(data.engines)) {
          const map = {};
          data.engines.forEach(e => { if (e.installed) map[e.provider] = e.binary_path; });
          this.detectedCliMap = map;
          if (!silent) window.$toast.success(`Se detectaron ${data.installed_count} herramientas CLI instaladas.`, 'Escaneo CLI');
        }
      } catch {
        if (!silent) window.$toast.error('No se pudo escanear herramientas CLI locales.');
      } finally { this.discoveringCli = false; }
    },
    async testConnection(cfg) {
      this.testing = true; this.testResult = null;
      try {
        const cleanKey = (cfg.api_key || '').includes('*') ? '' : (cfg.api_key || '').trim();
        const res = await fetch('/api/v1/settings/llm/test', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: cfg.provider,
            name: cfg.name || cfg.provider,
            api_key: cleanKey,
            base_url: cfg.base_url || '',
            default_model: cfg.default_model || '',
            engine_type: cfg.engine_type || 'local_http',
            cli_command: cfg.cli_command || '',
            cli_args: cfg.cli_args || '',
            temperature: parseFloat(cfg.temperature) || 0.2,
            max_tokens: parseInt(cfg.max_tokens) || 4096,
          }),
        });
        const data = await res.json();
        this.testResult = data;
        if (data.healthy) window.$toast.success(`${data.message} (${data.latency_ms} ms)`, 'Modelo Verificado');
        else window.$toast.error(data.message, 'Fallo de Verificación');
      } catch {
        this.testResult = { healthy: false, message: 'Error de red probando proveedor.', latency_ms: 0 };
      } finally { this.testing = false; }
    },
    async saveConfig(cfg) {
      this.saving = true;
      try {
        const res = await fetch('/api/v1/settings/llm', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: cfg.provider, name: cfg.name, api_key: (cfg.api_key || '').includes('*') ? '' : (cfg.api_key || ''),
            base_url: cfg.base_url || '', default_model: cfg.default_model || '',
            temperature: parseFloat(cfg.temperature) || 0.2, max_tokens: parseInt(cfg.max_tokens) || 4096,
            engine_type: cfg.engine_type || 'local_http', cli_command: cfg.cli_command || '', cli_args: cfg.cli_args || '',
            is_active: cfg.provider === this.activeProvider,
          }),
        });
        const data = await res.json();
        if (res.ok) window.$toast.success(data.message || 'Proveedor guardado.', 'Guardado');
        else window.$toast.error(data.detail || 'Error al guardar proveedor.');
      } catch (err) { window.$toast.error('Error: ' + err.message); }
      finally { this.saving = false; }
    },
    async activateProvider(prov) {
      const target = this.configs.find(c => c.provider === prov);
      if (target && target.egress_class === 'cloud') {
        const ok = window.confirm(`"${target.name}" tiene egreso a la NUBE (los fragmentos salen del equipo con redacción DLP y quedará bloqueado en proyectos sovereign_only). ¿Confirmas activarlo?`);
        if (!ok) return;
      }
      try {
        const res = await fetch('/api/v1/settings/llm/activate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider: prov }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.status === 'success') {
          this.activeProvider = prov;
          this.configs.forEach(c => { c.is_active = (c.provider === prov); });
          window.$toast?.success?.(data.message, 'Motor Activo');
        } else {
          window.$toast?.error?.(window.cfRenderProblemError ? window.cfRenderProblemError(data).formatted : 'No se pudo activar el motor.');
        }
      } catch (err) { window.$toast?.error?.('Error: ' + err.message); }
    },
    async loadAuditLogs(page = this.auditPage) {
      try {
        const p = Math.max(1, page);
        const resp = await fetch(`/api/v1/audit-logs?page=${p}&page_size=${this.auditPageSize}`);
        if (resp.status === 401 || resp.status === 403) { this.securityForbidden = true; return; }
        const auditRes = await resp.json();
        this.auditLogs = auditRes.items || [];
        this.auditChainValid = auditRes.chain_integrity_valid !== false;
        this.auditPage = auditRes.page || 1;
        this.auditTotal = auditRes.total_count ?? this.auditLogs.length;
        this.auditTotalPages = auditRes.total_pages || 1;
        this.auditHasPrev = this.auditPage > 1;
        this.auditHasNext = this.auditPage < this.auditTotalPages;
      } catch {}
    },
    async verifyAuditChain() {
      this.verifyingAudit = true;
      try {
        const resp = await fetch('/api/v1/audit-logs/verify');
        const data = await resp.json().catch(() => ({}));
        if (resp.ok) {
          this.auditVerifyReport = data;
          this.auditChainValid = Boolean(data.chain_valid);
          if (data.chain_valid) window.$toast?.success?.(`Cadena íntegra (${data.total_entries} eventos verificados).`, 'Auditoría SHA-256');
          else window.$toast?.error?.(`Integridad rota en secuencia #${data.broken_at_seq}.`, 'Alerta de Auditoría');
        } else {
          window.$toast?.error?.(window.cfRenderProblemError ? window.cfRenderProblemError(data).formatted : 'No se pudo verificar.');
        }
      } finally { this.verifyingAudit = false; }
    },
    async loadApiKeys(page = this.apiKeysPage) {
      try {
        const p = Math.max(1, page);
        const resp = await fetch(`/api/v1/auth/api-keys?page=${p}&page_size=${this.apiKeysPageSize}`);
        if (resp.status === 401 || resp.status === 403) { this.securityForbidden = true; return; }
        const keysRes = await resp.json();
        this.apiKeys = keysRes.items || [];
        this.apiKeysPage = keysRes.page || 1;
        this.apiKeysTotal = keysRes.total_count ?? this.apiKeys.length;
        this.apiKeysTotalPages = keysRes.total_pages || 1;
        this.apiKeysHasPrev = Boolean(keysRes.has_prev);
        this.apiKeysHasNext = Boolean(keysRes.has_next);
      } catch {}
    },
    async loadSecurityAndAudit() {
      this.securityForbidden = false;
      try {
        const [, , jobsResp] = await Promise.all([
          this.loadAuditLogs(this.auditPage),
          this.loadApiKeys(this.apiKeysPage),
          fetch(`/api/v1/rag/jobs?project=${encodeURIComponent(this.activeProject)}&status=dead_letter&page=1&page_size=50`),
        ]);
        if (jobsResp && jobsResp.ok) {
          const jobsRes = await jobsResp.json();
          this.dlqJobs = jobsRes.items || [];
        }
      } catch {}
    },
    async issueApiKey() {
      if (!this.newKeyName.trim()) { window.$toast?.warning?.('Ingresa un nombre para la API Key.'); return; }
      const allowedProjects = (this.newKeyProjectsCsv || '*').split(',').map(s => s.trim()).filter(Boolean);
      const allowedAgents = (this.newKeyAgentsCsv || '*').split(',').map(s => s.trim()).filter(Boolean);
      const allowedOrigins = (this.newKeyOriginsCsv || '').split(',').map(s => s.trim()).filter(Boolean);
      if (this.newKeyPublishable && allowedOrigins.some(o => !o.startsWith('http://') && !o.startsWith('https://'))) {
        window.$toast?.warning?.('Cada origen permitido debe iniciar con https:// o http:// (ej. https://app.empresa.com).');
        return;
      }
      const res = await fetch('/api/v1/auth/api-keys', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: this.newKeyName.trim(),
          role_scope: this.newKeyPublishable ? 'AgentClient' : this.newKeyRole,
          allowed_projects: allowedProjects.length ? allowedProjects : ['*'],
          is_publishable: Boolean(this.newKeyPublishable),
          allowed_origins: allowedOrigins,
          allowed_agents: allowedAgents,
          daily_quota_requests: parseInt(this.newKeyDailyQuota) || 1000,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        this.issuedPlainKey = data.api_key;
        this.newKeyName = '';
        window.$toast?.success?.('Clave API generada. Cópiala ahora, no volverá a mostrarse.');
        this.loadApiKeys(1);
      } else {
        window.$toast?.error?.(window.cfRenderProblemError ? window.cfRenderProblemError(data).formatted : (data.detail || 'No se pudo emitir la clave.'));
      }
    },
    async revokeApiKey(keyId, keyName) {
      const ok = window.confirm(`¿Confirmas revocar permanentemente la clave "${keyName || keyId}"? Esta acción no se puede deshacer.`);
      if (!ok) return;
      const res = await fetch(`/api/v1/auth/api-keys/${encodeURIComponent(keyId)}`, { method: 'DELETE' });
      if (res.ok) {
        window.$toast?.info?.('API Key revocada.');
        this.loadApiKeys(this.apiKeysPage);
      } else {
        const d = await res.json().catch(() => ({}));
        window.$toast?.error?.(window.cfRenderProblemError ? window.cfRenderProblemError(d).formatted : 'No se pudo revocar la clave.');
      }
    },
    async retryDlqJobs() {
      const res = await fetch(`/api/v1/rag/dlq/retry?project=${encodeURIComponent(this.activeProject)}`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      window.$toast?.success?.(`Trabajos reintentados: ${data.retried_jobs ?? 0}`, 'Cola de Reintentos');
      this.loadSecurityAndAudit();
    },
    async loadProjectWebhooks() {
      try {
        const res = await fetch(`/api/v1/projects/${encodeURIComponent(this.activeProject)}/webhooks`);
        if (res.ok) {
          const d = await res.json();
          this.projectWebhooks = d.items || [];
        }
      } catch {}
    },
    async createProjectWebhook() {
      const u = (this.newWebhookUrl || '').trim();
      if (!u.startsWith('https://')) {
        window.$toast?.warning?.('Por seguridad (BR-22), la URL del webhook debe usar https:// público.');
        return;
      }
      const res = await fetch(`/api/v1/projects/${encodeURIComponent(this.activeProject)}/webhooks`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: u, events: ['document.published', 'document.indexed'], secret: this.newWebhookSecret || '' }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        this.newWebhookUrl = '';
        this.newWebhookSecret = '';
        window.$toast?.success?.('Webhook HTTPS registrado con secreto cifrado.', 'Webhooks');
        this.loadProjectWebhooks();
      } else {
        window.$toast?.error?.(window.cfRenderProblemError ? window.cfRenderProblemError(data).formatted : 'No se pudo registrar el webhook.');
      }
    },
    async deleteProjectWebhook(whId) {
      if (!window.confirm('¿Eliminar este webhook?')) return;
      await fetch(`/api/v1/projects/${encodeURIComponent(this.activeProject)}/webhooks/${encodeURIComponent(whId)}`, { method: 'DELETE' });
      window.$toast?.info?.('Webhook eliminado.');
      this.loadProjectWebhooks();
    },
    ...window.cfSettingsInfraMixin(),
  };
}
