// Theme Toggle & Toast Notification Controller
(function() {
  function updateThemeIcon() {
    const icon = document.getElementById('theme-toggle-icon');
    if (!icon) return;
    const isDark = document.documentElement.classList.contains('dark');
    icon.className = isDark ? 'fa-solid fa-sun text-xs text-amber-400' : 'fa-solid fa-moon text-xs';
  }
  window.toggleTheme = function() {
    const isDark = document.documentElement.classList.toggle('dark');
    document.documentElement.classList.toggle('light', !isDark);
    localStorage.setItem('contextforge_theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
    if (window.renderMermaidDiagrams) window.renderMermaidDiagrams();
  };
  document.addEventListener('DOMContentLoaded', updateThemeIcon);

  function showToast(type, message, title) {
    const box = document.getElementById('cf-toast-container');
    if (!box) return;
    const palette = {
      success: 'border-emerald-500/40 bg-white dark:bg-[#141824] text-slate-900 dark:text-white',
      error: 'border-rose-500/40 bg-white dark:bg-[#141824] text-slate-900 dark:text-white',
      warning: 'border-amber-500/40 bg-white dark:bg-[#141824] text-slate-900 dark:text-white',
      info: 'border-indigo-500/40 bg-white dark:bg-[#141824] text-slate-900 dark:text-white',
    };
    const icon = (window.CFIcons && window.CFIcons[type]) || '';
    const el = document.createElement('div');
    el.className = `pointer-events-auto rounded-xl border px-4 py-3 shadow-xl flex items-start gap-2.5 text-xs cf-fade-in-up ${palette[type] || palette.info}`;
    el.innerHTML = `<span class="mt-0.5">${icon}</span><div class="min-w-0 flex-1">${title ? `<div class="font-bold">${title}</div>` : ''}<div class="text-slate-600 dark:text-zinc-300">${message}</div></div>`;
    box.appendChild(el);
    setTimeout(() => { el.remove(); }, 4200);
  }
  window.$toast = {
    success: (m, t) => showToast('success', m, t || 'Éxito'),
    error: (m, t) => showToast('error', m, t || 'Error'),
    warning: (m, t) => showToast('warning', m, t || 'Atención'),
    info: (m, t) => showToast('info', m, t || 'Información'),
  };
})();
