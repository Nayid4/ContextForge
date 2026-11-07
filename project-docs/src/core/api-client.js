/**
 * Unified API Client for SDD Harness & Plane Data Architecture
 * Soporta peticiones HTTP REST con detección de protocolo file:/// y fallback automático.
 * 100% JavaScript Vanilla, 0 dependencias externas, 0 emojis.
 */

export class ApiClient {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Determina si la aplicación se está ejecutando en modo offline (file:///)
   * @returns {boolean}
   */
  isOffline() {
    return typeof window !== 'undefined' && window.location?.protocol === 'file:';
  }

  /**
   * Obtiene datos de respaldo embebidos en window.__FALLBACK_DATA__
   * @returns {Record<string, any>}
   */
  getFallbackData() {
    if (typeof window !== 'undefined' && window.__FALLBACK_DATA__) {
      return window.__FALLBACK_DATA__;
    }
    return {};
  }

  /**
   * Realiza una petición GET segura con soporte de fallback.
   * @param {string} endpoint 
   * @param {RequestInit & { bypassCache?: boolean }} [options] 
   * @returns {Promise<any>}
   */
  async get(endpoint, options = {}) {
    if (this.isOffline()) {
      return this.resolveOfflineFallback(endpoint);
    }

    const { bypassCache = false, ...fetchOpts } = options;
    const url = bypassCache
      ? `${this.baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}_t=${Date.now()}`
      : `${this.baseUrl}${endpoint}`;

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: bypassCache ? 'no-store' : 'default',
        ...fetchOpts
      });

      if (!res.ok) {
        throw new Error(`Error HTTP ${res.status}: ${res.statusText}`);
      }

      return await res.json();
    } catch (err) {
      // Intento de fallback ante error de conexión
      const fallback = this.resolveOfflineFallback(endpoint);
      if (fallback !== null) return fallback;
      throw err;
    }
  }

  /**
   * Realiza una petición POST segura.
   * @param {string} endpoint 
   * @param {any} body 
   * @param {RequestInit} [options] 
   * @returns {Promise<any>}
   */
  async post(endpoint, body = {}, options = {}) {
    if (this.isOffline()) {
      console.warn(`Operación POST "${endpoint}" no persistida en servidor (modo offline file:///)`);
      return { ok: true, offline: true };
    }

    const url = `${this.baseUrl}${endpoint}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body),
      ...options
    });

    if (!res.ok) {
      throw new Error(`Error HTTP POST ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  }

  /**
   * Resuelve datos desde el objeto de fallback según el endpoint solicitado.
   * @param {string} endpoint 
   * @returns {any}
   */
  resolveOfflineFallback(endpoint) {
    const fallback = this.getFallbackData();
    const clean = endpoint.toLowerCase();

    if (clean.includes('feature_list') || clean.includes('/api/features')) {
      return fallback.featureList || { project: 'Proyecto (Modo Local)', features: [] };
    }
    if (clean.includes('current.json') || clean.includes('/api/spec/current')) {
      return fallback.currentSpec || {};
    }
    if (clean.includes('history.json') || clean.includes('/api/history')) {
      return fallback.historyData || { records: [] };
    }
    if (clean.includes('project-spec.json') || clean.includes('/api/spec/project')) {
      return fallback.projectSpec || null;
    }
    if (clean.includes('knowledge') || clean.includes('/api/knowledge')) {
      return fallback.knowledgeIndex || null;
    }
    if (clean.includes('plane') || clean.includes('/api/plane')) {
      return fallback.planeData || {
        workspace: { id: 'ws-default', name: 'Harness Workspace' },
        project: { id: 'proj-default', name: 'Arnés SDD' },
        states: [],
        cycles: [],
        modules: [],
        issues: [],
        pages: []
      };
    }

    return null;
  }

  /**
   * Carga todo el conjunto de datos del proyecto para el arnés.
   * @param {{ bypassCache?: boolean }} [options] 
   * @returns {Promise<Record<string, any>>}
   */
  async fetchAll(options = {}) {
    if (this.isOffline()) {
      const fb = this.getFallbackData();
      const fList = fb.featureList || { project: 'Proyecto (Modo Local)', features: [] };
      return {
        project: fList.project || 'Proyecto',
        features: Array.isArray(fList.features) ? fList.features : [],
        currentSpec: fb.currentSpec || {},
        historyData: fb.historyData || { records: [] },
        projectSpec: fb.projectSpec || null,
        knowledgeIndex: fb.knowledgeIndex || null,
        protocol: 'file:'
      };
    }

    const { bypassCache = false } = options;
    const cacheBuster = bypassCache ? `?_t=${Date.now()}` : '';

    const [featuresRes, currentRes, historyRes, specRes, knowledgeRes] = await Promise.allSettled([
      fetch(`feature_list.json${cacheBuster}`),
      fetch(`progres/current.json${cacheBuster}`),
      fetch(`progres/history.json${cacheBuster}`),
      fetch(`project-spec.json${cacheBuster}`),
      fetch(`knowledge/knowledge-index.json${cacheBuster}`)
    ]);

    const readJson = async (res) => {
      if (res.status === 'fulfilled' && res.value.ok) {
        try { return await res.value.json(); } catch (_) { return null; }
      }
      return null;
    };

    const fData = await readJson(featuresRes);
    const cData = await readJson(currentRes);
    const hData = await readJson(historyRes);
    const sData = await readJson(specRes);
    const kData = await readJson(knowledgeRes);

    const fallback = this.getFallbackData();

    return {
      project: (fData && fData.project) || 'Proyecto',
      features: (fData && Array.isArray(fData.features)) ? fData.features : (fallback.featureList?.features || []),
      currentSpec: cData || fallback.currentSpec || {},
      historyData: hData || fallback.historyData || { records: [] },
      projectSpec: sData || fallback.projectSpec || null,
      knowledgeIndex: kData || fallback.knowledgeIndex || null,
      protocol: 'http:'
    };
  }

  /**
   * Carga el estado estructurado de Plane (SQLite / fallback).
   * @param {{ bypassCache?: boolean }} [options] 
   * @returns {Promise<Record<string, any>>}
   */
  async fetchPlaneData(options = {}) {
    if (this.isOffline()) {
      return this.resolveOfflineFallback('plane');
    }

    try {
      return await this.get('/api/plane/data', options);
    } catch (_) {
      return this.resolveOfflineFallback('plane');
    }
  }

  /**
   * Solicita una sincronización SQLite forzada al servidor local.
   * @returns {Promise<any>}
   */
  async syncSQLite() {
    try {
      return await this.post('/api/plane/sync', {});
    } catch (err) {
      console.warn('Sincronización SQLite no disponible:', err.message);
      return { ok: false, error: err.message };
    }
  }

  /**
   * Actualiza el contenido Markdown o metadatos de una página en Plane SQLite.
   * @param {string} pageId
   * @param {string|Record<string, any>} payload
   * @returns {Promise<any>}
   */
  async updatePlanePage(pageId, payload) {
    if (this.isOffline()) {
      return { ok: true, offline: true };
    }
    const body = typeof payload === 'string' ? { content_markdown: payload } : payload;
    try {
      const res = await fetch(`${this.baseUrl}/api/plane/pages/${encodeURIComponent(pageId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        return { ok: false, status: res.status };
      }
      return await res.json();
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }
}

export const apiClient = new ApiClient();
