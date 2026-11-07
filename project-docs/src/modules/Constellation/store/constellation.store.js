/**
 * ConstellationStore
 * Estado reactivo local para la seleccion y animacion de nodos 3D.
 */
import { createStore } from '../../../core/store.js';

export const constellationStore = createStore({
  selectedNodeId: null,
  isRotating: true,
  cameraDistance: 600
});
