import { Icons } from '../../shared/Icons.js';
import { renderBadge } from '../../shared/Badge.js';

/**
 * KnowledgeBaseComponent: Base de Conocimiento Canónica del Proyecto.
 * Provee contexto completo para agentes de IA y desarrolladores:
 * - Catálogo de Reglas de Negocio con IDs únicos (BR-*).
 * - Matriz de Servicios Externos e Integraciones.
 * - Estándares de Programación & Directrices Anti-Sesgo.
 * - Explorador de Documentación Modular (infra, backend, billing, analytics, notifications).
 * - Generador de Prompt de Contexto para Agentes de IA.
 */
export function renderKnowledgeBase({ knowledgeIndex, projectSpec, features = [] }) {
  const kData = knowledgeIndex || getFallbackKnowledge();
  const rules = kData.business_rules || [];
  const services = kData.external_services || [];
  const standards = kData.coding_standards || {};
  const guardrails = standards.guardrails || [];
  const naming = standards.naming_conventions || {};

  return `
    <div class="space-y-8">
      
      <!-- 1. HEADER HERO: Base de Conocimiento Canónica -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Single Source of Truth
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-100 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                Anti-Bias Context for AI
              </span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span>📚</span> Base de Conocimiento del Proyecto
            </h2>
            <p class="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              Repositorio canónico de reglas de negocio, contratos de servicios externos, diagramas y estándares de codificación.
              Sirve de <strong>contexto canónico</strong> para alimentar a los agentes de IA (Google Antigravity, Claude Code, Open Code, Copilot, Codex) y evitar el sesgo o las alucinaciones por falta de información.
            </p>
          </div>

          <!-- Botón Generador de Prompt de Contexto -->
          <div class="shrink-0">
            <button type="button" 
                    data-action="open-ai-context-modal" 
                    class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">
              <span>🤖</span> Copiar Contexto para IA
            </button>
          </div>
        </div>

        <!-- Métricas Rápidas de la Base de Conocimiento -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div class="text-[10px] font-mono text-slate-400 uppercase">Reglas de Negocio</div>
            <div class="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">${rules.length} catalogadas</div>
            <div class="text-[10px] text-slate-500 mt-0.5">Identificadores BR-*</div>
          </div>
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div class="text-[10px] font-mono text-slate-400 uppercase">Servicios Externos</div>
            <div class="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">${services.length} integraciones</div>
            <div class="text-[10px] text-slate-500 mt-0.5">Stripe, PG, Redis, RabbitMQ</div>
          </div>
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div class="text-[10px] font-mono text-slate-400 uppercase">Guardrails Anti-Sesgo</div>
            <div class="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">${guardrails.length} directrices</div>
            <div class="text-[10px] text-slate-500 mt-0.5">Reglas de no-alucinación</div>
          </div>
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div class="text-[10px] font-mono text-slate-400 uppercase">Documentación Modular</div>
            <div class="text-xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-0.5">5 Bounded Contexts</div>
            <div class="text-[10px] text-slate-500 mt-0.5">infra, backend, billing...</div>
          </div>
        </div>
      </section>

      <!-- 2. CATÁLOGO DE REGLAS DE NEGOCIO (BR-*) -->
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

      <!-- 3. MATRIZ DE SERVICIOS EXTERNOS & CONTRATOS -->
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

      <!-- 4. GUARDRAILS ANTI-SESGO & FORMA DE PROGRAMAR -->
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

      <!-- 5. EXPLORADOR MODULAR DE DOCUMENTACIÓN -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="mb-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
              ${Icons.folder}
            </span>
            Documentación Modular Generada (<code class="font-mono text-indigo-500">project-docs/knowledge/modules/</code>)
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Archivos estructurados por Bounded Context listos para referencia de agentes y desarrolladores
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          ${['infra', 'backend', 'billing', 'analytics', 'notifications'].map(modName => `
            <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 space-y-2 text-xs">
              <div class="flex items-center gap-2 font-bold font-mono text-indigo-600 dark:text-indigo-400">
                <span>📁</span>
                <span>${modName}</span>
              </div>
              <div class="space-y-1 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                <div class="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                  <span>📄</span> <code>module-spec.md</code>
                </div>
                <div class="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                  <span>📄</span> <code>rules.md</code>
                </div>
                <div class="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                  <span>📄</span> <code>sequence.md</code>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- MODAL FLOTANTE DE CONTEXTO CANÓNICO PARA IA -->
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

function getFallbackKnowledge() {
  if (typeof window !== 'undefined' && window.__FALLBACK_DATA__?.knowledgeIndex) {
    return window.__FALLBACK_DATA__.knowledgeIndex;
  }
  return {
    business_rules: [],
    external_services: [],
    coding_standards: { guardrails: [], naming_conventions: {} }
  };
}
