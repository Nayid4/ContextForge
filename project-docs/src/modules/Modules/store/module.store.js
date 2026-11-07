/**
 * ModuleStore
 * Estado reactivo local para la seleccion y filtrado de modulos de arquitectura.
 */
import { createStore } from '../../../core/store.js';

export const moduleStore = createStore({
  selectedModuleId: null,
  filterStatus: 'all'
});
