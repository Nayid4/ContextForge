/**
 * Modules Domain Module (Screaming Architecture)
 * Modulos de Arquitectura, Bounded Contexts y Epics estilo Plane.
 */
export { ModuleService, moduleService } from './services/module.service.js';
export { moduleStore } from './store/module.store.js';
export { ModuleCard } from './components/ModuleCard.js';
export {
  renderModulesView,
  ModulesPage
} from './pages/ModulesPage.js';
