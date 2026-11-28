window.renderSkeletonRows = function(count) {
  return Array.from({ length: count || 3 }).map(() =>
    '<div class="h-14 rounded-xl bg-slate-200 dark:bg-slate-800/70 animate-pulse"></div>'
  ).join('');
};
