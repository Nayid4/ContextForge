/**
 * ArchitectureService
 * Capa de datos para extraer especificacion tecnica, diagramas C4 y stack tecnologico.
 * 100% Vectorial, resiliente y con cero dependencias externas.
 */
import { store } from '../../../core/store.js';

export class ArchitectureService {
  getProjectSpec() {
    const state = store.getState();
    return state.projectSpec || {};
  }

  getKnowledgeIndex() {
    const state = store.getState();
    return state.knowledgeIndex || {};
  }

  getModules() {
    const spec = this.getProjectSpec();
    return spec.modules || [];
  }

  getTechStack() {
    const spec = this.getProjectSpec();
    return spec.tech_stack || {};
  }

  getDiagrams() {
    const kData = this.getKnowledgeIndex();
    return kData.diagrams || [];
  }

  getLayers() {
    const spec = this.getProjectSpec();
    return spec.architecture?.layers || [];
  }
}

export const architectureService = new ArchitectureService();
