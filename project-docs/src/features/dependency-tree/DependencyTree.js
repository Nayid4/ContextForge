import { renderBadge } from '../../shared/Badge.js';
import { Icons } from '../../shared/Icons.js';

/**
 * DependencyTree: Visualizador visual en SVG interactivo del árbol jerárquico de ejecución.
 * Calcula niveles topológicos y renderiza nodos con conectores directos con soporte modo claro y oscuro.
 */
export class DependencyTreeComponent {
  constructor(containerEl, { features, onSelect }) {
    this.container = containerEl;
    this.features = features || [];
    this.onSelect = onSelect;
    this.zoom = 1;
    this.pan = { x: 40, y: 40 };
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
  }

  render() {
    if (!this.container) return;

    const { levels, nodesMap } = this.calculateTopologicalLevels(this.features);

    const nodeWidth = 260;
    const nodeHeight = 110;
    const gapX = 100;
    const gapY = 40;

    let maxNodesInLevel = 0;
    levels.forEach(lvl => {
      if (lvl.length > maxNodesInLevel) maxNodesInLevel = lvl.length;
    });

    const totalWidth = Math.max(900, levels.length * (nodeWidth + gapX) + 120);
    const totalHeight = Math.max(500, maxNodesInLevel * (nodeHeight + gapY) + 120);

    levels.forEach((levelFeatures, colIndex) => {
      const colX = colIndex * (nodeWidth + gapX) + 60;
      const colHeight = levelFeatures.length * (nodeHeight + gapY) - gapY;
      const startY = Math.max(60, (totalHeight - colHeight) / 2);

      levelFeatures.forEach((f, rowIndex) => {
        const x = colX;
        const y = startY + rowIndex * (nodeHeight + gapY);
        nodesMap.set(f.id, { ...f, x, y, width: nodeWidth, height: nodeHeight, colIndex, rowIndex });
      });
    });

    const linksSvg = [];
    this.features.forEach(f => {
      const targetNode = nodesMap.get(f.id);
      const rawDeps = f.depends_on || f.dependencies || [];
      if (!targetNode || !rawDeps.length) return;

      rawDeps.forEach(sourceId => {
        const sourceNode = nodesMap.get(sourceId);
        if (!sourceNode) return;

        const startX = sourceNode.x + sourceNode.width;
        const startY = sourceNode.y + sourceNode.height / 2;
        const endX = targetNode.x;
        const endY = targetNode.y + targetNode.height / 2;
        const midX = (startX + endX) / 2;

        const pathD = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
        const isDone = sourceNode.status === 'done';

        linksSvg.push(`
          <path d="${pathD}" 
                fill="none" 
                stroke="${isDone ? '#10b981' : '#6366f1'}" 
                stroke-width="2" 
                stroke-dasharray="${isDone ? 'none' : '4 4'}" 
                opacity="0.6"
                class="transition-all hover:opacity-100 hover:stroke-width-3" />
        `);
      });
    });

    const nodesSvg = Array.from(nodesMap.values()).map(n => {
      const isDone = n.status === 'done';
      const isFeature = (n.type || 'feature') === 'feature';
      const borderColor = isDone ? 'border-emerald-500/60' : isFeature ? 'border-indigo-500/40' : 'border-rose-500/40';

      return `
        <foreignObject x="${n.x}" y="${n.y}" width="${n.width}" height="${n.height}">
          <div xmlns="http://www.w3.org/1999/xhtml" 
               data-node-id="${n.id}"
               class="p-3 w-full h-full rounded-xl bg-white dark:bg-slate-900/95 backdrop-blur-md border ${borderColor} shadow-lg hover:border-slate-500 transition-all cursor-pointer flex flex-col justify-between text-left select-none">
            <div>
              <div class="flex items-center justify-between text-[11px] mb-1">
                <span class="font-mono font-bold text-indigo-600 dark:text-indigo-400">INT-${String(n.id).padStart(3, '0')}</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded font-medium ${isDone ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}">
                  ${n.status}
                </span>
              </div>
              <div class="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">${n.title || n.name}</div>
            </div>
            <div class="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400">
              <span>${n.module || 'Core'}</span>
              <span class="font-mono text-slate-400 dark:text-slate-500">${n.type || 'feature'}</span>
            </div>
          </div>
        </foreignObject>
      `;
    }).join('');

    this.container.innerHTML = `
      <div class="relative w-full h-[650px] bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md flex flex-col">
        <!-- Barra de herramientas superior -->
        <div class="absolute top-4 right-4 z-20 flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-1.5 backdrop-blur-md shadow-lg">
          <button type="button" data-tree-action="zoom-in" class="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-bold" title="Acercar">+</button>
          <button type="button" data-tree-action="zoom-out" class="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-bold" title="Alejar">-</button>
          <button type="button" data-tree-action="reset" class="px-2 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold" title="Centrar">Reset</button>
        </div>

        <div class="absolute top-4 left-4 z-20 pointer-events-none text-xs text-slate-500 dark:text-slate-400">
          <span class="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-sm shadow-xs">
            💡 Arrastra para desplazar el lienzo | Clic en un nodo para detalle
          </span>
        </div>

        <div id="tree-canvas-wrapper" class="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden">
          <svg id="tree-svg" width="100%" height="100%" class="w-full h-full">
            <g id="tree-viewport" transform="translate(${this.pan.x}, ${this.pan.y}) scale(${this.zoom})">
              <defs>
                <pattern id="dot-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" class="fill-slate-300 dark:fill-slate-700" opacity="0.6"></circle>
                </pattern>
              </defs>
              <rect x="-1000" y="-1000" width="5000" height="5000" fill="url(#dot-grid)"></rect>

              <g class="tree-links">
                ${linksSvg.join('')}
              </g>

              <g class="tree-nodes">
                ${nodesSvg}
              </g>
            </g>
          </svg>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  calculateTopologicalLevels(features) {
    const nodesMap = new Map();
    const levels = [];
    const inDegrees = new Map();
    const adj = new Map();

    features.forEach(f => {
      const rawDeps = f.depends_on || f.dependencies || [];
      inDegrees.set(f.id, rawDeps.length);
      adj.set(f.id, []);
    });

    features.forEach(f => {
      const rawDeps = f.depends_on || f.dependencies || [];
      rawDeps.forEach(depId => {
        if (adj.has(depId)) {
          adj.get(depId).push(f.id);
        }
      });
    });

    let currentQueue = features.filter(f => {
      const rawDeps = f.depends_on || f.dependencies || [];
      return rawDeps.length === 0;
    });
    const visited = new Set();

    while (currentQueue.length > 0) {
      levels.push(currentQueue);
      currentQueue.forEach(f => visited.add(f.id));

      const nextQueue = [];
      currentQueue.forEach(f => {
        const neighbors = adj.get(f.id) || [];
        neighbors.forEach(nxtId => {
          if (!visited.has(nxtId)) {
            const nxtFeature = features.find(item => item.id === nxtId);
            if (nxtFeature && !nextQueue.includes(nxtFeature)) {
              nextQueue.push(nxtFeature);
            }
          }
        });
      });

      currentQueue = nextQueue;
    }

    const unvisited = features.filter(f => !visited.has(f.id));
    if (unvisited.length > 0) {
      levels.push(unvisited);
    }

    return { levels, nodesMap };
  }

  bindEvents() {
    const wrapper = this.container.querySelector('#tree-canvas-wrapper');
    const viewport = this.container.querySelector('#tree-viewport');

    const updateTransform = () => {
      if (viewport) {
        viewport.setAttribute('transform', `translate(${this.pan.x}, ${this.pan.y}) scale(${this.zoom})`);
      }
    };

    wrapper.addEventListener('mousedown', (e) => {
      if (e.target.closest('[data-node-id]') || e.target.closest('button')) return;
      this.isDragging = true;
      this.dragStart = { x: e.clientX - this.pan.x, y: e.clientY - this.pan.y };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.pan.x = e.clientX - this.dragStart.x;
      this.pan.y = e.clientY - this.dragStart.y;
      updateTransform();
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    wrapper.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.zoom = Math.min(Math.max(0.3, this.zoom * delta), 2.5);
      updateTransform();
    }, { passive: false });

    this.container.querySelector('[data-tree-action="zoom-in"]')?.addEventListener('click', () => {
      this.zoom = Math.min(2.5, this.zoom * 1.2);
      updateTransform();
    });

    this.container.querySelector('[data-tree-action="zoom-out"]')?.addEventListener('click', () => {
      this.zoom = Math.max(0.3, this.zoom * 0.8);
      updateTransform();
    });

    this.container.querySelector('[data-tree-action="reset"]')?.addEventListener('click', () => {
      this.zoom = 1;
      this.pan = { x: 40, y: 40 };
      updateTransform();
    });

    this.container.querySelectorAll('[data-node-id]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(el.getAttribute('data-node-id'), 10);
        const feature = this.features.find(f => f.id === id);
        if (feature && this.onSelect) {
          this.onSelect(feature);
        }
      });
    });
  }
}

export function mountDependencyTree(containerEl, { features, onSelect }) {
  const treeComp = new DependencyTreeComponent(containerEl, { features, onSelect });
  treeComp.render();
  return treeComp;
}
