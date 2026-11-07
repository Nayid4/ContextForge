/**
 * ConstellationService
 * Capa de datos para clasificar nodos en niveles piramidales 3D (Entrada, Dominio, Features, Persistencia).
 */
import { store } from '../../../core/store.js';

export class ConstellationService {
  getFeatures() {
    const state = store.getState();
    return state.features || [];
  }
}

export const constellationService = new ConstellationService();
