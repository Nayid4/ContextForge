import { Icons } from '../../../shared/Icons.js';
import { renderDependencyGraph } from '../components/DependencyGraph.js';

export function renderDependencyGraphView({
  features = [],
  graphMode = 'graph', // 'graph' | 'tree'
  onSelectFeature = () => {}
}) {
  return `
    <div class="p-6 space-y-6 max-w-7xl mx-auto">
      <!-- Header with Mode Switch -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            ${Icons.gitTree('w-5 h-5 text-indigo-400')}
            <span>Grafo & Árbol de Dependencias del Proyecto</span>
          </h1>
          <p class="text-xs text-zinc-400 mt-0.5">Topología técnica acíclica (DAG) y taxonomía de requerimientos.</p>
        </div>

        <!-- Mode Toggle -->
        <div class="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          <button id="toggle-graph-mode-dag" class="px-3 py-1.5 rounded-md text-xs font-semibold ${graphMode === 'graph' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}">
            Grafo en Malla (DAG)
          </button>
          <button id="toggle-graph-mode-tree" class="px-3 py-1.5 rounded-md text-xs font-semibold ${graphMode === 'tree' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}">
            Árbol Jerárquico
          </button>
        </div>
      </div>

      <!-- Graph Container Card -->
      <div class="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-xl overflow-hidden min-h-[500px]">
        <div id="dependency-interactive-target">
          ${renderDependencyGraph({ features })}
        </div>
      </div>
    </div>
  `;
}
