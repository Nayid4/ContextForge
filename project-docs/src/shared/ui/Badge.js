/**
 * Reusable Badge Component for Status, Priority, Modules and Work Items
 * 100% Vectorial, accessible, sin dependencias externas ni emojis.
 */

const STATUS_CONFIG = {
  pending: {
    label: 'Pendiente',
    classes: 'bg-zinc-800 text-zinc-300 border-zinc-700/80'
  },
  spec_ready: {
    label: 'Spec Listo',
    classes: 'bg-amber-950/40 text-amber-300 border-amber-800/60'
  },
  in_progress: {
    label: 'En Progreso',
    classes: 'bg-indigo-950/40 text-indigo-300 border-indigo-800/60'
  },
  done: {
    label: 'Completado',
    classes: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
  },
  blocked: {
    label: 'Bloqueado',
    classes: 'bg-rose-950/40 text-rose-300 border-rose-800/60'
  }
};

const PRIORITY_CONFIG = {
  p0: { label: 'Urgente P0', classes: 'bg-rose-950/50 text-rose-300 border-rose-800/70' },
  p1: { label: 'Alta P1', classes: 'bg-amber-950/50 text-amber-300 border-amber-800/70' },
  p2: { label: 'Media P2', classes: 'bg-blue-950/50 text-blue-300 border-blue-800/70' },
  p3: { label: 'Baja P3', classes: 'bg-zinc-800 text-zinc-300 border-zinc-700/70' },
  urgent: { label: 'Urgente', classes: 'bg-rose-950/50 text-rose-300 border-rose-800/70' },
  urgente: { label: 'Urgente', classes: 'bg-rose-950/50 text-rose-300 border-rose-800/70' },
  high: { label: 'Alta', classes: 'bg-amber-950/50 text-amber-300 border-amber-800/70' },
  alta: { label: 'Alta', classes: 'bg-amber-950/50 text-amber-300 border-amber-800/70' },
  medium: { label: 'Media', classes: 'bg-blue-950/50 text-blue-300 border-blue-800/70' },
  media: { label: 'Media', classes: 'bg-blue-950/50 text-blue-300 border-blue-800/70' },
  low: { label: 'Baja', classes: 'bg-zinc-800 text-zinc-300 border-zinc-700/70' },
  baja: { label: 'Baja', classes: 'bg-zinc-800 text-zinc-300 border-zinc-700/70' }
};

export const Badge = {
  status(status = 'pending', customClasses = '') {
    const key = String(status).toLowerCase();
    const cfg = STATUS_CONFIG[key] || { label: status, classes: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
    return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${cfg.classes} ${customClasses}">${cfg.label}</span>`;
  },

  priority(priority = 'p2', customClasses = '') {
    const key = String(priority).toLowerCase();
    const cfg = PRIORITY_CONFIG[key] || { label: priority, classes: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
    return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${cfg.classes} ${customClasses}">${cfg.label}</span>`;
  },

  module(moduleName = '', customClasses = '') {
    return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border bg-zinc-900 text-zinc-300 border-zinc-800 ${customClasses}">${moduleName}</span>`;
  },

  agent(agentRole = 'implementer', customClasses = '') {
    const isQA = String(agentRole).toLowerCase().includes('qa') || String(agentRole).toLowerCase().includes('reviewer');
    const colorCls = isQA
      ? 'bg-purple-950/40 text-purple-300 border-purple-800/60'
      : 'bg-indigo-950/40 text-indigo-300 border-indigo-800/60';
    return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${colorCls} ${customClasses}">${agentRole}</span>`;
  },

  custom(text, classes = 'bg-zinc-800 text-zinc-300 border-zinc-700') {
    return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${classes}">${text}</span>`;
  }
};

/**
 * Función de compatibilidad para llamadas funcionales renderBadge(...)
 */
export function renderBadge(arg1, arg2, arg3 = '') {
  let type = 'status';
  let value = '';
  let extraClasses = '';

  if (typeof arg1 === 'object' && arg1 !== null) {
    type = arg1.type || 'status';
    value = arg1.value || '';
    extraClasses = arg1.extraClasses || '';
  } else {
    type = arg1 || 'status';
    value = arg2 || '';
    extraClasses = arg3 || '';
  }

  if (type === 'status') return Badge.status(value, extraClasses);
  if (type === 'priority') return Badge.priority(value, extraClasses);
  if (type === 'module') return Badge.module(value, extraClasses);
  if (type === 'agent') return Badge.agent(value, extraClasses);
  return Badge.custom(value || type, extraClasses);
}
