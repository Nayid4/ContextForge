/**
 * Analytics Domain Module (Screaming Architecture)
 * Metricas de Entrega, Velocidad de Desarrollo y Balance de Trabajo de Agentes SDD.
 */
export { AnalyticsService, analyticsService } from './services/analytics.service.js';
export { analyticsStore } from './store/analytics.store.js';
export {
  renderAnalyticsView,
  AnalyticsPage
} from './pages/AnalyticsPage.js';
