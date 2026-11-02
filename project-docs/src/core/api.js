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

  if (!featureData) {
    throw new Error('No se pudo cargar feature_list.json');
  }

  return {
    project: featureData.project || 'Proyecto',
    features: Array.isArray(featureData.features) ? featureData.features : [],
    currentSpec,
    historyData
  };
}
