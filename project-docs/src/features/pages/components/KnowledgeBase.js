import { Icons } from '../../../shared/Icons.js';
import { renderBadge } from '../../../shared/Badge.js';
import { renderMarkdown, extractTableOfContents, parseMarkdownToBlocks, blocksToMarkdown } from '../../../shared/MarkdownViewer.js';

/**
 * KnowledgeBaseComponent: Base de Conocimiento de Ingeniería Soberana (Docs-as-Code).
 * Diseñada con experiencia editorial de alta gama (Biblioteca por Estantes + Lector de Artículos)
 * e inspirada en la arquitectura visual de ContextForge y el patrón de ingeniería inversa de DeepWiki.
 * 
 * Estructura de 3 Niveles:
 *  - Tier 1: Visión Global & Arquitectura del Sistema (Documentos Canónicos, C4, DeepWiki Mindmap)
 *  - Tier 2: Módulos & Bounded Contexts Granulares (5 Bounded Contexts DDD, 5 Archivos Especializados c/u)
 *  - Tier 3: Megadocumento Maestro Consolidado (MASTER-PROJECT-KNOWLEDGE.md)
 * 
 * 100% Vectorial, accesible, sin emojis. Exportación exclusivamente en formato Markdown (.md).
 */

export function renderKnowledgeBase({ knowledgeIndex, projectSpec, features = [] }) {
  const kData = knowledgeIndex || getFallbackKnowledge();
  const rules = kData.business_rules || [];
  const services = kData.external_services || [];
  const standards = kData.coding_standards || {};
  const guardrails = standards.guardrails || [];
  const naming = standards.naming_conventions || {};
  const docs = kData.docs || getDefaultDocs();
  const docMetadata = kData.docMetadata || buildDocMetadataFallback(docs);
  const shelvesData = kData.shelves || buildShelvesFallback(docMetadata);
  const modulesData = kData.modulesData || buildModulesDataFallback(docMetadata);

  const docKeys = Object.keys(docs);
  const activeDocKey = docKeys.includes('c4-model.md') 
    ? 'c4-model.md' 
    : (docKeys.includes('coding-standards.md') ? 'coding-standards.md' : (docKeys[0] || ''));
  const activeDocContent = docs[activeDocKey] || '# Documento no disponible';
  const activeDocMeta = docMetadata[activeDocKey] || {
    title: activeDocKey,
    shelf: 'general',
    readingTime: 3,
    wordCount: 450,
    ruleCount: 0,
    reqCount: 0,
    adrCount: 0
  };

  // Módulos disponibles dinámicamente
  const moduleNames = Array.from(new Set([
    ...(projectSpec?.modules?.map(m => m.name) || []),
    ...Object.keys(modulesData),
    ...Object.values(docMetadata).filter(d => d.moduleName).map(d => d.moduleName),
    ...rules.map(r => r.module)
  ])).filter(Boolean);

  // Seleccionar documento para Hero Card destacado (c4-model.md para mantener contratos de tests)
  const heroDocKey = docKeys.includes('c4-model.md') 
    ? 'c4-model.md' 
    : (docKeys.includes('coding-standards.md') ? 'coding-standards.md' : (docKeys[0] || ''));
  const heroDocMeta = docMetadata[heroDocKey] || activeDocMeta;

  // Master doc info
  const masterDocKey = 'MASTER-PROJECT-KNOWLEDGE.md';
  const masterDocMeta = docMetadata[masterDocKey] || {
    title: 'Megadocumento Maestro Consolidado (Single-File Context Bundle)',
    wordCount: 8200,
    readingTime: 35
  };

  // Tabla de contenidos para el documento activo
  const activeDocToc = extractTableOfContents(activeDocContent);

  // Prompt dinámico para alimentar a la IA (System Prompt canónico)
  const dynamicAiPrompt = buildAiSystemPrompt({ projectSpec, kData, rules, services, guardrails, naming });

  return `
    <div class="space-y-10" id="kb-container">
      
      <!-- ============================================================== -->
      <!-- VISTA 1: BIBLIOTECA EDITORIAL (HUB POR ESTANTES)               -->
      <!-- ============================================================== -->
      <div id="kb-view-library" class="space-y-8">
        
        <!-- 1.1 Header Hero de la Biblioteca -->
        <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
          <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div class="space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Docs-as-Code
                </span>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-100 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                  v4.1 DeepWiki Pattern
                </span>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Anti-Bias Context
                </span>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  100% Offline Compatible
                </span>
              </div>
              <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <span class="text-indigo-600 dark:text-indigo-400">${Icons.book('w-7 h-7')}</span>
                <span>Base de Conocimiento de Ingeniería Soberana</span>
              </h2>
              <p class="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                Repositorio canónico de arquitectura (C4/UML), requerimientos (IEEE 830/INVEST), mapa mental de funcionalidades (DeepWiki), 
                reglas de negocio (BR-*), decisiones técnicas (ADR) y bounded contexts. Permite auditar, crear, editar y exportar documentación viva en Markdown (.md).
              </p>
            </div>

            <!-- Botones de Acción Globales -->
            <div class="flex flex-wrap items-center gap-2.5">
              <button type="button" 
                      data-action="open-new-doc-modal"
                      class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer">
                ${Icons.plus} <span>Nuevo Doc</span>
              </button>

              <button type="button" 
                      data-action="trigger-import-doc"
                      class="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer"
                      title="Importar archivo Markdown (.md)">
                ${Icons.upload} <span>Importar</span>
              </button>
              <input type="file" id="import-doc-file-input" accept=".md,.markdown" class="hidden" />

              <button type="button" 
                      data-action="export-all-knowledge"
                      class="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold transition-all cursor-pointer shadow-xs"
                      title="Exportar toda la base de conocimiento consolidada en formato Markdown (.md)">
                ${Icons.download} <span>Exportar (.md)</span>
              </button>

              <button type="button" 
                      data-action="open-ai-context-modal" 
                      class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all cursor-pointer">
                ${Icons.bot} <span>Contexto IA</span>
              </button>
            </div>
          </div>

          <!-- Métricas Dinámicas Reales -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div class="text-[10px] font-mono text-slate-400 uppercase">Documentos Vivos</div>
              <div class="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">${docKeys.length} indexados</div>
              <div class="text-[10px] text-slate-500 mt-0.5">Docs-as-Code (.md)</div>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div class="text-[10px] font-mono text-slate-400 uppercase">Bounded Contexts</div>
              <div class="text-xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-0.5">${moduleNames.length} módulos</div>
              <div class="text-[10px] text-slate-500 mt-0.5">Estratégicos DDD</div>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div class="text-[10px] font-mono text-slate-400 uppercase">Reglas de Negocio</div>
              <div class="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">${rules.length} catalogadas</div>
              <div class="text-[10px] text-slate-500 mt-0.5">Invariantes BR-*</div>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div class="text-[10px] font-mono text-slate-400 uppercase">Servicios Externos</div>
              <div class="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">${services.length} contratos</div>
              <div class="text-[10px] text-slate-500 mt-0.5">Integraciones auditadas</div>
            </div>
          </div>
        </section>

        <!-- 1.2 CONMUTADOR DE PERSPECTIVA (3 Tiers de Navegación Editorial) -->
        <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 p-2 shadow-xs">
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2" id="kb-perspective-nav">
            <div class="flex flex-wrap items-center gap-1.5 flex-1">
              
              <!-- Tier 1: Visión Global -->
              <button type="button" 
                      data-kb-perspective="global"
                      class="kb-perspective-btn active flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-mono font-bold bg-indigo-600 text-white shadow-xs transition-all cursor-pointer">
                ${Icons.architecture('w-4 h-4')}
                <span>1. Visión Global & Arquitectura</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white">Canónicos</span>
              </button>

              <!-- Tier 2: Módulos & Bounded Contexts -->
              <button type="button" 
                      data-kb-perspective="modules"
                      class="kb-perspective-btn flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-mono font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
                ${Icons.folder('w-4 h-4')}
                <span>2. Módulos & Bounded Contexts</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${moduleNames.length} Contextos</span>
              </button>

              <!-- Tier 3: Megadocumento Maestro -->
              <button type="button" 
                      data-kb-perspective="master"
                      class="kb-perspective-btn flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-mono font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
                ${Icons.fileText('w-4 h-4')}
                <span>3. Dossier Maestro Consolidado</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">MASTER-*.md</span>
              </button>

            </div>

            <!-- Ayuda Contextual de Perspectiva -->
            <div class="hidden xl:flex items-center gap-2 text-[11px] font-mono text-slate-400 px-3 py-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Navegación en 3 Niveles (Global $\\to$ Modular $\\to$ Dossier)</span>
            </div>
          </div>
        </section>

        <!-- ============================================================== -->
        <!-- PANEL TIER 1: VISIÓN GLOBAL & ARQUITECTURA DEL SISTEMA         -->
        <!-- ============================================================== -->
        <div id="kb-perspective-panel-global" class="kb-perspective-panel space-y-8">
          
          <!-- 1.3 Hero Featured Card (Artículo Destacado de la Biblioteca: Modelo C4) -->
          ${heroDocKey ? `
            <section class="rounded-3xl border border-indigo-200/60 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-sm">
              <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div class="space-y-3 max-w-3xl">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-600 text-white shadow-xs">
                      ${Icons.star('w-3 h-3')} <span>Documento Destacado</span>
                    </span>
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      ${Icons.clock('w-3 h-3')} <span>${heroDocMeta.readingTime} min de lectura</span>
                    </span>
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      ${Icons.fileText('w-3 h-3')} <span>${heroDocMeta.wordCount} palabras</span>
                    </span>
                    ${heroDocMeta.ruleCount ? `
                      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        ${Icons.scale('w-3 h-3')} <span>${heroDocMeta.ruleCount} Reglas BR</span>
                      </span>
                    ` : ''}
                  </div>

                  <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    ${escapeHtml(heroDocMeta.title || heroDocKey)}
                  </h3>
                  <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    ${escapeHtml(heroDocMeta.summary || 'Especificación formal del sistema con diagramas de contexto, contenedores y componentes.')}
                  </p>
                  <div class="font-mono text-[11px] text-slate-400">
                    Ruta canónica: <code class="text-indigo-600 dark:text-indigo-400 font-bold">${heroDocKey}</code>
                  </div>
                </div>

                <div class="flex sm:flex-col items-stretch gap-2.5 shrink-0 w-full sm:w-auto">
                  <button type="button" 
                          data-action="open-article-read"
                          data-doc-key="${escapeAttr(heroDocKey)}"
                          class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer">
                    ${Icons.bookOpen} <span>Leer Artículo Completo</span>
                  </button>
                  <button type="button" 
                          data-action="open-article-edit"
                          data-doc-key="${escapeAttr(heroDocKey)}"
                          class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer">
                    ${Icons.edit} <span>Editar en Vivo</span>
                  </button>
                </div>
              </div>
            </section>
          ` : ''}

          <!-- Grid de Accesos Rápidos: IEEE 830 & Desglose Funcional DeepWiki -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <!-- Tarjeta 1: Visión del Producto IEEE 830 -->
            <section class="rounded-3xl border border-indigo-200/70 dark:border-indigo-900/50 bg-gradient-to-r from-indigo-50/60 via-purple-50/40 to-transparent dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-transparent p-5 backdrop-blur-xl flex flex-col justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  ${Icons.info('w-4 h-4')} <span>¿De qué trata este software?</span>
                </div>
                <h4 class="font-bold text-sm text-slate-900 dark:text-white">Problema de Negocio & Alcance (IEEE 830)</h4>
                <p class="text-xs text-slate-600 dark:text-slate-300">
                  Definición formal del propósito, usuarios directos/indirectos, matriz RACI y límites funcionales.
                </p>
              </div>
              <div class="pt-2">
                <button type="button" 
                        data-action="open-article-read"
                        data-doc-key="01-project-overview-and-business.md"
                        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer">
                  ${Icons.bookOpen('w-3.5 h-3.5')} <span>Ver Resumen IEEE 830</span>
                </button>
              </div>
            </section>

            <!-- Tarjeta 2: Desglose Funcional & Mindmap DeepWiki -->
            <section class="rounded-3xl border border-purple-200/70 dark:border-purple-900/50 bg-gradient-to-r from-purple-50/60 via-indigo-50/40 to-transparent dark:from-purple-950/30 dark:via-indigo-950/20 dark:to-transparent p-5 backdrop-blur-xl flex flex-col justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2 text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                  ${Icons.grid('w-4 h-4')} <span>Patrón DeepWiki / OpenDeepWiki</span>
                </div>
                <h4 class="font-bold text-sm text-slate-900 dark:text-white">Catálogo de Capacidades & Mapa Mental</h4>
                <p class="text-xs text-slate-600 dark:text-slate-300">
                  Desglose jerárquico de capacidades $\\to$ features, User Journeys y deep linking directo a código fuente.
                </p>
              </div>
              <div class="pt-2">
                <button type="button" 
                        data-action="open-article-read"
                        data-doc-key="03-capabilities-and-features.md"
                        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer">
                  ${Icons.bookOpen('w-3.5 h-3.5')} <span>Ver Catálogo DeepWiki</span>
                </button>
              </div>
            </section>

          </div>

          <!-- 1.4 Barra de Filtros por Estante Temático y Buscador con Debouncing -->
          <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 p-5 shadow-sm space-y-4">
            <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              
              <!-- Píldoras de Filtro por Estante -->
              <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono" id="kb-shelf-filter-pills">
                <button type="button" 
                        data-shelf-filter="" 
                        class="kb-shelf-pill active px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold transition-all cursor-pointer shrink-0 shadow-xs">
                  Todos (${docKeys.length})
                </button>
                ${Object.values(shelvesData).map(sh => `
                  <button type="button" 
                          data-shelf-filter="${sh.id}" 
                          class="kb-shelf-pill px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shrink-0 font-medium inline-flex items-center gap-1.5">
                    ${getShelfIconSvg(sh.id)} <span>${sh.title.split(' ')[0]}</span> <span>(${sh.docs.length})</span>
                  </button>
                `).join('')}
              </div>

              <!-- Buscador con Debouncing -->
              <div class="relative min-w-[280px]">
                <input type="text" 
                       id="kb-library-search-input" 
                       placeholder="Buscar en la biblioteca (título, módulo, BR-*)..." 
                       class="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono shadow-xs" />
                <span class="absolute left-3 top-2.5 text-slate-400 pointer-events-none text-xs">
                  ${Icons.search('w-3.5 h-3.5')}
                </span>
              </div>

            </div>
          </section>

          <!-- 1.5 Estantes Temáticos (Shelves Grid) -->
          <div class="space-y-10" id="kb-shelves-container">
            ${Object.values(shelvesData).map(sh => {
              if (!sh.docs || sh.docs.length === 0) return '';
              return `
                <section class="space-y-4 kb-shelf-section" data-shelf-id="${sh.id}">
                  <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div class="flex items-center gap-2.5">
                      <span class="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        ${getShelfIconSvg(sh.id, 'w-5 h-5')}
                      </span>
                      <h3 class="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                        ${escapeHtml(sh.title)}
                      </h3>
                    </div>
                    <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      ${sh.docs.length} documentos
                    </span>
                  </div>

                  <!-- Cuadrícula de Tarjetas de Documentos -->
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    ${sh.docs.map(key => {
                      const meta = docMetadata[key] || {
                        title: key,
                        summary: 'Documento técnico.',
                        readingTime: 2,
                        ruleCount: 0,
                        reqCount: 0,
                        adrCount: 0
                      };

                      return `
                        <div class="kb-shelf-doc-card plane-page-item rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-xs hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500 transition-all flex flex-col justify-between group"
                             data-doc-key="${escapeAttr(key)}"
                             data-doc-shelf="${escapeAttr(sh.id)}"
                             data-doc-title="${escapeAttr(meta.title)}"
                             data-doc-module="${escapeAttr(meta.moduleName || '')}">
                          
                          <div class="space-y-3">
                            <div class="flex items-center justify-between gap-2">
                              <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${meta.moduleName ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'} truncate">
                                ${meta.moduleName ? `${Icons.folder('w-3 h-3')} <span>${meta.moduleName}</span>` : `${getShelfIconSvg(sh.id, 'w-3 h-3')} <span>${sh.title.split(' ')[0]}</span>`}
                              </span>
                              <span class="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 shrink-0">
                                ${Icons.clock('w-3 h-3')} <span>${meta.readingTime} min</span>
                              </span>
                            </div>

                            <div>
                              <h4 class="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                ${escapeHtml(meta.title)}
                              </h4>
                              <div class="text-[10px] font-mono text-slate-400 truncate mt-1">
                                ${escapeHtml(key)}
                              </div>
                            </div>

                            <p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                              ${escapeHtml(meta.summary)}
                            </p>
                          </div>

                          <div class="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                            <div class="flex items-center gap-1.5">
                              ${meta.ruleCount ? `
                                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800" title="${meta.ruleCount} Reglas de negocio catalogadas">
                                  ${Icons.scale('w-3 h-3')} <span>${meta.ruleCount} BR</span>
                                </span>
                              ` : ''}
                              ${meta.reqCount ? `
                                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" title="${meta.reqCount} Requerimientos funcionales">
                                  ${Icons.fileText('w-3 h-3')} <span>${meta.reqCount} RF</span>
                                </span>
                              ` : ''}
                              ${meta.adrCount ? `
                                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800" title="${meta.adrCount} Decisiones de arquitectura">
                                  ${Icons.cube('w-3 h-3')} <span>${meta.adrCount} ADR</span>
                                </span>
                              ` : ''}
                            </div>

                            <div class="flex items-center gap-1.5">
                              <button type="button" 
                                      data-action="open-article-read"
                                      data-doc-key="${escapeAttr(key)}"
                                      class="px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1">
                                ${Icons.bookOpen('w-3.5 h-3.5')} <span>Leer</span>
                              </button>
                              <button type="button" 
                                      data-action="open-article-edit"
                                      data-doc-key="${escapeAttr(key)}"
                                      class="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                      title="Editar directamente este documento">
                                ${Icons.edit('w-3.5 h-3.5')}
                              </button>
                            </div>
                          </div>

                        </div>
                      `;
                    }).join('')}
                  </div>
                </section>
              `;
            }).join('')}
          </div>

        </div>

        <!-- ============================================================== -->
        <!-- PANEL TIER 2: MÓDULOS & BOUNDED CONTEXTS GRANULARES            -->
        <!-- ============================================================== -->
        <div id="kb-perspective-panel-modules" class="kb-perspective-panel hidden space-y-8">
          
          <!-- Introducción a la Arquitectura por Bounded Contexts -->
          <section class="rounded-3xl border border-purple-200/70 dark:border-purple-900/50 bg-gradient-to-r from-purple-50/50 via-indigo-50/30 to-transparent dark:from-purple-950/30 dark:via-indigo-950/20 dark:to-transparent p-6 sm:p-8 backdrop-blur-xl">
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div class="space-y-2 max-w-3xl">
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    Domain-Driven Design (DDD)
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    5 Artefactos Especializados por Módulo
                  </span>
                </div>
                <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Explorador de Bounded Contexts Granulares
                </h3>
                <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Cada módulo representa un subdominio estratégico aislado con sus propias reglas invariantes, contratos transaccionales, 
                  tarjetas CRC y suite de 6 diagramas visuales en Mermaid.
                </p>
              </div>

              <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-xs font-mono space-y-1 shrink-0">
                <div class="text-[10px] uppercase font-bold text-slate-400">Artefactos por Módulo</div>
                <div class="text-purple-600 dark:text-purple-400 font-bold">1. module-spec.md (CRC)</div>
                <div class="text-amber-600 dark:text-amber-400 font-bold">2. requirements-and-rules.md</div>
                <div class="text-emerald-600 dark:text-emerald-400 font-bold">3. data-and-transactions.md</div>
                <div class="text-indigo-600 dark:text-indigo-400 font-bold">4. diagrams.md (6 Diagramas)</div>
                <div class="text-rose-600 dark:text-rose-400 font-bold">5. technical-debt-refactoring.md</div>
              </div>
            </div>
          </section>

          <!-- Barra de Navegación por Módulo (Tabs Horizontales) -->
          <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 p-3 shadow-xs">
            <div class="flex items-center gap-2 overflow-x-auto pb-1" id="kb-module-tab-bar">
              ${Object.keys(modulesData).map((modId, index) => {
                const mod = modulesData[modId];
                const isActive = index === 0;
                return `
                  <button type="button" 
                          data-module-tab="${escapeAttr(modId)}"
                          class="kb-module-tab-btn ${isActive ? 'active bg-purple-600 text-white font-bold shadow-xs' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium'} px-4 py-2 rounded-2xl text-xs font-mono transition-all cursor-pointer shrink-0 inline-flex items-center gap-2">
                    ${Icons.folder('w-3.5 h-3.5')}
                    <span>${escapeHtml(mod.title || modId)}</span>
                    <span class="text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}">${mod.docs?.length || 5}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </section>

          <!-- Paneles de Contenido Modular -->
          <div id="kb-module-contents-container">
            ${Object.keys(modulesData).map((modId, index) => {
              const mod = modulesData[modId];
              const isHidden = index !== 0;
              const modDocs = mod.docs || [];
              const modMetaMap = mod.docMetadata || {};

              // 5 Archivos Especializados canónicos
              const specializedSpecs = [
                {
                  filename: 'module-spec.md',
                  title: 'Especificación de Alcance & Tarjetas CRC',
                  desc: 'Delimitación del bounded context, lenguaje ubicuo de dominio y matriz de tarjetas CRC (Clase, Responsabilidades y Colaboradores).',
                  color: 'border-purple-200 dark:border-purple-800 hover:border-purple-500',
                  badge: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300',
                  icon: Icons.shield
                },
                {
                  filename: 'requirements-and-rules.md',
                  title: 'Requerimientos & Invariantes de Negocio',
                  desc: 'Matriz exhaustiva de requerimientos funcionales (RF-*), reglas de negocio inviolables (BR-*), historias de usuario (HU-*) y tareas técnicas (TI-*).',
                  color: 'border-amber-200 dark:border-amber-800 hover:border-amber-500',
                  badge: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
                  icon: Icons.scale
                },
                {
                  filename: 'data-and-transactions.md',
                  title: 'Persistencia, Entidades & Transacciones',
                  desc: 'Estructura de persistencia, entidades, estrategias de concurrencia optimista/pesimista, aislamiento de transacciones e invariantes ACID.',
                  color: 'border-emerald-200 dark:border-emerald-800 hover:border-emerald-500',
                  badge: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
                  icon: Icons.database
                },
                {
                  filename: 'diagrams.md',
                  title: 'Suite de 6 Diagramas Dedicados (Mermaid)',
                  desc: '6 diagramas visuales generados para el módulo: Contexto C4, Contenedores, Componentes, Diagrama de Secuencia, Diagrama de Estado y Modelo ERD.',
                  color: 'border-indigo-200 dark:border-indigo-800 hover:border-indigo-500',
                  badge: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300',
                  icon: Icons.architecture
                },
                {
                  filename: 'technical-debt-refactoring.md',
                  title: 'Deuda Técnica & Plan de Refactorización',
                  desc: 'Diagnóstico forense de deuda técnica, olores de código, brechas de pruebas unitarias/integración y hoja de ruta de remediación.',
                  color: 'border-rose-200 dark:border-rose-800 hover:border-rose-500',
                  badge: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300',
                  icon: Icons.alertTriangle
                }
              ];

              return `
                <div id="kb-module-content-${escapeAttr(modId)}" class="kb-module-content-panel space-y-6 ${isHidden ? 'hidden' : ''}">
                  
                  <!-- Cabecera del Módulo -->
                  <div class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div class="space-y-2">
                      <div class="flex items-center gap-2">
                        <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          ${mod.status || 'COMPLETAMENTE CUBIERTO'}
                        </span>
                        <span class="text-xs font-mono text-slate-400">Ruta: <code>project-docs/knowledge/modules/${modId}/</code></span>
                      </div>
                      <h3 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <span class="text-purple-600 dark:text-purple-400">${Icons.folder('w-6 h-6')}</span>
                        <span>${escapeHtml(mod.title || modId)}</span>
                      </h3>
                      <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                        Bounded Context auditado con 5 artefactos formales de ingeniería para garantizar contexto 100% libre de alucinaciones en agentes de IA y desarrolladores.
                      </p>
                    </div>

                    <!-- Métricas Rápidas del Módulo -->
                    <div class="flex items-center gap-2 text-xs font-mono shrink-0">
                      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                        <div class="text-[10px] text-slate-400 uppercase">Documentos</div>
                        <div class="text-base font-bold text-purple-600 dark:text-purple-400">${modDocs.length}</div>
                      </div>
                      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                        <div class="text-[10px] text-slate-400 uppercase">Diagramas</div>
                        <div class="text-base font-bold text-indigo-600 dark:text-indigo-400">6</div>
                      </div>
                      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                        <div class="text-[10px] text-slate-400 uppercase">Cobertura</div>
                        <div class="text-base font-bold text-emerald-600 dark:text-emerald-400">100%</div>
                      </div>
                    </div>
                  </div>

                  <!-- Grid de los 5 Archivos Especializados -->
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                        <div class="kb-shelf-doc-card plane-page-item rounded-2xl border ${spec.color} bg-white dark:bg-slate-900/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                             data-doc-key="${escapeAttr(docKey)}"
                             data-doc-shelf="modules"
                             data-doc-title="${escapeAttr(spec.title)}"
                             data-doc-module="${escapeAttr(modId)}">
                          
                          <div class="space-y-3">
                            <div class="flex items-center justify-between gap-2">
                              <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${spec.badge}">
                                ${spec.icon('w-3 h-3')} <span>${spec.filename}</span>
                              </span>
                              <span class="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 shrink-0">
                                ${Icons.clock('w-3 h-3')} <span>${meta.readingTime || 2} min</span>
                              </span>
                            </div>

                            <div>
                              <h4 class="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                ${escapeHtml(spec.title)}
                              </h4>
                              <div class="text-[10px] font-mono text-slate-400 truncate mt-1">
                                ${escapeHtml(docKey)}
                              </div>
                            </div>

                            <p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                              ${escapeHtml(spec.desc)}
                            </p>
                          </div>

                          <div class="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                            <div class="flex items-center gap-1.5">
                              ${meta.ruleCount ? `
                                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                  ${Icons.scale('w-3 h-3')} <span>${meta.ruleCount} BR</span>
                                </span>
                              ` : ''}
                              ${meta.reqCount ? `
                                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                  ${Icons.fileText('w-3 h-3')} <span>${meta.reqCount} RF</span>
                                </span>
                              ` : ''}
                            </div>

                            <div class="flex items-center gap-1.5">
                              <button type="button" 
                                      data-action="open-article-read"
                                      data-doc-key="${escapeAttr(docKey)}"
                                      class="px-2.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-600 hover:text-white text-purple-600 dark:text-purple-400 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1">
                                ${Icons.bookOpen('w-3.5 h-3.5')} <span>Leer</span>
                              </button>
                              <button type="button" 
                                      data-action="open-article-edit"
                                      data-doc-key="${escapeAttr(docKey)}"
                                      class="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                      title="Editar este archivo">
                                ${Icons.edit('w-3.5 h-3.5')}
                              </button>
                            </div>
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
        <!-- PANEL TIER 3: MEGADOCUMENTO MAESTRO CONSOLIDADO                -->
        <!-- ============================================================== -->
        <div id="kb-perspective-panel-master" class="kb-perspective-panel hidden space-y-8">
          
          <!-- Hero Card del Dossier Maestro -->
          <section class="rounded-3xl border border-purple-200/80 dark:border-purple-900/60 bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-slate-900/5 p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden shadow-sm">
            <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div class="space-y-4 max-w-3xl">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-600 text-white shadow-xs">
                    ${Icons.fileText('w-3.5 h-3.5')} <span>Single-File Context Bundle</span>
                  </span>
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    ${Icons.shield('w-3.5 h-3.5')} <span>Anti-Bias Context for AI</span>
                  </span>
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    ${Icons.checkCircle('w-3.5 h-3.5')} <span>Docs-as-Code Soberano</span>
                  </span>
                </div>

                <h3 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  MASTER-PROJECT-KNOWLEDGE.md
                </h3>
                <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Compendio unificado de ingeniería inversa que consolida en un único archivo la visión de negocio (IEEE 830), 
                  arquitectura AS-IS (Screaming Architecture), modelado C4, tarjetas CRC, requerimientos INVEST, diccionario de datos con ERD, 
                  invariantes BR-*, matriz de servicios externos y trazabilidad RTM. Diseñado para alimentar a modelos LLM con contexto 100% libre 
                  de alucinaciones en un solo prompt.
                </p>

                <!-- Grid de Métricas del Megadocumento -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono text-xs">
                  <div class="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                    <div class="text-[10px] text-slate-400 uppercase">Extensión Total</div>
                    <div class="text-base font-bold text-purple-600 dark:text-purple-400 mt-0.5">~${masterDocMeta.wordCount || 8200} palabras</div>
                  </div>
                  <div class="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                    <div class="text-[10px] text-slate-400 uppercase">Capítulos</div>
                    <div class="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">9 Capítulos</div>
                  </div>
                  <div class="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                    <div class="text-[10px] text-slate-400 uppercase">Diagramas</div>
                    <div class="text-base font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">12 Diagramas</div>
                  </div>
                  <div class="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                    <div class="text-[10px] text-slate-400 uppercase">Contextos DDD</div>
                    <div class="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">${moduleNames.length} Bounded Contexts</div>
                  </div>
                </div>
              </div>

              <!-- Botones de Acción del Megadocumento -->
              <div class="flex flex-col sm:flex-row lg:flex-col items-stretch gap-3 shrink-0 w-full lg:w-auto">
                <button type="button" 
                        data-action="open-article-read"
                        data-doc-key="${escapeAttr(masterDocKey)}"
                        class="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-500/25 transition-all cursor-pointer">
                  ${Icons.bookOpen} <span>Leer Megadocumento Completo</span>
                </button>

                <button type="button" 
                        data-action="copy-master-doc"
                        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all cursor-pointer">
                  ${Icons.copy} <span>Copiar Markdown Completo</span>
                </button>

                <button type="button" 
                        data-action="download-master-doc"
                        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer">
                  ${Icons.download} <span>Descargar .md</span>
                </button>
              </div>
            </div>
          </section>

          <!-- Índice de Capítulos del Megadocumento Maestro -->
          <section class="space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h4 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span class="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                  ${Icons.fileText}
                </span>
                <span>Estructura & Capítulos del Dossier Maestro</span>
              </h4>
              <span class="text-xs font-mono text-slate-400">9 Capítulos Estructurados</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              ${[
                { num: '01', title: 'Resumen Ejecutivo & Problema de Negocio (IEEE 830)', desc: 'Definición formal del problema, usuarios del sistema, objetivos cuantificables y matriz RACI.' },
                { num: '02', title: 'Arquitectura General & Screaming Architecture', desc: 'Topología AS-IS, patrones arquitectónicos, estilo hexagonal y flujo de datos.' },
                { num: '03', title: 'Modelado C4 & Diagramas Globales (Mermaid)', desc: 'Contexto C1, Contenedores C2, Componentes C3, Diagramas de Secuencia y Clases de Dominio.' },
                { num: '04', title: 'Bounded Contexts & Tarjetas CRC (DDD Táctico)', desc: 'Lenguaje ubicuo de negocio, responsabilidades por bounded context y colaboradores.' },
                { num: '05', title: 'Requerimientos Funcionales & No Funcionales (INVEST)', desc: 'Matriz RF-*, historias de usuario y requerimientos no funcionales (rendimiento, seguridad, offline).' },
                { num: '06', title: 'Diccionario de Datos & Modelo Entidad-Relación (ERD)', desc: 'Modelo relacional, entidades, llaves compuestas, índices y restricciones transaccionales.' },
                { num: '07', title: 'Catálogo de Invariantes & Reglas de Negocio (BR-*)', desc: 'Invariantes de dominio de estricto cumplimiento para evitar alucinaciones.' },
                { num: '08', title: 'Servicios Externos & Contratos de Integración', desc: 'Protocolos de red, variables de entorno, mecanismos de autenticación y contingencia failover.' },
                { num: '09', title: 'Matriz de Trazabilidad RTM & Guardrails Anti-Sesgo', desc: 'Trazabilidad Requerimiento $\\leftrightarrow$ Código $\\leftrightarrow$ Tests y directrices de código.' }
              ].map(ch => `
                <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 space-y-2.5 hover:border-purple-400 dark:hover:border-purple-600 transition-all flex flex-col justify-between">
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="px-2 py-0.5 rounded-md font-mono text-xs font-black bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                        Capítulo ${ch.num}
                      </span>
                      <span class="text-[10px] font-mono text-slate-400">Canónico</span>
                    </div>
                    <h5 class="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                      ${escapeHtml(ch.title)}
                    </h5>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      ${escapeHtml(ch.desc)}
                    </p>
                  </div>

                  <div class="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button type="button" 
                            data-action="open-article-read"
                            data-doc-key="${escapeAttr(masterDocKey)}"
                            class="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 hover:text-purple-500 flex items-center gap-1 cursor-pointer">
                      <span>Ir al dossier</span> ${Icons.arrowRight('w-3 h-3')}
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </section>

        </div>

      </div>

      <!-- ============================================================== -->
      <!-- VISTA 2: LECTOR & EDITOR EDITORIAL (ARTICLE MODE)              -->
      <!-- ============================================================== -->
      <div id="kb-view-article" class="hidden space-y-6">
        
        <!-- 2.1 Breadcrumb de Navegación & Barra de Herramientas Flotante -->
        <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl p-4 sm:p-5 shadow-sm sticky top-20 z-20 transition-all">
          <div class="flex flex-wrap items-center justify-between gap-4">
            
            <!-- Breadcrumbs -->
            <div class="flex items-center gap-2 text-xs font-mono">
              <button type="button" 
                      data-action="back-to-library"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-bold transition-all cursor-pointer">
                ${Icons.arrowLeft} <span>Biblioteca</span>
              </button>
              <span class="text-slate-300 dark:text-slate-700">/</span>
              <span id="article-shelf-badge" class="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                ${activeDocMeta.shelf || 'Canónico'}
              </span>
              <span class="text-slate-300 dark:text-slate-700">/</span>
              <span id="doc-active-path" class="text-indigo-600 dark:text-indigo-400 font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 truncate max-w-xs sm:max-w-md">
                ${activeDocKey}
              </span>
            </div>

            <!-- Acciones del Documento -->
            <div class="flex items-center gap-2">
              <span id="article-reading-time-badge" class="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-500">
                ${Icons.clock('w-3.5 h-3.5')} <span>${activeDocMeta.readingTime} min</span>
              </span>

              <!-- Botón Conmutar Modo Edición / Lectura -->
              <button type="button" 
                      id="btn-toggle-doc-editor" 
                      class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                      title="Alternar entre Lector Editorial y Editor Dual">
                <span id="btn-toggle-doc-icon">${Icons.edit}</span>
                <span id="btn-toggle-doc-text">Modo Editor</span>
              </button>

              <!-- Botón Copiar Markdown -->
              <button type="button" 
                      id="copy-active-doc-btn" 
                      class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      title="Copiar contenido Markdown completo">
                ${Icons.copy}
              </button>

              <!-- Botón Descargar Archivo .md -->
              <button type="button" 
                      data-action="download-active-doc" 
                      class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      title="Descargar este archivo .md a tu equipo">
                ${Icons.download}
              </button>

              <!-- Botón Eliminar Documento -->
              <button type="button" 
                      data-action="delete-active-doc" 
                      class="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                      title="Eliminar este documento de la Base de Conocimiento">
                ${Icons.trash}
              </button>
            </div>

          </div>
        </section>

        <!-- 2.2 MODO LECTOR EDITORIAL (Columna centrada 780px + TOC flotante) -->
        <div id="doc-reader-view-container" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Contenido Principal del Artículo (Columna de Lectura) -->
          <div class="lg:col-span-9 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-8 sm:p-12 shadow-sm min-h-[600px]">
            <article id="doc-active-body" class="prose dark:prose-invert max-w-3xl mx-auto text-slate-800 dark:text-slate-200 leading-relaxed text-sm">
              ${renderMarkdown(activeDocContent)}
            </article>
          </div>

          <!-- Barra Lateral Flotante: Tabla de Contenidos (TOC) On-This-Page -->
          <div class="hidden lg:block lg:col-span-3 sticky top-36 space-y-4">
            <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 p-4 backdrop-blur-md">
              <div class="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 pb-2 mb-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                ${Icons.fileText} <span>En esta página</span>
              </div>
              <div id="doc-active-toc" class="max-h-[460px] overflow-y-auto pr-1">
                ${renderTableOfContentsHtml(activeDocToc)}
              </div>
            </div>

            <!-- Meta Box -->
            <div class="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-[11px] font-mono text-slate-500 space-y-1.5">
              <div class="flex items-center justify-between">
                <span>Palabras:</span>
                <strong id="article-meta-words" class="text-slate-800 dark:text-slate-200">${activeDocMeta.wordCount || 0}</strong>
              </div>
              <div class="flex items-center justify-between">
                <span>Invariantes BR:</span>
                <strong id="article-meta-br" class="text-amber-600 dark:text-amber-400">${activeDocMeta.ruleCount || 0}</strong>
              </div>
              <div class="flex items-center justify-between">
                <span>Requerimientos RF:</span>
                <strong id="article-meta-rf" class="text-emerald-600 dark:text-emerald-400">${activeDocMeta.reqCount || 0}</strong>
              </div>
            </div>
          </div>

        </div>

        <!-- 2.3 MODO EDITOR DUAL (Markdown vs Bloques Visuales con Scroll Sincronizado) -->
        <div id="doc-editor-view-container" class="hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-6 sm:p-8 shadow-sm space-y-6">
          
          <!-- Barra de Control del Editor Dual -->
          <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <div class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 border border-slate-200 dark:border-slate-700">
                <button type="button" 
                        id="btn-editor-mode-md" 
                        class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-indigo-600 text-white shadow-xs cursor-pointer transition-all">
                  ${Icons.code('w-3.5 h-3.5')} <span>Modo Markdown</span>
                </button>
                <button type="button" 
                        id="btn-editor-mode-blocks" 
                        class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-all">
                  ${Icons.grid('w-3.5 h-3.5')} <span>Modo Bloques Visuales</span>
                </button>
              </div>

              <span id="editor-sync-indicator" class="text-xs text-slate-500 font-mono hidden sm:inline">
                Sincronización activa (Docs-as-Code)
              </span>
            </div>

            <!-- Botones Guardar / Cancelar -->
            <div class="flex items-center gap-2">
              <button type="button" 
                      id="btn-cancel-doc-edit" 
                      class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                Cancelar
              </button>
              <button type="button" 
                      id="btn-save-doc-edit" 
                      class="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-1.5">
                ${Icons.save} <span>Guardar Cambios</span>
              </button>
            </div>
          </div>

          <!-- PANEL 1: MODO MARKDOWN CON SCROLL SINCRONIZADO -->
          <div id="editor-pane-markdown" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div class="space-y-2">
              <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
                <span>Código Fuente Markdown (.md)</span>
                <span>Atajos: Alertas GitHub, Tablas, Mermaid</span>
              </div>
              <textarea id="doc-editor-textarea" 
                        rows="24" 
                        class="w-full p-4 font-mono text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed h-[560px] overflow-y-auto">${escapeHtml(activeDocContent)}</textarea>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
                <span>Previsualización Renderizada en Vivo</span>
                <span class="text-emerald-500 font-semibold">● Scroll Sincronizado</span>
              </div>
              <div id="doc-editor-live-preview" class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 overflow-y-auto h-[560px] prose dark:prose-invert max-w-none text-xs">
                ${renderMarkdown(activeDocContent)}
              </div>
            </div>

          </div>

          <!-- PANEL 2: MODO BLOQUES VISUALES (ESTILO CONTEXTFORGE) -->
          <div id="editor-pane-blocks" class="hidden space-y-4">
            
            <!-- Barra para Agregar Bloques Nuevos -->
            <div class="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono">
              <span class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                ${Icons.grid} <span>Añadir Bloque Visual:</span>
              </span>
              <div class="flex flex-wrap items-center gap-1.5">
                <button type="button" data-add-block="header" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all cursor-pointer font-semibold">
                  ${Icons.plus('w-3 h-3')} <span>Encabezado</span>
                </button>
                <button type="button" data-add-block="paragraph" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all cursor-pointer font-semibold">
                  ${Icons.plus('w-3 h-3')} <span>Párrafo</span>
                </button>
                <button type="button" data-add-block="business_rule" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:text-amber-600 transition-all cursor-pointer font-semibold">
                  ${Icons.plus('w-3 h-3')} <span>Regla BR</span>
                </button>
                <button type="button" data-add-block="callout" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-cyan-500 hover:text-cyan-600 transition-all cursor-pointer font-semibold">
                  ${Icons.plus('w-3 h-3')} <span>Alerta/Callout</span>
                </button>
                <button type="button" data-add-block="code" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-purple-500 hover:text-purple-600 transition-all cursor-pointer font-semibold">
                  ${Icons.plus('w-3 h-3')} <span>Diagrama/Código</span>
                </button>
                <button type="button" data-add-block="divider" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-400 transition-all cursor-pointer font-semibold">
                  ${Icons.plus('w-3 h-3')} <span>Separador</span>
                </button>
              </div>
            </div>

            <!-- Lista de Bloques Visuales Editables -->
            <div id="doc-editor-blocks-container" class="space-y-4 max-h-[580px] overflow-y-auto pr-1">
              <!-- Renderizado dinámicamente con parseMarkdownToBlocks -->
            </div>

          </div>

        </div>

      </div>

      <!-- ============================================================== -->
      <!-- 3. CATÁLOGO DINÁMICO DE REGLAS DE NEGOCIO (INVARIANTES BR-*)   -->
      <!-- ============================================================== -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                ${Icons.scale}
              </span>
              <span>Catálogo de Reglas de Negocio (Invariantes de Dominio)</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Invariantes de estricto cumplimiento para evitar alucinaciones, fallos contables y vulnerabilidades
            </p>
          </div>

          <!-- Selector de Filtro de Módulo Dinámico -->
          <div class="flex items-center gap-2 text-xs">
            <span class="text-slate-400 font-mono text-[11px]">Filtrar por Módulo:</span>
            <select id="kb-rules-module-filter" 
                    class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option value="">Todos los Módulos (${rules.length})</option>
              ${moduleNames.map(m => `
                <option value="${escapeAttr(m)}">${m}</option>
              `).join('')}
            </select>
          </div>
        </div>

        ${rules.length > 0 ? `
          <div class="space-y-3" id="kb-rules-list">
            ${rules.map(rule => {
              const isCritical = rule.severity === 'Crítica' || rule.severity === 'Critica' || rule.severity === 'Alta';
              const sevBadge = isCritical 
                ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                : 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';

              return `
                <div data-rule-module="${escapeAttr(rule.module || 'general')}" 
                     class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all space-y-2">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800/60">
                        ${rule.id}
                      </span>
                      <span class="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                        [${rule.module || 'general'}]
                      </span>
                      <h4 class="font-bold text-xs text-slate-900 dark:text-slate-100">
                        ${escapeHtml(rule.title)}
                      </h4>
                    </div>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${sevBadge}">
                      ${rule.severity || 'Normal'}
                    </span>
                  </div>
                  <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-1">
                    ${escapeHtml(rule.description)}
                  </p>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
            <div class="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              ${Icons.scale('w-5 h-5')}
            </div>
            <div class="text-sm font-bold text-slate-700 dark:text-slate-300">No hay reglas de negocio registradas aún</div>
            <p class="text-xs text-slate-500 max-w-md mx-auto">
              Ejecuta la skill <code class="font-mono text-indigo-500">/project-knowledge</code> para extraer automáticamente las reglas e invariantes de tu proyecto.
            </p>
          </div>
        `}
      </section>

      <!-- ============================================================== -->
      <!-- 4. MATRIZ DE SERVICIOS EXTERNOS & CONTRATOS                   -->
      <!-- ============================================================== -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="mb-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
              ${Icons.server}
            </span>
            <span>Matriz de Servicios Externos & Protocolos</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Contratos, protocolos de red, esquemas de autenticación y políticas de contingencia
          </p>
        </div>

        ${services.length > 0 ? `
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${services.map(svc => `
              <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 space-y-2.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-xs text-slate-900 dark:text-slate-100">${escapeHtml(svc.name)}</span>
                  <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-100 dark:cyan-950 text-cyan-700 dark:text-cyan-300 font-semibold">
                    ${escapeHtml(svc.type)}
                  </span>
                </div>
                <div class="space-y-1 text-[11px] font-mono">
                  <div class="text-slate-500 dark:text-slate-400">
                    Protocolo: <span class="text-slate-800 dark:text-slate-200 font-semibold">${escapeHtml(svc.protocol)}</span>
                  </div>
                  <div class="text-slate-500 dark:text-slate-400">
                    Autenticación: <span class="text-slate-800 dark:text-slate-200 font-semibold">${escapeHtml(svc.auth)}</span>
                  </div>
                  <div class="text-slate-500 dark:text-slate-400">
                    Variable: <code class="text-indigo-600 dark:text-indigo-400">${escapeHtml(svc.env_var)}</code>
                  </div>
                </div>
                <div class="pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-600 dark:text-slate-400">
                  <strong class="text-slate-700 dark:text-slate-300">Failover:</strong> ${escapeHtml(svc.failover)}
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
            <div class="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 mx-auto flex items-center justify-center">
              ${Icons.network('w-5 h-5')}
            </div>
            <div class="text-sm font-bold text-slate-700 dark:text-slate-300">Sin integraciones externas documentadas</div>
            <p class="text-xs text-slate-500 max-w-md mx-auto">
              Si tu sistema consume APIs externas, bases de datos o brokers de mensajería, documenta sus contratos para auditar su contingencia.
            </p>
          </div>
        `}
      </section>

      <!-- ============================================================== -->
      <!-- 5. GUARDRAILS ANTI-SESGO & DIRECTRICES DE CÓDIGO               -->
      <!-- ============================================================== -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="mb-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              ${Icons.code}
            </span>
            <span>Directrices Anti-Sesgo & Convenciones de Ingeniería</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Reglas de oro para asegurar que agentes de IA y desarrolladores respeten la arquitectura del proyecto
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Guardrails Anti-Alucinación -->
          <div class="p-5 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/15 space-y-3">
            <h4 class="text-xs font-bold font-mono text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              ${Icons.shield} <span>Guardrails de No-Alucinación (Inviolables)</span>
            </h4>
            <ul class="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              ${(guardrails.length > 0 ? guardrails : [
                'Prohibido instalar paquetes o bibliotecas redundantes no canónicas.',
                'Toda regla de negocio BR-* debe implementarse con tests automatizados.',
                'Inversión de dependencias obligatoria en controladores y servicios.'
              ]).map(g => `
                <li class="flex items-start gap-2">
                  <span class="text-rose-500 font-bold shrink-0 mt-0.5">&times;</span>
                  <span>${escapeHtml(g)}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <!-- Convenciones de Nomenclatura -->
          <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 space-y-3">
            <h4 class="text-xs font-bold font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              ${Icons.tag} <span>Convenciones de Nomenclatura & Control de Versiones</span>
            </h4>
            <div class="space-y-2 text-xs font-mono">
              <div class="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span class="text-slate-400">Archivos:</span>
                <span class="text-slate-800 dark:text-slate-200 font-semibold">${naming.files || 'kebab-case'}</span>
              </div>
              <div class="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span class="text-slate-400">Clases / Tipos:</span>
                <span class="text-slate-800 dark:text-slate-200 font-semibold">${naming.classes || 'PascalCase'}</span>
              </div>
              <div class="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span class="text-slate-400">Ramas Git:</span>
                <code class="text-indigo-600 dark:text-indigo-400 font-bold">{type}/INT-{id}/{name} (≤80c)</code>
              </div>
              <div class="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span class="text-slate-400">Commits:</span>
                <code class="text-indigo-600 dark:text-indigo-400 font-bold">feat(scope): desc / fix(...)</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================== -->
      <!-- MODAL: CREAR NUEVO DOCUMENTO                                   -->
      <!-- ============================================================== -->
      <div id="new-doc-modal" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm hidden items-center justify-center p-4">
        <div class="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              ${Icons.fileText} <span>Crear Nuevo Documento Técnico</span>
            </h3>
            <button type="button" data-action="close-new-doc-modal" class="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer">
              ${Icons.close('w-3.5 h-3.5')}
            </button>
          </div>
          
          <form id="new-doc-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-mono text-[11px] text-slate-500 dark:text-slate-400 mb-1">Módulo o Categoría:</label>
              <input type="text" id="new-doc-module" placeholder="general, backend, billing, infra..." value="general" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none" required />
            </div>

            <div>
              <label class="block font-mono text-[11px] text-slate-500 dark:text-slate-400 mb-1">Nombre del Archivo (.md):</label>
              <input type="text" id="new-doc-filename" placeholder="mi-especificacion.md" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none" required />
            </div>

            <div>
              <label class="block font-mono text-[11px] text-slate-500 dark:text-slate-400 mb-1">Contenido Markdown Inicial:</label>
              <textarea id="new-doc-content" rows="8" placeholder="# Título del Documento&#10;&#10;Descripción y requerimientos..." class="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 resize-none focus:ring-1 focus:ring-indigo-500 focus:outline-none" required></textarea>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2">
              <button type="button" data-action="close-new-doc-modal" class="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer">
                Cancelar
              </button>
              <button type="submit" class="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md transition-colors cursor-pointer">
                Crear Documento
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- MODAL: PROMPT BUNDLER DINÁMICO PARA IA (SYSTEM PROMPT)          -->
      <!-- ============================================================== -->
      <div id="ai-context-modal" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm hidden items-center justify-center p-4">
        <div class="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              ${Icons.bot} <span>Contexto Canónico para alimentar a la IA (System Prompt)</span>
            </h3>
            <button type="button" data-action="close-ai-context-modal" class="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer">
              ${Icons.close('w-3.5 h-3.5')}
            </button>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-400">
            Copia estas instrucciones generadas en vivo desde los metadatos reales del arnés para inicializar cualquier modelo (Claude, Gemini, ChatGPT, Codex) sin sesgo:
          </p>
          <div class="relative">
            <textarea id="ai-context-prompt-text" readonly rows="13" class="w-full p-3.5 font-mono text-[11px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 resize-none focus:outline-none leading-relaxed">${escapeHtml(dynamicAiPrompt)}</textarea>
          </div>
          <div class="flex items-center justify-end gap-3 pt-2">
            <button type="button" 
                    id="copy-context-btn" 
                    class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer">
              Copiar al Portapapeles
            </button>
          </div>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- MODAL: EXPANDIR DIAGRAMAS A PANTALLA COMPLETA                   -->
      <!-- ============================================================== -->
      <div id="diagram-modal" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md hidden items-center justify-center p-4">
        <div class="w-full max-w-6xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-indigo-600 dark:text-indigo-400">${Icons.architecture}</span>
              <h3 id="diagram-modal-title" class="font-bold text-sm text-slate-900 dark:text-white">Diagrama Ampliado</h3>
            </div>
            <button type="button" data-action="close-diagram-modal" class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer">
              ${Icons.close('w-3.5 h-3.5')}
            </button>
          </div>
          <div id="diagram-modal-content" class="p-6 overflow-auto flex-1 flex justify-center items-center bg-slate-50 dark:bg-slate-950">
          </div>
        </div>
      </div>

    </div>
  `;
}

function getShelfIconSvg(shelfId, cls = 'w-4 h-4') {
  switch (shelfId) {
    case 'architecture': return Icons.architecture(cls);
    case 'business_rules': return Icons.scale(cls);
    case 'requirements': return Icons.fileText(cls);
    case 'adrs': return Icons.cube(cls);
    case 'standards': return Icons.shield(cls);
    case 'modules': return Icons.folder(cls);
    default: return Icons.book(cls);
  }
}

function renderTableOfContentsHtml(toc = []) {
  if (!toc || toc.length === 0) {
    return `<div class="text-[11px] text-slate-400 italic py-2">Sin encabezados en este documento.</div>`;
  }

  return `
    <nav class="space-y-1 text-xs font-mono">
      ${toc.map(item => `
        <a href="#${item.id}" 
           class="block py-1 px-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate text-slate-600 dark:text-slate-400 ${item.level === 1 ? 'font-bold text-slate-900 dark:text-slate-100' : item.level === 2 ? 'pl-3' : 'pl-5 text-[11px]'}"
           title="${escapeAttr(item.text)}">
          ${escapeHtml(item.text)}
        </a>
      `).join('')}
    </nav>
  `;
}

function buildAiSystemPrompt({ projectSpec, kData, rules = [], services = [], guardrails = [], naming = {} }) {
  const pName = projectSpec?.project?.name || projectSpec?.name || 'Sistema de Ingeniería Soberana';
  const archStyle = projectSpec?.architecture?.style || 'Clean Architecture (Hexagonal)';
  const patterns = (projectSpec?.architecture?.patterns || []).join(', ');
  const stack = projectSpec?.tech_stack ? Object.entries(projectSpec.tech_stack).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : (v?.name || v)}`).join(' | ') : 'Agnóstico';

  const rulesText = rules.slice(0, 10).map(r => `- ${r.id} (${r.module || 'general'}): ${r.title}. ${r.description}`).join('\n');
  const servicesText = services.map(s => `- ${s.name} (${s.type}): Protocolo ${s.protocol}, Auth: ${s.auth}, Var: ${s.env_var}`).join('\n');
  const guardrailsText = guardrails.map(g => `- [GUARDRAIL] ${g}`).join('\n');

  return `# Contexto Canónico del Proyecto — ${pName}
Arquitectura: ${archStyle} ${patterns ? `(${patterns})` : ''}
Stack Tecnológico: ${stack}

## Reglas de Negocio Clave (Invariantes Obligatorias):
${rulesText || '- Sin reglas de negocio registradas aún.'}

## Integraciones y Servicios Externos:
${servicesText || '- Sin servicios externos registrados aún.'}

## Guardrails Anti-Sesgo & Estándares:
${guardrailsText || '- No inventar librerías redundantes.\n- Respetar convención de ramas {type}/INT-{id}/{name} (≤80c).'}

## Convenciones de Nomenclatura:
- Archivos: ${naming.files || 'kebab-case'}
- Clases / Tipos: ${naming.classes || 'PascalCase'}
- Ramas Git: {type}/INT-{id}/{name} (≤80c)
- Commits: Conventional Commits (feat, fix, docs, refactor)
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

function escapeAttr(text) {
  if (!text) return '';
  return String(text).replace(/"/g, '&quot;');
}

function getFallbackKnowledge() {
  if (typeof window !== 'undefined' && window.__FALLBACK_DATA__?.knowledgeIndex) {
    return window.__FALLBACK_DATA__.knowledgeIndex;
  }
  return {
    diagrams: [],
    business_rules: [],
    external_services: [],
    coding_standards: { guardrails: [], naming_conventions: {} },
    docs: getDefaultDocs()
  };
}

function buildDocMetadataFallback(docs) {
  const meta = {};
  for (const [k, c] of Object.entries(docs)) {
    const words = c.trim().split(/\s+/).length;
    meta[k] = {
      key: k,
      title: k.replace(/\.md$/, '').replace(/[-_]/g, ' '),
      summary: c.slice(0, 140) + '...',
      shelf: k.startsWith('modules/') ? 'modules' : 'architecture',
      readingTime: Math.max(1, Math.ceil(words / 200)),
      wordCount: words,
      ruleCount: (c.match(/BR-[A-Z]+-[0-9]+/g) || []).length,
      reqCount: (c.match(/RF-[A-Z]+-[0-9]+/g) || []).length,
      adrCount: (c.match(/ADR-[0-9]+/g) || []).length,
      moduleName: k.startsWith('modules/') ? k.split('/')[1] : null
    };
  }
  return meta;
}

function buildShelvesFallback(docMetadata) {
  const shelves = {
    architecture: { id: 'architecture', title: 'Arquitectura & Modelado C4', iconName: 'architecture', docs: [] },
    business_rules: { id: 'business_rules', title: 'Reglas de Negocio & Dominio', iconName: 'business_rules', docs: [] },
    requirements: { id: 'requirements', title: 'Requerimientos & Metodología Ágil', iconName: 'requirements', docs: [] },
    adrs: { id: 'adrs', title: 'Decisiones de Arquitectura (ADRs)', iconName: 'adrs', docs: [] },
    standards: { id: 'standards', title: 'Estándares, Capacidades & Servicios', iconName: 'standards', docs: [] },
    modules: { id: 'modules', title: 'Módulos & Bounded Contexts', iconName: 'modules', docs: [] }
  };
  for (const [k, m] of Object.entries(docMetadata)) {
    const s = m.shelf && shelves[m.shelf] ? m.shelf : (k.startsWith('modules/') ? 'modules' : 'architecture');
    shelves[s].docs.push(k);
  }
  return shelves;
}

function buildModulesDataFallback(docMetadata) {
  const modules = {};
  for (const [k, m] of Object.entries(docMetadata)) {
    if (k.startsWith('modules/')) {
      const parts = k.split('/');
      const modId = parts[1];
      const filename = parts.slice(2).join('/');
      if (!modules[modId]) {
        modules[modId] = {
          id: modId,
          name: modId,
          title: modId.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          status: 'COMPLETAMENTE CUBIERTO',
          docs: [],
          docMetadata: {}
        };
      }
      modules[modId].docs.push(k);
      modules[modId].docMetadata[filename] = m;
    }
  }
  return modules;
}

function getDefaultDocs() {
  return {
    'c4-model.md': '# Modelo C4 — Arquitectura de Sistema y Contenedores\n\n> [!NOTE]\n> Especificación de contexto y contenedores del sistema.\n\n## Componentes\n- API Gateway\n- Microservicios de Dominio\n- Bases de datos transaccionales',
    'coding-standards.md': '# Estándares de Codificación & Guardrails Anti-Sesgo\n\n> [!NOTE]\n> Este documento define las directrices obligatorias para desarrolladores y agentes de IA.\n\n## Convenciones\n- **Ramas**: `{type}/INT-{id}/{name}` (≤80c)\n- **Commits**: `feat(scope): desc` o `fix(scope): desc`\n\n## Guardrails Estrictos\n1. No instalar librerías redundantes.\n2. Inversión de dependencias estricta en controladores.'
  };
}
