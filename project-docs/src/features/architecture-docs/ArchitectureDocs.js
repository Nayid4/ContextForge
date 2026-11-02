import { Icons } from '../../shared/Icons.js';
import { renderBadge } from '../../shared/Badge.js';

/**
 * ArchitectureDocs Component: Vista técnica completa del proyecto.
 * Presenta:
 * 1. ¿De qué se trata el proyecto? (Propósito, alcance y objetivos).
 * 2. Visualizador Interactivo de Diagramas Generales:
 *    - Capas del Sistema (Clean Architecture + EDA)
 *    - C4 Nivel 1: Contexto del Sistema (C1)
 *    - C4 Nivel 2: Contenedores (C2)
 *    - C4 Nivel 3: Componentes Clean Core (C3)
 *    - UML: Clases de Dominio
 *    - UML: Secuencia Checkout & Pago Idempotente
 *    - UML: Casos de Uso
 * 3. Stack de tecnologías, librerías y runtimes identificados por technical-audit.
 * 4. Arquitectura y patrones de diseño (Repository, CQRS, Idempotency, DLQ, etc.).
 * 5. Módulos identificados con responsabilidades y tareas asociadas.
 */
export function renderArchitectureDocs({ projectSpec, knowledgeIndex, features = [] }) {
  const spec = projectSpec || getFallbackSpec();
  const kData = knowledgeIndex || getFallbackKnowledge();
  const proj = spec.project || {};
  const tech = spec.tech_stack || {};
  const arch = spec.architecture || {};
  const modules = spec.modules || [];
  const goals = spec.business_goals || [];
  const diagrams = kData.diagrams || [];

  const featureMap = new Map();
  features.forEach(f => featureMap.set(f.id, f));

  return `
    <div class="space-y-10">
      
      <!-- 1. HEADER: ¿De qué se trata el proyecto? -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                ${proj.type || 'Cloud Architecture'}
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                v${proj.version || '2.0.0'}
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                ${proj.maturity || 'SDD 2.0'}
              </span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ${escapeHtml(proj.name || 'CloudSaaS Platform')}
            </h2>
            <p class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
              ${escapeHtml(proj.tagline || 'E-Commerce & Microservicios Cloud')}
            </p>
          </div>

          <!-- Métricas de Auditoría Rápida -->
          <div class="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-mono">
            <div>
              <div class="text-[10px] text-slate-400 uppercase tracking-wider">Módulos</div>
              <div class="font-bold text-slate-800 dark:text-slate-200 text-base">${modules.length}</div>
            </div>
            <div class="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
            <div>
              <div class="text-[10px] text-slate-400 uppercase tracking-wider">Servicios Base</div>
              <div class="font-bold text-slate-800 dark:text-slate-200 text-base">3 (DB, Cache, Queue)</div>
            </div>
            <div class="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
            <div>
              <div class="text-[10px] text-slate-400 uppercase tracking-wider">Auditoría</div>
              <div class="font-bold text-emerald-600 dark:text-emerald-400 text-base">verify.sh OK</div>
            </div>
          </div>
        </div>

        <!-- Descripción del Proyecto y Objetivos -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
          <div class="lg:col-span-2 space-y-3">
            <h3 class="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              ${Icons.folder} Propósito y Alcance del Sistema
            </h3>
            <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              ${escapeHtml(proj.description || '')}
            </p>
          </div>

          <div class="space-y-3 lg:border-l lg:border-slate-200 lg:dark:border-slate-800 lg:pl-6">
            <h3 class="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              ${Icons.check} Objetivos Técnicos & de Negocio
            </h3>
            <ul class="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              ${goals.map(g => `
                <li class="flex items-start gap-2">
                  <span class="text-indigo-500 font-bold shrink-0 mt-0.5">▪</span>
                  <span>${escapeHtml(g)}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </section>

      <!-- 2. DIAGRAMAS GENERALES DE ARQUITECTURA (C4 & UML) -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                ${Icons.layers}
              </span>
              Diagramas Generales de Arquitectura (C4 & UML)
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Visualiza el modelo C4 y los diagramas UML del proyecto con código Mermaid interactivo
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button type="button" 
                    id="copy-active-mermaid-btn" 
                    class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5">
              <span>📋</span> Copiar Código Mermaid
            </button>
          </div>
        </div>

        <!-- Selector de Pestañas de Diagramas -->
        <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto text-xs font-medium" id="arch-diagram-nav">
          <button type="button" 
                  data-arch-tab="layers" 
                  class="arch-tab-btn active px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold transition-all cursor-pointer">
            🏗️ Capas del Sistema (Clean Core)
          </button>
          <button type="button" 
                  data-arch-tab="c4-context" 
                  class="arch-tab-btn px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
            📐 C4: Contexto (C1)
          </button>
          <button type="button" 
                  data-arch-tab="c4-containers" 
                  class="arch-tab-btn px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
            📦 C4: Contenedores (C2)
          </button>
          <button type="button" 
                  data-arch-tab="c4-components" 
                  class="arch-tab-btn px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
            🧩 C4: Componentes (C3)
          </button>
          <button type="button" 
                  data-arch-tab="uml-classes" 
                  class="arch-tab-btn px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
            🏛️ UML: Clases
          </button>
          <button type="button" 
                  data-arch-tab="uml-sequence" 
                  class="arch-tab-btn px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
            🔄 UML: Secuencia Checkout
          </button>
          <button type="button" 
                  data-arch-tab="uml-usecases" 
                  class="arch-tab-btn px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
            👥 UML: Casos de Uso
          </button>
        </div>

        <!-- 2.1 PANEL: CAPAS GENERALES DEL SISTEMA -->
        <div id="diagram-panel-layers" class="diagram-panel block mt-6">
          <div class="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/90 p-4 shadow-inner">
            <div class="min-w-[960px] max-w-5xl mx-auto py-4">
              
              <!-- CAPA 1: Clientes y Entrada Externa -->
              <div class="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs mb-6">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Capa 1: Clientes & Perímetro de Entrada
                  </span>
                  <span class="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-800">
                    HTTPS / WSS / JSON
                  </span>
                </div>
                <div class="grid grid-cols-4 gap-3">
                  <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                    <div class="text-base mb-1">💻</div>
                    <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Web App (SPA)</div>
                    <div class="text-[10px] text-slate-400">Dashboard & Catálogo</div>
                  </div>
                  <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                    <div class="text-base mb-1">📱</div>
                    <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Mobile Client</div>
                    <div class="text-[10px] text-slate-400">Checkout & Tracking</div>
                  </div>
                  <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                    <div class="text-base mb-1">🤖</div>
                    <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Agentes de IA</div>
                    <div class="text-[10px] text-slate-400">Antigravity / SDD CLI</div>
                  </div>
                  <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                    <div class="text-base mb-1">💳</div>
                    <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Webhooks Pasarela</div>
                    <div class="text-[10px] text-slate-400">Stripe / PSE Callbacks</div>
                  </div>
                </div>
              </div>

              <!-- Flecha de Flujo 1 -> 2 -->
              <div class="flex justify-center -my-3 relative z-10">
                <div class="px-3 py-1 rounded-full bg-cyan-600 text-white font-mono text-[10px] font-bold shadow-md">
                  ↓ Tráfico HTTPS Seguro
                </div>
              </div>

              <!-- CAPA 2: API Gateway & Edge -->
              <div class="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 shadow-xs my-6">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Capa 2: API Gateway, Enrutamiento & Seguridad Perimetral
                  </span>
                  <span class="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                    Reverse Proxy + Auth Middleware
                  </span>
                </div>
                <div class="grid grid-cols-3 gap-3 text-center">
                  <div class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50">
                    <div class="text-xs font-bold text-slate-800 dark:text-slate-200">🛡️ Rate Limiting & SSL</div>
                    <div class="text-[10px] text-slate-400">Protección DoS & TLS 1.3</div>
                  </div>
                  <div class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50">
                    <div class="text-xs font-bold text-slate-800 dark:text-slate-200">🔑 JWT Auth & RBAC</div>
                    <div class="text-[10px] text-slate-400">Middleware de firmas criptográficas</div>
                  </div>
                  <div class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50">
                    <div class="text-xs font-bold text-slate-800 dark:text-slate-200">🔀 Router & Circuit Breaker</div>
                    <div class="text-[10px] text-slate-400">Despacho hacia microservicios</div>
                  </div>
                </div>
              </div>

              <!-- Flecha de Flujo 2 -> 3 -->
              <div class="flex justify-center -my-3 relative z-10">
                <div class="px-3 py-1 rounded-full bg-indigo-600 text-white font-mono text-[10px] font-bold shadow-md">
                  ↓ Casos de Uso & Clean Core
                </div>
              </div>

              <!-- CAPA 3: Dominios & Microservicios (Clean Core) -->
              <div class="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs my-6">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Capa 3: Dominios Funcionales & Microservicios (Lógica de Negocio Pura)
                  </span>
                  <span class="text-[10px] font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                    Clean Architecture
                  </span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">auth</span>
                      <span class="text-[9px] font-mono bg-indigo-100 dark:bg-indigo-950/60 px-1 py-0.2 rounded text-indigo-700 dark:text-indigo-300">INT-002, 003</span>
                    </div>
                    <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Auth & Roles</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">JWT, RBAC y expiración UTC</div>
                  </div>

                  <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-xs font-bold text-cyan-600 dark:text-cyan-400">catalog</span>
                      <span class="text-[9px] font-mono bg-cyan-100 dark:bg-cyan-950/60 px-1 py-0.2 rounded text-cyan-700 dark:text-cyan-300">INT-004</span>
                    </div>
                    <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Product Catalog</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">Cursor pagination & búsqueda</div>
                  </div>

                  <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">cart</span>
                      <span class="text-[9px] font-mono bg-emerald-100 dark:bg-emerald-950/60 px-1 py-0.2 rounded text-emerald-700 dark:text-emerald-300">INT-005</span>
                    </div>
                    <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Shopping Cart</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">Operaciones atómicas Redis</div>
                  </div>

                  <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-xs font-bold text-amber-600 dark:text-amber-400">billing</span>
                      <span class="text-[9px] font-mono bg-amber-100 dark:bg-amber-950/60 px-1 py-0.2 rounded text-amber-700 dark:text-amber-300">INT-006, 007</span>
                    </div>
                    <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Payment Gateway</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">Stripe HMAC & redondeo contable</div>
                  </div>

                  <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-xs font-bold text-purple-600 dark:text-purple-400">orders</span>
                      <span class="text-[9px] font-mono bg-purple-100 dark:bg-purple-950/60 px-1 py-0.2 rounded text-purple-700 dark:text-purple-300">INT-008</span>
                    </div>
                    <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Order Worker</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">Consumidor de colas con DLQ</div>
                  </div>

                  <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-xs font-bold text-rose-600 dark:text-rose-400">analytics</span>
                      <span class="text-[9px] font-mono bg-rose-100 dark:bg-rose-950/60 px-1 py-0.2 rounded text-rose-700 dark:text-rose-300">INT-009</span>
                    </div>
                    <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Event Stream</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">Métricas Prometheus /metrics</div>
                  </div>

                  <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 sm:col-span-2">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-xs font-bold text-blue-600 dark:text-blue-400">notifications</span>
                      <span class="text-[9px] font-mono bg-blue-100 dark:bg-blue-950/60 px-1 py-0.2 rounded text-blue-700 dark:text-blue-300">INT-010</span>
                    </div>
                    <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Notification Service</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">Emails transaccionales HTML seguros & retries SMTP</div>
                  </div>
                </div>
              </div>

              <!-- Flecha de Flujo 3 -> 4 -->
              <div class="flex justify-center -my-3 relative z-10">
                <div class="px-3 py-1 rounded-full bg-emerald-600 text-white font-mono text-[10px] font-bold shadow-md">
                  ↓ Persistencia, Cache & Colas de Mensajes
                </div>
              </div>

              <!-- CAPA 4: Infraestructura, Datos & Mensajería -->
              <div class="p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-xs mt-6">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Capa 4: Servicios de Persistencia, Cache Distribuido & Event Broker
                  </span>
                  <span class="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    State & Messaging
                  </span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <!-- PostgreSQL -->
                  <div class="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-xl">🐘</span>
                      <div>
                        <div class="font-bold text-xs text-slate-900 dark:text-slate-100">PostgreSQL 16 Cluster</div>
                        <div class="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Puerto 5432 · ACID Transaccional</div>
                      </div>
                    </div>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400">
                      Órdenes, usuarios, tablas de roles y catálogo. Versionado con migraciones deterministas y pool de conexiones.
                    </p>
                  </div>

                  <!-- Redis -->
                  <div class="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-xl">🔴</span>
                      <div>
                        <div class="font-bold text-xs text-slate-900 dark:text-slate-100">Redis 7.2 Distributed Cache</div>
                        <div class="text-[10px] font-mono text-amber-600 dark:text-amber-400">Puerto 6379 · In-Memory Key/Value</div>
                      </div>
                    </div>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400">
                      Cache de catálogo, sesiones volátiles de carritos anónimos y cerrojos distribuidos (Redlock) para stock concurrente.
                    </p>
                  </div>

                  <!-- RabbitMQ / Kafka -->
                  <div class="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-xl">🐇</span>
                      <div>
                        <div class="font-bold text-xs text-slate-900 dark:text-slate-100">RabbitMQ / Kafka Broker</div>
                        <div class="text-[10px] font-mono text-purple-600 dark:text-purple-400">Puerto 5672 · Event Bus & DLQ</div>
                      </div>
                    </div>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400">
                      Colas asíncronas para OrderFulfilled, webhooks entrantes y reintentos automáticos con retroceso exponencial.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- 2.2 PANELES DE DIAGRAMAS C4 & UML (Generados desde knowledge-index.json) -->
        ${diagrams.map(diag => `
          <div id="diagram-panel-${diag.id}" class="diagram-panel hidden mt-6 space-y-4">
            <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                    ${diag.type}
                  </span>
                  <span class="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                    ${diag.level}
                  </span>
                </div>
                <button type="button" 
                        data-copy-mermaid="${escapeAttr(diag.mermaid)}"
                        class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-slate-700 dark:text-slate-300 font-mono text-xs transition-colors cursor-pointer flex items-center gap-1">
                  <span>📋</span> Copiar Mermaid
                </button>
              </div>
              <h4 class="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">${diag.title}</h4>
              <p class="text-xs text-slate-600 dark:text-slate-400 mb-4">${diag.description}</p>
              
              <!-- Visor de Código Mermaid -->
              <pre class="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800"><code>${escapeHtml(diag.mermaid)}</code></pre>
            </div>
          </div>
        `).join('')}

      </section>

      <!-- 3. STACK DE TECNOLOGÍAS Y LIBRERÍAS -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="mb-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              ${Icons.cpu}
            </span>
            Stack de Tecnologías y Dependencias Identificadas
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Información técnica recolectada por la skill <code class="font-mono text-indigo-500">/technical-audit</code>
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Runtimes & Lenguajes -->
          <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 space-y-3">
            <div class="flex items-center gap-2 text-xs font-bold font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <span>⚡</span> Runtimes & Lenguajes
            </div>
            <div class="space-y-2.5">
              ${(tech.runtimes || []).map(r => `
                <div class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <div class="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span class="flex items-center gap-1.5">${r.icon || '▪'} ${r.name}</span>
                    <span class="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">${r.version}</span>
                  </div>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">${r.purpose}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Servicios & Bases de Datos -->
          <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 space-y-3">
            <div class="flex items-center gap-2 text-xs font-bold font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <span>🐘</span> Bases de Datos & Middleware
            </div>
            <div class="space-y-2.5">
              ${(tech.databases || []).map(db => `
                <div class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <div class="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span class="flex items-center gap-1.5">${db.icon || '▪'} ${db.name}</span>
                    <span class="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">:${db.port}</span>
                  </div>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">${db.purpose}</div>
                </div>
              `).join('')}
              ${(tech.messaging || []).map(msg => `
                <div class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <div class="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span class="flex items-center gap-1.5">${msg.icon || '▪'} ${msg.name}</span>
                    <span class="font-mono text-[10px] text-purple-600 dark:text-purple-400">:${msg.port}</span>
                  </div>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">${msg.purpose}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Librerías & Paquetes Clave -->
          <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 space-y-3 md:col-span-2 lg:col-span-1">
            <div class="flex items-center gap-2 text-xs font-bold font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <span>📦</span> Librerías & Frameworks Clave
            </div>
            <div class="space-y-2 max-h-[310px] overflow-y-auto pr-1">
              ${(tech.libraries || []).map(lib => `
                <div class="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-slate-800 dark:text-slate-200">${lib.name}</span>
                    <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">${lib.category}</span>
                  </div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">${lib.purpose}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </section>

      <!-- 4. ARQUITECTURA Y PATRONES DE DISEÑO -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="mb-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              ${Icons.cube}
            </span>
            Patrones de Diseño & Decisiones Arquitecturales
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Estilo principal: <strong class="text-indigo-600 dark:text-indigo-400">${arch.style || 'Clean Architecture + EDA'}</strong>
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${(arch.patterns || []).map(pat => `
            <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 space-y-2">
              <div class="flex items-center justify-between">
                <h4 class="font-bold text-xs text-slate-900 dark:text-slate-100">${pat.name}</h4>
                <span class="text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  ${pat.type}
                </span>
              </div>
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                ${pat.description}
              </p>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- 5. MÓDULOS IDENTIFICADOS -->
      <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div class="mb-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              ${Icons.folder}
            </span>
            Módulos del Sistema Identificados (${modules.length})
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Límites de contexto (Bounded Contexts) y responsabilidades asignadas a cada módulo
          </p>
        </div>

        <div class="space-y-4">
          ${modules.map(mod => {
            const modFeatures = (mod.features || []).map(fIdStr => {
              const numId = parseInt(fIdStr.replace('INT-', ''), 10);
              return featureMap.get(numId);
            }).filter(Boolean);

            const doneFeatures = modFeatures.filter(f => f.status === 'done').length;
            const progressPct = modFeatures.length ? Math.round((doneFeatures / modFeatures.length) * 100) : 0;

            return `
              <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 space-y-3">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div class="flex items-center gap-2.5">
                    <span class="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono font-bold text-xs">
                      📁
                    </span>
                    <div>
                      <h4 class="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>${mod.name}</span>
                        <code class="text-xs font-mono text-indigo-600 dark:text-indigo-400">[${mod.id}]</code>
                      </h4>
                      <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${mod.purpose}</p>
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
      </section>

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

function getFallbackSpec() {
  if (typeof window !== 'undefined' && window.__FALLBACK_DATA__?.projectSpec) {
    return window.__FALLBACK_DATA__.projectSpec;
  }
  return {
    project: {
      name: 'CloudSaaS Platform',
      tagline: 'E-Commerce & Microservicios Cloud',
      description: 'Plataforma SaaS integral de microservicios con arquitectura limpia y eventos.',
      version: '2.0.0',
      type: 'Fullstack Microservices'
    },
    business_goals: [
      'Garantizar transacciones consistentes y atómicas.',
      'Aislamiento estricto de dominios con Clean Architecture.'
    ],
    tech_stack: {
      runtimes: [],
      databases: [],
      messaging: [],
      libraries: []
    },
    architecture: {
      style: 'Clean Architecture + Event-Driven',
      layers: [],
      patterns: []
    },
    modules: []
  };
}

function getFallbackKnowledge() {
  if (typeof window !== 'undefined' && window.__FALLBACK_DATA__?.knowledgeIndex) {
    return window.__FALLBACK_DATA__.knowledgeIndex;
  }
  return {
    diagrams: [],
    business_rules: [],
    external_services: [],
    coding_standards: { guardrails: [], naming_conventions: {} }
  };
}
