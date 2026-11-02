/**
 * API Data Service to load feature_list.json, current.json and history.json
 */

export async function fetchProjectData() {
  let featureData = null;
  let currentSpec = {};
  let historyData = { records: [] };

  // Try relative and parent paths
  const featurePaths = ['feature_list.json', '../feature_list.json', './project-docs/feature_list.json'];
  const currentPaths = ['progres/current.json', 'progress/current.json', '../progress/current.json', '../project-docs/progres/current.json'];
  const historyPaths = ['progres/history.json', 'progress/history.json', '../progress/history.json', '../project-docs/progres/history.json'];

  for (const path of featurePaths) {
    try {
      const res = await fetch(path);
      if (res.ok) {
        featureData = await res.json();
        break;
      }
    } catch (_) {}
  }

  for (const path of currentPaths) {
    try {
      const res = await fetch(path);
      if (res.ok) {
        currentSpec = await res.json();
        break;
      }
    } catch (_) {}
  }

  for (const path of historyPaths) {
    try {
      const res = await fetch(path);
      if (res.ok) {
        historyData = await res.json();
        break;
      }
    } catch (_) {}
  }

  // Fallback si fetch es bloqueado por política CORS de file:///
  if (!featureData && typeof window !== 'undefined' && window.__FALLBACK_DATA__) {
    featureData = window.__FALLBACK_DATA__.featureList || null;
    currentSpec = window.__FALLBACK_DATA__.currentSpec || {};
    historyData = window.__FALLBACK_DATA__.historyData || { records: [] };
  }

  if (!featureData) {
    // Estado por defecto seguro para que la interfaz siempre se dibuje
    featureData = {
      project: 'Proyecto (Modo Local)',
      features: []
    };
  }

  return {
    project: featureData.project || 'Proyecto',
    features: Array.isArray(featureData.features) ? featureData.features : [],
    currentSpec,
    historyData
  };
}

export const api = {
  fetchAll: fetchProjectData
};
