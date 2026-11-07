/**
 * GraphService
 * Capa de datos para resolver grafos de dependencias tecnicas y jerarquia de features.
 */
import { store } from '../../../core/store.js';

export class GraphService {
  getFeatures() {
    const state = store.getState();
    return state.features || [];
  }

  getDependencies() {
    const features = this.getFeatures();
    const deps = [];
    features.forEach(f => {
      if (Array.isArray(f.dependencies)) {
        f.dependencies.forEach(depId => {
          deps.push({ source: depId, target: f.id });
        });
      }
    });
    return deps;
  }
}

export const graphService = new GraphService();
