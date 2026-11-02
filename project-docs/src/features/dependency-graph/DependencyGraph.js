import { renderBadge } from '../../shared/Badge.js';
import { Icons } from '../../shared/Icons.js';

/**
 * DependencyGraph: Grafo Visual Dirigido (DAG) interactivo con análisis de impacto y ruta crítica.
 * Heurísticas UI/UX: visibilidad del estado de bloqueos, feedback inmediato al interactuar y atenuación de ruido.
 */
export function renderDependencyGraph({ features }) {
  if (!features || features.length === 0) {
    return `<div class="p-12 text-center text-slate-500 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">No hay datos de dependencias disponibles.</div>`;
  }

  const featureMap = new Map();
  features.forEach(f => featureMap.set(f.id, f));

  // 1. Análisis topológico y cálculo de columnas (Fases)
  const nodeLevels = new Map();
  
  function getDepth(id, visited = new Set()) {
    if (visited.has(id)) return 0;
    visited.add(id);
    const f = featureMap.get(id);
    if (!f) return 0;
    const deps = f.depends_on || f.dependencies || [];
    if (!deps.length) return 0;
    return 1 + Math.max(...deps.map(dId => getDepth(dId, new Set(visited))));
  }

  features.forEach(f => {
    nodeLevels.set(f.id, getDepth(f.id));
  });

  const maxLevel = Math.max(...Array.from(nodeLevels.values()), 0);
  const levels = [];
  for (let i = 0; i <= maxLevel; i++) levels.push([]);
  features.forEach(f => {
    const lvl = nodeLevels.get(f.id) || 0;
    levels[lvl].push(f);
  });

  // Métricas
  const analyzed = features.map(f => {
    const rawDeps = f.depends_on || f.dependencies || [];
    const deps = rawDeps.map(dId => featureMap.get(dId)).filter(Boolean);
    const pendingDeps = deps.filter(d => d.status !== 'done');
    const isBlocked = f.status !== 'done' && pendingDeps.length > 0;
    const isReady = f.status === 'pending' && pendingDeps.length === 0;
    const dependents = features.filter(other => (other.depends_on || other.dependencies || []).includes(f.id));

    return {
      feature: f,
      deps,
      pendingDeps,
      isBlocked,
      isReady,
      dependents
    };
  });

  const blockedCount = analyzed.filter(a => a.isBlocked).length;
  const readyCount = analyzed.filter(a => a.isReady).length;
  const doneCount = analyzed.filter(a => a.feature.status === 'done').length;

  // 2. Coordenadas de Nodos para Renderizado en SVG Canvas
  const colWidth = 260;
  const nodeHeight = 85;
  const gapY = 30;
  const gapX = 80;

  let maxRowInCol = 0;
  levels.forEach(lvl => {
    if (lvl.length > maxRowInCol) maxRowInCol = lvl.length;
  });

  const totalWidth = Math.max(920, levels.length * (colWidth + gapX) + 80);
  const totalHeight = Math.max(480, maxRowInCol * (nodeHeight + gapY) + 100);

  const coords = new Map();
  levels.forEach((colFeatures, colIdx) => {
    const x = colIdx * (colWidth + gapX) + 40;
    const colHeight = colFeatures.length * (nodeHeight + gapY) - gapY;
    const startY = Math.max(50, (totalHeight - colHeight) / 2);

    colFeatures.forEach((f, rowIdx) => {
      const y = startY + rowIdx * (nodeHeight + gapY);
      coords.set(f.id, { x, y, width: colWidth, height: nodeHeight, colIdx, rowIdx });
    });
  });

  // 3. Generar Flechas Dirigidas de Enlace
  const edgesSvg = [];
  features.forEach(f => {
    const target = coords.get(f.id);
    const rawDeps = f.depends_on || f.dependencies || [];
    if (!target || !rawDeps.length) return;

    rawDeps.forEach(depId => {
      const source = coords.get(depId);
      const sourceFeature = featureMap.get(depId);
      if (!source || !sourceFeature) return;

      const isResolved = sourceFeature.status === 'done';
      const startX = source.x + source.width;
      const startY = source.y + source.height / 2;
      const endX = target.x;
      const endY = target.y + target.height / 2;
      const midX = (startX + endX) / 2;

      const pathD = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
      
      const strokeColor = isResolved ? '#10b981' : '#f43f5e';
      const markerId = isResolved ? 'arrow-resolved' : 'arrow-blocked';

      edgesSvg.push(`
        <path d="${pathD}" 
              data-edge-from="${depId}" 
              data-edge-to="${f.id}" 
              class="graph-edge transition-all duration-200" 
              fill="none" 
              stroke="${strokeColor}" 
              stroke-width="2" 
              stroke-dasharray="${isResolved ? 'none' : '4 4'}" 
              opacity="0.65" 
              marker-end="url(#${markerId})" />
      `);
    });
  });

  // 4. Generar Nodos SVG ForeignObject
  const nodesSvg = features.map(f => {
    const pos = coords.get(f.id);
    if (!pos) return '';
    const isDone = f.status === 'done';
    const isProg = f.status === 'in_progress';
    const rawDeps = f.depends_on || f.dependencies || [];
    const pendingDeps = rawDeps.filter(dId => {
      const dep = featureMap.get(dId);
      return dep && dep.status !== 'done';
    });
    const isBlocked = f.status !== 'done' && pendingDeps.length > 0;
    const isReady = f.status === 'pending' && pendingDeps.length === 0;

    let borderClass = 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90';
    let statusDot = 'bg-slate-400';

    if (isDone) {
      borderClass = 'border-emerald-500/60 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs';
      statusDot = 'bg-emerald-500';
    } else if (isProg) {
      borderClass = 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-md ring-2 ring-indigo-500/20';
      statusDot = 'bg-indigo-500 animate-pulse';
    } else if (isBlocked) {
      borderClass = 'border-rose-400 dark:border-rose-500/60 bg-rose-50/50 dark:bg-rose-950/20';
      statusDot = 'bg-rose-500';
    } else if (isReady) {
      borderClass = 'border-cyan-400 dark:border-cyan-500/60 bg-cyan-50/50 dark:bg-cyan-950/20 shadow-xs';
      statusDot = 'bg-cyan-500';
    }

    const branchName = f.branch || `${f.type || 'feature'}/INT-${String(f.id).padStart(3, '0')}/${f.name}`;

    return `
      <foreignObject x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}">
        <div xmlns="http://www.w3.org/1999/xhtml"
             data-graph-node="${f.id}"
             data-deps="${rawDeps.join(',')}"
             class="graph-node p-2.5 w-full h-full rounded-xl border ${borderClass} backdrop-blur-md shadow-sm transition-all duration-200 cursor-pointer select-none flex flex-col justify-between hover:scale-[1.02] hover:shadow-md"
             title="${branchName}">
          <div>
            <div class="flex items-center justify-between gap-1 mb-1">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full ${statusDot}"></span>
                <span class="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">INT-${String(f.id).padStart(3, '0')}</span>
                <span class="text-[10px] font-mono px-1 py-0.2 rounded font-semibold ${f.type === 'bugfix' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}">
                  ${f.type || 'feat'}
                </span>
              </div>
              <span class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                ${f.status}
              </span>
            </div>
            <div class="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate leading-tight">
              ${f.title || f.name}
            </div>
          </div>
          <div class="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <span>${f.module || 'Core'}</span>
            <span class="font-mono">${rawDeps.length ? `${rawDeps.length} dep${rawDeps.length > 1 ? 's' : ''}` : 'Raíz'}</span>
          </div>
        </div>
      </foreignObject>
    `;
  }).join('');

  // 5. Encabezados de Fase / Columnas
  const phaseHeaders = levels.map((lvl, colIdx) => {
    const x = colIdx * (colWidth + gapX) + 40;
    const titles = ['Fase 1: Fundamentos', 'Fase 2: Core Services', 'Fase 3: APIs & Lógica', 'Fase 4: Consumo & Workers', 'Fase 5: Extensión'];
    const title = titles[colIdx] || `Fase ${colIdx + 1}`;
    return `
      <div class="absolute top-2 font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-1 bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-lg backdrop-blur-xs pointer-events-none"
           style="left: ${x}px; width: ${colWidth}px;">
        ${title} (${lvl.length})
      </div>
    `;
  }).join('');

  return `
    <div class="space-y-6">
      <!-- Barra KPI de Grafo -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div class="text-xs text-slate-500 dark:text-slate-400">Listas para iniciar (Desbloqueadas)</div>
            <div class="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">${readyCount}</div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            ${Icons.check}
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div class="text-xs text-slate-500 dark:text-slate-400">Bloqueadas por predecesores</div>
            <div class="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">${blockedCount}</div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            ${Icons.clock}
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div class="text-xs text-slate-500 dark:text-slate-400">Resueltas en el flujo</div>
            <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">${doneCount}</div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            ${Icons.checkCircle}
          </div>
        </div>
      </div>

      <!-- Lienzo SVG Interactivo del Grafo Dirigido -->
      <div class="relative w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/80 shadow-md overflow-hidden">
        
        <!-- Controles y Leyenda Superior -->
        <div class="p-3 border-b border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              ${Icons.gitBranch} Grafo de Dependencias (DAG)
            </span>
            <span class="text-slate-400 dark:text-slate-500">|</span>
            <span class="text-slate-500 dark:text-slate-400 text-[11px]">
              Pasa el cursor sobre un nodo para aislar sus dependencias y dependientes
            </span>
          </div>

          <div class="flex items-center gap-3 text-[11px]">
            <span class="inline-flex items-center gap-1"><span class="w-2.5 h-0.5 bg-emerald-500"></span> Resuelta</span>
            <span class="inline-flex items-center gap-1"><span class="w-2.5 h-0.5 border-b border-dashed border-rose-500"></span> Bloqueo Activo</span>
          </div>
        </div>

        <!-- Canvas con Scroll Horizontal Suave -->
        <div id="graph-scroll-container" class="relative overflow-x-auto overflow-y-hidden p-6 min-h-[500px]">
          ${phaseHeaders}
          <svg width="${totalWidth}" height="${totalHeight}" class="w-full h-full block pt-6">
            <defs>
              <marker id="arrow-resolved" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
              </marker>
              <marker id="arrow-blocked" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
              </marker>
            </defs>

            <!-- Aristas de Grafo -->
            <g id="graph-edges-group">
              ${edgesSvg.join('')}
            </g>

            <!-- Nodos de Grafo -->
            <g id="graph-nodes-group">
              ${nodesSvg}
            </g>
          </svg>
        </div>
      </div>
    </div>
  `;
}
