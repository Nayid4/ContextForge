/**
 * ModuleService
 * Capa de datos para extraer los modulos / bounded contexts y sus metricas asociadas.
 */
import { store } from '../../../core/store.js';

export class ModuleService {
  getModules() {
    const state = store.getState();
    return state.planeData?.modules || state.projectSpec?.modules || [];
  }

  getModuleById(id) {
    const modules = this.getModules();
    return modules.find(m => m.id === id || m.name === id) || null;
  }
}

export const moduleService = new ModuleService();
