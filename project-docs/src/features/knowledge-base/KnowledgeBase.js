import { Icons } from '../../shared/Icons.js';
import { renderBadge } from '../../shared/Badge.js';
import { renderMarkdown } from '../../shared/MarkdownViewer.js';

/**
 * KnowledgeBaseComponent: Base de Conocimiento de Ingeniería Soberana (Docs-as-Code).
 * Inspirada en la arquitectura, gestión y diseño editorial de ContextForge.
 *
 * Capacidades:
 * 1. Gestión de Documentos: Lectura, Creación (➕), Edición directa (✏️) y Eliminación (🗑️).
 * 2. Importación & Exportación: Carga de archivos .md/.json y exportación en 1-clic.
 * 3. Buscador reactivo con debouncing para módulos y documentos.
 * 4. Lector Editorial con soporte de GitHub Alerts, tablas limpias y bloques de código.
 * 5. Prompt Bundler para LLMs (copiar contexto canónico sin sesgo).
 * 6. Catálogo formal de Reglas de Negocio (BR-*), Servicios Externos y Guardrails.
 */

export function renderKnowledgeBase({ knowledgeIndex, projectSpec, features = [] }) {
  const kData = knowledgeIndex || getFallbackKnowledge();
  const rules = kData.business_rules || [];
  const services = kData.external_services || [];
  const standards = kData.coding_standards || {};
  const guardrails = standards.guardrails || [];
  const naming = standards.naming_conventions || {};
  const docs = kData.docs || getDefaultDocs();

  // Documento activo por defecto
  const docKeys = Object.keys(docs);
  const activeDocKey = docKeys.includes('coding-standards.md') 
    ? 'coding-standards.md' 
    : (docKeys[0] || 'c4-model.md');
  const activeDocContent = docs[activeDocKey] || '# Documento no disponible';

  // Categorizar documentos
  const generalDocs = [];
  const moduleDocsMap = {};

  docKeys.forEach(key => {
    if (key.startsWith('modules/')) {
      const parts = key.split('/');
      const modName = parts[1] || 'general';
      const fileName = parts.slice(2).join('/') || parts[1];
      if (!moduleDocsMap[modName]) moduleDocsMap[modName] = [];
      moduleDocsMap[modName].push({ key, fileName, modName });
    } else {
      generalDocs.push({ key, fileName: key });
    }
  });

  const availableModules = Object.keys(moduleDocsMap);

  return `
    <div class="space-y-10">
      
      <!-- 1. HEADER HERO: ContextForge Sovereign Knowledge Base -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Docs-as-Code
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-100 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                Sovereign Engineering Knowledge
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Anti-Bias Context
              </span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span>📚</span> Base de Conocimiento de Ingeniería (ContextForge)
            </h2>
            <p class="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              Repositorio soberano de arquitectura, requerimientos, reglas de negocio y documentación viva en Markdown.
              Permite auditar, crear y editar documentos técnicos para transferir contexto libre de sesgos a desarrolladores e inteligencias artificiales.
            </p>
          </div>

          <!-- Barra de Acciones Principales -->
          <div class="flex flex-wrap items-center gap-2.5">
            <!-- Nuevo Documento -->
            <button type="button" 
                    data-action="open-new-doc-modal"
                    class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer">
              <span>➕</span> Nuevo Doc
            </button>

            <!-- Importar Archivo -->
            <button type="button" 
                    data-action="trigger-import-doc"
                    class="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer"
                    title="Importar archivo .md o .json local">
              <span>📥</span> Importar
            </button>
            <input type="file" id="import-doc-file-input" accept=".md,.markdown,.json" class="hidden" />

            <!-- Exportar Todo -->
            <button type="button" 
                    data-action="export-all-knowledge"
                    class="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer"
                    title="Descargar paquete JSON con toda la Base de Conocimiento">
              <span>📤</span> Exportar
            </button>

            <!-- Prompt Bundler para LLM -->
            <button type="button" 
                    data-action="open-ai-context-modal" 
                    class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all cursor-pointer">
              <span>🤖</span> Contexto IA
            </button>
          </div>
        </div>

        <!-- Métricas Rápidas -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div class="text-[10px] font-mono text-slate-400 uppercase">Documentos Vivos</div>
            <div id="kb-stats-doc-count" class="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">${docKeys.length} indexados</div>
            <div class="text-[10px] text-slate-500 mt-0.5">Docs-as-Code (.md)</div>
          </div>
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div class="text-[10px] font-mono text-slate-400 uppercase">Bounded Contexts</div>
            <div class="text-xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-0.5">${availableModules.length} módulos</div>
            <div class="text-[10px] text-slate-500 mt-0.5">DDD estratégicos</div>
          </div>
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div class="text-[10px] font-mono text-slate-400 uppercase">Reglas de Negocio</div>
            <div class="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">${rules.length} catalogadas</div>
            <div class="text-[10px] text-slate-500 mt-0.5">Identificadores BR-*</div>
          </div>
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div class="text-[10px] font-mono text-slate-400 uppercase">Servicios Externos</div>
            <div class="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">${services.length} integraciones</div>
            <div class="text-[10px] text-slate-500 mt-0.5">Stripe, PG, Redis...</div>
          </div>
        </div>
      </section>

      <!-- 2. EXPLORADOR & LECTOR EDITORIAL DOCS-AS-CODE (Estilo ContextForge) -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- 2.1 SIDEBAR DE NAVEGACIÓN Y BÚSQUEDA (4 de 12 columnas) -->
          <div class="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 space-y-4">
            
            <!-- Buscador con Debouncing -->
            <div class="relative">
              <input type="text" 
                     id="kb-doc-search-input" 
                     placeholder="Buscar documento o módulo..." 
                     class="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono shadow-xs" />
              <span class="absolute left-3 top-2.5 text-slate-400 pointer-events-none text-xs">
                ${Icons.search('w-3.5 h-3.5')}
              </span>
            </div>

            <!-- Filtro rápido por Módulo (Pills) -->
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono" id="kb-module-pill-filters">
              <button type="button" 
                      data-kb-filter-module="" 
                      class="kb-mod-pill active px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold transition-all cursor-pointer shrink-0">
                Todos
              </button>
              ${availableModules.map(m => `
                <button type="button" 
                        data-kb-filter-module="${m}" 
                        class="kb-mod-pill px-2.5 py-1 rounded-lg bg-slate-200/70 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shrink-0">
                  ${m}
                </button>
              `).join('')}
            </div>

            <!-- Lista Jerárquica de Documentos -->
            <div class="space-y-4 max-h-[560px] overflow-y-auto pr-1" id="kb-docs-list-tree">
              
              <!-- Documentos Canónicos Generales -->
              <div class="space-y-1 kb-doc-group" data-group-type="general">
                <div class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center justify-between">
                  <span>🏛️ Canónicos Generales</span>
                  <span class="text-[9px] opacity-70">${generalDocs.length}</span>
                </div>
                <div class="space-y-0.5">
                  ${generalDocs.map(doc => `
                    <button type="button" 
                            data-doc-key="${escapeAttr(doc.key)}"
                            data-doc-name="${escapeAttr(doc.fileName)}"
                            class="doc-nav-item w-full text-left px-3 py-2 rounded-xl flex items-center justify-between font-mono text-xs transition-all cursor-pointer ${doc.key === activeDocKey ? 'active bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'}">
                      <span class="flex items-center gap-2 truncate">
                        <span class="text-xs opacity-75">📄</span>
                        <span class="truncate">${doc.fileName}</span>
                      </span>
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Módulos / Bounded Contexts -->
              <div class="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800" id="kb-modules-container">
                <div class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center justify-between">
                  <span>📦 Bounded Contexts</span>
                  <span class="text-[9px] opacity-70">${availableModules.length}</span>
                </div>

                ${availableModules.map(modName => `
                  <div class="space-y-1 kb-module-item" data-module-name="${modName}">
                    <div class="flex items-center justify-between px-2 py-0.5 text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      <span class="flex items-center gap-1.5">
                        <span>📁</span>
                        <span>${modName}</span>
                      </span>
                      <span class="text-[9px] font-normal text-slate-400">${moduleDocsMap[modName].length} docs</span>
                    </div>
                    <div class="pl-2 space-y-0.5 text-xs font-mono">
                      ${moduleDocsMap[modName].map(doc => `
                        <button type="button" 
                                data-doc-key="${escapeAttr(doc.key)}"
                                data-doc-name="${escapeAttr(doc.fileName)}"
                                data-doc-module="${escapeAttr(modName)}"
                                class="doc-nav-item w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${doc.key === activeDocKey ? 'active bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'}">
                          <span class="flex items-center gap-1.5 truncate">
                            <span class="text-[10px] opacity-70">📄</span>
                            <span class="truncate text-[11px]">${doc.fileName}</span>
                          </span>
                        </button>
                      `).join('')}
                    </div>
                  </div>
                `).join('')}
              </div>

            </div>

          </div>

          <!-- 2.2 LECTOR & EDITOR EDITORIAL (8 de 12 columnas) -->
          <div class="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 min-h-[560px] shadow-sm flex flex-col justify-between">
            
            <div>
              <!-- Barra Superior del Documento -->
              <div class="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div class="flex items-center gap-2 text-xs font-mono">
                  <span class="text-slate-400">Documento:</span>
                  <span id="doc-active-path" class="text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60">
                    ${activeDocKey}
                  </span>
                </div>

                <!-- Herramientas del Documento Activo -->
                <div class="flex items-center gap-2">
                  <!-- Botón Conmutar Modo Edición / Lectura -->
                  <button type="button" 
                          id="btn-toggle-doc-editor" 
                          class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                          title="Editar el contenido de este documento">
                    <span id="btn-toggle-doc-icon">✏️</span>
                    <span id="btn-toggle-doc-text">Editar</span>
                  </button>

                  <!-- Botón Copiar Markdown -->
                  <button type="button" 
                          id="copy-active-doc-btn" 
                          class="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                          title="Copiar contenido Markdown completo">
                    <span class="text-xs">📋</span>
                  </button>

                  <!-- Botón Descargar Archivo .md -->
                  <button type="button" 
                          data-action="download-active-doc" 
                          class="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                          title="Descargar este archivo .md a tu equipo">
                    <span class="text-xs">💾</span>
                  </button>

                  <!-- Botón Eliminar Documento -->
                  <button type="button" 
                          data-action="delete-active-doc" 
                          class="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                          title="Eliminar este documento de la Base de Conocimiento">
                    <span class="text-xs">🗑️</span>
                  </button>
                </div>
              </div>

              <!-- MODO 1: LECTOR EDITORIAL (ACTIVO) -->
              <div id="doc-reader-view-container" class="space-y-4">
                <div id="doc-active-body" class="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200">
                  ${renderMarkdown(activeDocContent)}
                </div>
              </div>

              <!-- MODO 2: EDITOR MARKDOWN EN VIVO (OCULTO POR DEFECTO) -->
              <div id="doc-editor-view-container" class="hidden space-y-4">
                <div class="flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>Modo Editor Directo (Markdown)</span>
                  <span>Soporta tablas, alertas GitHub y diagramas Mermaid</span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Textarea de Edición -->
                  <textarea id="doc-editor-textarea" 
                            rows="18" 
                            class="w-full p-4 font-mono text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed">${escapeHtml(activeDocContent)}</textarea>

                  <!-- Previsualización en Vivo -->
                  <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 overflow-y-auto max-h-[460px]">
                    <div class="text-[10px] font-mono uppercase tracking-wider text-slate-400 pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                      Vista Previa en Vivo
                    </div>
                    <div id="doc-editor-live-preview" class="prose dark:prose-invert max-w-none text-xs">
                      ${renderMarkdown(activeDocContent)}
                    </div>
                  </div>
                </div>

                <!-- Botones de Guardar / Cancelar Edición -->
                <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button type="button" 
                          id="btn-cancel-doc-edit" 
                          class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    Cancelar
                  </button>
                  <button type="button" 
                          id="btn-save-doc-edit" 
                          class="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-1.5">
                    <span>💾</span> Guardar Cambios
                  </button>
                </div>
              </div>

            </div>

            <!-- Pie del Lector -->
            <div class="pt-6 mt-8 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Soberanía: Docs-as-Code</span>
              <span>Guardado local persistente</span>
            </div>

          </div>

        </div>

      </section>

      <!-- 3. CATÁLOGO DE REGLAS DE NEGOCIO (BR-*) -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                ${Icons.checkCircle}
              </span>
              Catálogo de Reglas de Negocio (Invariantes de Dominio)
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Invariantes de cumplimiento estricto para no generar discrepancias contables ni vulnerabilidades
            </p>
          </div>

          <!-- Selector de Filtro de Módulo -->
          <div class="flex items-center gap-2 text-xs">
            <span class="text-slate-400 font-mono text-[11px]">Filtrar:</span>
            <select id="kb-rules-module-filter" 
                    class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option value="">Todos los Módulos</option>
              <option value="backend">backend</option>
              <option value="billing">billing</option>
              <option value="infra">infra</option>
              <option value="analytics">analytics</option>
              <option value="notifications">notifications</option>
            </select>
          </div>
        </div>

        <div class="space-y-3" id="kb-rules-list">
          ${rules.map(rule => {
            const isCritical = rule.severity === 'Crítica';
            const sevBadge = isCritical 
              ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
              : 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';

            return `
              <div data-rule-module="${rule.module}" 
                   class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 hover:border-indigo-400 transition-all space-y-1.5">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800/60">
                      ${rule.id}
                    </span>
                    <span class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                      [${rule.module}]
                    </span>
                    <h4 class="font-bold text-xs text-slate-900 dark:text-slate-100">
                      ${rule.title}
                    </h4>
                  </div>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${sevBadge}">
                    ${rule.severity}
                  </span>
                </div>
                <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-1">
                  ${rule.description}
                </p>
              </div>
            `;
          }).join('')}
        </div>
      </section>

      <!-- 4. MATRIZ DE SERVICIOS EXTERNOS & CONTRATOS -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="mb-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
              ${Icons.server}
            </span>
            Matriz de Servicios Externos & Protocolos
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Contratos, protocolos, autenticación y políticas de contingencia de las dependencias externas
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${services.map(svc => `
            <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-slate-900 dark:text-slate-100">${svc.name}</span>
                <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-semibold">
                  ${svc.type}
                </span>
              </div>
              <div class="space-y-1 text-[11px] font-mono">
                <div class="text-slate-500 dark:text-slate-400">
                  Protocolo: <span class="text-slate-800 dark:text-slate-200 font-semibold">${svc.protocol}</span>
                </div>
                <div class="text-slate-500 dark:text-slate-400">
                  Autenticación: <span class="text-slate-800 dark:text-slate-200 font-semibold">${svc.auth}</span>
                </div>
                <div class="text-slate-500 dark:text-slate-400">
                  Variable: <code class="text-indigo-600 dark:text-indigo-400">${svc.env_var}</code>
                </div>
              </div>
              <div class="pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-600 dark:text-slate-400">
                <strong class="text-slate-700 dark:text-slate-300">Failover:</strong> ${svc.failover}
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- 5. GUARDRAILS ANTI-SESGO & FORMA DE PROGRAMAR -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="mb-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              ${Icons.code}
            </span>
            Directrices Anti-Sesgo & Forma de Programar
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Reglas de oro para evitar que los agentes de IA inventen dependencias o rompan la arquitectura
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Guardrails Estrictos para IA -->
          <div class="p-5 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/15 space-y-3">
            <h4 class="text-xs font-bold font-mono text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🛑</span> Guardrails de No-Alucinación (Obligatorios)
            </h4>
            <ul class="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              ${guardrails.map(g => `
                <li class="flex items-start gap-2">
                  <span class="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                  <span>${escapeHtml(g)}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <!-- Convenciones de Nomenclatura -->
          <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 space-y-3">
            <h4 class="text-xs font-bold font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>📐</span> Convenciones de Nomenclatura del Código
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

      <!-- MODAL PARA NUEVO DOCUMENTO (➕) -->
      <div id="new-doc-modal" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm hidden items-center justify-center p-4">
        <div class="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>📄</span> Crear Nuevo Documento Técnico
            </h3>
            <button type="button" data-action="close-new-doc-modal" class="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer">
              ✕
            </button>
          </div>
          
          <form id="new-doc-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-mono text-[11px] text-slate-500 dark:text-slate-400 mb-1">Módulo o Categoría:</label>
              <input type="text" id="new-doc-module" placeholder="general, infra, backend, billing..." value="general" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none" required />
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

      <!-- MODAL FLOTANTE DE CONTEXTO CANÓNICO PARA IA (PROMPT BUNDLER) -->
      <div id="ai-context-modal" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm hidden items-center justify-center p-4">
        <div class="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>🤖</span> Contexto Canónico para alimentar a la IA (System Prompt)
            </h3>
            <button type="button" data-action="close-ai-context-modal" class="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer">
              ✕
            </button>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-400">
            Copia este bloque de instrucciones para inicializar cualquier conversación con agentes o modelos (ChatGPT, Claude, Codex, Copilot) para que operen con cero sesgo y pleno conocimiento del proyecto:
          </p>
          <div class="relative">
            <textarea id="ai-context-prompt-text" readonly rows="12" class="w-full p-3 font-mono text-[11px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 resize-none focus:outline-none">
# Contexto Canónico del Proyecto — CloudSaaS Platform
Arquitectura: Clean Architecture (Hexagonal) + Event-Driven Architecture (EDA)
Stack: Node.js (LTS), .NET 10, PostgreSQL 16, Redis 7.2, RabbitMQ 3.13

## Reglas de Negocio Clave:
- BR-AUTH-001: Marcas de tiempo de expiración JWT calculadas exclusivamente en Epoch UTC.
- BR-BILL-001: Cabecera Idempotency-Key obligatoria en checkout (Redis TTL 120s).
- BR-BILL-002: Verificación criptográfica HMAC-SHA256 obligatoria en webhooks de Stripe.
- BR-BILL-003: Algoritmo Banker's Rounding (IEEE 754) a dos decimales exactos.
- BR-CART-002: Operaciones atómicas en Redis para reserva de inventario.
- BR-ORDR-001: Desvío a orders.dlq tras 3 reintentos con backoff exponencial.

## Estándares de Código:
- Ramas Git: {type}/INT-{numero}/{nombre_rama} (máximo 80 caracteres).
- Commits: Conventional Commits (feat, fix, docs, refactor).
- Estilo: Controladores HTTP pasan por Casos de Uso e interfaces de repositorio. Prohibido inventar librerías no aprobadas.
            </textarea>
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

      <!-- MODAL PARA EXPANDIR DIAGRAMAS A PANTALLA COMPLETA -->
      <div id="diagram-modal" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md hidden items-center justify-center p-4">
        <div class="w-full max-w-6xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-base">📐</span>
              <h3 id="diagram-modal-title" class="font-bold text-sm text-slate-900 dark:text-white">Diagrama Ampliado</h3>
            </div>
            <button type="button" data-action="close-diagram-modal" class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer">
              ✕
            </button>
          </div>
          <div id="diagram-modal-content" class="p-6 overflow-auto flex-1 flex justify-center items-center bg-slate-50 dark:bg-slate-950">
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

function getDefaultDocs() {
  return {
    'coding-standards.md': '# Estándares de Codificación & Guardrails Anti-Sesgo\n\n> [!NOTE]\n> Este documento define las directrices obligatorias para desarrolladores y agentes de IA.\n\n## Convenciones\n- **Ramas**: `{type}/INT-{id}/{name}` (≤80c)\n- **Commits**: `feat(scope): desc` o `fix(scope): desc`\n\n## Guardrails Estrictos\n1. No instalar librerías redundantes.\n2. Inversión de dependencias estricta en controladores.',
    'modules/billing/module-spec.md': '# Módulo: billing (Facturación & Pagos)\n\n> [!IMPORTANT]\n> Módulo crítico que gestiona cobros e impuestos.\n\n## Tareas Asignadas\n- `INT-006`: `payment_gateway_integration` (Stripe HMAC e idempotencia).\n- `INT-007`: `fix_cart_tax_rounding` (Banker\'s rounding a 2 decimales).'
  };
}
