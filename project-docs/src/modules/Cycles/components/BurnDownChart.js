/**
 * BurnDownChart Component
 * Gráfico vectorial SVG puro para visualización de Burn-down de iteraciones/sprints.
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */

export function BurnDownChart({
  points = [],
  svgWidth = 600,
  svgHeight = 160,
  padding = 30
} = {}) {
  if (!points || points.length === 0) {
    return `
      <div class="h-40 flex items-center justify-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
        Sin datos de avance para generar el gráfico burn-down
      </div>
    `;
  }

  const maxVal = Math.max(...points.map(p => Math.max(p.ideal, p.remaining)), 5);
  const getX = (idx) => padding + (idx * ((svgWidth - (padding * 2)) / (points.length - 1)));
  const getY = (val) => svgHeight - padding - ((val / maxVal) * (svgHeight - (padding * 2)));

  const idealPath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.ideal)}`).join(' ');
  const realPath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.remaining)}`).join(' ');

  // Área bajo la curva real
  const areaPath = `${realPath} L ${getX(points.length - 1)} ${svgHeight - padding} L ${getX(0)} ${svgHeight - padding} Z`;

  return `
    <div class="w-full overflow-x-auto select-none" role="img" aria-label="Gráfico de Burn-down de Tareas">
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="w-full h-40 text-zinc-400">
        <defs>
          <linearGradient id="burndownGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6366f1" stop-opacity="0.3"></stop>
            <stop offset="100%" stop-color="#6366f1" stop-opacity="0.0"></stop>
          </linearGradient>
        </defs>

        <!-- Ejes y Líneas Guía -->
        <line x1="${padding}" y1="${svgHeight - padding}" x2="${svgWidth - padding}" y2="${svgHeight - padding}" stroke="#27272a" stroke-width="1"></line>
        <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${svgHeight - padding}" stroke="#27272a" stroke-width="1"></line>
        <line x1="${padding}" y1="${getY(maxVal / 2)}" x2="${svgWidth - padding}" y2="${getY(maxVal / 2)}" stroke="#27272a" stroke-dasharray="4 4" stroke-width="1"></line>

        <!-- Área bajo la curva -->
        <path d="${areaPath}" fill="url(#burndownGrad)"></path>

        <!-- Trayectoria Ideal (Línea punteada) -->
        <path d="${idealPath}" fill="none" stroke="#71717a" stroke-width="2" stroke-dasharray="4 4"></path>

        <!-- Trayectoria Real (Línea sólida) -->
        <path d="${realPath}" fill="none" stroke="#6366f1" stroke-width="2.5"></path>

        <!-- Puntos Reales con tooltip -->
        ${points.map((p, idx) => `
          <circle cx="${getX(idx)}" cy="${getY(p.remaining)}" r="4" class="fill-indigo-500 stroke-zinc-950 stroke-2 hover:r-6 transition-all cursor-pointer">
            <title>${p.label}: ${p.remaining} tareas restantes</title>
          </circle>
          <text x="${getX(idx)}" y="${svgHeight - 10}" text-anchor="middle" class="text-[10px] fill-zinc-400 font-mono">
            ${p.label}
          </text>
        `).join('')}
      </svg>
    </div>
  `;
}
