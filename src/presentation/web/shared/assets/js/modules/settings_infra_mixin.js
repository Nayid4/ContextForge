// Clean Diagnostic Database, Storage & Full System Settings Mixin for Settings Page (SET-06, SET-07)
window.cfSettingsInfraMixin = function() {
  return {
    selectDb(db) { this.selectedDatabase = db.provider; this.dbTestResult = null; },
    getCurrentDb() { return this.dbConfigs.find(d => d.provider === this.selectedDatabase) || this.dbConfigs[0] || {}; },
    async testDbConnection(db) {
      this.testingDb = true; this.dbTestResult = null;
      try {
        const res = await fetch('/api/v1/settings/database/test', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: db.provider, connection_url: db.connection_url || '', host: db.host || '',
            port: parseInt(db.port) || 0, database_name: db.database_name || '', username: db.username || '',
            password: db.password || '', api_key: db.api_key || '', project_id: db.project_id || '', ssl_enabled: Boolean(db.ssl_enabled)
          })
        });
        const data = await res.json();
        this.dbTestResult = data;
        if (data.healthy) window.$toast?.success?.(`${data.message} (${data.latency_ms} ms)`, 'Base de Datos Conectada');
        else window.$toast?.error?.(window.cfRenderProblemError ? window.cfRenderProblemError(data, data.message).formatted : data.message, 'Error de Base de Datos');
      } catch {
        this.dbTestResult = { healthy: false, message: 'Error al probar conexión con BD', latency_ms: 0 };
        window.$toast?.error?.('Error de red al probar base de datos');
      } finally { this.testingDb = false; }
    },
    selectStorage(st) { this.selectedStorage = st.provider; this.storageTestResult = null; },
    getCurrentStorage() { return this.storageConfigs.find(s => s.provider === this.selectedStorage) || this.storageConfigs[0] || {}; },
    async testStorageConnection(st) {
      this.testingStorage = true; this.storageTestResult = null;
      try {
        const res = await fetch('/api/v1/settings/storage/test', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: st.provider, base_path: st.base_path || './docs', endpoint_url: st.endpoint_url || '',
            bucket_name: st.bucket_name || '', region: st.region || 'us-east-1', access_key: st.access_key || '',
            secret_key: st.secret_key || '', project_id: st.project_id || '', sync_local_mirror: Boolean(st.sync_local_mirror)
          })
        });
        const data = await res.json();
        this.storageTestResult = data;
        if (data.healthy) window.$toast?.success?.(`${data.message} (${data.latency_ms} ms)`, 'Storage Verificado');
        else window.$toast?.error?.(window.cfRenderProblemError ? window.cfRenderProblemError(data, data.message).formatted : data.message, 'Error de Storage');
      } catch {
        this.storageTestResult = { healthy: false, message: 'Error probando storage', latency_ms: 0 };
        window.$toast?.error?.('Error de red al probar storage');
      } finally { this.testingStorage = false; }
    },
    async loadEmbeddingStatus() {
      try {
        const res = await fetch('/api/v1/settings/embeddings/status');
        if (res.ok) this.embeddingStatus = await res.json();
      } catch {}
    },
    async triggerEmbeddingReindex() {
      this.reindexingEmbeddings = true;
      try {
        const res = await fetch('/api/v1/settings/embeddings/reindex', { method: 'POST' });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          this.embeddingStatus = data;
          window.$toast?.success?.(`Se reindexaron ${data.reindexed_documents ?? 0} documentos publicados.`, 'Embeddings');
        } else {
          window.$toast?.error?.(window.cfRenderProblemError ? window.cfRenderProblemError(data).formatted : 'No se pudo reindexar.');
        }
      } finally { this.reindexingEmbeddings = false; }
    },
    async saveSystemSettings() {
      this.savingSystemSettings = true;
      try {
        const res = await fetch('/api/v1/settings', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            active_llm_model: this.getActiveConfig().default_model || '',
            docs_path: this.systemSettings.docs_path || './docs',
            ollama_url: this.systemSettings.ollama_url || 'http://127.0.0.1:11434',
            embedding_model: this.systemSettings.embedding_model || 'nomic-embed-text',
            temperature: parseFloat(this.systemSettings.temperature) || 0.2,
            min_grounding_score: parseFloat(this.systemSettings.min_grounding_score) || 0.15,
            enable_dlp_redaction: Boolean(this.systemSettings.enable_dlp_redaction),
            enable_extractive_fallback: Boolean(this.systemSettings.enable_extractive_fallback),
          })
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          window.$toast?.success?.('Todos los parámetros globales de RAG, embeddings y DLP fueron guardados.', 'Ajustes Actualizados');
          await this.loadEmbeddingStatus();
        } else {
          window.$toast?.error?.(window.cfRenderProblemError ? window.cfRenderProblemError(data).formatted : (data.detail || 'No se pudieron guardar los parámetros.'));
        }
      } catch (err) { window.$toast?.error?.('Error al guardar ajustes: ' + err.message); }
      finally { this.savingSystemSettings = false; }
    }
  };
};
