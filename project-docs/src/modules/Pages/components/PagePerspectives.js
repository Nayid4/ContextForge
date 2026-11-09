/**
 * PagePerspectives Component (Secondary Sovereign Perspectives)
 * Implementa las 4 perspectivas avanzadas de ingeniería soberana:
 *  - Modules DDD: Bounded Contexts y 5 artefactos canónicos por módulo
 *  - Master Bundle: Megadocumento Maestro Consolidado y sus 9 capítulos
 *  - Split Workspace: Grafo y árbol sincronizado con PagesPage
 *  - Rules & Contracts (Governance): Catálogo BR-*, Servicios externos y Guardrails anti-sesgo
 * 100% Vectorial, 0 dependencias externas, 0 emojis.
 */
import { Icons } from '../../../shared/Icons.js';
import { PagesPage } from '../pages/PagesPage.js';

function escapeHtml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(text = '') {
  return String(text).replace(/"/g, '&quot;');
}

export function renderPagePerspectives({
  modulesData = {},
  docMetadata = {},
  masterDocKey = 'MASTER-PROJECT-KNOWLEDGE.md',
  masterDocMeta = {},
  moduleNames = [],
  planePages = [],
  features = [],
  planePageState = {},
  rules = [],
  services = [],
  guardrails = []
}) {
  return `
    <!-- ============================================================== -->
    <!-- PANEL TIER 2: MÓDULOS & BOUNDED CONTEXTS (Plane List Format)   -->
    <!-- ============================================================== -->
    <div id="kb-perspective-panel-modules" class="kb-perspective-panel hidden flex-1 flex flex-col">
      <!-- Module Selector Sub-bar -->
      <div class="px-5 py-2.5 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between gap-4 overflow-x-auto" id="kb-module-tab-bar">
        <div class="flex items-center gap-1.5">
          ${Object.keys(modulesData).map((modId, index) => {
            const mod = modulesData[modId];
            const isActive = index === 0;
            return `
              <button
                type="button"
                data-module-tab="${escapeAttr(modId)}"
                class="kb-module-tab-btn ${
                  isActive
                    ? 'active bg-indigo-600 text-white font-semibold'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                } h-7 px-3 rounded-md text-xs font-mono transition-colors cursor-pointer shrink-0 inline-flex items-center gap-2"
              >
                ${Icons.folder('w-3.5 h-3.5')}
                <span>${escapeHtml(mod.title || modId)}</span>
                <span class="text-[10px] px-1.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'}">${mod.docs?.length || 5}</span>
              </button>
            `;
          }).join('')}
        </div>
        <span class="text-[11px] font-mono text-zinc-500 shrink-0 hidden md:inline">5 Artefactos DDD por Bounded Context</span>
      </div>

      <!-- Module Pages List -->
      <div id="kb-module-contents-container" class="flex-1">
        ${Object.keys(modulesData).map((modId, index) => {
          const mod = modulesData[modId];
          const isHidden = index !== 0;
          const modMetaMap = mod.docMetadata || {};

          const specializedSpecs = [
            {
              filename: 'module-spec.md',
              title: 'Especificación de Alcance & Tarjetas CRC',
              desc: 'Delimitación del bounded context, lenguaje ubicuo de dominio y matriz de tarjetas CRC.',
              badge: 'bg-purple-950/70 text-purple-300 border-purple-500/30',
              icon: Icons.shield
            },
            {
              filename: 'requirements-and-rules.md',
              title: 'Requerimientos & Invariantes de Negocio',
              desc: 'Matriz exhaustiva de requerimientos funcionales (RF-*), reglas BR-* e historias HU-*.',
              badge: 'bg-amber-950/70 text-amber-300 border-amber-500/30',
              icon: Icons.scale
            },
            {
              filename: 'data-and-transactions.md',
              title: 'Persistencia, Entidades & Transacciones',
              desc: 'Estructura de persistencia, entidades, concurrencia e invariantes ACID.',
              badge: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30',
              icon: Icons.database
            },
            {
              filename: 'diagrams.md',
              title: 'Suite de 6 Diagramas Dedicados (Mermaid)',
              desc: 'Contexto C4, Contenedores, Componentes, Secuencia, Estado y Modelo ERD.',
              badge: 'bg-indigo-950/70 text-indigo-300 border-indigo-500/30',
              icon: Icons.architecture
            },
            {
              filename: 'technical-debt-refactoring.md',
              title: 'Deuda Técnica & Plan de Refactorización',
              desc: 'Diagnóstico forense de deuda técnica, brechas de pruebas y hoja de ruta.',
              badge: 'bg-rose-950/70 text-rose-300 border-rose-500/30',
              icon: Icons.alertTriangle
            }
          ];

          return `
            <div id="kb-module-content-${escapeAttr(modId)}" class="kb-module-content-panel ${isHidden ? 'hidden' : ''}">
              <div class="px-5 py-2.5 bg-zinc-900/30 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2.5">
                  <span class="text-purple-400">${Icons.folder('w-4 h-4')}</span>
                  <span class="text-xs font-semibold text-zinc-100">${escapeHtml(mod.title || modId)}</span>
                  <code class="text-[11px] font-mono text-zinc-500">project-docs/knowledge/modules/${modId}/</code>
                </div>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                  ${mod.status || '100% COVERED'}
                </span>
              </div>

              <div class="divide-y divide-zinc-800/50">
                ${specializedSpecs.map(spec => {
                  const docKey = `modules/${modId}/${spec.filename}`;
                  const meta = modMetaMap[spec.filename] || docMetadata[docKey] || {
                    title: spec.title,
                    summary: spec.desc,
                    readingTime: 2,
                    wordCount: 300,
                    ruleCount: 0,
                    reqCount: 0
                  };

                  return `
                    <div
                      class="kb-shelf-doc-card plane-page-item group flex items-center justify-between gap-4 px-5 py-3 bg-zinc-950 hover:bg-zinc-900/75 transition-colors"
                      data-doc-key="${escapeAttr(docKey)}"
                      data-doc-shelf="modules"
                      data-doc-title="${escapeAttr(spec.title)}"
                      data-doc-module="${escapeAttr(modId)}"
                    >
                      <div class="flex items-center gap-3 min-w-0 flex-1">
                        <span class="text-zinc-400 group-hover:text-indigo-400 shrink-0">${spec.icon('w-4 h-4')}</span>
                        <div class="min-w-0 flex-1">
                          <div class="flex items-center gap-2">
                            <span class="text-xs font-medium text-zinc-100 truncate">${escapeHtml(spec.title)}</span>
                            <span class="px-1.5 py-0.2 rounded text-[10px] font-mono border ${spec.badge}">${spec.filename}</span>
                          </div>
                          <p class="text-[11px] text-zinc-500 truncate mt-0.5">${escapeHtml(spec.desc)}</p>
                        </div>
                      </div>

                      <div class="flex items-center gap-2 shrink-0">
                        ${meta.ruleCount ? `<span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-500/30">${meta.ruleCount} BR</span>` : ''}
                        ${meta.reqCount ? `<span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">${meta.reqCount} RF</span>` : ''}
                        <span class="text-[11px] font-mono text-zinc-500 hidden sm:inline">${meta.readingTime || 2}m</span>
                        <button
                          type="button"
                          data-action="open-article-read"
                          data-doc-key="${escapeAttr(docKey)}"
                          class="h-6 px-2.5 rounded bg-zinc-900 hover:bg-indigo-600 text-zinc-200 hover:text-white border border-zinc-800 text-[11px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          ${Icons.bookOpen('w-3 h-3')}
                          <span>Leer</span>
                        </button>
                        <button
                          type="button"
                          data-action="open-article-edit"
                          data-doc-key="${escapeAttr(docKey)}"
                          class="h-6 w-6 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          ${Icons.edit('w-3 h-3')}
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- PANEL TIER 3: MASTER BUNDLE (Plane List Format)                -->
    <!-- ============================================================== -->
    <div id="kb-perspective-panel-master" class="kb-perspective-panel hidden flex-1 flex flex-col">
      <!-- Master Bundle Top Bar -->
      <div class="px-5 py-3 bg-zinc-900/40 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="p-1.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300">
            ${Icons.fileText('w-4 h-4')}
          </span>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-xs font-bold text-zinc-100">MASTER-PROJECT-KNOWLEDGE.md</h3>
              <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-purple-950/80 text-purple-300 border border-purple-500/30">Single-File AI Bundle</span>
            </div>
            <p class="text-[11px] text-zinc-400">~${masterDocMeta.wordCount || 8200} palabras · 9 Capítulos Canónicos · 12 Diagramas Mermaid · ${moduleNames.length} Bounded Contexts</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            data-action="open-article-read"
            data-doc-key="${escapeAttr(masterDocKey)}"
            class="h-7 px-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            ${Icons.bookOpen('w-3.5 h-3.5')}
            <span>Open Master Document</span>
          </button>
          <button
            type="button"
            data-action="copy-master-doc"
            class="h-7 px-2.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            ${Icons.copy('w-3.5 h-3.5')}
            <span>Copy Markdown</span>
          </button>
          <button
            type="button"
            data-action="download-master-doc"
            class="h-7 px-2.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            ${Icons.download('w-3.5 h-3.5')}
            <span>Download .md</span>
          </button>
        </div>
      </div>

      <!-- 9 Chapters as Plane List Rows -->
      <div class="divide-y divide-zinc-800/50">
        ${[
          { num: '01', title: 'Resumen Ejecutivo & Problema de Negocio (IEEE 830)', desc: 'Definición formal del problema, usuarios del sistema, objetivos cuantificables y matriz RACI.' },
          { num: '02', title: 'Arquitectura General & Screaming Architecture', desc: 'Topología AS-IS, patrones arquitectónicos, estilo hexagonal y flujo de datos.' },
          { num: '03', title: 'Modelado C4 & Diagramas Globales (Mermaid)', desc: 'Contexto C1, Contenedores C2, Componentes C3, Diagramas de Secuencia y Clases de Dominio.' },
          { num: '04', title: 'Bounded Contexts & Tarjetas CRC (DDD Táctico)', desc: 'Lenguaje ubicuo de negocio, responsabilidades por bounded context y colaboradores.' },
          { num: '05', title: 'Requerimientos Funcionales & No Funcionales (INVEST)', desc: 'Matriz RF-*, historias de usuario y requerimientos no funcionales.' },
          { num: '06', title: 'Diccionario de Datos & Modelo Entidad-Relación (ERD)', desc: 'Modelo relacional SQLite (28 tablas), entidades, llaves foráneas e índices.' },
          { num: '07', title: 'Catálogo de Invariantes & Reglas de Negocio (BR-*)', desc: 'Invariantes de dominio de estricto cumplimiento para evitar alucinaciones.' },
          { num: '08', title: 'Servicios Externos & Contratos de Integración', desc: 'Protocolos de red, variables de entorno, mecanismos de autenticación y contingencia failover.' },
          { num: '09', title: 'Matriz de Trazabilidad RTM & Guardrails Anti-Sesgo', desc: 'Trazabilidad Requerimiento <-> Código <-> Tests y directrices de código.' }
        ].map(ch => `
          <div class="flex items-center justify-between gap-4 px-5 py-2.5 bg-zinc-950 hover:bg-zinc-900/75 transition-colors">
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <span class="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-500/30 shrink-0">
                CH-${ch.num}
              </span>
              <div class="min-w-0 flex-1">
                <div class="text-xs font-medium text-zinc-100 truncate">${escapeHtml(ch.title)}</div>
                <div class="text-[11px] text-zinc-500 truncate">${escapeHtml(ch.desc)}</div>
              </div>
            </div>
            <button
              type="button"
              data-action="open-article-read"
              data-doc-key="${escapeAttr(masterDocKey)}"
              class="h-6 px-2.5 rounded bg-zinc-900 hover:bg-purple-600 text-zinc-300 hover:text-white border border-zinc-800 text-[11px] font-medium shrink-0 transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <span>Open Chapter</span>
              ${Icons.arrowRight('w-3 h-3')}
            </button>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- PANEL TIER 4: PLANE PAGES SPLIT WORKSPACE & KNOWLEDGE GRAPH    -->
    <!-- ============================================================== -->
    <div id="kb-perspective-panel-plane-workspace" class="kb-perspective-panel hidden flex-1 overflow-hidden">
      ${PagesPage({
        pages: planePages,
        issues: features,
        activePageId: planePageState.activePageId || (planePages[0] && planePages[0].id) || null,
        activePageContent: planePageState.activePageContent || '',
        searchQuery: planePageState.searchQuery || '',
        filterTab: planePageState.filterTab || 'all',
        editorMode: planePageState.editorMode || 'reader',
        isFullWidth: Boolean(planePageState.isFullWidth),
        showNavigationPane: planePageState.showNavigationPane !== false,
        activeNavTab: planePageState.activeNavTab || 'outline',
        showAiMenu: Boolean(planePageState.showAiMenu)
      })}
    </div>

    <!-- ============================================================== -->
    <!-- PANEL TIER 5: RULES, EXTERNAL SERVICES & GUARDRAILS            -->
    <!-- ============================================================== -->
    <div id="kb-perspective-panel-governance" class="kb-perspective-panel hidden flex-1 divide-y divide-zinc-800">
      <!-- Business Rules Section -->
      <div>
        <div class="px-5 py-2.5 bg-zinc-900/45 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="text-amber-400">${Icons.scale('w-4 h-4')}</span>
            <h3 class="text-xs font-semibold text-zinc-100">Catálogo de Reglas de Negocio (Invariantes BR-*)</h3>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span class="text-zinc-500 font-mono text-[11px]">Module:</span>
            <select
              id="kb-rules-module-filter"
              class="h-7 px-2.5 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-200 text-xs font-mono focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Modules (${rules.length})</option>
              ${moduleNames.map(m => `<option value="${escapeAttr(m)}">${m}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="divide-y divide-zinc-800/50" id="kb-rules-list">
          ${rules.map(rule => {
            const isCritical = rule.severity === 'Crítica' || rule.severity === 'Critica' || rule.severity === 'Alta';
            const sevBadge = isCritical
              ? 'bg-rose-950/70 text-rose-300 border-rose-500/30'
              : 'bg-amber-950/70 text-amber-300 border-amber-500/30';
            return `
              <div
                data-rule-module="${escapeAttr(rule.module || 'general')}"
                class="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-900/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors"
              >
                <div class="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                  <span class="font-mono text-[11px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 shrink-0">
                    ${rule.id}
                  </span>
                  <span class="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 shrink-0">
                    ${rule.module || 'general'}
                  </span>
                  <div class="min-w-0 flex-1">
                    <span class="text-xs font-semibold text-zinc-100">${escapeHtml(rule.title)}</span>
                    <span class="text-xs text-zinc-400 ml-2">${escapeHtml(rule.description)}</span>
                  </div>
                </div>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${sevBadge}">
                  ${rule.severity || 'Normal'}
                </span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- External Services & Anti-Bias Guardrails -->
      <div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
        <div class="p-5 space-y-3">
          <div class="flex items-center gap-2 text-xs font-semibold text-zinc-200">
            <span class="text-cyan-400">${Icons.server('w-4 h-4')}</span>
            <span>External Services & Integration Contracts (${services.length})</span>
          </div>
          <div class="space-y-2">
            ${services.map(svc => `
              <div class="p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div class="font-semibold text-zinc-100">${escapeHtml(svc.name)} <span class="text-[10px] font-mono text-cyan-400">(${escapeHtml(svc.type)})</span></div>
                  <div class="text-[11px] text-zinc-400 font-mono">Protocol: ${escapeHtml(svc.protocol)} · Auth: ${escapeHtml(svc.auth)}</div>
                </div>
                <code class="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-indigo-300">${escapeHtml(svc.env_var)}</code>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="p-5 space-y-3">
          <div class="flex items-center gap-2 text-xs font-semibold text-zinc-200">
            <span class="text-rose-400">${Icons.shield('w-4 h-4')}</span>
            <span>Anti-Hallucination Guardrails & Naming Conventions</span>
          </div>
          <ul class="space-y-1.5 text-xs text-zinc-300">
            ${(guardrails.length > 0 ? guardrails : [
              'Prohibido instalar paquetes o bibliotecas redundantes no canónicas.',
              'Toda regla de negocio BR-* debe implementarse con tests automatizados.',
              'Inversión de dependencias obligatoria en controladores y servicios.'
            ]).map(g => `
              <li class="flex items-start gap-2">
                <span class="text-rose-400 font-mono font-bold shrink-0">•</span>
                <span>${escapeHtml(g)}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    </div>
  `;
}
