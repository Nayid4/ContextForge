/**
 * ConstellationPage Component (Screaming Architecture)
 * Vista interactiva de la Constelacion Piramidal 3D en Three.js con estetica Plane.
 * 100% Vectorial, accesible y con cero emojis.
 */
import { Icons } from '../../../shared/Icons.js';

export function renderConstellation3DView() {
  return `
    <div class="p-6 space-y-6 max-w-7xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between shrink-0">
        <div>
          <h1 class="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            ${Icons.cube('w-5 h-5 text-indigo-400')}
            <span>Constelación Piramidal 3D (Three.js)</span>
          </h1>
          <p class="text-xs text-zinc-400 mt-0.5">Topología piramidal de 4 niveles arquitectónicos con flujo de partículas.</p>
        </div>

        <div class="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800">Arrastra para rotar · Rueda para zoom</span>
        </div>
      </div>

      <!-- 3D Canvas Mounting Container -->
      <div id="space-3d-canvas-container" class="flex-1 rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden relative shadow-2xl">
        <div class="absolute inset-0 flex items-center justify-center text-xs text-zinc-500 font-mono">
          Iniciando motor Three.js...
        </div>
      </div>
    </div>
  `;
}

export const ConstellationPage = renderConstellation3DView;
