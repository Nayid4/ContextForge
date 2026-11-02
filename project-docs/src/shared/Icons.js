/**
 * Lightweight SVG Icon Components con soporte dual (string directo y función parametrizada)
 */

function createIcon(svgInner, defaultCls = 'w-4 h-4') {
  const fn = (cls = defaultCls) => `
    <svg class="${cls}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${svgInner}
    </svg>`.trim();

  // Permite interpolación directa como string: ${Icons.search}
  fn.toString = () => fn(defaultCls);
  return fn;
}

export const Icons = {
  check: createIcon('<path d="M5 13l4 4L19 7"/>'),
  
  checkCircle: createIcon('<circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/>'),

  clock: createIcon('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),

  spinner: createIcon(`
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
  `, 'w-4 h-4 animate-spin'),

  alert: createIcon('<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>'),

  search: createIcon('<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>'),

  branch: createIcon('<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>'),

  gitBranch: createIcon('<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>'),

  folder: createIcon('<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>'),

  cube: createIcon('<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>'),

  eye: createIcon('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'),

  gitTree: createIcon('<path d="M4 6h16M4 12h16M4 18h7"/>'),

  chevronLeft: createIcon('<polyline points="15 18 9 12 15 6"/>'),

  chevronRight: createIcon('<polyline points="9 18 15 12 9 6"/>'),

  refresh: createIcon('<path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>'),

  close: createIcon('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'),

  sun: createIcon('<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'),

  moon: createIcon('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>')
};
