import { Icons } from '../../../shared/Icons.js';
import { renderList } from '../../../shared/utils/renderList.js';
import { ModuleCard } from '../components/ModuleCard.js';

export function renderModulesView({
  modules = [],
  issues = [],
  onSelectIssue = () => {}
}) {
  return `
    <div class="p-6 space-y-6 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            ${Icons.moduleIcon('w-5 h-5 text-indigo-400')}
            <span>Módulos de Arquitectura (Epics / Bounded Contexts)</span>
          </h1>
          <p class="text-xs text-zinc-400 mt-0.5">Agrupación de dominios de negocio, servicios e historias del arnés.</p>
        </div>
      </div>

      <!-- Modules Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        ${renderList(modules, m => ModuleCard({ module: m, issues }), () => `
          <div class="col-span-full p-12 text-center text-xs text-zinc-500">
            No hay módulos registrados en la arquitectura.
          </div>
        `)}
      </div>
    </div>
  `;
}
