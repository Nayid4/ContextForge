/**
 * Re-export canónico de Badge desde shared/ui/Badge.js
 * Mantiene compatibilidad total hacia atrás con helpers legacy.
 */
import { Badge, renderBadge } from './ui/Badge.js';

export { Badge, renderBadge };

export function renderStatusBadge(status, customClasses = '') {
  return Badge.status(status, customClasses);
}

export function renderPriorityBadge(priority, customClasses = '') {
  return Badge.priority(priority, customClasses);
}
