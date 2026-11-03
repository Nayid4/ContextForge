/**
 * Button UI Component
 */

export function renderTabButton({ id, label, icon = '', active = false, badge = null }) {
  const baseClasses = 'inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer select-none';
  const activeClasses = active
    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-900 border border-transparent hover:border-slate-300 dark:hover:border-slate-800';

  const badgeHtml = badge !== null
    ? `<span class="ml-1 px-1.5 py-0.2 text-[10px] font-mono rounded-full font-bold ${active ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}">${badge}</span>`
    : '';

  return `
    <button type="button" data-tab="${id}" class="${baseClasses} ${activeClasses}">
      <span class="shrink-0 flex items-center justify-center">${icon}</span>
      <span>${label}</span>
      ${badgeHtml}
    </button>
  `;
}

export function TabButton({ id, label, icon = '', active = false, badge = null, onClick }) {
  const baseClasses = 'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
  const activeClasses = active
    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800';

  const badgeHtml = badge !== null
    ? `<span class="ml-1 px-1.5 py-0.5 text-xs rounded-full ${active ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}">${badge}</span>`
    : '';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.dataset.tab = id;
  btn.className = `${baseClasses} ${activeClasses}`;
  btn.innerHTML = `${icon}<span>${label}</span>${badgeHtml}`;

  if (onClick) {
    btn.addEventListener('click', onClick);
  }

  return btn;
}

export function ActionButton({ label, icon = '', variant = 'primary', size = 'md', onClick, extraClasses = '' }) {
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-500 shadow-sm',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500 shadow-sm',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
  }[variant] || 'bg-indigo-600 text-white';

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base'
  }[size] || 'px-3.5 py-2 text-sm';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 ${variantClasses} ${sizeClasses} ${extraClasses}`;
  btn.innerHTML = `${icon}<span>${label}</span>`;

  if (onClick) {
    btn.addEventListener('click', onClick);
  }

  return btn;
}
