/**
 * Declarative Functional Component List Renderer (Screaming Architecture Helper)
 * Permite componer bucles repetitivos de componentes tipo React/Vue en Vanilla JS puro.
 * 100% Vectorial, sin emojis.
 */

export function renderList(items = [], renderItemFn, emptyMessageOrFn = '') {
  if (!items || !Array.isArray(items) || items.length === 0) {
    if (typeof emptyMessageOrFn === 'function') {
      return emptyMessageOrFn();
    }
    if (typeof emptyMessageOrFn === 'string' && emptyMessageOrFn.trim().length > 0) {
      return `
        <div class="p-8 text-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 text-xs text-zinc-400">
          <span>${emptyMessageOrFn}</span>
        </div>
      `;
    }
    return '';
  }

  return items.map((item, index) => renderItemFn(item, index, items)).join('');
}
