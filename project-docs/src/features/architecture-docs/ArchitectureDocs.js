import { Icons } from '../../shared/Icons.js';
import { renderMermaidViewer } from '../../shared/MermaidViewer.js';

/**
 * ArchitectureDocs Component: Vista técnica completa y 100% dinámica del proyecto.
 * Erradicación total de emojis por iconografía SVG técnica.
 * Purga de ruido y presentación compacta del Stack en Grid/Tabla estructurada.
 */
export function renderArchitectureDocs({ projectSpec, knowledgeIndex, features = [] }) {
  const spec = projectSpec || {};
  const kData = knowledgeIndex || {};
  const proj = spec.project || {};
  const tech = spec.tech_stack || {};
  const arch = spec.architecture || {};
  const modules = spec.modules || [];
  const goals = spec.business_goals || [];
  const diagrams = kData.diagrams || [];
  const layers = arch.layers || [];
  const patterns = arch.patterns || [];

  const featureMap = new Map();
  features.forEach(f => featureMap.set(f.id, f));

  // Preparación estructurada de filas del Stack Tecnológico
  const stackRows = buildStructuredStack(tech, spec);

  return `
    <div class="space-y-10">
      
      <!-- 1. HEADER: Propósito, Alcance y Metadatos del Sistema -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                ${proj.type || 'Sistema de Software'}
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                v${proj.version || '1.0.0'}
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                ${proj.maturity || 'Harness SDD'}
              </span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ${escapeHtml(proj.name || 'Proyecto de Software')}
            </h2>
            <p class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
              ${escapeHtml(proj.tagline || 'Arquitectura Canónica y Especificación Técnica')}
            </p>
          </div>

          <!-- Métricas Técnicas Compactas -->
          <div class="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-mono">
            <div>
              <div class="text-[10px] text-slate-400 uppercase tracking-wider">Módulos</div>
              <div class="font-bold text-slate-800 dark:text-slate-200 text-base">${modules.length}</div>
            </div>
            <div class="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
            <div>
              <div class="text-[10px] text-slate-400 uppercase tracking-wider">Stack Items</div>
              <div class="font-bold text-slate-800 dark:text-slate-200 text-base">${stackRows.length}</div>
            </div>
            <div class="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
            <div>
              <div class="text-[10px] text-slate-400 uppercase tracking-wider">Diagramas</div>
              <div class="font-bold text-indigo-600 dark:text-indigo-400 text-base">${diagrams.length}</div>
            </div>
          </div>
        </div>

        <!-- Descripción y Objetivos -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
          <div class="lg:col-span-2 space-y-3">
            <h3 class="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              ${Icons.folder} Propósito y Alcance del Sistema
            </h3>
            ${proj.description ? `
              <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                ${escapeHtml(proj.description)}
              </p>
            ` : `
              <div class="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
                No hay descripción registrada en <code>project-spec.json</code>. Ejecuta <code>/technical-audit</code> para generarla.
              </div>
            `}
          </div>

          <div class="space-y-3 lg:border-l lg:border-slate-200 lg:dark:border-slate-800 lg:pl-6">
            <h3 class="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              ${Icons.check} Objetivos Técnicos & de Negocio
            </h3>
            ${goals.length > 0 ? `
              <ul class="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                ${goals.map(g => `
                  <li class="flex items-start gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5"></span>
                    <span>${escapeHtml(g)}</span>
                  </li>
                `).join('')}
              </ul>
            ` : `
              <p class="text-xs text-slate-400 italic">No se han registrado objetivos explícitos en el spec.</p>
            `}
          </div>
        </div>
      </section>

      <!-- 2. DIAGRAMAS GENERALES DE ARQUITECTURA (C4, UML & ERD) -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                ${Icons.layers}
              </span>
              Diagramas de Arquitectura, UML & Persistencia
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Visualiza modelos C4, secuencias y el esquema relacional con renderizado interactivo y soporte de Draw.io
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button type="button" 
                    id="copy-active-mermaid-btn" 
                    class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5">
              ${Icons.copy} Copiar Mermaid / XML
            </button>
          </div>
        </div>

        <!-- Selector de Pestañas de Diagramas -->
        <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto text-xs font-medium" id="arch-diagram-nav">
          <button type="button" 
                  data-arch-tab="layers" 
                  class="arch-tab-btn active px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold transition-all cursor-pointer flex items-center gap-1.5">
            ${Icons.layers} Capas del Sistema
          </button>
          ${diagrams.map(diag => {
            const iconSvg = diag.type === 'C4 Model' ? Icons.architecture : diag.type === 'Database ERD' ? Icons.database : Icons.gitTree;
            return `
              <button type="button" 
                      data-arch-tab="${diag.id}" 
                      class="arch-tab-btn px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5">
                ${iconSvg} ${diag.title || diag.id}
              </button>
            `;
          }).join('')}
        </div>

        <!-- 2.1 PANEL: CAPAS DINÁMICAS DEL SISTEMA -->
        <div id="diagram-panel-layers" class="diagram-panel block mt-6">
          ${renderDynamicLayersPanel({ layers, modules, featureMap })}
        </div>

        <!-- 2.2 PANELES DE DIAGRAMAS MERMAID / DRAW.IO -->
        ${diagrams.map(diag => `
          <div id="diagram-panel-${diag.id}" class="diagram-panel hidden mt-6">
            ${renderMermaidViewer(diag)}
          </div>
        `).join('')}

      </section>

      <!-- 3. STACK DE TECNOLOGÍAS COMPACTO & TÉCNICO (TABLA ESTRUCTURADA) -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                ${Icons.cpu}
              </span>
              Stack Tecnológico & Matriz de Dependencias
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Catálogo técnico verificado por <code class="font-mono text-indigo-500">/technical-audit</code> libre de dependencias fantasma
            </p>
          </div>
          <span class="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            ${stackRows.length} componentes auditados
          </span>
        </div>

        <!-- Tabla Estructurada del Stack -->
        <div class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/80 text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th class="py-3 px-4 font-bold">Capa</th>
                <th class="py-3 px-4 font-bold">Tecnología / Herramienta</th>
                <th class="py-3 px-4 font-bold">Versión</th>
                <th class="py-3 px-4 font-bold">Propósito en el Sistema</th>
                <th class="py-3 px-4 font-bold">Estado</th>
                <th class="py-3 px-4 font-bold">Dependencias & Licencia</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              ${stackRows.map(row => `
                <tr class="hover:bg-white dark:hover:bg-slate-900 transition-colors">
                  <td class="py-3 px-4 whitespace-nowrap">
                    <span class="font-mono font-bold text-[11px] px-2 py-0.5 rounded ${row.layerBadgeClass}">
                      ${row.layer}
                    </span>
                  </td>
                  <td class="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    <div class="flex items-center gap-2">
                      <span class="text-indigo-600 dark:text-indigo-400">${row.iconSvg}</span>
                      <span>${escapeHtml(row.technology)}</span>
                    </div>
                  </td>
                  <td class="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    ${escapeHtml(row.version || 'Auto')}
                  </td>
                  <td class="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs">
                    ${escapeHtml(row.purpose)}
                  </td>
                  <td class="py-3 px-4 whitespace-nowrap">
                    <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${row.statusBadgeClass}">
                      <span class="w-1.5 h-1.5 rounded-full ${row.statusDotClass}"></span>
                      ${row.status}
                    </span>
                  </td>
                  <td class="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    ${escapeHtml(row.dependencies || 'Nativa / MIT')}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <!-- 4. PATRONES DE DISEÑO Y ARQUITECTURA -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="mb-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              ${Icons.cube}
            </span>
            Patrones de Diseño & Estilo de Arquitectura
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Estilo principal: <strong class="text-indigo-600 dark:text-indigo-400">${arch.style || 'Lógica desacoplada'}</strong>
          </p>
        </div>

        ${patterns.length > 0 ? `
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${patterns.map(pat => {
              const pName = typeof pat === 'string' ? pat : pat.name;
              const pType = typeof pat === 'string' ? 'Patrón Canónico' : pat.type || 'Patrón';
              const pDesc = typeof pat === 'string' ? 'Estándar arquitectónico adoptado en el repositorio.' : pat.description || '';
              return `
                <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 space-y-2">
                  <div class="flex items-center justify-between">
                    <h4 class="font-bold text-xs text-slate-900 dark:text-slate-100">${escapeHtml(pName)}</h4>
                    <span class="text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      ${escapeHtml(pType)}
                    </span>
                  </div>
                  <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    ${escapeHtml(pDesc)}
                  </p>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="p-6 text-center text-slate-400 text-xs rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
            No se han registrado patrones explícitos en <code>project-spec.json</code>.
          </div>
        `}
      </section>

      <!-- 5. MÓDULOS DEL SISTEMA IDENTIFICADOS -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="mb-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              ${Icons.folder}
            </span>
            Módulos del Sistema Identificados (${modules.length})
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Límites de contexto (Bounded Contexts) con trazabilidad hacia tareas INT-*
          </p>
        </div>

        ${modules.length > 0 ? `
          <div class="space-y-4">
            ${modules.map(mod => {
              const modFeatures = (mod.features || []).map(fIdStr => {
                const numId = parseInt(String(fIdStr).replace('INT-', ''), 10);
                return featureMap.get(numId);
              }).filter(Boolean);

              const doneFeatures = modFeatures.filter(f => f.status === 'done').length;
              const progressPct = modFeatures.length ? Math.round((doneFeatures / modFeatures.length) * 100) : 0;

              return `
                <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 space-y-3">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="flex items-center gap-2.5">
                      <span class="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono font-bold text-xs">
                        ${Icons.folder}
                      </span>
                      <div>
                        <h4 class="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span>${mod.name}</span>
                          <code class="text-xs font-mono text-indigo-600 dark:text-indigo-400">[${mod.id}]</code>
                        </h4>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${mod.purpose || ''}</p>
                      </div>
                    </div>

                    <!-- Progreso del Módulo -->
                    <div class="flex items-center gap-3">
                      <div class="text-right">
                        <div class="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">${doneFeatures}/${modFeatures.length} tareas resueltas</div>
                        <div class="text-[10px] text-slate-400">${progressPct}% completado</div>
                      </div>
                      <div class="w-16 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div class="h-full bg-indigo-500 rounded-full" style="width: ${progressPct}%"></div>
                      </div>
                    </div>
                  </div>

                  <!-- Responsabilidades -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs">
                    <div>
                      <span class="font-mono font-bold text-[10px] uppercase text-slate-400">Responsabilidades Principales:</span>
                      <ul class="mt-1 space-y-1 text-slate-600 dark:text-slate-300">
                        ${(mod.responsibilities || []).map(r => `
                          <li class="flex items-start gap-1.5">
                            <span class="text-indigo-500 font-bold shrink-0 mt-0.5">›</span>
                            <span>${escapeHtml(r)}</span>
                          </li>
                        `).join('')}
                      </ul>
                    </div>

                    <div>
                      <span class="font-mono font-bold text-[10px] uppercase text-slate-400">Stack Tecnológico & Tareas Asignadas:</span>
                      <div class="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 mt-1 mb-2">
                        ${escapeHtml(mod.tech || '')}
                      </div>
                      <div class="flex flex-wrap gap-1.5">
                        ${modFeatures.map(f => `
                          <button type="button" 
                                  data-action="view-detail" 
                                  data-id="${f.id}" 
                                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                                  title="${f.title || f.name}">
                            <span class="w-1.5 h-1.5 rounded-full ${f.status === 'done' ? 'bg-emerald-400' : f.status === 'in_progress' ? 'bg-indigo-400' : 'bg-slate-400'}"></span>
                            INT-${String(f.id).padStart(3, '0')}
                          </button>
                        `).join('')}
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="p-8 text-center text-slate-400 text-xs rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
            No se han registrado módulos aún. Ejecuta <code>/project-knowledge</code> para extraer los Bounded Contexts.
          </div>
        `}
      </section>

    </div>
  `;
}

/**
 * Normaliza y estructura el Stack Tecnológico en una matriz compacta para tabla
 */
function buildStructuredStack(tech, spec) {
  const rows = [];

  // 1. Orquestación Multi-Agente
  if (tech.orchestration || spec.runtime?.language) {
    rows.push({
      layer: 'Orquestación',
      layerBadgeClass: 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
      iconSvg: Icons.bot,
      technology: tech.orchestration || 'Antigravity 2.0 / OpenCode / Copilot',
      version: 'v2.5.0',
      purpose: 'Orquestación multi-agente con roles especializados (leader, spec-author, implementer, reviewer)',
      status: 'Activo',
      statusBadgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
      statusDotClass: 'bg-emerald-500',
      dependencies: 'MIT / Sovereign Agents'
    });
  }

  // 2. Frontend / Visualizador
  rows.push({
    layer: 'Frontend',
    layerBadgeClass: 'bg-cyan-100 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800',
    iconSvg: Icons.layout,
    technology: tech.frontend || 'Vanilla JS + Tailwind CSS v4 + Three.js',
    version: 'r128 / v4.0',
    purpose: 'Tablero SPA interactivo, lector editorial ContextForge y constelación 3D en Screaming Architecture',
    status: 'Activo',
    statusBadgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
    statusDotClass: 'bg-emerald-500',
    dependencies: '@tailwindcss/browser@4, three.min.js'
  });

  // 3. Tooling & Bundling
  rows.push({
    layer: 'Tooling',
    layerBadgeClass: 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    iconSvg: Icons.terminal,
    technology: tech.tooling || 'Node.js (ESM) + esbuild',
    version: '>=18.0.0 / ^0.25.0',
    purpose: 'Compilación IIFE ultrarrápida, servidor estático y pipeline de sincronización de datos',
    status: 'Activo',
    statusBadgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
    statusDotClass: 'bg-emerald-500',
    dependencies: 'esbuild (devDependency)'
  });

  // 4. Documentación & Diagramas
  rows.push({
    layer: 'Docs-as-Code',
    layerBadgeClass: 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800',
    iconSvg: Icons.bookOpen,
    technology: tech.documentation || 'Markdown + Mermaid.js + Draw.io XML',
    version: 'Mermaid v10.9+',
    purpose: 'Elicitación formal IEEE 830, diagramas C4, UML, ERD y decisiones arquitectónicas (ADRs)',
    status: 'Activo',
    statusBadgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
    statusDotClass: 'bg-emerald-500',
    dependencies: 'mermaid.min.js'
  });

  // 5. Testing & Aseguramiento de Calidad (QA)
  rows.push({
    layer: 'Testing & QA',
    layerBadgeClass: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    iconSvg: Icons.shield,
    technology: tech.testing || 'Node.js Test Runner + Playwright ATDD',
    version: 'Node.js Native / ^1.40',
    purpose: 'Pruebas unitarias de parser/sincronización y pruebas de aceptación E2E de interfaz',
    status: 'Activo',
    statusBadgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
    statusDotClass: 'bg-emerald-500',
    dependencies: 'node:test, node:assert'
  });

  // 6. Runtimes adicionales si existen
  if (Array.isArray(tech.runtimes)) {
    tech.runtimes.forEach(r => {
      rows.push({
        layer: 'Runtime',
        layerBadgeClass: 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
        iconSvg: Icons.cpu,
        technology: r.name,
        version: r.version || 'Detectada',
        purpose: r.purpose || 'Entorno de ejecución de backend',
        status: 'Activo',
        statusBadgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
        statusDotClass: 'bg-emerald-500',
        dependencies: 'Sistema'
      });
    });
  }

  // 7. Bases de datos / middleware adicionales si existen
  if (Array.isArray(tech.databases)) {
    tech.databases.forEach(db => {
      rows.push({
        layer: 'Persistencia',
        layerBadgeClass: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
        iconSvg: Icons.database,
        technology: db.name,
        version: db.type || 'Storage Engine',
        purpose: db.purpose || 'Almacenamiento de estado del sistema',
        status: 'Activo',
        statusBadgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
        statusDotClass: 'bg-emerald-500',
        dependencies: db.port ? `Puerto :${db.port}` : 'Local/Embedded'
      });
    });
  }

  return rows;
}

/**
 * Renderizado de Capas Arquitectónicas Dinámicas sin emojis
 */
function renderDynamicLayersPanel({ layers, modules, featureMap }) {
  if (!layers.length && !modules.length) {
    return `
      <div class="p-8 text-center text-slate-500 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
        <div class="p-3 w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto mb-3 flex items-center justify-center">
          ${Icons.zap}
        </div>
        <div class="text-sm font-bold text-slate-800 dark:text-slate-200">No hay capas de arquitectura configuradas aún</div>
        <p class="text-xs text-slate-400 mt-1 max-w-md mx-auto">Ejecuta la skill <code>/technical-audit</code> o <code>/project-knowledge</code> para extraer la arquitectura real del proyecto.</p>
      </div>
    `;
  }

  return `
    <div class="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/90 p-4 shadow-inner">
      <div class="min-w-[960px] max-w-5xl mx-auto py-4 space-y-6">
        
        <!-- Capa 1: Entrada & Perímetro -->
        <div class="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Capa 1: Clientes & Perímetro de Entrada
            </span>
            <span class="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-800">
              HTTPS / WSS / API Contracts
            </span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div class="flex justify-center text-indigo-600 dark:text-indigo-400 mb-1.5">${Icons.layout}</div>
              <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Web App (SPA)</div>
              <div class="text-[10px] text-slate-400">Dashboard & Clientes</div>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div class="flex justify-center text-indigo-600 dark:text-indigo-400 mb-1.5">${Icons.bot}</div>
              <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Agentes de IA</div>
              <div class="text-[10px] text-slate-400">Antigravity / SDD CLI</div>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div class="flex justify-center text-indigo-600 dark:text-indigo-400 mb-1.5">${Icons.terminal}</div>
              <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Terminal CLI</div>
              <div class="text-[10px] text-slate-400">Scripts de Verificación</div>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div class="flex justify-center text-indigo-600 dark:text-indigo-400 mb-1.5">${Icons.shield}</div>
              <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Guardrails & Tests</div>
              <div class="text-[10px] text-slate-400">Anti-Sesgo & ATDD</div>
            </div>
          </div>
        </div>

        <!-- Flecha de Flujo 1 -> 2 -->
        <div class="flex justify-center -my-3 relative z-10">
          <div class="px-3 py-1 rounded-full bg-indigo-600 text-white font-mono text-[10px] font-bold shadow-md flex items-center gap-1.5">
            ${Icons.chevronDown} Casos de Uso & Lógica de Negocio
          </div>
        </div>

        <!-- Capa 2: Dominios & Módulos Dinámicos -->
        <div class="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Capa de Dominio: Bounded Contexts (${modules.length} módulos)
            </span>
            <span class="text-[10px] font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
              Screaming Architecture Core
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            ${modules.map(mod => {
              const modFeatures = (mod.features || []).map(fIdStr => {
                const numId = parseInt(String(fIdStr).replace('INT-', ''), 10);
                return featureMap.get(numId);
              }).filter(Boolean);

              return `
                <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">${mod.id}</span>
                    <span class="text-[9px] font-mono bg-indigo-100 dark:bg-indigo-950/60 px-1 py-0.2 rounded text-indigo-700 dark:text-indigo-300">
                      ${modFeatures.length} tareas
                    </span>
                  </div>
                  <div class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">${mod.name}</div>
                  <div class="text-[10px] text-slate-400 mt-0.5 line-clamp-2">${mod.purpose || ''}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Flecha de Flujo 2 -> 3 -->
        <div class="flex justify-center -my-3 relative z-10">
          <div class="px-3 py-1 rounded-full bg-emerald-600 text-white font-mono text-[10px] font-bold shadow-md flex items-center gap-1.5">
            ${Icons.chevronDown} Estado, Persistencia & Documentación
          </div>
        </div>

        <!-- Capa 3: Persistencia & Base de Conocimiento -->
        <div class="p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Capa de Infraestructura & Estado Soberano
            </span>
            <span class="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              Filesystem & Offline Fallback
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-indigo-600 dark:text-indigo-400">${Icons.database}</span>
                <div>
                  <div class="font-bold text-xs text-slate-900 dark:text-slate-100">data-fallback.js</div>
                  <div class="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Embedded Data Cache</div>
                </div>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Cache serializado que permite ejecución 100% offline a través del protocolo file:/// sin servidor local.
              </p>
            </div>

            <div class="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-indigo-600 dark:text-indigo-400">${Icons.book}</span>
                <div>
                  <div class="font-bold text-xs text-slate-900 dark:text-slate-100">project-docs/knowledge/</div>
                  <div class="text-[10px] font-mono text-purple-600 dark:text-purple-400">Sovereign Knowledge Engine</div>
                </div>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Repositorio vivo de documentos Markdown, especificaciones C4, UML, ERD y reglas de negocio invariantes.
              </p>
            </div>

            <div class="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-indigo-600 dark:text-indigo-400">${Icons.share}</span>
                <div>
                  <div class="font-bold text-xs text-slate-900 dark:text-slate-100">Triple-Mirror Sync</div>
                  <div class="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">Cross-Platform Registry</div>
                </div>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Replicador de paridad exacta entre .opencode/skills/, .github/skills/ y .agents/skills/.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
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
