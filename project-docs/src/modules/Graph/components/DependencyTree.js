import { renderBadge } from '../../../shared/Badge.js';
import { Icons } from '../../../shared/Icons.js';

/**
 * DependencyTreeComponent: Árbol Jerárquico Estricto del Proyecto.
 * 
 * Principios Matemáticos y Conceptuales:
 * 1. Nodo Raíz Único: El Proyecto es la única raíz (Nivel 0).
 * 2. Padre Único Estricto: Cada nodo hijo tiene exactamente UN ÚNICO padre (Nivel 1: Módulos; Nivel 2: Features/Bugfixes; Nivel 3: Subtareas/Hojas).
 * 3. Cero Ciclos: Estructura 100% acíclica por definición.
 * 4. Conectividad y Aristas: Siempre es conexo y posee exactamente N - 1 aristas para N nodos.
 * 
 * Heurísticas UI/UX:
 * - Colapso/expansión interactivo de ramas.
 * - Líneas de conexión jerárquicas ortogonales (árbol de taxonomía).
 * - Comparativa pedagógica Grafo vs Árbol integrada.
 */
export class DependencyTreeComponent {
  constructor(containerEl, { features, currentSpec, onSelect }) {
    this.container = containerEl;
    this.features = features || [];
    this.currentSpec = currentSpec || {};
    this.onSelect = onSelect;
    
    // Estado de colapso de ramas (por defecto módulos expandidos)
    this.collapsedNodes = new Set();
  }

  toggleNode(nodeKey) {
    if (this.collapsedNodes.has(nodeKey)) {
      this.collapsedNodes.delete(nodeKey);
    } else {
      this.collapsedNodes.add(nodeKey);
    }
    this.render();
  }

  expandAll() {
    this.collapsedNodes.clear();
    this.render();
  }

  collapseToModules() {
    this.collapsedNodes.clear();
    // Colapsar todas las features para dejar solo visibles los módulos
    this.features.forEach(f => {
      this.collapsedNodes.add(`feature-${f.id}`);
    });
    this.render();
  }

  collapseAll() {
    const modules = Array.from(new Set(this.features.map(f => f.module || 'core')));
    modules.forEach(m => this.collapsedNodes.add(`module-${m}`));
    this.features.forEach(f => this.collapsedNodes.add(`feature-${f.id}`));
    this.render();
  }

  render() {
    if (!this.container) return;

    // 1. Construir Jerarquía Estricta (Raíz -> Módulos -> Tareas -> Subtareas)
    const projectName = this.features[0]?.project || 'CloudSaaS Platform';
    const modulesMap = new Map();

    this.features.forEach(f => {
      const mod = f.module || 'core';
      if (!modulesMap.has(mod)) {
        modulesMap.set(mod, []);
      }
      modulesMap.get(mod).push(f);
    });

    const totalFeatures = this.features.length;
    const totalModules = modulesMap.size;
    const completedFeatures = this.features.filter(f => f.status === 'done').length;

    // Conteo de aristas del árbol: Raíz a Módulos (totalModules) + Módulos a Features (totalFeatures) + Features a Subtareas
    let totalSubtasks = 0;
    this.features.forEach(f => {
      if (f.id === this.currentSpec?.id && Array.isArray(this.currentSpec?.tasks)) {
        totalSubtasks += this.currentSpec.tasks.length;
      } else if (Array.isArray(f.acceptance)) {
        totalSubtasks += Math.min(f.acceptance.length, 3);
      }
    });

    const totalTreeNodes = 1 + totalModules + totalFeatures + totalSubtasks;
    const totalTreeEdges = totalTreeNodes - 1; // Teorema: Árbol con N nodos tiene N - 1 aristas

    // 2. Renderizar Nodos de Módulos y sus Ramas
    const modulesHtml = Array.from(modulesMap.entries()).map(([moduleName, moduleFeatures], modIdx) => {
      const modKey = `module-${moduleName}`;
      const isModCollapsed = this.collapsedNodes.has(modKey);
      const modDoneCount = moduleFeatures.filter(f => f.status === 'done').length;
      const modTotal = moduleFeatures.length;
      const modProgressPct = Math.round((modDoneCount / modTotal) * 100);

      // Features del módulo
      const featuresHtml = moduleFeatures.map((f, featIdx) => {
        const featKey = `feature-${f.id}`;
        const isFeatCollapsed = this.collapsedNodes.has(featKey);
        const isDone = f.status === 'done';
        const isProg = f.status === 'in_progress';
        const isBug = f.type === 'bugfix';
        const weightVal = f.weight || (f.priority === 'P0' ? 95 : f.priority === 'P1' ? 75 : 50);

        // Subtareas u hojas (Nivel 3)
        let subtasks = [];
        if (f.id === this.currentSpec?.id && Array.isArray(this.currentSpec?.tasks)) {
          subtasks = this.currentSpec.tasks.map(t => ({
            name: t.name || t.title,
            done: t.done || t.status === 'done'
          }));
        } else if (Array.isArray(f.acceptance)) {
          subtasks = f.acceptance.slice(0, 3).map(a => ({
            name: a,
            done: isDone
          }));
        }

        const subtasksHtml = subtasks.map((sub, sIdx) => {
          const isLastSub = sIdx === subtasks.length - 1;
          return `
            <div class="relative flex items-center gap-2 pl-6 py-1 text-xs group">
              <!-- Conector Ortogonal de Hoja -->
              <div class="absolute left-1.5 top-0 w-3 h-3.5 border-l-2 border-b-2 border-slate-300 dark:border-slate-700/80 rounded-bl-sm"></div>
              
              <span class="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${sub.done ? 'bg-emerald-500 text-white' : 'border border-slate-400 dark:border-slate-600 text-slate-400'}">
                ${sub.done ? Icons.check('w-2.5 h-2.5') : '○'}
              </span>
              <span class="truncate text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200">
                ${escapeHtml(sub.name)}
              </span>
            </div>
          `;
        }).join('');

        const isLastFeat = featIdx === moduleFeatures.length - 1;

        return `
          <div class="relative pl-6 pt-2">
            <!-- Guía Vertical del Padre (Módulo) -->
            ${!isLastFeat ? '<div class="absolute left-2 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800"></div>' : ''}
            <!-- Conector Ortogonal hacia la Feature -->
            <div class="absolute left-2 top-5 w-4 h-0.5 bg-slate-200 dark:bg-slate-800"></div>

            <!-- Tarjeta de Feature (Nivel 2) -->
            <div class="rounded-xl border ${isProg ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm' : isDone ? 'border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/15' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80'} p-3 shadow-xs hover:border-indigo-400 transition-all">
              
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <!-- Botón Colapsar Subtareas -->
                  <button type="button" 
                          data-tree-toggle="${featKey}"
                          class="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                          title="${isFeatCollapsed ? 'Expandir subtareas' : 'Colapsar subtareas'}">
                    ${isFeatCollapsed ? '+' : '−'}
                  </button>

                  <span class="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">INT-${String(f.id).padStart(3, '0')}</span>
                  
                  <span class="text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${isBug ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}">
                    ${f.type || 'feat'}
                  </span>

                  <!-- Peso Entero -->
                  <span class="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-900/60"
                        title="Peso de importancia: ${weightVal}/100">
                    Peso: ${weightVal}
                  </span>

                  <span class="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    ${escapeHtml(f.title || f.name)}
                  </span>
                </div>

                <div class="flex items-center gap-2 text-xs">
                  <span class="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${isDone ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : isProg ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 animate-pulse' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}">
                    ${f.status}
                  </span>

                  <button type="button" 
                          data-action="view-detail" 
                          data-id="${f.id}" 
                          class="px-2 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium transition-colors cursor-pointer">
                    Ver Spec
                  </button>
                </div>
              </div>

              <!-- Hojas / Subtareas (Nivel 3) -->
              ${!isFeatCollapsed && subtasks.length > 0 ? `
                <div class="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-0.5">
                  <div class="text-[10px] uppercase font-mono font-bold text-slate-400 mb-1 pl-6">
                    Subtareas de Implementación (${subtasks.filter(s => s.done).length}/${subtasks.length}):
                  </div>
                  ${subtasksHtml}
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');

      const isLastMod = modIdx === modulesMap.size - 1;

      return `
        <div class="relative pl-6 pt-4">
          <!-- Guía Vertical de la Raíz -->
          ${!isLastMod ? '<div class="absolute left-2.5 top-0 bottom-0 w-0.5 bg-indigo-300 dark:bg-indigo-900/60"></div>' : ''}
          <!-- Conector Ortogonal hacia el Módulo -->
          <div class="absolute left-2.5 top-8 w-4 h-0.5 bg-indigo-300 dark:bg-indigo-900/60"></div>

          <!-- Tarjeta de Módulo (Nivel 1) -->
          <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 backdrop-blur-md p-3.5 shadow-xs">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5">
                <button type="button" 
                        data-tree-toggle="${modKey}"
                        class="w-6 h-6 rounded-lg bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                        title="${isModCollapsed ? 'Expandir módulo' : 'Colapsar módulo'}">
                  ${isModCollapsed ? '+' : '−'}
                </button>

                <div class="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold font-mono">
                  ${Icons.folder('w-3.5 h-3.5')}
                </div>

                <div>
                  <div class="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>Módulo: <span class="font-mono text-indigo-600 dark:text-indigo-400">${moduleName}</span></span>
                    <span class="text-xs font-normal text-slate-400">(${modTotal} tareas subordinadas)</span>
                  </div>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400">
                    Padre directo: <span class="font-semibold text-slate-700 dark:text-slate-300">Raíz del Proyecto</span>
                  </div>
                </div>
              </div>

              <!-- Progreso del Módulo -->
              <div class="flex items-center gap-3">
                <div class="text-right hidden sm:block">
                  <div class="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">${modDoneCount}/${modTotal} resueltas</div>
                  <div class="text-[10px] text-slate-400">${modProgressPct}% progreso</div>
                </div>
                <div class="w-16 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div class="h-full bg-indigo-500 rounded-full" style="width: ${modProgressPct}%"></div>
                </div>
              </div>
            </div>

            <!-- Ramas Hijas (Features del Módulo) -->
            ${!isModCollapsed ? `
              <div class="mt-2 space-y-1">
                ${featuresHtml}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    this.container.innerHTML = `
      <div class="space-y-6">
        
        <!-- Tarjeta Pedagógica: Grafo vs Árbol Jerárquico -->
        <div class="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/5 via-cyan-500/5 to-transparent border border-indigo-200/60 dark:border-indigo-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
              ${Icons.folder}
            </div>
            <div>
              <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Árbol Jerárquico Estricto (Taxonomía Padre → Hijos)
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold">
                  Estructura Conexa Acíclica
                </span>
              </h3>
              <p class="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
                A diferencia del <strong>Grafo DAG</strong> (malla de bloqueos cruzados donde un nodo puede tener múltiples padres), 
                el <strong>Árbol Jerárquico</strong> impone que cada nodo tenga <strong>exactamente un único padre</strong>: 
                <span class="font-mono text-indigo-600 dark:text-indigo-400">Proyecto (Raíz) → Módulos → Tareas → Subtareas</span>. 
                Posee exactamente <span class="font-mono font-bold">${totalTreeNodes - 1} aristas</span> para sus <span class="font-mono font-bold">${totalTreeNodes} nodos</span>.
              </p>
            </div>
          </div>

          <!-- Botones de Acción de Árbol -->
          <div class="flex items-center gap-2 shrink-0">
            <button type="button" 
                    data-action="tree-expand-all" 
                    class="px-2.5 py-1.5 text-xs rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer">
              + Expandir Todo
            </button>
            <button type="button" 
                    data-action="tree-collapse-modules" 
                    class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer">
              ${Icons.folder('w-3.5 h-3.5')} <span>Solo Módulos</span>
            </button>
          </div>
        </div>

        <!-- Contenedor del Árbol Visual con Conexiones Ortogonales -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 shadow-md">
          
          <!-- NODO RAÍZ ÚNICO (NIVEL 0) -->
          <div class="relative">
            <div class="p-4 rounded-2xl bg-indigo-600 text-white shadow-lg flex flex-wrap items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-xl shadow-xs">
                  ${Icons.cube('w-5 h-5')}
                </div>
                <div>
                  <div class="text-[11px] font-mono uppercase tracking-wider text-indigo-200 font-bold">Nodo Raíz (Nivel 0)</div>
                  <h2 class="text-lg font-bold tracking-tight">${escapeHtml(projectName)}</h2>
                </div>
              </div>

              <div class="flex items-center gap-4 text-xs font-mono">
                <span class="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15">
                  ${totalModules} Módulos
                </span>
                <span class="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15">
                  ${totalFeatures} Tareas
                </span>
                <span class="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15">
                  ${totalTreeEdges} Aristas (N - 1)
                </span>
              </div>
            </div>

            <!-- Subárboles de Módulos (Nivel 1 y sucesivos) -->
            <div class="mt-2 space-y-2">
              ${modulesHtml}
            </div>
          </div>
        </div>
      </div>
    `;

    // Vincular Eventos de Expansión/Colapso
    this.container.querySelectorAll('[data-tree-toggle]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const key = btn.getAttribute('data-tree-toggle');
        this.toggleNode(key);
      });
    });

    this.container.querySelectorAll('[data-action="tree-expand-all"]').forEach(btn => {
      btn.addEventListener('click', () => this.expandAll());
    });

    this.container.querySelectorAll('[data-action="tree-collapse-modules"]').forEach(btn => {
      btn.addEventListener('click', () => this.collapseToModules());
    });
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
