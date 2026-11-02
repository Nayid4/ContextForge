/**
 * Badge UI Component
 */

const STATUS_CONFIG = {
  pending: {
    label: 'Pendiente',
    classes: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
  },
  spec_ready: {
    label: 'Spec Listo',
    classes: 'bg-amber-50 text-amber-800 ring-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-800'
  },
  in_progress: {
    label: 'En Progreso',
    classes: 'bg-blue-50 text-blue-700 ring-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:ring-blue-800'
  },
  done: {
    label: 'Completado',
    classes: 'bg-emerald-50 text-emerald-700 ring-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800'
  },
  blocked: {
    label: 'Bloqueado',
    classes: 'bg-rose-50 text-rose-700 ring-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-800'
  }
};

const PRIORITY_CONFIG = {
  alta: {
    label: 'Alta',
    classes: 'bg-rose-50 text-rose-700 ring-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-800'
  },
  media: {
    label: 'Media',
    classes: 'bg-amber-50 text-amber-700 ring-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-800'
  },
  baja: {
    label: 'Baja',
    classes: 'bg-slate-100 text-slate-700 ring-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
  }
};

const MODULE_CONFIG = {
  backend: {
    label: 'Backend',
    classes: 'bg-indigo-50 text-indigo-700 ring-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:ring-indigo-800'
  },
  frontend: {
    label: 'Frontend',
    classes: 'bg-purple-50 text-purple-700 ring-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:ring-purple-800'
  },
  infra: {
    label: 'Infra',
    classes: 'bg-sky-50 text-sky-700 ring-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:ring-sky-800'
  },
  domain: {
    label: 'Domain',
    classes: 'bg-emerald-50 text-emerald-700 ring-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800'
  },
  application: {
    label: 'Application',
    classes: 'bg-blue-50 text-blue-700 ring-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:ring-blue-800'
  }
};

const TYPE_CONFIG = {
  feature: {
    label: 'feature',
    classes: 'bg-cyan-50 text-cyan-800 ring-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-300 dark:ring-cyan-800 font-mono'
  },
  bugfix: {
    label: 'bugfix',
    classes: 'bg-rose-50 text-rose-800 ring-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-800 font-mono'
  }
};

export function Badge({ type, value, extraClasses = '' }) {
  let label = value;
  let classes = 'bg-slate-100 text-slate-700 ring-slate-200';

  if (type === 'status' && STATUS_CONFIG[value]) {
    label = STATUS_CONFIG[value].label;
    classes = STATUS_CONFIG[value].classes;
  } else if (type === 'priority' && PRIORITY_CONFIG[value]) {
    label = PRIORITY_CONFIG[value].label;
    classes = PRIORITY_CONFIG[value].classes;
  } else if (type === 'module') {
    const mod = (value || '').toLowerCase();
    label = MODULE_CONFIG[mod]?.label || value;
    classes = MODULE_CONFIG[mod]?.classes || 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300';
  } else if (type === 'type') {
    const t = (value || 'feature').toLowerCase();
    label = TYPE_CONFIG[t]?.label || value;
    classes = TYPE_CONFIG[t]?.classes || 'bg-slate-100 text-slate-700 ring-slate-200 font-mono';
  } else if (type === 'ready') {
    label = 'Listo';
    classes = 'bg-emerald-50 text-emerald-700 ring-emerald-400 font-semibold';
  } else if (type === 'blocked-dep') {
    label = 'Bloqueado por deps';
    classes = 'bg-rose-50 text-rose-700 ring-rose-400 font-semibold';
  }

  return `
    <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${classes} ${extraClasses}">
      ${label}
    </span>
  `;
}
