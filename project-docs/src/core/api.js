/**
 * API Data Service to load feature_list.json, current.json and history.json
 * Incluye soporte de Auto-Sync (detección en vivo de cambios sin refrescar).
 */

export async function fetchProjectData(options = {}) {
  const { bypassCache = false } = options;

  // Protocolo file:///: los navegadores bloquean fetch() hacia URLs locales (CORS origin 'null').
  // En modo local offline, resolver inmediatamente con window.__FALLBACK_DATA__ sin intentar fetch().
  if (typeof window !== 'undefined' && window.location?.protocol === 'file:') {
    const fallback = window.__FALLBACK_DATA__ || {};
    const fData = fallback.featureList || { project: 'Proyecto (Modo Local)', features: [] };
    return {
      project: fData.project || 'Proyecto',
      features: Array.isArray(fData.features) ? fData.features : [],
      currentSpec: fallback.currentSpec || {},
      historyData: fallback.historyData || { records: [] },
      projectSpec: fallback.projectSpec || null,
      knowledgeIndex: fallback.knowledgeIndex || null,
      protocol: 'file:'
    };
  }

  let featureData = null;
  let currentSpec = {};
  let historyData = { records: [] };
  let projectSpec = null;
  let knowledgeIndex = null;

  const cacheBuster = bypassCache ? `?_t=${Date.now()}` : '';
  const fetchOpts = bypassCache ? { cache: 'no-store' } : {};

  // Rutas relativas compatibles con ejecución local y raíz
  const featurePaths = [
    `feature_list.json${cacheBuster}`,
    `../feature_list.json${cacheBuster}`,
    `./project-docs/feature_list.json${cacheBuster}`
  ];
  const currentPaths = [
    `progres/current.json${cacheBuster}`,
    `progress/current.json${cacheBuster}`,
    `../progress/current.json${cacheBuster}`,
    `../project-docs/progres/current.json${cacheBuster}`
  ];
  const historyPaths = [
    `progres/history.json${cacheBuster}`,
    `progress/history.json${cacheBuster}`,
    `../progress/history.json${cacheBuster}`,
    `../project-docs/progres/history.json${cacheBuster}`
  ];
  const specPaths = [
    `project-spec.json${cacheBuster}`,
    `../project-spec.json${cacheBuster}`,
    `./project-docs/project-spec.json${cacheBuster}`
  ];
  const knowledgePaths = [
    `knowledge/knowledge-index.json${cacheBuster}`,
    `../knowledge/knowledge-index.json${cacheBuster}`,
    `./project-docs/knowledge/knowledge-index.json${cacheBuster}`
  ];

  for (const path of featurePaths) {
    try {
      const res = await fetch(path, fetchOpts);
      if (res.ok) {
        featureData = await res.json();
        break;
      }
    } catch (_) {}
  }

  for (const path of currentPaths) {
    try {
      const res = await fetch(path, fetchOpts);
      if (res.ok) {
        currentSpec = await res.json();
        break;
      }
    } catch (_) {}
  }

  for (const path of historyPaths) {
    try {
      const res = await fetch(path, fetchOpts);
      if (res.ok) {
        historyData = await res.json();
        break;
      }
    } catch (_) {}
  }

  for (const path of specPaths) {
    try {
      const res = await fetch(path, fetchOpts);
      if (res.ok) {
        projectSpec = await res.json();
        break;
      }
    } catch (_) {}
  }

  for (const path of knowledgePaths) {
    try {
      const res = await fetch(path, fetchOpts);
      if (res.ok) {
        knowledgeIndex = await res.json();
        break;
      }
    } catch (_) {}
  }

  // Fallback si fetch es bloqueado por política CORS de file:///
  if (!featureData && typeof window !== 'undefined' && window.__FALLBACK_DATA__) {
    featureData = window.__FALLBACK_DATA__.featureList || null;
    currentSpec = window.__FALLBACK_DATA__.currentSpec || {};
    historyData = window.__FALLBACK_DATA__.historyData || { records: [] };
    projectSpec = window.__FALLBACK_DATA__.projectSpec || null;
    knowledgeIndex = window.__FALLBACK_DATA__.knowledgeIndex || null;
  }

  if (!projectSpec && typeof window !== 'undefined' && window.__FALLBACK_DATA__?.projectSpec) {
    projectSpec = window.__FALLBACK_DATA__.projectSpec;
  }
  if (!knowledgeIndex && typeof window !== 'undefined' && window.__FALLBACK_DATA__?.knowledgeIndex) {
    knowledgeIndex = window.__FALLBACK_DATA__.knowledgeIndex;
  }

  if (!featureData) {
    featureData = {
      project: 'Proyecto (Modo Local)',
      features: []
    };
  }

  return {
    project: featureData.project || 'Proyecto',
    features: Array.isArray(featureData.features) ? featureData.features : [],
    currentSpec,
    historyData,
    projectSpec,
    knowledgeIndex,
    protocol: typeof window !== 'undefined' ? (window.location?.protocol || 'http:') : 'http:'
  };
}

/**
 * Inicia el monitoreo reactivo de cambios en los JSON.
 * Detecta automáticamente cuando un agente o humano actualiza feature_list.json o current.json.
 */
export function startAutoSync({ onUpdate, intervalMs = 2500 } = {}) {
  // En protocolo file:// no hay soporte de polling fetch por política de seguridad del navegador
  if (typeof window !== 'undefined' && window.location?.protocol === 'file:') {
    return {
      stop: () => {}
    };
  }

  let isRunning = true;
  let lastFingerprint = '';

  const checkUpdates = async () => {
    if (!isRunning) return;
    try {
      const data = await fetchProjectData({ bypassCache: true });
      
      // Fingerprint ligero y determinista
      const fingerprint = JSON.stringify({
        project: data.project,
        featuresCount: data.features.length,
        features: data.features.map(f => ({
          id: f.id,
          status: f.status,
          priority: f.priority,
          weight: f.weight,
          branch: f.branch,
          depends_on: f.depends_on || f.dependencies || []
        })),
        currentSpec: {
          id: data.currentSpec?.id,
          name: data.currentSpec?.name,
          status: data.currentSpec?.status,
          taskCount: (data.currentSpec?.tasks || []).length,
          tasksDone: (data.currentSpec?.tasks || []).filter(t => t.done || t.status === 'done').length
        },
        historyCount: (data.historyData?.records || []).length
      });

      if (!lastFingerprint) {
        lastFingerprint = fingerprint;
      } else if (fingerprint !== lastFingerprint) {
        lastFingerprint = fingerprint;
        if (typeof onUpdate === 'function') {
          onUpdate(data);
        }
      }
    } catch (_) {
      // Ignorar fallos de red silenciosamente
    }
  };

  const timerId = setInterval(checkUpdates, intervalMs);

  return {
    stop: () => {
      isRunning = false;
      clearInterval(timerId);
    }
  };
}

export async function fetchPlaneData(options = {}) {
  // Protocolo file:///: resolver inmediatamente con window.__PLANE_DATA__ o window.__FALLBACK_DATA__
  if (typeof window !== 'undefined' && window.location?.protocol === 'file:') {
    const fallback = window.__PLANE_DATA__ || (window.__FALLBACK_DATA__ && window.__FALLBACK_DATA__.planeData) || {};
    return fallback;
  }

  try {
    const res = await fetch('/api/plane/data');
    if (res.ok) {
      return await res.json();
    }
  } catch (_) {}

  return window.__PLANE_DATA__ || (window.__FALLBACK_DATA__ && window.__FALLBACK_DATA__.planeData) || {};
}

export async function updatePlaneIssue(issueId, updates = {}) {
  if (typeof window !== 'undefined' && window.location?.protocol === 'file:') {
    if (window.__PLANE_DATA__ && Array.isArray(window.__PLANE_DATA__.issues)) {
      const issue = window.__PLANE_DATA__.issues.find(i => i.id === issueId);
      if (issue) Object.assign(issue, updates);
    }
    return { ok: true };
  }

  try {
    const res = await fetch(`/api/plane/issues/${encodeURIComponent(issueId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('[API] Error actualizando issue:', e);
  }
  return { ok: false };
}

export async function updatePlanePage(pageId, markdownContent) {
  if (typeof window !== 'undefined' && window.location?.protocol === 'file:') {
    if (window.__PLANE_DATA__ && Array.isArray(window.__PLANE_DATA__.pages)) {
      const page = window.__PLANE_DATA__.pages.find(p => p.id === pageId);
      if (page) page.content_markdown = markdownContent;
    }
    return { ok: true };
  }

  try {
    const res = await fetch(`/api/plane/pages/${encodeURIComponent(pageId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content_markdown: markdownContent })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('[API] Error actualizando página:', e);
  }
  return { ok: false };
}

export const api = {
  fetchAll: fetchProjectData,
  fetchPlaneData,
  updatePlaneIssue,
  updatePlanePage,
  startAutoSync,
  startPolling: startAutoSync
};
