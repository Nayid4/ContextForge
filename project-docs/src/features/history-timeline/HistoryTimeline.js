import { renderBadge } from '../../shared/Badge.js';
import { Icons } from '../../shared/Icons.js';

/**
 * HistoryTimeline: Línea de tiempo de auditoría y trazabilidad histórica de features completadas con soporte claro/oscuro.
 * @param {Object} props
 * @param {Array} props.history - Entradas de history.json
 * @param {Array} props.features - Lista de features para cruzar metadatos
 * @returns {string} HTML markup
 */
export function renderHistoryTimeline({ history, features }) {
  const records = history?.records || history || [];

  if (!records || records.length === 0) {
    return `
      <div class="p-12 text-center bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="w-16 h-16 mx-auto mb-4 text-slate-400 dark:text-slate-600 flex items-center justify-center">
          ${Icons.clock}
        </div>
        <h4 class="text-lg font-semibold text-slate-800 dark:text-slate-300 mb-1">Sin historial de ejecuciones aún</h4>
        <p class="text-sm text-slate-500 max-w-md mx-auto">
          A medida que las features y bugfixes completen el flujo SDD y pasen la revisión del subagente <code class="text-indigo-600 dark:text-indigo-400">reviewer</code>, las entradas se registrarán aquí automáticamente desde <code class="text-indigo-600 dark:text-indigo-400">project-docs/progres/history.json</code>.
        </p>
      </div>
    `;
  }

  const itemsHtml = records.map((rec, idx) => {
    const isFirst = idx === 0;
    const branchName = rec.branch || `${rec.type || 'feature'}/INT-${String(rec.id).padStart(3, '0')}/${rec.name || 'task'}`;

    return `
      <div class="relative pl-8 pb-8 group last:pb-0">
        <!-- Línea conectora -->
        <div class="absolute top-3 left-3 -ml-[1px] h-full w-0.5 bg-slate-200 dark:bg-slate-800 group-last:hidden"></div>

        <!-- Punto en la línea de tiempo -->
        <div class="absolute top-1.5 left-1 w-4 h-4 rounded-full border-2 ${
          isFirst 
            ? 'bg-emerald-500 border-emerald-400 shadow-md shadow-emerald-500/50' 
            : 'bg-white dark:bg-slate-900 border-indigo-500'
        } transition-transform group-hover:scale-125"></div>

        <!-- Contenido de la tarjeta de historial -->
        <div class="bg-white dark:bg-slate-900/70 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-400 dark:hover:border-slate-700 transition-all shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div class="flex items-center gap-2">
              <span class="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">INT-${String(rec.id).padStart(3, '0')}</span>
              ${renderBadge('type', rec.type || 'feature')}
              <span class="font-semibold text-slate-900 dark:text-slate-100 text-sm">${rec.title || rec.name}</span>
            </div>
            <div class="text-xs text-slate-500 dark:text-slate-400 font-mono">
              ${rec.completed_at || rec.date || 'Reciente'}
            </div>
          </div>

          <!-- Rama y Commit -->
          <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
            <span class="inline-flex items-center gap-1 font-mono text-[11px] bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              <span class="text-indigo-600 dark:text-indigo-400">${Icons.gitBranch}</span>
              ${branchName}
            </span>

            ${rec.commit ? `
              <span class="inline-flex items-center gap-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                <span>SHA:</span>
                <span class="text-indigo-600 dark:text-indigo-300 font-semibold">${rec.commit.substring(0, 7)}</span>
              </span>
            ` : ''}

            ${rec.executor ? `
              <span class="text-slate-500 text-xs">
                Por: <span class="text-slate-700 dark:text-slate-300">${rec.executor}</span>
              </span>
            ` : ''}
          </div>

          <!-- Descripción o notas -->
          ${rec.summary ? `
            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80">
              ${rec.summary}
            </p>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="max-w-3xl mx-auto py-4">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">Bitácora de Cierres de Tareas</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Registro cronológico de despliegues y trazabilidad SDD</p>
        </div>
        <span class="px-3 py-1 text-xs font-mono rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-xs">
          Total: ${records.length}
        </span>
      </div>

      <div class="relative">
        ${itemsHtml}
      </div>
    </div>
  `;
}
