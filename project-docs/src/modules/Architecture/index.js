/**
 * Architecture Domain Module (Screaming Architecture)
 * Modelado C4, Diagramas Mermaid, Stack Tecnologico, Invariantes y Metas de Negocio.
 */
export { ArchitectureService, architectureService } from './services/architecture.service.js';
export { architectureStore } from './store/architecture.store.js';
export {
  renderArchitectureDocs,
  renderArchitectureView
} from './pages/ArchitecturePage.js';
