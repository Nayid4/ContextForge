import { renderBadge } from '../../../shared/Badge.js';
import { Icons } from '../../../shared/Icons.js';

/**
 * DependencyGraph: Grafo Visual Dirigido (DAG) en Malla.
 * Concepto: Red de dependencias técnicas y bloqueos.
 * Restricciones: Malla flexible, múltiples predecesores/sucesores (in-degree y out-degree arbitrarios).
 * Heurísticas UI/UX:
 * - Canvas navegable con soporte de Zoom, Pan (arrastre) y ajuste automático sin recortes.
 * - Resaltado interactivo de camino de dependencias (hover isolation).
 * - Indicadores de estado de bloqueo y ruta crítica.
 */
export function renderDependencyGraph({ features }) {
  if (!features || features.length === 0) {
    return `<div class="p-12 text-center text-slate-500 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">No hay datos de dependencias disponibles.</div>`;
  }

  const featureMap = new Map();
  features.forEach(f => featureMap.set(f.id, f));

  // 1. Análisis topológico y cálculo de columnas (Fases del Grafo)
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

  // Métricas del Grafo
  let totalEdges = 0;
  let maxInDegree = 0;
  const analyzed = features.map(f => {
    const rawDeps = f.depends_on || f.dependencies || [];
    totalEdges += rawDeps.length;
    if (rawDeps.length > maxInDegree) maxInDegree = rawDeps.length;

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

  // 2. Dimensionamiento del Canvas y Coordenadas de Nodos
  const colWidth = 270;
  const nodeHeight = 98;
  const gapY = 32;
  const gapX = 110;
  const paddingX = 60;
  const paddingTop = 90;
  const paddingBottom = 60;

  let maxRowInCol = 0;
  levels.forEach(lvl => {
    if (lvl.length > maxRowInCol) maxRowInCol = lvl.length;
  });

  const canvasWidth = Math.max(1240, levels.length * (colWidth + gapX) + paddingX * 2);
  const canvasHeight = Math.max(640, maxRowInCol * (nodeHeight + gapY) + paddingTop + paddingBottom);

  const coords = new Map();
  levels.forEach((colFeatures, colIdx) => {
    const x = paddingX + colIdx * (colWidth + gapX);
    const colHeight = colFeatures.length * (nodeHeight + gapY) - gapY;
    const startY = paddingTop + Math.max(0, (canvasHeight - paddingTop - paddingBottom - colHeight) / 2);

    colFeatures.forEach((f, rowIdx) => {
      const y = startY + rowIdx * (nodeHeight + gapY);
      coords.set(f.id, { x, y, width: colWidth, height: nodeHeight, colIdx, rowIdx });
    });
  });

  // 3. Aristas Dirigidas Bézier con Flechas
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
      const deltaX = endX - startX;
      const ctrl1X = startX + deltaX * 0.45;
      const ctrl2X = endX - deltaX * 0.45;

      const pathD = `M ${startX} ${startY} C ${ctrl1X} ${startY}, ${ctrl2X} ${endY}, ${endX} ${endY}`;
      const strokeColor = isResolved ? '#10b981' : '#f43f5e';
      const markerId = isResolved ? 'arrow-resolved' : 'arrow-blocked';

      edgesSvg.push(`
        <path d="${pathD}" 
              data-edge-from="${depId}" 
              data-edge-to="${f.id}" 
              class="graph-edge transition-all duration-200" 
              fill="none" 
              stroke="${strokeColor}" 
              stroke-width="2.2" 
              stroke-dasharray="${isResolved ? 'none' : '5 4'}" 
              opacity="0.75" 
              marker-end="url(#${markerId})" />
      `);
    });
  });

  // 4. Nodos del Grafo (ForeignObject con UI enriquecida)
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

    let borderClass = 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/95';
    let statusDot = 'bg-slate-400';
    let glowClass = '';

    if (isDone) {
      borderClass = 'border-emerald-500/70 bg-emerald-50/60 dark:bg-emerald-950/25';
      statusDot = 'bg-emerald-500';
    } else if (isProg) {
      borderClass = 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/35 ring-2 ring-indigo-500/30';
      statusDot = 'bg-indigo-500 animate-pulse';
      glowClass = 'shadow-md shadow-indigo-500/10';
    } else if (isBlocked) {
      borderClass = 'border-rose-400 dark:border-rose-500/70 bg-rose-50/60 dark:bg-rose-950/25';
      statusDot = 'bg-rose-500';
    } else if (isReady) {
      borderClass = 'border-cyan-400 dark:border-cyan-500/70 bg-cyan-50/60 dark:bg-cyan-950/25';
      statusDot = 'bg-cyan-500';
    }

    const dependentsCount = features.filter(other => (other.depends_on || other.dependencies || []).includes(f.id)).length;
    const weightVal = f.weight || (f.priority === 'P0' ? 95 : f.priority === 'P1' ? 75 : 50);

    return `
      <foreignObject x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}">
        <div xmlns="http://www.w3.org/1999/xhtml"
             data-graph-node="${f.id}"
             data-deps="${rawDeps.join(',')}"
             class="graph-node p-3 w-full h-full rounded-2xl border ${borderClass} ${glowClass} backdrop-blur-md shadow-sm transition-all duration-200 cursor-pointer select-none flex flex-col justify-between hover:scale-[1.02] hover:shadow-lg"
             title="Clic para ver detalle de ${f.branch || f.name}">
          <div>
            <div class="flex items-center justify-between gap-1 mb-1">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full ${statusDot}"></span>
                <span class="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">INT-${String(f.id).padStart(3, '0')}</span>
                <span class="text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${f.type === 'bugfix' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}">
                  ${f.type || 'feat'}
                </span>
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-1 py-0.2 rounded border border-amber-200 dark:border-amber-900/60">
                  P:${weightVal}
                </span>
                <span class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  ${f.status}
                </span>
              </div>
            </div>
            <div class="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate leading-snug">
              ${f.title || f.name}
            </div>
          </div>
          <div class="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
            <span class="font-medium">${f.module || 'Core'}</span>
            <div class="flex items-center gap-2 font-mono text-[10px]">
              <span title="Dependencias requeridas">← ${rawDeps.length} req</span>
              <span title="Tareas que desbloquea">→ ${dependentsCount} dep</span>
            </div>
          </div>
        </div>
      </foreignObject>
    `;
  }).join('');

  // 5. Encabezados de Fase Topológica
  const phaseTitles = [
    'Fase 1: Fundamentos (Raíces)',
    'Fase 2: Arquitectura y Datos',
    'Fase 3: Lógica y Endpoints',
    'Fase 4: Integración & Workers',
    'Fase 5: Extensión & BI'
  ];

  const phaseHeaders = levels.map((lvl, colIdx) => {
    const x = paddingX + colIdx * (colWidth + gapX);
    const title = phaseTitles[colIdx] || `Fase ${colIdx + 1}`;
    return `
      <div class="absolute font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider px-3 py-1.5 bg-white/85 dark:bg-slate-900/85 border border-slate-200 dark:border-slate-800 rounded-xl backdrop-blur-md shadow-xs pointer-events-none"
           style="left: ${x}px; top: 20px; width: ${colWidth}px;">
        <div class="flex items-center justify-between">
          <span>${title}</span>
          <span class="px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">${lvl.length}</span>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="space-y-6">
      <!-- Barra KPI de Grafo -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div class="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div class="text-xs text-slate-500 dark:text-slate-400">Estructura de Red</div>
            <div class="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 font-mono">Grafo DAG (Malla)</div>
            <div class="text-[10px] text-slate-400 mt-0.5">${features.length} nodos · ${totalEdges} aristas</div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            ${Icons.gitBranch}
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div class="text-xs text-slate-500 dark:text-slate-400">Listas para Iniciar</div>
            <div class="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-0.5 font-mono">${readyCount}</div>
            <div class="text-[10px] text-cyan-600 dark:text-cyan-400 mt-0.5">Predecesores completos</div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            ${Icons.check}
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div class="text-xs text-slate-500 dark:text-slate-400">Bloqueadas Activas</div>
            <div class="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-0.5 font-mono">${blockedCount}</div>
            <div class="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">Esperando resolución</div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            ${Icons.clock}
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div class="text-xs text-slate-500 dark:text-slate-400">Tareas Resueltas</div>
            <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">${doneCount}</div>
            <div class="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Flujo completado</div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            ${Icons.checkCircle}
          </div>
        </div>
      </div>

      <!-- Lienzo SVG Interactivo del Grafo Dirigido (Sin Recorte) -->
      <div class="relative w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/90 shadow-md overflow-hidden">
        
        <!-- Barra de Herramientas y Leyenda Superior -->
        <div class="p-3 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              ${Icons.gitBranch} Grafo de Bloqueos y Dependencias (DAG)
            </span>
            <span class="text-slate-300 dark:text-slate-700">|</span>
            <span class="text-slate-500 dark:text-slate-400 text-[11px] hidden sm:inline">
              Pasa el cursor sobre un nodo para aislar sus dependientes y requerimientos
            </span>
          </div>

          <div class="flex items-center gap-4 text-[11px]">
            <span class="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span class="w-3 h-0.5 bg-emerald-500 rounded"></span> Satisfecha
            </span>
            <span class="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span class="w-3 h-0.5 border-b-2 border-dashed border-rose-500"></span> Bloqueo Activo
            </span>
            <span class="inline-flex items-center gap-1 text-slate-400 font-mono text-[10px]">
              [P:xx] = Peso
            </span>
          </div>
        </div>

        <!-- Canvas con Desplazamiento Suave y Sin Recorte -->
        <div id="graph-viewport-container" 
             class="relative overflow-x-auto overflow-y-auto p-4 max-h-[720px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 cursor-grab active:cursor-grabbing">
          
          <div class="relative" style="width: ${canvasWidth}px; height: ${canvasHeight}px;">
            ${phaseHeaders}

            <svg viewBox="0 0 ${canvasWidth} ${canvasHeight}" 
                 width="${canvasWidth}" 
                 height="${canvasHeight}" 
                 class="block">
              <defs>
                <marker id="arrow-resolved" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#10b981" />
                </marker>
                <marker id="arrow-blocked" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#f43f5e" />
                </marker>
              </defs>

              <!-- Aristas de Grafo (Conexiones de red) -->
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
    </div>
  `;
}
