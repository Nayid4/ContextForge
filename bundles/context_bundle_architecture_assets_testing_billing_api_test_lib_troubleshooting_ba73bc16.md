# Context Bundle: architecture_assets_testing_billing_api_test_lib_troubleshooting (ba73bc16)
> Generado por ContextForge el 2026-10-14 04:49:08 UTC
> Módulos incluidos: architecture, assets, testing, billing, api, test_lib, troubleshooting

## Directrices Operativas para el Asistente de IA (Cursor / Windsurf / Copilot)
1. Eres un asistente de desarrollo asistido consciente de las reglas de negocio de este repositorio.
2. NO inventes ni alteres reglas de negocio o contratos documentados en este paquete de contexto.
3. Respeta estrictamente los Architecture Decision Records (ADRs) aquí contenidos.

## Tabla de Contenidos
- [ADR 001: Adopción de Arquitectura Dirigida por Eventos en Pagos (001_event_driven_payments.md)](#architecture-adrs-001_event_driven_payments-md)
- [plan (plan.md)](#default-assets-especificaci_n_de_flujo_y_reglas_t_cnicas-plan-md)
- [Doc Creado por API (api_doc.md)](#default-modules-testing-api_doc-md)
- [Documento Creado Web (web_test.md)](#default-modules-testing-web_test-md)
- [Políticas de Reintentos en Facturación Recurrente (retry_policy.md)](#modules-billing-retry_policy-md)
- [Doc Creado por API (api_doc.md)](#modules-testing-api_doc-md)
- [Guía de Prueba (guide_test.md)](#modules-testing-guide_test-md)
- [Documento Creado Web (web_test.md)](#modules-testing-web_test-md)
- [Protocolo de Webhooks (protocolo-de-webhooks.md)](#test_lib-api-protocolo-de-webhooks-md)
- [documento-editable-temporal (documento-editable-temporal.md)](#test_lib-general-documento-editable-temporal-md)
- [Guía de Diagnóstico: Timeouts en Webhooks de Stripe (stripe_webhook_timeout.md)](#troubleshooting-stripe_webhook_timeout-md)

---
## Documento: ADR 001: Adopción de Arquitectura Dirigida por Eventos en Pagos <a id='architecture-adrs-001_event_driven_payments-md'></a>
**Ruta:** `architecture/adrs/001_event_driven_payments.md` | **Módulo:** `architecture` | **Autor:** Chief Architect

# ADR 001: Adopción de Arquitectura Dirigida por Eventos en Pagos

## Estado
Aceptado

## Contexto
El flujo original de cobros sincronizaba inventario, emisión de factura y notificaciones de correo en una sola llamada HTTP síncrona. Si el servicio de facturación demoraba más de 3 segundos, la pasarela de pagos abortaba la sesión por timeout del usuario.

## Decisión
Desacoplar la orquestación de pagos mediante eventos de dominio inmutables publicados en Kafka:
1. `OrderPlacedEvent` dispara el intento de cobro.
2. `PaymentCapturedEvent` dispara en paralelo:
   - Reserva definitiva de inventario (`inventory_service`).
   - Generación de factura electrónica PDF (`invoicing_service`).
   - Envío de recibo al cliente (`notification_service`).

## Consecuencias
- **Positivas:** Reducción del tiempo de respuesta del checkout de 4.2s a 380ms.
- **Negativas:** Se requiere manejo de consistencia eventual y conciliación periódica mediante outbox pattern.

---
## Documento: plan <a id='default-assets-especificaci_n_de_flujo_y_reglas_t_cnicas-plan-md'></a>
**Ruta:** `default/assets/especificaci_n_de_flujo_y_reglas_t_cnicas/plan.md` | **Módulo:** `assets` | **Autor:** Equipo Técnico

# DOCUMENTO DE DISEÑO DE SISTEMA (SDD) & GUÍA DE ARQUITECTURA
# IurisTrack Backend: Core Serverless de Vigilancia Judicial y Operaciones Legales

---

## 1. TÍTULO Y VISIÓN ARQUITECTÓNICA

### 1.1. Visión Ejecutiva
**IurisTrack Backend** es el motor central de automatización, inteligencia judicial y vigilancia procesal en tiempo real para Colombia. El sistema realiza la transición arquitectónica desde un monolito Angular con BFF hacia una **arquitectura desacoplada Cliente-Servidor de alto rendimiento**, donde el backend opera como un clúster de **Funciones Serverless en Vercel** impulsado por **NestJS**.

El backend está diseñado bajo los principios de **Clean Architecture**, **Domain-Driven Design (DDD)** y **CQRS (Command Query Responsibility Segregation)**, garantizando desacoplamiento absoluto de infraestructura, tipado estricto (0 `any`), resiliencia ante la volatilidad de los portales de la Rama Judicial colombiana (CPNJ y SIUGJ SGDE) y observabilidad completa.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             CLIENTES (SPA / WEB / MOVIL)                         │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ HTTPS / JWT Bearer
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   VERCEL SERVERLESS GATEWAY (EDGE & API RUNTIME)                 │
│                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────┐   │
│   │                      NESTJS APPLICATION ROOT                             │   │
│   │                                                                          │   │
│   │  [Presentation] Controllers ──► ValidationPipes ──► RFC 7807 Filter     │   │
│   │         │                                                                │   │
│   │         ▼ (@nestjs/cqrs)                                                 │   │
│   │  [Application]  Command Bus / Query Bus ──► Sagas / Orchestrators        │   │
│   │         │                                                                │   │
│   │         ▼                                                                │   │
│   │  [Domain]       Entities, Value Objects, Domain Services, Aggregates     │   │
│   │         │                                                                │   │
│   │         ▼                                                                │   │
│   │  [Infrastructure] Unit of Work, Adapters, External Gateways              │   │
│   └─────────┬───────────────────┬───────────────────┬────────────────────────┘   │
└─────────────┼───────────────────┼───────────────────┼────────────────────────────┘
              │                   │                   │
              ▼                   ▼                   ▼
    ┌──────────────────┐ ┌─────────────────┐ ┌───────────────────┐
    │  CLOUD FIRESTORE │ │ UPSTASH (REDIS) │ │  BLOB STORAGE     │
    │  (Persistencia   │ │ Rate Limiter,   │ │  (Supabase /      │
    │   Transaccional) │ │ Coalescing, Lock│ │   Vercel Blob)    │
    └──────────────────┘ └─────────────────┘ └───────────────────┘
              │                   │                   │
              ▼                   ▼                   ▼
    ┌──────────────────┐ ┌─────────────────┐ ┌───────────────────┐
    │ RAMA JUDICIAL    │ │ INNGEST/QSTASH  │ │ GOOGLE GEMINI 2.5 │
    │ CPNJ v2 (448)    │ │ Staggered Batch │ │ Análisis Jurídico │
    │ SIUGJ SGDE       │ │ Cron Nocturno   │ │ & Redacción Docs  │
    └──────────────────┘ └─────────────────┘ └───────────────────┘
```

---

## 2. STACK TECNOLÓGICO, PARADIGMAS Y PATRONES DE DISEÑO

### 2.1. Stack Tecnológico
* **Framework:** NestJS v11+ (TypeScript en modo estricto).
* **Entorno de Ejecución:** Vercel Serverless Functions (Node.js 22 LTS Runtime con optimización de Cold Starts).
* **Base de Datos & Auth:**
  * **Firebase Admin SDK:** Firestore (Colecciones normalizadas, transacciones ACID y batch operations) y Firebase Authentication (Verificación criptográfica de tokens JWT).
* **Almacenamiento de Providencias (Blob Storage):**
  * **Supabase Storage / Vercel Blob:** Custodia inmutable de binarios PDF mediante streaming server-to-server, reemplazando dependencias de CORS en cliente.
* **Orquestación Asíncrona & Tareas Programadas:**
  * **Inngest / Upstash QStash:** Encolamiento distribuido resiliente y ejecución de Cron Jobs serverless sin servidores dedicados.
* **Caché Distribuida & Resiliencia Gateway:**
  * **Upstash Redis (REST HTTP Client):** Rate Limiting distribuido (Token Bucket), Request Coalescing y Circuit Breakers independientes del ciclo de vida efímero de las lambdas.
* **Servicio de Correo:**
  * **Nodemailer:** Conexión SMTP a Gmail Workspace (Puerto 587 con cifrado explícito STARTTLS).
* **Motor de Inteligencia Artificial:**
  * **SDK Oficial `@google/genai` (Google Gemini 2.5):** Extracción de hitos procesales, síntesis de estados y redacción de memoriales jurídicos.

---

### 2.2. Patrones de Diseño Implementados

#### A. Arquitectura Limpia (Clean Architecture) & Domain-Driven Design (DDD)
La arquitectura se divide en 4 capas estrictas con dirección de dependencias de afuera hacia adentro:
1. **Domain Layer:** Entidades (`Case`, `Actuacion`, `Deadline`), Value Objects (`CuiRadicado`, `LegalTerm`), Eventos de Dominio y Contratos de Repositorio. Libre de dependencias externas o paquetes de NestJS/Firebase.
2. **Application Layer:** Casos de uso materializados en Comandos (`Commands`) y Consultas (`Queries`), sus respectivos Handlers, DTOs de entrada/salida y Sagas de orquestación.
3. **Infrastructure Layer:** Implementación técnica de repositorios (`FirestoreCaseRepository`), adaptadores de clientes HTTP (Scrapers CPNJ/SGDE), Upstash Redis, Nodemailer y Gemini SDK.
4. **Presentation Layer:** Controladores REST, DTOs de transporte HTTP, Guards de autenticación JWT y Exception Filters.

#### B. CQRS con `@nestjs/cqrs`
* **Command Bus:** Procesa operaciones de mutación de estado (`SyncCaseCommand`, `CreateLegalNoticeCommand`, `DraftDocumentCommand`). No retornan entidades pesadas de dominio, sino identificadores de recursos o resultados de confirmación.
* **Query Bus:** Procesa operaciones de lectura optimizada (`GetCaseByRadicadoQuery`, `GetCourtAnalyticsQuery`, `CalculateInactivityQuery`), proyectando DTOs planos optimizados sin sobrecarga de hidratación.

#### C. Unit of Work & Repository Pattern sobre Firestore
Abstracción de operaciones atómicas sobre múltiples colecciones (`cases`, `actuaciones`, `user_cases`, `deadlines`):
```typescript
export interface IUnitOfWork {
  runTransaction<T>(work: (transaction: FirebaseFirestore.Transaction) => Promise<T>): Promise<T>;
  createBatch(): FirebaseFirestore.WriteBatch;
  commitBatch(batch: FirebaseFirestore.WriteBatch): Promise<void>;
}
```

#### D. Manejo de Errores Estricto bajo RFC 7807 (ProblemDetails)
Ninguna excepción nativa se escapa sin estructurarse bajo el estándar internacional RFC 7807 mediante un filtro global `ProblemDetailsExceptionsFilter`:
```json
{
  "type": "https://iuristrack.com/errors/judicial-circuit-breaker-open",
  "title": "Servicio Judicial No Disponible Temporalmente",
  "status": 503,
  "detail": "El endpoint de Consulta Nacional (CPNJ 448) se encuentra protegido por apertura de Circuit Breaker tras fallos consecutivos.",
  "instance": "/api/v1/cases/08001315301220180029200/sync",
  "code": "JUDICIAL_GATEWAY_CIRCUIT_OPEN",
  "timestamp": "2026-10-10T19:30:00.000Z",
  "traceId": "req-98fbc1-4c"
}
```

#### E. TDD (Test-Driven Development) Estricto con Jest
* Pruebas Unitarias aisladas para Dominio y Aplicación mediante `@nestjs/testing` con 100% de cobertura en lógica de negocio.
* Tests de Integración usando emuladores locales de Firestore y mocks HTTP estrictos con `@types/jest`.

---

## 3. ESTRUCTURA DE DIRECTORIOS (CLEAN ARCHITECTURE EN NESTJS)

```
iuristrack-backend/
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── api/
│   └── index.ts                           # Serverless Entrypoint para Vercel
├── src/
│   ├── app.module.ts                      # Módulo raíz de la aplicación
│   ├── main.ts                            # Bootstrap local (desarrollo standalone)
│   │
│   ├── core/                              # Núcleo transversal compartido
│   │   ├── config/                        # Validación de variables de entorno (Joi / Zod)
│   │   ├── decorators/                    # @CurrentUser(), @ApiKey(), etc.
│   │   ├── filters/                       # RFC 7807 ProblemDetails Global Filter
│   │   ├── guards/                        # FirebaseAuthGuard, RolesGuard
│   │   ├── interceptors/                  # LoggingInterceptor, TimeoutInterceptor
│   │   └── pipes/                         # StrictValidationPipe
│   │
│   ├── modules/
│   │   │
│   │   ├── judicial-gateway/              # DOMINIO: Motor Judicial Dual & Resiliencia
│   │   │   ├── domain/
│   │   │   │   ├── entities/              # JudicialRecord, RawActuacion
│   │   │   │   ├── value-objects/         # CuiRadicado.vo.ts, TerritorialScope.vo.ts
│   │   │   │   ├── ports/                 # IJudicialScraperPort, IResilienceGatewayPort
│   │   │   │   └── exceptions/            # InvalidCuiException, GatewayTimeoutException
│   │   │   ├── application/
│   │   │   │   ├── commands/              # SyncJudicialRecordCommand.ts
│   │   │   │   ├── queries/               # SearchJudicialRecordQuery.ts
│   │   │   │   ├── handlers/              # SyncJudicialRecordHandler.ts
│   │   │   │   └── dtos/                  # JudicialSyncResultDto.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── adapters/
│   │   │   │   │   ├── cpnj-scraper.adapter.ts    # Rama Judicial CPNJ v2 (448)
│   │   │   │   │   ├── sgde-scraper.adapter.ts    # SIUGJ SGDE External API
│   │   │   │   │   └── upstash-resilience.adapter.ts # Token Bucket & Coalescing
│   │   │   │   └── resilience/
│   │   │   │       ├── distributed-token-bucket.ts
│   │   │   │       └── circuit-breaker.ts
│   │   │   └── presentation/
│   │   │       ├── controllers/           # JudicialGatewayController.ts
│   │   │       └── dtos/                  # SearchJudicialHttpDto.ts
│   │   │
│   │   ├── cases/                         # DOMINIO: Gestión y Expedientes Canónicos
│   │   │   ├── domain/
│   │   │   │   ├── entities/              # Case.entity.ts, Actuacion.entity.ts
│   │   │   │   ├── events/                # CaseSyncedEvent.ts, NoveltyDetectedEvent.ts
│   │   │   │   └── ports/                 # ICaseRepository.ts, IUserCaseRepository.ts
│   │   │   ├── application/
│   │   │   │   ├── commands/              # CreateCaseCommand.ts, SyncCaseCommand.ts
│   │   │   │   ├── queries/               # GetCaseByIdQuery.ts, ListUserCasesQuery.ts
│   │   │   │   └── handlers/
│   │   │   ├── infrastructure/
│   │   │   │   └── repositories/          # FirestoreCaseRepository.ts
│   │   │   └── presentation/
│   │   │       └── controllers/           # CaseController.ts
│   │   │
│   │   ├── documents-custody/             # DOMINIO: Blob Storage & Motor OCR
│   │   │   ├── domain/
│   │   │   │   ├── entities/              # ProcessDocument.entity.ts
│   │   │   │   └── ports/                 # IBlobStoragePort.ts, IOcrExtractorPort.ts
│   │   │   ├── application/
│   │   │   │   ├── commands/              # CustodyDocumentCommand.ts, ExtractOcrCommand.ts
│   │   │   │   └── handlers/
│   │   │   ├── infrastructure/
│   │   │   │   └── adapters/
│   │   │   │       ├── supabase-storage.adapter.ts # O Vercel Blob Adapter
│   │   │   │       └── gemini-ocr.adapter.ts       # Extracción OCR multimodal
│   │   │   └── presentation/
│   │   │       └── controllers/           # DocumentStreamController.ts
│   │   │
│   │   ├── legal-operations/              # DOMINIO: Términos, Desistimiento y Liquidación
│   │   │   ├── domain/
│   │   │   │   ├── services/              # InactivityCalculator.ts, CreditLiquidator.ts
│   │   │   │   └── value-objects/         # LegalNoticeReceipt.vo.ts
│   │   │   ├── application/
│   │   │   │   ├── commands/              # DispatchLegalNoticeCommand.ts
│   │   │   │   └── queries/               # CalculateInactivityQuery.ts
│   │   │   └── presentation/
│   │   │       └── controllers/           # LegalOperationsController.ts
│   │   │
│   │   └── notifications-scheduler/       # DOMINIO: Jobs Asíncronos, Correo & Calendario
│   │       ├── domain/
│   │       │   └── ports/                 # IEmailDispatcherPort.ts, IJobQueuePort.ts
│   │       ├── application/
│   │       │   └── handlers/              # SendTransactionalEmailHandler.ts
│   │       ├── infrastructure/
│   │       │   ├── adapters/
│   │       │   │   ├── nodemailer-gmail.adapter.ts
│   │       │   │   └── qstash-queue.adapter.ts
│   │       │   └── jobs/
│   │       │       └── nightly-staggered-sync.job.ts
│   │       └── presentation/
│   │           └── webhooks/              # InngestWebhookController.ts
│   │
│   └── shared/                            # Utilidades, Extensiones y Constantes
│       ├── constants/
│       └── utils/
│           └── territorial-decoder.util.ts
│
├── test/                                  # Pruebas de Integración y E2E
│   ├── jest-e2e.json
│   └── cases.e2e-spec.ts
├── vercel.json                            # Configuración de Rutas y Runtimes en Vercel
├── tsconfig.json
├── package.json
└── README.md
```

---

## 4. FLUJOS DE DATOS (DATA FLOWS EN ARQUITECTURA LIMPIA)

El siguiente flujo ejemplifica cómo se ejecuta una solicitud de sincronización judicial:

```
[Cliente HTTP]
       │
       ▼ POST /api/v1/cases/08001315301220180029200/sync
[Presentation: CaseController]
       │ 1. Valida Body/Params con Zod / ValidationPipe
       │ 2. Extrae AuthToken mediante FirebaseAuthGuard
       │ 3. Instancia `SyncCaseCommand(radicado, userId)`
       ▼
[Application: CommandBus (@nestjs/cqrs)]
       │ 4. Resuelve y ejecuta `SyncCaseHandler`
       ▼
[Application: SyncCaseHandler]
       │ 5. Solicita bloqueo distribuido a `IResilienceGatewayPort` (Upstash Lock: 45s)
       │ 6. Invoca orquestación dual mediante `IJudicialScraperPort.fetchDualData(cui)`
       ▼
[Infrastructure: UpstashResilienceAdapter]
       │ 7. Verifica Request Coalescing (¿Consulta idéntica en vuelo? Retorna promesa compartida)
       │ 8. Adquiere Token en Bucket distribuido (CPNJ: 3 req/s | SGDE: 5 req/s)
       ▼
[Infrastructure: Scraper Dual Adapter]
       │ 9. Dispara Promise.allSettled([ fetchCPNJ(448), fetchSGDE() ])
       │ 10. Decodifica metadatos territoriales con `TerritorialDecoder`
       ▼
[Domain: Case Aggregate Root]
       │ 11. Aplica reglas de negocio: detecta actuaciones nuevas
       │ 12. Evalúa inactividad procesal (Art. 317 CGP - Desistimiento Tácito)
       │ 13. Emite `NoveltyDetectedEvent` si hay cambios
       ▼
[Infrastructure: FirestoreCaseRepository (UoW)]
       │ 14. Ejecuta transacción ACID en Firestore actualizando estado canónico
       ▼
[Infrastructure: BlobStorageAdapter (Async Event / Saga)]
       │ 15. Si hay nuevas providencias, descarga server-to-server hacia Supabase Storage / Vercel Blob
       ▼
[Presentation: Response Handler]
       │ 16. Retorna HTTP 200 OK con `JudicialSyncResultDto`
       └─► (En caso de fallo, `ProblemDetailsExceptionsFilter` retorna RFC 7807)
```

---

## 5. DISEÑO DE RESILIENCIA Y GATEWAY EN ENTORNO SERVERLESS

Dado que **Vercel Serverless Functions** opera mediante instancias efímeras que escalan a cero y no comparten memoria de proceso, **la resiliencia no puede residir en variables en memoria**. Se utiliza **Upstash Redis** (conectividad HTTP REST sin agotar pools de sockets) como motor de estado distribuido.

```
                  ┌────────────────────────────────────────┐
                  │       VERCEL SERVERLESS INSTANCES      │
                  │   Instance A   Instance B   Instance C │
                  └───────┬────────────┬────────────┬──────┘
                          │            │            │
                          ▼            ▼            ▼
               ┌────────────────────────────────────────────────┐
               │         UPSTASH REDIS (ESTADO DISTRIBUIDO)     │
               ├────────────────────────────────────────────────┤
               │  1. Distributed Locks (TTL: 45s)               │
               │  2. Request Coalescing Keys (In-Flight Mutex)  │
               │  3. Token Buckets (Sliding Window / Leaky)     │
               │  4. Circuit Breakers (State: CLOSED/OPEN)      │
               └───────────────────────┬────────────────────────┘
                                       │
                                       ▼
                       ┌───────────────────────────────┐
                       │  RAMA JUDICIAL DE COLOMBIA    │
                       │  CPNJ (Puerto 448) - SGDE     │
                       └───────────────────────────────┘
```

### 5.1. Token Bucket Distribuido (Control Estricto de Tasa)
* **CPNJ v2 (Puerto 448):** Máximo **3 req/s**.
* **SIUGJ SGDE:** Máximo **5 req/s**.
* **Mecanismo:** Script Lua ejecutado atómicamente en Upstash Redis para verificar y descontar tokens con marcas de tiempo en milisegundos (`redis.eval`). Si no hay tokens disponibles, la función suspende la ejecución mediante backoff activo o delega el trabajo a la cola con delay.

### 5.2. Request Coalescing (Deduplicación Distribuida en Vuelo)
Si 10 usuarios consultan o sincronizan el radicado `08001315301220180029200` exactamente al mismo tiempo:
1. La primera petición adquiere una clave de exclusión en Redis: `SET in_flight:08001... <requestId> NX EX 20`.
2. Las peticiones concurrentes detectan la clave activa y se suscriben mediante sondeo pasivo (`polling` de 500ms contra la clave de resultado en Redis `cache:result:08001...`) en lugar de saturar los servidores de la Rama Judicial con 10 peticiones idénticas.
3. La primera petición almacena el resultado en Redis (TTL corto de 30 segundos) y resuelve las consultas hermanas.

### 5.3. Circuit Breaker Distribuido
* **Ventana de Error:** 3 fallos consecutivos con código `429 Too Many Requests`, `502 Bad Gateway` o `ETIMEDOUT`.
* **Estado:**
  * `OPEN`: Interrumpe de inmediato peticiones durante 60 segundos, retornando de forma expedita una respuesta RFC 7807 (`503 Service Unavailable`) y sirviendo datos cacheados en Firestore para proteger la IP institucional.
  * `HALF-OPEN`: Permite una única petición de prueba antes de reabrir el tráfico completo.

### 5.4. Distributed Lock (Bloqueo Distribuido Optimista)
* En Firestore y Redis, el atributo `isSyncing: true` con `syncStartedAt` opera bajo un **TTL estricto de 45 segundos**. Si una instancia serverless falla o finaliza su timeout inesperadamente, el bloqueo expira automáticamente, garantizando que el expediente no quede congelado para futuras consultas.

### 5.5. Encolamiento Nocturno Escalonado (Staggered Batch Queue)
* **Requisito:** Monitorear 500 expedientes activos por noche sin ser catalogado como ataque de denegación de servicio (DoS).
* **Solución:** Tarea programada en **QStash / Inngest** activada a las **00:00 COT**.
* **Ventana:** 6 horas (00:00 a 06:00 COT = 21,600 segundos).
* **Cadencia:** Dispersión estocástica con retraso (`delay`) de **43.2 segundos entre expedientes**, combinada con Jitter aleatorio (+/- 5 segundos) para emular comportamiento de navegación natural.

---

## 6. DOMINIOS Y LÓGICA DE NEGOCIO CORE

### 6.1. Dominio de Consulta Judicial Dual & Decodificación Territorial
* **Estructura CUI (23 dígitos numéricos):**
  ```
  08001 31 53 012 2018 00292 00
  ├───┘ └┘ └─┘ └─┘ └──┘ └───┘ └┘
    │    │  │   │    │    │   └── Recurso (00 = Principal)
    │    │  │   │    │    └────── Consecutivo de radicación (5 dígitos)
    │    │  │   │    └─────────── Año de radicación (4 dígitos)
    │    │  │   └──────────────── Consecutivo de despacho (3 dígitos)
    │    │  └──────────────────── Especialidad de despacho (2 dígitos)
    │    └─────────────────────── Corporación / Juzgado (2 dígitos)
    └──────────────────────────── DANE: Depto (2 dígitos) + Municipio (3 dígitos)
  ```
* **Decodificador Territorial (`TerritorialDecoder`):** Resuelve dinámicamente el departamento, municipio, entidad judicial, especialidad y despacho a partir de tablas estáticas normalizadas en memoria, enriqueciendo los metadatos del expediente canónico sin necesidad de consultas de red adicionales.

### 6.2. Dominio de Documentos & Motor OCR Asíncrono
1. **Streaming Binario & Evasión de CORS:** El endpoint `/api/v1/documents/stream` descarga el PDF desde la Rama Judicial en el backend y lo transmite al cliente configurando:
   * `Content-Type: application/pdf`
   * `Content-Disposition: inline; filename="providencia.pdf"`
   * `X-Document-SHA256: <hash_hexadecimal>`
2. **Custodia Permanente:** Cada providencia se transfiere hacia **Supabase Storage** o **Vercel Blob** con ruta:
   `cases/{radicado}/{sha256}.pdf`. La URL permanente se actualiza en el registro canónico de Firestore.
3. **OCR Inteligente con Google Gemini 2.5:**
   * Detección de providencias escaneadas (densidad inferior a 20 caracteres por página).
   * Envío del buffer del documento al SDK `@google/genai` utilizando el modelo `gemini-2.5-flash` con prompts estructurados para extraer:
     - Tipo de providencia (Auto interlocutorio, Auto de trámite, Sentencia).
     - Fechas de ejecutoria y plazos de traslado.
     - Resumen operativo del pronunciamiento judicial.

### 6.3. Dominio de Alertas Legales & Notificaciones
* **Monitoreo de Inactividad (Art. 317 Código General del Proceso - CGP):**
  * Nivel Preventivo: $\ge 270$ días de inactividad de las partes $\rightarrow$ Alerta preventiva de Desistimiento Tácito.
  * Nivel Crítico: $\ge 330$ días $\rightarrow$ Alerta roja inminente de terminación anormal del proceso.
* **Notificaciones Personales (Ley 2213 de 2022):**
  * Cálculo de 2 días hábiles posteriores al envío del correo electrónico (excluyendo sábados, domingos y festivos colombianos oficiales).
  * Emisión de acta técnica con huella digital criptográfica SHA-256 e hipervínculo de descarga segura.
* **Nodemailer + Gmail SMTP:**
  * Configuración con pool de conexiones efímero adaptado a Serverless, autenticación mediante contraseñas de aplicación de Google Workspace y cifrado obligatorio TLS en puerto 587.

---

## 7. ESPECIFICACIÓN DE PERSISTENCIA (FIRESTORE)

Las entidades residen en colecciones normalizadas garantizando escalabilidad y consultas compuestas eficientes:

```
firestore/
├── cases/{caseId}                         # Expediente canónico único compartido
│   ├── radicado: string (23 dígitos)
│   ├── despacho: string
│   ├── departamento: string
│   ├── municipio: string
│   ├── estado: 'activo' | 'inactivo' | 'terminado'
│   ├── riesgo: 'bajo' | 'medio' | 'alto' | 'critico'
│   ├── isSyncing: boolean
│   ├── lastSyncedAt: Timestamp
│   ├── actuaciones: Array<ActuacionEmbed>
│   └── documentos: Array<DocumentoEmbed>
│
├── user_cases/{userCaseId}                # Relación N:M usuario-expediente
│   ├── userId: string (Auth UID)
│   ├── caseId: string
│   ├── radicado: string
│   ├── alias: string
│   ├── customTags: Array<string>
│   └── createdAt: Timestamp
│
├── deadlines/{deadlineId}                 # Términos y alertas de calendario
│   ├── caseId: string
│   ├── radicado: string
│   ├── title: string
│   ├── dueDate: Timestamp
│   ├── termType: 'traslado' | 'recurso' | 'alegatos' | 'desistimiento'
│   ├── isCompleted: boolean
│   └── userId: string
│
└── audit_logs/{logId}                     # Trazabilidad forense inmutable
    ├── caseId: string
    ├── eventType: 'CREATED' | 'SYNCED' | 'DOCUMENT_CUSTODIED'
    ├── payload: Map
    ├── performedBy: string
    └── timestamp: Timestamp
```

---

## 8. GUÍA DE CONFIGURACIÓN LOCAL Y DESPLIEGUE EN VERCEL

### 8.1. Variables de Entorno (`.env.example`)
Crea un archivo `.env` en la raíz del proyecto backend con la siguiente estructura:

```ini
# ==============================================================================
# ENTORNO Y CONFIGURACIÓN GENERAL
# ==============================================================================
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1
CORS_ALLOWED_ORIGINS=http://localhost:4200,https://iuristrack.com

# ==============================================================================
# FIREBASE ADMIN SDK (BASE DE DATOS & AUTH)
# ==============================================================================
FIREBASE_PROJECT_ID=consultasjuridicas
# En despliegues como Vercel, configura la cuenta de servicio como secreto JSON:
# FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"consultasjuridicas","private_key":"...","client_email":"..."}
# Alternativamente, configura FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY.
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@consultasjuridicas.iam.gserviceaccount.com
# La clave privada debe contener los saltos de línea escapados (\n)
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
# Si no se configura la cuenta de servicio, se usan Application Default Credentials (ADC).
# Opcional: almacenamiento temporal para desarrollo/pruebas sin Firebase (no usar en producción)
# FIRESTORE_IN_MEMORY=true

# ==============================================================================
# UPSTASH REDIS (RATE LIMITING, COALESCING & DISTRIBUTED LOCKS)
# ==============================================================================
UPSTASH_REDIS_REST_URL=https://your-upstash-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxxxxxxxYOUR_REST_TOKENxxxxxxxxxxx

# ==============================================================================
# ALMACENAMIENTO DE ARCHIVOS (BLOB STORAGE)
# ==============================================================================
# Opción A: Supabase Storage
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJh...
SUPABASE_STORAGE_BUCKET=judicial-records

# Opción B: Vercel Blob (Alternativa)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxx

# ==============================================================================
# SERVICIO DE CORREO (NODEMAILER / GMAIL WORKSPACE SMTP)
# ==============================================================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=notificaciones@iuristrack.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx
EMAIL_FROM="IurisTrack Notificaciones <notificaciones@iuristrack.com>"

# ==============================================================================
# TAREAS EN SEGUNDO PLANO (QSTASH / INNGEST)
# ==============================================================================
QSTASH_URL=https://qstash.upstash.io/v2
QSTASH_TOKEN=ey...
QSTASH_CURRENT_SIGNING_KEY=sig_...
QSTASH_NEXT_SIGNING_KEY=sig_...

# ==============================================================================
# INTELIGENCIA ARTIFICIAL (GOOGLE GEMINI SDK)
# ==============================================================================
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.5-flash
```

---

### 8.2. Adaptador Serverless para Vercel (`api/index.ts`)
Para ejecutar NestJS dentro del runtime de Vercel sin regenerar la aplicación en cada request (reutilizando instancias cálidas):

```typescript
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express, { Express, Request, Response } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { ProblemDetailsExceptionsFilter } from '../src/core/filters/problem-details.filter';

let cachedServer: Express;

async function bootstrapServer(): Promise<Express> {
  if (!cachedServer) {
    const expressApp = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
      logger: ['error', 'warn', 'log'],
    });

    app.setGlobalPrefix('api/v1');
    app.enableCors({
      origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') || '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new ProblemDetailsExceptionsFilter());

    await app.init();
    cachedServer = expressApp;
  }
  return cachedServer;
}

export default async function handler(req: Request, res: Response): Promise<void> {
  const server = await bootstrapServer();
  server(req, res);
}
```

---

### 8.3. Configuración de Despliegue (`vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node",
      "config": {
        "maxDuration": 60,
        "memory": 1024
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/api/index.ts"
    }
  ]
}
```

---

### 8.4. Comandos de Desarrollo y Pruebas (TDD)

```bash
# 1. Instalación de dependencias
npm install

# 2. Ejecución local en modo observador (Standalone NestJS en :3000)
npm run start:dev

# 3. Ciclo TDD: Ejecutar suite de pruebas unitarias en modo Watch
npm run test:watch

# 4. Cobertura estricta de código (Debe superar 90% en dominio y aplicación)
npm run test:cov

# 5. Ejecución de pruebas E2E contra emuladores locales
npm run test:e2e

# 6. Compilación de producción
npm run build

# 7. Despliegue a Vercel (Preview)
vercel

# 8. Despliegue a Producción (Vercel Production)
vercel --prod
```

---

## 9. MATRIZ DE SEGURIDAD Y CUMPLIMIENTO REGULATORIO

1. **Custodia Probatoria e Inmutabilidad:** Todas las providencias y actas técnicas de notificación personal calculan y persisten el hash SHA-256 del binario en la base de datos, garantizando la cadena de custodia exigida por el **Código General del Proceso** y la **Ley 527 de 1999 (Comercio Electrónico y Firmas Digitales)**.
2. **Cero Fuga de Credenciales:** Las credenciales del Firebase Admin SDK y Upstash Redis se inyectan estrictamente a través de variables de entorno cifradas en el panel de Vercel.
3. **Control de Acceso Basado en Tokens (RBAC):** Cada endpoint autenticado valida criptográficamente el token JWT contra el endpoint de claves públicas de Google OAuth (`https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com`).
4. **Protección de IP Institucional:** El diseño del Gateway con Circuit Breakers y Token Buckets previene que las IPs de salida de Vercel sean bloqueadas por los firewalls de la Rama Judicial colombiana (Fortinet/Cloudflare).

---
## Documento: Doc Creado por API <a id='default-modules-testing-api_doc-md'></a>
**Ruta:** `default/modules/testing/api_doc.md` | **Módulo:** `testing` | **Autor:** API Tester

# Doc API

Prueba API.

---
## Documento: Documento Creado Web <a id='default-modules-testing-web_test-md'></a>
**Ruta:** `default/modules/testing/web_test.md` | **Módulo:** `testing` | **Autor:** Web Tester

# Contenido Web

Prueba de creación.

---
## Documento: Políticas de Reintentos en Facturación Recurrente <a id='modules-billing-retry_policy-md'></a>
**Ruta:** `modules/billing/retry_policy.md` | **Módulo:** `billing` | **Autor:** Arquitectura Pagos

# Políticas de Reintentos en Facturación Recurrente

## 1. Resumen Ejecutivo
Este documento formaliza el comportamiento del subsistema de cobro recurrente cuando la pasarela de pagos (Stripe / Adyen) responde con errores de timeout o fallos transitorios de red.

## 2. Flujo de Reintentos y Backoff Exponencial
Cuando una solicitud de cobro contra el endpoint `/v1/charges` devuelve `HTTP 504 Gateway Timeout` o `ERR_SOCKET_TIMEOUT`, el worker aplica un ciclo de reintentos determinista:
- **Intento 1:** Inmediato tras 2 segundos.
- **Intento 2:** Tras 15 segundos con jitter aleatorio.
- **Intento 3:** Tras 60 segundos.

```python
def should_retry_transaction(error_code: str, current_attempt: int) -> bool:
    TRANSIENT_ERRORS = {"ERR_GATEWAY_TIMEOUT", "ERR_CONNECTION_RESET", "429_TOO_MANY_REQUESTS"}
    if error_code in TRANSIENT_ERRORS and current_attempt < 3:
        return True
    return False
```

## 3. Fallo Definitivo y Dead Letter Queue (DLQ)
Si tras el 3er intento la pasarela no confirma la transacción:
1. El estado del pedido se marca como `PAYMENT_PENDING_MANUAL_REVIEW`.
2. Se emite el evento de dominio `PaymentDeadLetterEvent` al bus de eventos Kafka/PubSub.
3. Se notifica al equipo de soporte mediante alerta PagerDuty si el monto supera los \$1,000 USD.

---
## Documento: Doc Creado por API <a id='modules-testing-api_doc-md'></a>
**Ruta:** `modules/testing/api_doc.md` | **Módulo:** `testing` | **Autor:** API Tester

# Doc API

Prueba API.

---
## Documento: Guía de Prueba <a id='modules-testing-guide_test-md'></a>
**Ruta:** `modules/testing/guide_test.md` | **Módulo:** `testing` | **Autor:** Ingeniero

## Sección 1
Regla de prueba.

---
## Documento: Documento Creado Web <a id='modules-testing-web_test-md'></a>
**Ruta:** `modules/testing/web_test.md` | **Módulo:** `testing` | **Autor:** Web Tester

# Contenido Web

Prueba de creación.

---
## Documento: Protocolo de Webhooks <a id='test_lib-api-protocolo-de-webhooks-md'></a>
**Ruta:** `test_lib/api/protocolo-de-webhooks.md` | **Módulo:** `api` | **Autor:** Equipo Técnico

# Protocolo de Webhooks

Todos los webhooks deben firmarse con HMAC-SHA256.

```python
def sign_payload(): pass
```

---
## Documento: documento-editable-temporal <a id='test_lib-general-documento-editable-temporal-md'></a>
**Ruta:** `test_lib/general/documento-editable-temporal.md` | **Módulo:** `test_lib` | **Autor:** Equipo Técnico

# Documento Editable Temporal Modificado

Version actualizada 2.0 con cambios en sitio.

---
## Documento: Guía de Diagnóstico: Timeouts en Webhooks de Stripe <a id='troubleshooting-stripe_webhook_timeout-md'></a>
**Ruta:** `troubleshooting/stripe_webhook_timeout.md` | **Módulo:** `troubleshooting` | **Autor:** SRE Lead

# Guía de Diagnóstico: Timeouts en Webhooks de Stripe

## Síntoma
El dashboard de Stripe muestra reintentos continuos con estado `HTTP 504 Gateway Timeout` hacia el endpoint `/api/webhooks/stripe`.

## Causa Raíz Frecuente
El handler del webhook estaba ejecutando transacciones pesadas de base de datos antes de responder `HTTP 200 OK` a Stripe. Stripe impone un límite estricto de 5 segundos para recibir la confirmación.

## Solución y Regla de Oro
1. Validar la firma HMAC `Stripe-Signature` inmediatamente.
2. Encolar el payload sin procesar en Redis o RabbitMQ.
3. Responder `HTTP 200 OK` inmediatamente (latencia esperada: &lt; 50ms).
4. El worker asíncrono procesa el evento fuera del ciclo HTTP.
