/**
 * Datos de respaldo embebidos (Fallback).
 * Permite que index.html funcione al 100% abriendo directamente con doble clic (file:///)
 * sin ser bloqueado por la directiva CORS de los navegadores.
 * Sincronizado automáticamente por project-docs/sync-data.js
 */
window.__FALLBACK_DATA__ = {
  featureList: {
  "project": "CloudSaaS Platform",
  "description": "Sistema E-Commerce & Microservicios Cloud con arquitectura limpia, eventos asíncronos y API Gateway. Ejemplo de seguimiento de ingeniería para agentes de IA.",
  "version": "2.0.0",
  "tech_stack": "Universal (Node.js / .NET / Python / Go)",
  "runtime": "Cross-Platform Agentic SDD",
  "rules": {
    "one_feature_at_a_time": true,
    "require_tests_to_close": true,
    "require_approved_spec_to_implement": true,
    "branch_pattern": "{type}/INT-{id}/{name}",
    "branch_types": [
      "feature",
      "bugfix"
    ],
    "max_branch_length": 80,
    "valid_status": [
      "pending",
      "spec_ready",
      "in_progress",
      "done",
      "blocked"
    ]
  },
  "features": [
    {
      "id": 1,
      "type": "feature",
      "name": "infra_database_setup",
      "title": "Infraestructura Base de Datos y Migraciones",
      "description": "Scaffolding de base de datos relacional PostgreSQL con pool de conexiones, migraciones versionadas y scripts de inicialización.",
      "module": "infra",
      "priority": "P0",
      "weight": 95,
      "branch": "feature/INT-001/infra_database_setup",
      "spec_folder": "specs/001_infra_database_setup",
      "status": "done",
      "acceptance": [
        "El contenedor de base de datos levanta con healthcheck activo",
        "Las migraciones iniciales se ejecutan automáticamente en arranque",
        "El pool de conexiones maneja reconexión transparente ante caídas"
      ],
      "depends_on": [],
      "documentation": [
        "docs/architecture.md",
        "docs/conventions.md"
      ]
    },
    {
      "id": 2,
      "type": "feature",
      "name": "user_auth_service",
      "title": "Servicio de Autenticación JWT y Roles",
      "description": "Implementar endpoints de login, registro, rotación de tokens JWT (access + refresh) y control de acceso basado en roles (RBAC).",
      "module": "backend",
      "priority": "P0",
      "weight": 90,
      "branch": "feature/INT-002/user_auth_service",
      "spec_folder": "specs/002_user_auth_service",
      "status": "done",
      "acceptance": [
        "POST /auth/login retorna tokens JWT con expiración configurable",
        "Middleware de autenticación valida firmas criptográficas con clave pública",
        "Roles admin, user y operator correctamente aislados con tests"
      ],
      "depends_on": [
        1
      ],
      "documentation": [
        "docs/specs.md"
      ]
    },
    {
      "id": 3,
      "type": "bugfix",
      "name": "fix_jwt_token_expiration",
      "title": "Corrección de Expiración JWT en Desfases UTC",
      "description": "Corregir cálculo de expiración de token en servidores con huso horario no UTC que generaban tokens con validez incorrecta.",
      "module": "backend",
      "priority": "P1",
      "weight": 70,
      "branch": "bugfix/INT-003/fix_jwt_token_expiration",
      "spec_folder": "specs/003_fix_jwt_token_expiration",
      "status": "done",
      "acceptance": [
        "Tokens validan exclusivamente usando tiempo Epoch UTC",
        "Prueba de regresión con desfasajes horarios de +5 y -8 horas pasa al 100%"
      ],
      "depends_on": [
        2
      ],
      "documentation": [
        "docs/verification.md"
      ]
    },
    {
      "id": 4,
      "type": "feature",
      "name": "product_catalog_api",
      "title": "API de Catálogo de Productos y Búsqueda",
      "description": "Endpoints para consultar catálogo de productos con paginación basada en cursor, filtros por categoría y búsqueda full-text optimizada.",
      "module": "backend",
      "priority": "P1",
      "weight": 80,
      "branch": "feature/INT-004/product_catalog_api",
      "spec_folder": "specs/004_product_catalog_api",
      "status": "in_progress",
      "acceptance": [
        "GET /products soporta cursor pagination con latencia < 50ms",
        "Búsqueda por texto con índice trigram o índice full-text",
        "Cache de lectura con invalidación ante actualización de inventario"
      ],
      "depends_on": [
        1
      ],
      "documentation": [
        "docs/architecture.md"
      ]
    },
    {
      "id": 5,
      "type": "feature",
      "name": "shopping_cart_service",
      "title": "Servicio de Carrito de Compras en Memoria y Cache",
      "description": "Gestión de carritos temporales y persistentes con sincronización Redis, control de stock concurrente y cálculo de totales.",
      "module": "backend",
      "priority": "P1",
      "weight": 75,
      "branch": "feature/INT-005/shopping_cart_service",
      "spec_folder": "specs/005_shopping_cart_service",
      "status": "spec_ready",
      "acceptance": [
        "Operaciones atómicas en carrito previenen sobreventa de stock",
        "TTL configurable para carritos de usuarios anónimos (24h)",
        "Fusión de carrito local con usuario autenticado al iniciar sesión"
      ],
      "depends_on": [
        2,
        4
      ],
      "documentation": [
        "docs/specs.md"
      ]
    },
    {
      "id": 6,
      "type": "feature",
      "name": "payment_gateway_integration",
      "title": "Integración con Pasarela de Pagos (Stripe / PSE)",
      "description": "Flujo de cobro seguro con soporte de webhooks con firma criptográfica, reintentos idempotentes y registro de transacciones.",
      "module": "billing",
      "priority": "P0",
      "weight": 98,
      "branch": "feature/INT-006/payment_gateway_integration",
      "spec_folder": "specs/006_payment_gateway_integration",
      "status": "pending",
      "acceptance": [
        "Webhook de confirmación de pago valida firma HMAC sha256",
        "Manejo idempotente de eventos duplicados",
        "Transacciones registradas con clave foránea hacia la orden y el usuario"
      ],
      "depends_on": [
        5
      ],
      "documentation": [
        "docs/verification.md"
      ]
    },
    {
      "id": 7,
      "type": "bugfix",
      "name": "fix_cart_tax_rounding",
      "title": "Corrección de Redondeo Financiero de Impuestos",
      "description": "Ajustar algoritmo de redondeo a dos decimales (Banker's rounding) para evitar discrepancias de centavos en liquidación de facturas.",
      "module": "billing",
      "priority": "P1",
      "weight": 65,
      "branch": "bugfix/INT-007/fix_cart_tax_rounding",
      "spec_folder": "specs/007_fix_cart_tax_rounding",
      "status": "pending",
      "acceptance": [
        "Pruebas con 100 cálculos complejos de IVA y retenciones cuadran al centavo exacto",
        "Cumple con estándar contable internacional"
      ],
      "depends_on": [
        5
      ],
      "documentation": [
        "docs/conventions.md"
      ]
    },
    {
      "id": 8,
      "type": "feature",
      "name": "order_fulfillment_worker",
      "title": "Worker Asíncrono de Procesamiento de Órdenes",
      "description": "Consumidor de cola de mensajería (RabbitMQ / Kafka) para orquestar la facturación, despacho y reserva definitiva de inventario.",
      "module": "infra",
      "priority": "P2",
      "weight": 55,
      "branch": "feature/INT-008/order_fulfillment_worker",
      "spec_folder": "specs/008_order_fulfillment_worker",
      "status": "pending",
      "acceptance": [
        "Procesamiento asíncrono con Dead Letter Queue (DLQ)",
        "Reintentos con retroceso exponencial ante fallos transitorios",
        "Emisión de evento OrderFulfilled tras completar el ciclo"
      ],
      "depends_on": [
        6
      ],
      "documentation": [
        "docs/architecture.md"
      ]
    },
    {
      "id": 9,
      "type": "feature",
      "name": "analytics_event_stream",
      "title": "Stream de Eventos de Analítica y Métricas",
      "description": "Captura y agregación de eventos de navegación, clics y compras para generar paneles de conversión en tiempo real.",
      "module": "analytics",
      "priority": "P2",
      "weight": 45,
      "branch": "feature/INT-009/analytics_event_stream",
      "spec_folder": "specs/009_analytics_event_stream",
      "status": "pending",
      "acceptance": [
        "Buffer de eventos no bloquea las solicitudes HTTP del usuario",
        "Ingesta por lotes con compresión gzip",
        "Métricas Prometheus expuestas en /metrics"
      ],
      "depends_on": [
        2,
        4
      ],
      "documentation": [
        "docs/architecture.md"
      ]
    },
    {
      "id": 10,
      "type": "feature",
      "name": "notification_service_email",
      "title": "Servicio de Notificaciones y Webhooks",
      "description": "Envío de emails transaccionales (bienvenida, confirmación de orden, recuperación de clave) mediante plantillas HTML y proveedor SMTP/SES.",
      "module": "notifications",
      "priority": "P2",
      "weight": 50,
      "branch": "feature/INT-010/notification_service_email",
      "spec_folder": "specs/010_notification_service_email",
      "status": "pending",
      "acceptance": [
        "Plantillas responsivas con renderizado seguro contra inyecciones",
        "Cola de reintentos para emails rechazados temporalmente",
        "Endpoints de unsubscribe y gestión de preferencias de usuario"
      ],
      "depends_on": [
        2
      ],
      "documentation": [
        "docs/specs.md"
      ]
    }
  ],
  "metadata": {
    "total_features": 10,
    "pending_count": 5,
    "spec_ready_count": 1,
    "in_progress_count": 1,
    "done_count": 3,
    "blocked_count": 3,
    "ready_to_start_count": 2,
    "last_updated": "2026-11-02",
    "updated_by": "leader"
  }
},
  currentSpec: {
  "feature": {
    "id": 4,
    "type": "feature",
    "name": "product_catalog_api",
    "title": "API de Catálogo de Productos y Búsqueda",
    "description": "Endpoints para consultar catálogo de productos con paginación basada en cursor, filtros por categoría y búsqueda full-text optimizada.",
    "module": "backend",
    "priority": "P1",
    "branch": "feature/INT-004/product_catalog_api",
    "spec_folder": "specs/004_product_catalog_api"
  },
  "responsable": "leader (orquestador)",
  "started_at": "2026-11-02 10:15 UTC",
  "tasks": [
    {
      "title": "Definir DTOs y validadores de consulta de productos",
      "done": true
    },
    {
      "title": "Crear repositorio con consultas paginadas por cursor",
      "done": true
    },
    {
      "title": "Implementar endpoint GET /api/v1/products con filtros",
      "done": true
    },
    {
      "title": "Integrar cache en memoria / Redis con invalidación",
      "done": false
    },
    {
      "title": "Escribir tests de integración y carga con k6",
      "done": false
    }
  ]
},
  historyData: {
  "records": [
    {
      "id": 1,
      "type": "feature",
      "name": "infra_database_setup",
      "title": "Infraestructura Base de Datos y Migraciones",
      "branch": "feature/INT-001/infra_database_setup",
      "completed_at": "2026-11-01 16:30 UTC",
      "commit": "a4f891b2c3d4e5f67890",
      "executor": "implementer + reviewer",
      "summary": "Base de datos PostgreSQL configurada con migraciones automáticas y pool de conexiones verificado al 100%."
    },
    {
      "id": 2,
      "type": "feature",
      "name": "user_auth_service",
      "title": "Servicio de Autenticación JWT y Roles",
      "branch": "feature/INT-002/user_auth_service",
      "completed_at": "2026-11-02 08:45 UTC",
      "commit": "e8c21a4f5b6c7d8e9f01",
      "executor": "implementer + reviewer",
      "summary": "Endpoints de login, registro y middleware de validación RBAC con cobertura de pruebas unitarias al 92%."
    },
    {
      "id": 3,
      "type": "bugfix",
      "name": "fix_jwt_token_expiration",
      "title": "Corrección de Expiración JWT en Desfases UTC",
      "branch": "bugfix/INT-003/fix_jwt_token_expiration",
      "completed_at": "2026-11-02 09:30 UTC",
      "commit": "c3d4e5f6a1b2c3d4e5f6",
      "executor": "implementer + reviewer",
      "summary": "Corregido cálculo de expiración de token para operar estrictamente en Epoch UTC independientemente del huso horario del servidor."
    }
  ]
},
  projectSpec: {
  "project": {
    "name": "CloudSaaS Platform",
    "tagline": "E-Commerce & Microservicios Cloud con Arquitectura Limpia y Eventos Asíncronos",
    "description": "Plataforma SaaS integral de comercio electrónico y microservicios orientada a eventos. Diseñada para alta concurrencia, resiliencia financiera y trazabilidad SDD. Gestiona catálogo de productos en tiempo real, carritos de compra de baja latencia con sincronización Redis, pasarela de pagos con prevención de duplicados e idempotencia, facturación con redondeo contable estricto, despacho asíncrono con Dead Letter Queues (DLQ) y observabilidad mediante streams de analítica y métricas Prometheus.",
    "version": "2.0.0",
    "type": "Fullstack / Cloud Distributed Microservices",
    "maturity": "SDD 2.0 (Spec Driven Development)",
    "verification_mode": "verify.sh + Test Suites"
  },
  "business_goals": [
    "Garantizar transacciones de pago atómicas, seguras y sin duplicidad mediante llaves de idempotencia.",
    "Mantener latencia de consulta de catálogo < 50ms mediante cursor pagination e invalidación reactiva de cache.",
    "Aislamiento estricto de dominios con Clean Architecture para permitir escalado y despliegues independientes.",
    "Trazabilidad completa de especificaciones EARS, pruebas unitarias y verificación continua."
  ],
  "tech_stack": {
    "runtimes": [
      {
        "name": "Node.js & TypeScript",
        "version": "v20.x (LTS) / TS 5.4",
        "purpose": "APIs REST, Gateway y orquestación de servicios asíncronos",
        "icon": "⚡"
      },
      {
        "name": ".NET 10 / C#",
        "version": "10.0 (Preview / LTS)",
        "purpose": "Workers de alta concurrencia, reglas de facturación contable y procesamiento intensivo",
        "icon": "🔷"
      },
      {
        "name": "Vanilla JS & Tailwind v4",
        "version": "ES2024 / Tailwind @tailwindcss/browser@4",
        "purpose": "Tablero de seguimiento de ingeniería con Screaming Architecture y Three.js",
        "icon": "🎨"
      }
    ],
    "databases": [
      {
        "name": "PostgreSQL 16",
        "type": "Relacional ACID",
        "port": 5432,
        "purpose": "Persistencia principal transaccional de órdenes, usuarios, roles y catálogo con migraciones automáticas",
        "icon": "🐘"
      },
      {
        "name": "Redis 7.2",
        "type": "In-Memory Key-Value / Cache",
        "port": 6379,
        "purpose": "Cache distribuido de lectura, sesiones de carrito volátiles y locks distribuidos (Redlock)",
        "icon": "🔴"
      }
    ],
    "messaging": [
      {
        "name": "RabbitMQ 3.13 / Apache Kafka",
        "type": "Message Broker & Colas de Eventos",
        "port": 5672,
        "purpose": "Procesamiento asíncrono de órdenes, eventos de integración y Dead Letter Queues (DLQ)",
        "icon": "🐇"
      }
    ],
    "libraries": [
      {
        "name": "Zod / FluentValidation",
        "category": "Validación & Contratos",
        "purpose": "Validación estricta de DTOs en tiempo de compilación y ejecución para contratos de API OpenAPI v3"
      },
      {
        "name": "jsonwebtoken & node-crypto",
        "category": "Seguridad & Criptografía",
        "purpose": "Tokens JWT (Access + Refresh), verificación RBAC y validación de firmas HMAC-SHA256 en webhooks"
      },
      {
        "name": "Prisma / Entity Framework Core",
        "category": "ORM & Persistencia",
        "purpose": "Mapeo objeto-relacional con pool de conexiones gestionado y migraciones deterministas"
      },
      {
        "name": "Prometheus Client & Winston",
        "category": "Observabilidad & Telemetría",
        "purpose": "Exportador de métricas en /metrics y registro de logs estructurados JSON con correlation_id"
      },
      {
        "name": "Three.js r128",
        "category": "Visualización 3D",
        "purpose": "Constelación 3D espacial con pesos de importancia, sprites y órbitas"
      },
      {
        "name": "Vitest / Supertest / xUnit",
        "category": "Aseguramiento de Calidad",
        "purpose": "Suites completas de pruebas unitarias, de integración y regresión TDD/SDD"
      }
    ]
  },
  "architecture": {
    "style": "Clean Architecture (Onion / Hexagonal) + Event-Driven Architecture (EDA)",
    "description": "Arquitectura modular por capas con inversión de dependencias estricta. Las capas internas de Dominio no conocen frameworks, bases de datos ni servicios externos. La comunicación entre dominios desacoplados se realiza mediante eventos asíncronos publicados en colas de mensajería.",
    "layers": [
      {
        "name": "Capa 1: Clientes & Perímetro",
        "badge": "External Entry",
        "description": "Aplicaciones cliente (Web, Móvil, Agentes de IA) y proveedores de webhooks que acceden al sistema a través de HTTPS/WSS."
      },
      {
        "name": "Capa 2: API Gateway & Seguridad",
        "badge": "Gateway / Edge",
        "description": "Control de tráfico, terminación TLS, rate limiting perimetral, middleware de autenticación JWT y enrutamiento hacia los dominios internos."
      },
      {
        "name": "Capa 3: Dominios & Microservicios (Clean Core)",
        "badge": "Core Domain & Use Cases",
        "description": "Casos de uso y reglas de negocio aisladas: Auth, Catálogo, Carrito, Pagos, Despacho, Analítica y Notificaciones."
      },
      {
        "name": "Capa 4: Datos, Cache & Event Broker",
        "badge": "Infrastructure & State",
        "description": "PostgreSQL (ACID), Redis (Cache & Locks) y RabbitMQ (Broker de eventos asíncronos y colas DLQ)."
      }
    ],
    "patterns": [
      {
        "name": "Clean / Hexagonal Architecture",
        "type": "Estructural",
        "description": "Aislamiento total del núcleo de negocio mediante puertos e interfaces (Domain → Application → Infrastructure)."
      },
      {
        "name": "Repository & Unit of Work",
        "type": "Persistencia",
        "description": "Abstrae el motor SQL garantizando transacciones atómicas coordinadas entre múltiples agregados."
      },
      {
        "name": "CQRS Ligero (Command Query Separation)",
        "type": "Rendimiento",
        "description": "Separa lecturas rápidas optimizadas con Redis de comandos transaccionales hacia PostgreSQL."
      },
      {
        "name": "Idempotency Key Pattern",
        "type": "Resiliencia Financiera",
        "description": "Previene cobros duplicados en la pasarela de pagos registrando llaves de idempotencia en Redis."
      },
      {
        "name": "Dead Letter Queue (DLQ) & Exponential Backoff",
        "type": "Mensajería",
        "description": "Aísla eventos fallidos tras reintentos exponenciales para análisis forense sin bloquear el pipeline."
      },
      {
        "name": "Banker's Rounding (IEEE 754)",
        "type": "Lógica Contable",
        "description": "Algoritmo de redondeo bancario a dos decimales para evitar discrepancias de centavos en facturas e impuestos."
      }
    ]
  },
  "modules": [
    {
      "id": "infra",
      "name": "Infraestructura & Plataforma Base",
      "purpose": "Scaffolding de base de datos relacional, pool de conexiones, migraciones versionadas y workers de procesamiento en cola.",
      "responsibilities": [
        "Inicialización de PostgreSQL con healthchecks activos",
        "Ejecución determinista de migraciones en arranque",
        "Worker asíncrono consumidor de colas con Dead Letter Queue (DLQ)"
      ],
      "features": [
        "INT-001",
        "INT-008"
      ],
      "tech": "PostgreSQL 16, Docker Compose, RabbitMQ, verify.sh",
      "status": "in_progress"
    },
    {
      "id": "backend",
      "name": "Servicios Core & Catálogo",
      "purpose": "Autenticación segura JWT, roles de usuario RBAC, catálogo de productos con paginación cursor y carrito en memoria.",
      "responsibilities": [
        "Emisión y rotación de tokens JWT (Access + Refresh)",
        "Middleware de autenticación y aislamiento de roles",
        "Endpoints de catálogo con latencia < 50ms y filtros full-text",
        "Gestión atómica de stock en carrito temporal y persistente con Redis"
      ],
      "features": [
        "INT-002",
        "INT-003",
        "INT-004",
        "INT-005"
      ],
      "tech": "Node.js, TypeScript, Redis 7, JWT, Zod",
      "status": "in_progress"
    },
    {
      "id": "billing",
      "name": "Facturación & Pasarelas de Pago",
      "purpose": "Flujo de cobro seguro con pasarelas (Stripe/PSE), webhooks firmados con HMAC y redondeo financiero contable.",
      "responsibilities": [
        "Integración con API de pagos con idempotencia obligatoria",
        "Validación criptográfica de webhooks con HMAC-SHA256",
        "Cálculo de impuestos con algoritmo de redondeo contable exacto"
      ],
      "features": [
        "INT-006",
        "INT-007"
      ],
      "tech": "Stripe SDK, Crypto HMAC, Banker's Rounding",
      "status": "pending"
    },
    {
      "id": "analytics",
      "name": "Analítica & Streams de Eventos",
      "purpose": "Ingesta no bloqueante de eventos de comportamiento y métricas operativas de la plataforma.",
      "responsibilities": [
        "Buffer de eventos en memoria con descarga por lotes comprimidos",
        "Exportador de métricas Prometheus para monitoreo en /metrics"
      ],
      "features": [
        "INT-009"
      ],
      "tech": "Prometheus, Stream Ingestion, gzip",
      "status": "pending"
    },
    {
      "id": "notifications",
      "name": "Comunicaciones & Notificaciones",
      "purpose": "Servicio de emails transaccionales con plantillas seguras contra inyecciones y colas de reintento.",
      "responsibilities": [
        "Renderizado seguro de plantillas HTML responsivas",
        "Gestión de rebotes, reintentos SMTP/SES y preferencias de usuario"
      ],
      "features": [
        "INT-010"
      ],
      "tech": "SMTP / AWS SES, HTML Sanitizer, Queue Retries",
      "status": "pending"
    }
  ]
},
  knowledgeIndex: {
  "system": {
    "name": "CloudSaaS Platform",
    "version": "2.0.0",
    "architecture_style": "Clean Architecture (Hexagonal) + Event-Driven Architecture (EDA)",
    "last_audit": "2026-11-02",
    "audited_by": "skill:project-knowledge"
  },
  "diagrams": [
    {
      "id": "c4-context",
      "type": "C4 Model",
      "level": "C1 - System Context",
      "title": "Diagrama de Contexto del Sistema (C1)",
      "description": "Fronteras del sistema con clientes, administradores, pasarela Stripe, proveedores SMTP y Prometheus.",
      "mermaid": "flowchart TD\n    Customer[\"👤 Cliente Comprador<br>[Web / Mobile]\"]\n    Admin[\"👤 Administrador<br>[Backoffice]\"]\n    SaaS[\"🚀 CloudSaaS Platform<br>[Core SaaS System]\"]\n    Stripe[\"💳 Stripe / PSE API<br>[Pagos & Webhooks]\"]\n    SES[\"✉️ Proveedor SMTP / SES<br>[Emails Transaccionales]\"]\n    Prom[\"📊 Prometheus Server<br>[Scraping /metrics]\"]\n\n    Customer -->|Navegación & Compras| SaaS\n    Admin -->|Gestión & Operaciones| SaaS\n    SaaS -->|Cobros & Reversiones| Stripe\n    Stripe -->|Webhooks Firmados HMAC| SaaS\n    SaaS -->|Despacho de Correos| SES\n    Prom -->|Consulta de Métricas| SaaS"
    },
    {
      "id": "c4-containers",
      "type": "C4 Model",
      "level": "C2 - Containers",
      "title": "Diagrama de Contenedores (C2)",
      "description": "Aplicaciones ejecutables, APIs backend, PostgreSQL 16, Redis 7 y RabbitMQ 3.13.",
      "mermaid": "flowchart TD\n    SPA[\"🌐 Tablero SPA<br>[Vanilla JS + Tailwind v4]\"]\n    Gateway[\"🛡️ API Gateway<br>[Reverse Proxy & Auth]\"]\n    API[\"⚡ Core Services API<br>[Node.js / Express / TypeScript]\"]\n    Worker[\"🔷 Order Fulfillment Worker<br>[.NET 10 Background Worker]\"]\n    PG[(\"🐘 PostgreSQL 16<br>[ACID Relacional :5432]\")]\n    Redis[(\"🔴 Redis 7.2<br>[Cache & Locks :6379]\")]\n    Rabbit[\"🐇 RabbitMQ 3.13<br>[Event Broker :5672]\"]\n\n    SPA -->|HTTPS| Gateway\n    Gateway --> API\n    API -->|Persistencia| PG\n    API -->|Cache & Sessions| Redis\n    API -->|Publica Eventos| Rabbit\n    Rabbit -->|Consume Eventos| Worker\n    Worker -->|Actualiza Estado| PG"
    },
    {
      "id": "c4-components",
      "type": "C4 Model",
      "level": "C3 - Components",
      "title": "Diagrama de Componentes Clean Architecture (C3)",
      "description": "Desglose por capas de Controllers, Application Services, Domain Entities e Infrastructure Adapters.",
      "mermaid": "flowchart TD\n    subgraph Entry [\"Capa 1: Controllers & Gateways\"]\n        AC[AuthController]\n        CC[CatalogController]\n        CartC[CartController]\n        PW[PaymentWebhookHandler]\n    end\n    subgraph App [\"Capa 2: Application Services\"]\n        AS[AuthService]\n        CS[CatalogService]\n        CartS[CartService]\n        PS[PaymentService]\n    end\n    subgraph Domain [\"Capa 3: Domain Core\"]\n        UserE[User & Role]\n        ProdE[Product Entity]\n        OrderE[Order & TaxCalculator]\n    end\n    subgraph Infra [\"Capa 4: Infrastructure\"]\n        PGRepo[PostgresRepository]\n        RedisA[RedisCacheAdapter]\n        StripeC[StripeApiClient]\n        EvtPub[RabbitMQEventPublisher]\n    end\n    AC --> AS\n    CC --> CS\n    CartC --> CartS\n    PW --> PS\n    AS --> UserE\n    CS --> ProdE\n    CartS --> ProdE\n    PS --> OrderE\n    AS --> PGRepo\n    CS --> RedisA\n    CS --> PGRepo\n    CartS --> RedisA\n    PS --> StripeC\n    PS --> PGRepo\n    PS --> EvtPub"
    },
    {
      "id": "uml-classes",
      "type": "UML",
      "level": "Domain Class Diagram",
      "title": "Diagrama UML de Clases de Dominio",
      "description": "Entidades User, Role, Product, ShoppingCart, Order, PaymentTransaction y sus invariantes.",
      "mermaid": "classDiagram\n    class User {\n        +UUID id\n        +string email\n        +Role role\n        +validatePassword(pass) bool\n    }\n    class Product {\n        +UUID id\n        +string name\n        +decimal price\n        +int stock\n        +reserveStock(qty) bool\n    }\n    class ShoppingCart {\n        +UUID id\n        +UUID userId\n        +DateTime expiresAt\n        +addItem(prod, qty) void\n    }\n    class Order {\n        +UUID id\n        +OrderStatus status\n        +decimal total\n        +string idempotencyKey\n        +markAsPaid() void\n    }\n    class PaymentTransaction {\n        +UUID id\n        +string chargeId\n        +decimal amount\n        +string hmacSignature\n    }\n    User \"1\" --> \"1\" Role\n    ShoppingCart \"1\" *-- \"many\" Product\n    Order \"1\" --> \"1\" ShoppingCart\n    Order \"1\" *-- \"many\" PaymentTransaction"
    },
    {
      "id": "uml-sequence-checkout",
      "type": "UML",
      "level": "Sequence Diagram",
      "title": "Diagrama UML de Secuencia: Checkout & Pago Idempotente",
      "description": "Flujo transaccional con llave de idempotencia, verificación Redis, cobro Stripe y confirmación por webhook HMAC.",
      "mermaid": "sequenceDiagram\n    actor Cliente as 👤 Cliente\n    participant API as ⚡ API Gateway\n    participant Pay as 💳 PaymentService\n    participant Redis as 🔴 Redis Cache\n    participant Stripe as 💳 Stripe API\n    participant DB as 🐘 PostgreSQL\n    participant Queue as 🐇 RabbitMQ\n\n    Cliente->>API: POST /cart/checkout (Idempotency-Key: idemp_123)\n    API->>Pay: Procesar Pago\n    Pay->>Redis: SETNX idempotency:idemp_123 (TTL: 120s)\n    Pay->>Stripe: POST /v1/payment_intents\n    Stripe-->>Pay: 200 OK (client_secret)\n    Pay->>DB: INSERT Order (PENDING_PAYMENT)\n    Pay-->>Cliente: client_secret para confirmación\n    Stripe->>API: POST /webhooks/stripe (Stripe-Signature)\n    API->>Pay: Validar firma HMAC-SHA256\n    Pay->>DB: UPDATE Order SET status='PAID'\n    Pay->>Queue: Publicar evento 'OrderPaid'\n    Pay-->>Stripe: 200 OK"
    },
    {
      "id": "uml-usecases",
      "type": "UML",
      "level": "Use Case Diagram",
      "title": "Diagrama UML de Casos de Uso del Sistema",
      "description": "Interacciones de Cliente, Administrador y Background Worker con los casos de uso principales.",
      "mermaid": "flowchart LR\n    Customer((👤 Cliente))\n    Admin((👤 Administrador))\n    Worker((⚙️ Worker))\n    UC1([UC-01: Autenticación JWT])\n    UC2([UC-02: Catálogo con Cursor])\n    UC3([UC-03: Carrito Atómico en Redis])\n    UC4([UC-04: Checkout con Idempotencia])\n    UC5([UC-05: Administración de Roles])\n    UC6([UC-06: Procesamiento de Órdenes con DLQ])\n    Customer --> UC1\n    Customer --> UC2\n    Customer --> UC3\n    Customer --> UC4\n    Admin --> UC1\n    Admin --> UC5\n    Worker --> UC6"
    }
  ],
  "business_rules": [
    {
      "id": "BR-AUTH-001",
      "module": "backend",
      "title": "Validez de expiración de tokens exclusivamente en Epoch UTC",
      "severity": "Crítica",
      "description": "El cálculo de marcas iat y exp debe realizarse en Epoch Unix UTC para evitar desfases horarios entre servidores."
    },
    {
      "id": "BR-AUTH-002",
      "module": "backend",
      "title": "Aislamiento y precedencia de roles RBAC",
      "severity": "Alta",
      "description": "Los roles ADMIN, OPERATOR y CUSTOMER cuentan con permisos estrictamente delimitados por middleware."
    },
    {
      "id": "BR-CART-001",
      "module": "backend",
      "title": "Expiración de carritos anónimos a las 24 horas",
      "severity": "Media",
      "description": "Los carritos no autenticados en Redis tienen un TTL de 86,400s y se fusionan al iniciar sesión."
    },
    {
      "id": "BR-CART-002",
      "module": "backend",
      "title": "Reserva atómica y prevención de sobreventa",
      "severity": "Crítica",
      "description": "Operaciones atómicas DECRBY en Redis previenen que se vendan más unidades de las disponibles en stock."
    },
    {
      "id": "BR-BILL-001",
      "module": "billing",
      "title": "Obligatoriedad de llave de idempotencia en transacciones",
      "severity": "Crítica",
      "description": "Todo cobro exige Idempotency-Key. Las solicitudes duplicadas son cacheadas sin generar doble cargo."
    },
    {
      "id": "BR-BILL-002",
      "module": "billing",
      "title": "Verificación de firma criptográfica HMAC en webhooks",
      "severity": "Crítica",
      "description": "Ningún webhook externo puede procesarse sin validar previamente su firma HMAC-SHA256."
    },
    {
      "id": "BR-BILL-003",
      "module": "billing",
      "title": "Algoritmo contable Banker's Rounding (IEEE 754)",
      "severity": "Alta",
      "description": "El redondeo de impuestos e IVA aplica redondeo al entero par más cercano a dos decimales exactos."
    },
    {
      "id": "BR-ORDR-001",
      "module": "infra",
      "title": "Aislamiento en Dead Letter Queue tras 3 reintentos",
      "severity": "Alta",
      "description": "Mensajes fallidos tras retroceso exponencial (1s, 2s, 4s) se desvían a orders.dlq sin frenar la cola."
    },
    {
      "id": "BR-ANLT-001",
      "module": "analytics",
      "title": "Ingesta no bloqueante de analítica",
      "severity": "Media",
      "description": "La captura de métricas ocurre en un buffer en memoria en segundo plano sin impactar latencias HTTP."
    },
    {
      "id": "BR-NOTF-001",
      "module": "notifications",
      "title": "Sanitización estricta contra XSS en plantillas de email",
      "severity": "Alta",
      "description": "Todas las variables inyectadas en plantillas de correo deben ser escapadas contra inyección HTML."
    }
  ],
  "external_services": [
    {
      "name": "Stripe API",
      "type": "Payment Gateway",
      "protocol": "HTTPS REST",
      "auth": "Bearer API Key",
      "env_var": "STRIPE_SECRET_KEY",
      "failover": "Circuit Breaker + Idempotency"
    },
    {
      "name": "Stripe Webhooks",
      "type": "Callback Ingestion",
      "protocol": "HTTPS Webhook",
      "auth": "HMAC-SHA256 Signature",
      "env_var": "STRIPE_WEBHOOK_SECRET",
      "failover": "Reintentos idempotentes 200 OK"
    },
    {
      "name": "PostgreSQL 16",
      "type": "Relational Database",
      "protocol": "TCP / PostgreSQL :5432",
      "auth": "Connection String / User-Pass",
      "env_var": "DATABASE_URL",
      "failover": "Connection Pool Healthchecks"
    },
    {
      "name": "Redis 7.2",
      "type": "In-Memory Cache & Lock",
      "protocol": "TCP / RESP :6379",
      "auth": "Auth Token",
      "env_var": "REDIS_URL",
      "failover": "Fallback graceful a PostgreSQL"
    },
    {
      "name": "RabbitMQ 3.13",
      "type": "Message Broker",
      "protocol": "AMQP :5672",
      "auth": "AMQP Credentials",
      "env_var": "RABBITMQ_URL",
      "failover": "Dead Letter Queue (DLQ)"
    },
    {
      "name": "AWS SES / SMTP",
      "type": "Transactional Email",
      "protocol": "SMTP / TLS :587",
      "auth": "SMTP User / Password",
      "env_var": "SMTP_PASS",
      "failover": "Cola diferida de reintento"
    }
  ],
  "coding_standards": {
    "naming_conventions": {
      "files": "kebab-case o PascalCase según runtime",
      "classes": "PascalCase",
      "methods": "camelCase",
      "git_branches": "{type}/INT-{numero}/{nombre_rama} (≤80 caracteres)",
      "git_commits": "Conventional Commits (feat, fix, docs, refactor)"
    },
    "guardrails": [
      "Prohibido instalar librerías redundantes para problemas ya resueltos con dependencias del proyecto.",
      "Controladores HTTP jamás acceden directamente a SQL o Redis; pasan por Use Cases e interfaces.",
      "Todo flujo debe usar tipos de resultado explícitos o excepciones de dominio capturadas en middleware.",
      "Toda nueva lógica debe contar con tests unitarios y de integración guiados por TDD/SDD."
    ]
  },
  "docs": {
    "business-rules.md": "# Catálogo de Reglas de Negocio — CloudSaaS Platform\n\nLas siguientes reglas de negocio son **invariantes de dominio de cumplimiento obligatorio**. Todo agente de IA o desarrollador debe asegurarse de que cualquier código, migración o prueba escrita respete estas reglas sin excepción.\n\n---\n\n## Índice de Reglas por Dominio\n\n| ID | Módulo | Título | Severidad |\n|---|---|---|---|\n| `BR-AUTH-001` | `backend` | Validez de expiración de tokens exclusivamente en Epoch UTC | Crítica |\n| `BR-AUTH-002` | `backend` | Aislamiento y precedencia de roles RBAC | Alta |\n| `BR-CART-001` | `backend` | Expiración de carritos anónimos a las 24 horas | Media |\n| `BR-CART-002` | `backend` | Reserva atómica y prevención de sobreventa | Crítica |\n| `BR-BILL-001` | `billing` | Obligatoriedad de llave de idempotencia en transacciones | Crítica |\n| `BR-BILL-002` | `billing` | Verificación de firma criptográfica HMAC en webhooks | Crítica |\n| `BR-BILL-003` | `billing` | Algoritmo contable Banker's Rounding (IEEE 754) | Alta |\n| `BR-ORDR-001` | `infra` | Aislamiento de mensajes fallidos en Dead Letter Queue tras 3 reintentos | Alta |\n| `BR-ANLT-001` | `analytics` | Ingesta no bloqueante de analítica sin afectar latencia transaccional | Media |\n| `BR-NOTF-001` | `notifications` | Sanitización estricta contra XSS/inyección en plantillas de email | Alta |\n\n---\n\n## Detalle de Reglas de Negocio\n\n### `BR-AUTH-001`: Validez de Expiración JWT en Epoch UTC\n* **Contexto:** Mitigación del bug `INT-003`.\n* **Regla:** El cálculo de las marcas de tiempo `iat` (issued at) y `exp` (expires at) debe realizarse exclusivamente a partir de marcas Epoch Unix en UTC (`DateTime.UtcNow.ToUnixTimeSeconds()` o `Math.floor(Date.now() / 1000)`).\n* **Prohibición:** Está terminantemente prohibido utilizar `DateTime.Now` o husos horarios locales del servidor.\n\n### `BR-AUTH-002`: Aislamiento de Roles RBAC\n* **Regla:** Un usuario solo puede acceder a recursos que coincidan con sus permisos asignados. Los roles `ADMIN` tienen acceso global; los roles `OPERATOR` tienen acceso limitado a catálogo y órdenes; los usuarios `CUSTOMER` solo pueden leer su propio carrito y órdenes.\n\n### `BR-CART-001`: Ciclo de Vida de Carritos Anónimos\n* **Regla:** Los carritos de compras no asociados a un usuario autenticado deben almacenarse en Redis con un Time-To-Live (TTL) estricto de 24 horas (86,400 segundos). Si el usuario inicia sesión, el carrito anónimo se fusiona automáticamente con el carrito persistente del usuario en PostgreSQL.\n\n### `BR-CART-002`: Atomicidad en Control de Inventario\n* **Regla:** La adición de un producto al carrito o el inicio de checkout debe ejecutar una operación atómica (`DECRBY` en Redis o `SELECT FOR UPDATE` en SQL). Si el stock disponible es menor a la cantidad solicitada, la operación debe ser rechazada inmediatamente retornando `INSUFFICIENT_STOCK`.\n\n### `BR-BILL-001`: Idempotencia Obligatoria en Pagos\n* **Regla:** Todo endpoint de cobro (`POST /cart/checkout`, `POST /payments`) exige la cabecera `Idempotency-Key`. La primera solicitud procesa el cobro y guarda el resultado en Redis por 120 segundos. Solicitudes duplicadas concurrentes son rechazadas con `409 Conflict` o devuelven el resultado previamente cacheado sin generar doble cargo.\n\n### `BR-BILL-002`: Validación Criptográfica de Webhooks\n* **Regla:** Ningún evento de pasarela externa (ej. `payment_intent.succeeded` de Stripe) puede marcar una orden como `PAID` sin antes validar la firma criptográfica enviada en la cabecera `Stripe-Signature` utilizando HMAC-SHA256 y la clave secreta `STRIPE_WEBHOOK_SECRET`.\n\n### `BR-BILL-003`: Redondeo Financiero Banker's Rounding (IEEE 754)\n* **Regla:** El cálculo de impuestos e IVA debe aplicar redondeo al entero par más cercano (*Banker's Rounding* o redondeo bancario) a dos decimales exactos. Queda prohibido el truncamiento directo o `Math.round()` tradicional que genera discrepancias acumulativas de centavos en facturación masiva.\n\n### `BR-ORDR-001`: Resiliencia en Colas de Órdenes (DLQ)\n* **Regla:** Los consumidores de mensajería (RabbitMQ/Kafka) disponen de un máximo de 3 reintentos con retroceso exponencial (1s, 2s, 4s). Si tras 3 intentos el procesamiento falla, el mensaje debe ser enrutado automáticamente a la Dead Letter Queue (`orders.dlq`) y generar una alerta operativa sin detener el hilo principal de procesamiento.\n\n### `BR-ANLT-001`: Aislamiento de Ingesta de Analítica\n* **Regla:** La captura de eventos de navegación o telemetría debe realizarse en un buffer en memoria en segundo plano. Bajo ninguna circunstancia un fallo o demora en la ingesta de analítica debe aumentar la latencia o interrumpir las peticiones HTTP del usuario.\n\n### `BR-NOTF-001`: Sanitización de Plantillas de Notificación\n* **Regla:** Los valores inyectados en las plantillas HTML de correo transaccional (nombre de usuario, productos, direcciones) deben ser sanitizados y escapados para prevenir ataques de inyección HTML o enlaces maliciosos.\n",
    "c4-model.md": "# Modelo C4 de Arquitectura — CloudSaaS Platform\n\nEste documento define la arquitectura del sistema en tres niveles del modelo C4 (Contexto, Contenedores y Componentes), permitiendo a los desarrolladores y agentes de IA comprender las fronteras, responsabilidades y protocolos de comunicación sin ambigüedad.\n\n---\n\n## Nivel 1: Diagrama de Contexto del Sistema (System Context - C1)\n\nMuestra cómo el sistema `CloudSaaS Platform` interactúa con los usuarios y los sistemas externos.\n\n```mermaid\nflowchart TD\n    subgraph Users [\"Actores & Usuarios\"]\n        Customer[\"👤 Cliente Comprador<br>[Web / Mobile]\"]\n        Admin[\"👤 Administrador de Operaciones<br>[Backoffice]\"]\n        AIAgent[\"🤖 Agente de IA SDD<br>[Google Antigravity / Copilot / OpenCode]\"]\n    end\n\n    subgraph System [\"Límite del Sistema\"]\n        SaaS[\"🚀 CloudSaaS Platform<br>[E-Commerce & Microservicios Cloud]<br>Catálogo, carrito, órdenes, facturación y analítica\"]\n    end\n\n    subgraph External [\"Sistemas Externos\"]\n        Stripe[\"💳 Pasarela de Pagos<br>[Stripe / PSE API]<br>Cobros y Webhooks\"]\n        EmailService[\"✉️ Proveedor SMTP / SES<br>[AWS SES / SendGrid]<br>Emails transaccionales\"]\n        Prometheus[\"📊 Sistema de Monitoreo<br>[Prometheus Server]<br>Scraping de métricas /metrics\"]\n    end\n\n    Customer -->|\"Navega productos, gestiona carrito y realiza compras (HTTPS)\"| SaaS\n    Admin -->|\"Gestiona inventario, órdenes y roles RBAC (HTTPS)\"| SaaS\n    AIAgent -->|\"Ejecuta specs, implementa código y audita verify.sh\"| SaaS\n\n    SaaS -->|\"Autoriza pagos y procesa devoluciones (HTTPS REST)\"| Stripe\n    Stripe -->|\"Envía confirmación de cobro por webhook firmado HMAC\"| SaaS\n    SaaS -->|\"Despacha emails de bienvenida y facturas (SMTP/TLS)\"| EmailService\n    Prometheus -->|\"Consulta métricas operativas y latencias /metrics\"| SaaS\n```\n\n---\n\n## Nivel 2: Diagrama de Contenedores (Container Diagram - C2)\n\nMuestra las aplicaciones ejecutables, APIs, almacenes de datos y brokers de mensajería que componen la solución.\n\n```mermaid\nflowchart TD\n    subgraph Clients [\"Clientes\"]\n        SPA[\"🌐 Single Page Application<br>[Vanilla JS + Tailwind v4]<br>Tablero de Seguimiento & UI\"]\n        Mobile[\"📱 Mobile App<br>[iOS / Android]<br>Catálogo & Checkout\"]\n    end\n\n    subgraph GatewayBoundary [\"Perímetro\"]\n        Gateway[\"🛡️ API Gateway & Reverse Proxy<br>[Node.js / Reverse Proxy]<br>Rate Limiting, TLS 1.3, Auth Middleware\"]\n    end\n\n    subgraph BackendBoundary [\"Contenedores de Backend & Workers\"]\n        CoreAPI[\"⚡ Core Services API<br>[Node.js v20 / Express / TypeScript]<br>Auth JWT, Catálogo, Carrito y Pagos\"]\n        OrderWorker[\"🔷 Order Fulfillment Worker<br>[.NET 10 / C# Background Worker]<br>Procesamiento asíncrono de órdenes y reservas\"]\n        AnalyticsWorker[\"📊 Analytics Stream Collector<br>[Node.js Buffer Worker]<br>Agregación de eventos y métricas Prometheus\"]\n    end\n\n    subgraph StorageBoundary [\"Almacenamiento & Mensajería\"]\n        Postgres[(\"🐘 PostgreSQL 16 Database<br>[ACID Relacional · Puerto 5432]<br>Usuarios, roles, órdenes, transacciones y catálogo\")]\n        Redis[(\"🔴 Redis 7.2 Distributed Cache<br>[In-Memory · Puerto 6379]<br>Cache de catálogo, sesiones volátiles y Redlock\")]\n        RabbitMQ[\"🐇 RabbitMQ 3.13 Event Broker<br>[AMQP · Puerto 5672]<br>Colas OrderFulfilled, Dead Letter Queue (DLQ)\"]\n    end\n\n    SPA -->|\"HTTPS / JSON\"| Gateway\n    Mobile -->|\"HTTPS / JSON\"| Gateway\n\n    Gateway -->|\"Enruta tráfico autenticado\"| CoreAPI\n\n    CoreAPI -->|\"Lecturas rápidas y locks de carrito\"| Redis\n    CoreAPI -->|\"Persistencia transaccional de usuarios y pagos\"| Postgres\n    CoreAPI -->|\"Emite eventos OrderPlaced / PaymentReceived\"| RabbitMQ\n\n    RabbitMQ -->|\"Consume eventos de órdenes\"| OrderWorker\n    OrderWorker -->|\"Actualiza estado de orden y reserva inventario\"| Postgres\n\n    RabbitMQ -->|\"Consume eventos de navegación y compra\"| AnalyticsWorker\n    AnalyticsWorker -->|\"Métricas en memoria expuestas para Prometheus\"| StorageBoundary\n```\n\n---\n\n## Nivel 3: Diagrama de Componentes del Core API (Component Diagram - C3)\n\nDetalla la arquitectura limpia (Clean Architecture) dentro del contenedor principal `Core Services API`.\n\n```mermaid\nflowchart TD\n    subgraph Controllers [\"Capa 1: Controllers & Webhooks (HTTP Entry)\"]\n        AuthController[\"AuthController<br>[Endpoints /auth/login, /auth/refresh]\"]\n        CatalogController[\"CatalogController<br>[Endpoints /products, búsqueda cursor]\"]\n        CartController[\"CartController<br>[Endpoints /cart, checkout]\"]\n        PaymentWebhook[\"PaymentWebhookHandler<br>[Endpoint /webhooks/stripe, HMAC check]\"]\n    end\n\n    subgraph Application [\"Capa 2: Application Services (Use Cases)\"]\n        AuthService[\"AuthService<br>Emisión JWT, RBAC, hash bcrypt\"]\n        CatalogService[\"CatalogService<br>Filtros, cache invalidation\"]\n        CartService[\"CartService<br>Operaciones atómicas, cálculo total\"]\n        PaymentService[\"PaymentService<br>Idempotency control, cobro Stripe\"]\n    end\n\n    subgraph Domain [\"Capa 3: Domain Core (Invariantes & Reglas)\"]\n        UserAggregate[\"User & Role Entities<br>Validación invariante\"]\n        ProductEntity[\"Product Entity<br>Precios, stock mínimo\"]\n        OrderAggregate[\"Order & Tax Calculator<br>Banker's rounding rules\"]\n    end\n\n    subgraph Infrastructure [\"Capa 4: Infrastructure Adapters\"]\n        PostgresRepo[\"PostgresRepository<br>Pool transaccional SQL\"]\n        RedisAdapter[\"RedisCacheAdapter<br>TTL, Redlock distribuido\"]\n        StripeClient[\"StripeApiClient<br>Circuit breaker, reintentos\"]\n        EventPublisher[\"RabbitMQEventPublisher<br>Publicador de eventos AMQP\"]\n    end\n\n    AuthController --> AuthService\n    CatalogController --> CatalogService\n    CartController --> CartService\n    PaymentWebhook --> PaymentService\n\n    AuthService --> UserAggregate\n    CatalogService --> ProductEntity\n    CartService --> ProductEntity\n    PaymentService --> OrderAggregate\n\n    AuthService --> PostgresRepo\n    CatalogService --> RedisAdapter\n    CatalogService --> PostgresRepo\n    CartService --> RedisAdapter\n    PaymentService --> StripeClient\n    PaymentService --> PostgresRepo\n    PaymentService --> EventPublisher\n```\n",
    "coding-standards.md": "# Estándares de Programación & Directrices Anti-Sesgo — CloudSaaS Platform\n\nEste documento define las convenciones de código observadas y obligatorias en el proyecto. Su objetivo es asegurar que los agentes de IA no introduzcan librerías no deseadas, mantengan el estilo de codificación existente y respeten los patrones arquitecturales establecidos.\n\n---\n\n## 1. Directrices Anti-Sesgo para Agentes de IA (AI Guardrails)\n\nPara evitar que los modelos de lenguaje (LLMs) apliquen patrones genéricos o bibliotecas obsoletas aprendidas en su pre-entrenamiento:\n\n> [!IMPORTANT]\n> 1. **No inventar librerías**: Si una funcionalidad ya está resuelta con dependencias del proyecto (ej. `node:crypto`, `Zod`, `pg`), está prohibido instalar bibliotecas redundantes (como `crypto-js`, `joi`, etc.).\n> 2. **Respetar la arquitectura en capas**: Ningún controlador HTTP puede acceder directamente a consultas SQL o al cliente de Redis; debe pasar por la capa de Casos de Uso (`Application Service`) e interfaces de repositorio.\n> 3. **Manejo de Errores con Result Pattern o Excepciones de Dominio**: No retornar objetos vacíos ni `null` ante errores. Usar tipos explícitos de error o lanzar excepciones tipadas capturadas por el middleware de errores global.\n> 4. **Tests Primero o Acompañados**: Toda lógica nueva debe contar con su correspondiente suite de pruebas unitarias cubriendo casos de éxito y caminos de fallo.\n\n---\n\n## 2. Convenciones de Nomenclatura\n\n| Elemento | Convención | Ejemplo |\n|---|---|---|\n| Archivos de código | `kebab-case` o `PascalCase` según lenguaje | `cart-service.ts`, `OrderWorker.cs` |\n| Clases e Interfaces | `PascalCase` | `PaymentService`, `IOrderRepository` |\n| Funciones y Métodos | `camelCase` | `calculateTaxAmount()`, `reserveStock()` |\n| Variables y Parámetros | `camelCase` | `orderId`, `idempotencyKey` |\n| Constantes | `UPPER_SNAKE_CASE` | `DEFAULT_CACHE_TTL`, `MAX_RETRIES` |\n| Ramas Git | `{type}/INT-{numero}/{nombre_rama}` (≤80c) | `feature/INT-004/product_catalog_api` |\n| Commits | Convencionales (`feat`, `fix`, `docs`, `refactor`) | `feat(billing): implement idempotency check` |\n\n---\n\n## 3. Patrones de Diseño Implementados\n\n### A. Repository & Unit of Work Pattern\n* La interfaz `IRepository<T>` se define en la capa de Dominio o Aplicación.\n* La implementación concreta (`PostgresOrderRepository`) reside en `Infrastructure`.\n* Permite reemplazar o simular (mock) la base de datos en pruebas unitarias con facilidad.\n\n### B. Clean Use Cases (Single Responsibility)\n* Cada caso de uso complejo se implementa en su propia clase u orquestador con un método `execute(command)` o `handle(query)`.\n* Esto evita controladores \"gordos\" (*Fat Controllers*) y facilita la prueba aislada.\n\n### C. DTOs Inmutables y Validación con Zod\n* Toda entrada a un endpoint debe ser validada contra un schema de validación estricto antes de llegar a la lógica de negocio:\n  ```typescript\n  export const CheckoutRequestSchema = z.object({\n    idempotencyKey: z.string().uuid(),\n    currency: z.enum(['USD', 'COP', 'EUR']),\n    paymentMethodId: z.string().min(1)\n  });\n  ```\n\n---\n\n## 4. Estructura Estándar de Carpetas (Clean Architecture)\n\n```\nsrc/\n├── core/                  # Entidades de dominio, tipos base y constantes globales\n├── modules/\n│   ├── {modulo}/\n│   │   ├── controllers/   # Handlers HTTP, rutas OpenAPI y validadores\n│   │   ├── services/      # Lógica de aplicación y casos de uso\n│   │   ├── domain/        # Entidades puras y reglas de negocio\n│   │   ├── dtos/          # Esquemas de entrada/salida y contratos\n│   │   └── repositories/  # Acceso a datos e integraciones externas\n└── shared/                # Middlewares comunes, logging y utilidades\n```\n",
    "external-services.md": "# Catálogo de Servicios Externos — CloudSaaS Platform\n\nEste documento especifica los servicios externos, APIs de terceros e integraciones de infraestructura que consume el proyecto, detallando protocolos, autenticación, manejo de fallos y contratos.\n\n---\n\n## Matriz de Integraciones Externas\n\n| Servicio | Tipo | Protocolo | Autenticación | Variable de Entorno | Manejo de Fallos |\n|---|---|---|---|---|---|\n| **Stripe API** | Pasarela de Pagos | HTTPS REST | Bearer API Key | `STRIPE_SECRET_KEY` | Circuit Breaker + Idempotencia |\n| **Stripe Webhooks** | Callbacks de Cobro | HTTPS Webhook | Firma HMAC-SHA256 | `STRIPE_WEBHOOK_SECRET` | Reintentos idempotentes 200 OK |\n| **PostgreSQL 16** | Base de Datos Principal | TCP / PostgreSQL | Password / Pool | `DATABASE_URL` | Healthchecks + Pool Retry |\n| **Redis 7.2** | Cache & Lock Distribuido | TCP / RESP | Password opcional | `REDIS_URL` | Fallback a BD si Redis no responde |\n| **RabbitMQ 3.13** | Broker de Mensajería | AMQP (5672) | User/Password | `RABBITMQ_URL` | Dead Letter Queue (DLQ) |\n| **AWS SES / SMTP** | Email Transaccional | SMTP / TLS (587) | SMTP Credentials | `SMTP_HOST`, `SMTP_PASS` | Cola diferida de reintento |\n| **Prometheus** | Métricas del Sistema | HTTP GET /metrics | Ninguna / Intranet | `METRICS_PORT` | Buffer aislado en memoria |\n\n---\n\n## Detalle Técnico por Servicio\n\n### 1. Pasarela de Pagos Stripe\n* **Host:** `https://api.stripe.com/v1/`\n* **Endpoints consumidos:**\n  * `POST /v1/payment_intents`: Creación de intención de cobro.\n  * `POST /v1/refunds`: Devolución total o parcial.\n* **Cabeceras obligatorias:**\n  * `Authorization: Bearer sk_test_...`\n  * `Idempotency-Key: uuid-v4` (Vital para evitar doble cobro ante timeouts).\n* **Manejo de Errores:** En caso de HTTP 5xx o timeout de red, aplicar Circuit Breaker y no marcar la orden como fallida hasta que expire la ventana de gracia.\n\n### 2. Webhooks Entrantes de Pagos\n* **Ruta de escucha:** `/webhooks/stripe`\n* **Verificación de Firma:**\n  ```javascript\n  const signature = req.headers['stripe-signature'];\n  const event = stripe.webhooks.constructEvent(req.rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);\n  ```\n* **Eventos Soportados:**\n  * `payment_intent.succeeded` $\\to$ Marca orden como `PAID` y emite evento a RabbitMQ.\n  * `payment_intent.payment_failed` $\\to$ Registra transacción fallida y libera stock atómico.\n\n### 3. Cluster PostgreSQL\n* **Driver:** `pg` / `Npgsql` con connection pooling (mínimo 5, máximo 25 conexiones por instancia).\n* **Políticas:** Todas las operaciones sobre órdenes y transacciones deben ejecutarse dentro de un bloque transaccional (`BEGIN ... COMMIT`).\n\n### 4. Cluster Redis\n* **Uso:**\n  * Cache con prefijo `cat:prod:{id}` (TTL: 600 segundos).\n  * Carrito anónimo `cart:anon:{sessionId}` (TTL: 86400 segundos).\n  * Cerrojo de stock `lock:stock:{productId}` (TTL: 5 segundos para Redlock).\n\n### 5. Broker de Mensajería RabbitMQ\n* **Exchange principal:** `saas.events` (Topic Exchange).\n* **Colas:**\n  * `orders.process` $\\to$ Routing key: `order.paid`\n  * `orders.dlq` $\\to$ Enrutamiento automático por encabezado `x-dead-letter-exchange` tras 3 fallos.\n",
    "modules/analytics/module-spec.md": "# Módulo: analytics (Analítica & Streams de Eventos)\n\n## Propósito\nIngestar eventos de navegación, clics y compras de forma no bloqueante y exportar métricas Prometheus en `/metrics`.\n\n## Tareas Asignadas\n- `INT-009`: `analytics_event_stream` (Buffer en memoria, compresión gzip, métricas Prometheus).\n\n## Reglas\n- **`BR-ANLT-001`**: La captura de analítica jamás bloquea peticiones HTTP del usuario.\n- **`BR-ANLT-002`**: Exportación en `/metrics` conforme al estándar OpenMetrics.\n",
    "modules/backend/module-spec.md": "# Módulo: backend (Servicios Core & Catálogo)\n\n## Propósito\nExponer las APIs REST principales del sistema: autenticación JWT, roles RBAC, catálogo de productos con paginación cursor y carrito de compras en memoria.\n\n## Tareas Asignadas\n- `INT-002`: `user_auth_service` (Login, roles, rotación JWT).\n- `INT-003`: `fix_jwt_token_expiration` (Cálculo Epoch UTC estricto).\n- `INT-004`: `product_catalog_api` (Cursor pagination y filtros full-text).\n- `INT-005`: `shopping_cart_service` (Carrito en memoria con Redis).\n\n## Componentes Clave\n- `AuthController`: Emisión y validación de tokens.\n- `CatalogService`: Gestión de productos y caché.\n- `CartService`: Operaciones atómicas de stock.\n",
    "modules/backend/rules.md": "# Reglas del Módulo: backend\n\n1. **`BR-AUTH-001`**: Las marcas de expiración JWT deben calcularse exclusivamente en Epoch UTC.\n2. **`BR-AUTH-002`**: Los roles permitidos son exclusivamente `ADMIN`, `OPERATOR`, `CUSTOMER`.\n3. **`BR-CAT-001`**: La paginación de productos utiliza cursores (`after_id`) para latencia $< 50\\text{ms}$.\n4. **`BR-CART-001`**: Los carritos anónimos expiran en 24h (TTL en Redis).\n5. **`BR-CART-002`**: Las adiciones al carrito verifican y descuentan stock de forma atómica.\n",
    "modules/backend/sequence.md": "# Flujo de Secuencia: backend (Consulta de Catálogo con Caché)\n\n```mermaid\nsequenceDiagram\n    actor Cliente as 👤 Cliente\n    participant Cat as 🛍️ CatalogController\n    participant Svc as ⚙️ CatalogService\n    participant Redis as 🔴 Redis Cache\n    participant DB as 🐘 PostgreSQL\n\n    Cliente->>Cat: GET /products?cursor=xyz&limit=20\n    Cat->>Svc: getProducts(cursor, limit)\n    Svc->>Redis: GET cat:page:xyz\n    \n    alt Cache Hit\n        Redis-->>Svc: Lista de productos en JSON\n        Svc-->>Cat: Productos cacheados\n        Cat-->>Cliente: 200 OK (X-Cache: HIT, < 10ms)\n    else Cache Miss\n        Redis-->>Svc: null\n        Svc->>DB: SELECT * FROM products WHERE id > cursor LIMIT 20\n        DB-->>Svc: Registros SQL\n        Svc->>Redis: SET cat:page:xyz (TTL: 300s)\n        Svc-->>Cat: Lista de productos\n        Cat-->>Cliente: 200 OK (X-Cache: MISS, < 40ms)\n    end\n```\n",
    "modules/billing/module-spec.md": "# Módulo: billing (Facturación & Pasarelas de Pago)\n\n## Propósito\nGestionar las transacciones financieras, integración con Stripe/PSE, webhooks firmados con HMAC y algoritmos de liquidación de impuestos.\n\n## Tareas Asignadas\n- `INT-006`: `payment_gateway_integration` (Stripe, webhooks HMAC, idempotencia).\n- `INT-007`: `fix_cart_tax_rounding` (Redondeo Banker's rounding a dos decimales).\n",
    "modules/billing/rules.md": "# Reglas del Módulo: billing\n\n1. **`BR-BILL-001`**: La cabecera `Idempotency-Key` es obligatoria en checkout.\n2. **`BR-BILL-002`**: Todo webhook exige validación criptográfica HMAC-SHA256 antes de procesar el cobro.\n3. **`BR-BILL-003`**: El redondeo contable aplica Banker's Rounding (IEEE 754) a dos decimales exactos.\n",
    "modules/billing/sequence.md": "# Flujo de Secuencia: billing (Liquidación de Impuestos y Redondeo Contable)\n\n```mermaid\nsequenceDiagram\n    participant Cart as 🛒 CartService\n    participant TaxCalc as 📐 TaxCalculator\n    participant DB as 🐘 PostgreSQL\n\n    Cart->>TaxCalc: calculateTaxes(subtotal, taxRate)\n    activate TaxCalc\n    Note over TaxCalc: Aplica Banker's Rounding<br>Math.round al entero par más cercano\n    TaxCalc->>TaxCalc: tax = roundBankers(subtotal * 0.19, 2)\n    TaxCalc->>TaxCalc: total = subtotal + tax\n    TaxCalc-->>Cart: { subtotal, tax, total, roundingDiff: 0.00 }\n    deactivate TaxCalc\n```\n",
    "modules/infra/module-spec.md": "# Módulo: infra (Infraestructura & Plataforma Base)\n\n## Propósito\nProveer los cimientos de almacenamiento, pooling, migraciones versionadas y procesamiento asíncrono para toda la plataforma.\n\n## Tareas Asignadas\n- `INT-001`: `infra_database_setup` (PostgreSQL setup, pooling y migraciones automáticas).\n- `INT-008`: `order_fulfillment_worker` (Worker consumidor con DLQ y reintentos).\n\n## Entidades & Contratos\n- `DatabaseMigrationRecord`: Registro de scripts ejecutados.\n- `WorkerHealthStatus`: Healthcheck activo del consumidor RabbitMQ.\n",
    "modules/infra/rules.md": "# Reglas del Módulo: infra\n\n1. **`BR-INFRA-001`**: Las migraciones SQL deben ser deterministas, idempotentes e incluir siempre estrategia de reversión (rollback).\n2. **`BR-INFRA-002`**: El pool de base de datos debe limitar el número máximo de conexiones a 25 para evitar agotamiento de recursos del cluster.\n3. **`BR-ORDR-001`**: Tras 3 fallos en procesamiento de colas, los mensajes se enrutan obligatoriamente a `orders.dlq`.\n",
    "modules/infra/sequence.md": "# Flujo de Secuencia: infra (Procesamiento de Órdenes en Worker)\n\n```mermaid\nsequenceDiagram\n    participant Queue as 🐇 RabbitMQ (orders.process)\n    participant Worker as ⚙️ OrderWorker (.NET 10)\n    participant DB as 🐘 PostgreSQL\n    participant DLQ as ☠️ RabbitMQ (orders.dlq)\n\n    Queue->>Worker: Mensaje OrderPaid (order_id)\n    activate Worker\n    Worker->>DB: Verificar estado de orden\n    \n    alt Error transitorio (timeout de BD)\n        Worker-->>Queue: NACK (Reintento con backoff)\n    else Fallo fatal o reintentos superados\n        Worker->>DLQ: Publicar a Dead Letter Queue\n        Worker-->>Queue: ACK (Desencolar de principal)\n    else Éxito\n        Worker->>DB: Actualizar status = 'FULFILLED'\n        Worker-->>Queue: ACK\n    end\n    deactivate Worker\n```\n",
    "modules/notifications/module-spec.md": "# Módulo: notifications (Comunicaciones & Notificaciones)\n\n## Propósito\nEnvío de emails transaccionales con plantillas HTML responsivas y seguras contra inyección, y gestión de reintentos SMTP/SES.\n\n## Tareas Asignadas\n- `INT-010`: `notification_service_email` (Plantillas responsivas, reintentos diferidos, unsubscribe).\n\n## Reglas\n- **`BR-NOTF-001`**: Sanitización estricta de variables en plantillas HTML.\n- **`BR-NOTF-002`**: Manejo de rebotes temporales con reintento a los 5 y 15 minutos.\n",
    "uml-diagrams.md": "# Diagramas UML del Sistema — CloudSaaS Platform\n\nEste documento recopila los diagramas UML formales para modelar entidades, transacciones críticas y casos de uso del sistema.\n\n---\n\n## 1. Diagrama de Clases de Dominio (Domain Class Diagram)\n\nModela las entidades de negocio, sus relaciones y contratos de dominio aislados de frameworks.\n\n```mermaid\nclassDiagram\n    class User {\n        +UUID id\n        +string email\n        +string passwordHash\n        +Role role\n        +DateTime createdAt\n        +validatePassword(plainText) bool\n        +hasPermission(permission) bool\n    }\n\n    class Role {\n        <<enumeration>>\n        ADMIN\n        OPERATOR\n        CUSTOMER\n    }\n\n    class Product {\n        +UUID id\n        +string sku\n        +string name\n        +decimal price\n        +int stock\n        +bool isActive\n        +reserveStock(quantity) bool\n        +releaseStock(quantity) void\n    }\n\n    class ShoppingCart {\n        +UUID id\n        +UUID userId\n        +string sessionId\n        +DateTime expiresAt\n        +List~CartItem~ items\n        +addItem(product, qty) void\n        +removeItem(productId) void\n        +calculateSubtotal() decimal\n    }\n\n    class CartItem {\n        +UUID productId\n        +string name\n        +decimal unitPrice\n        +int quantity\n        +decimal getTotal()\n    }\n\n    class Order {\n        +UUID id\n        +UUID customerId\n        +OrderStatus status\n        +decimal subtotal\n        +decimal taxAmount\n        +decimal total\n        +string idempotencyKey\n        +DateTime createdAt\n        +applyTaxCalculation(taxResult) void\n        +markAsPaid() void\n    }\n\n    class OrderStatus {\n        <<enumeration>>\n        PENDING_PAYMENT\n        PAID\n        FULFILLING\n        FULFILLED\n        CANCELLED\n    }\n\n    class PaymentTransaction {\n        +UUID id\n        +UUID orderId\n        +string gatewayProvider\n        +string chargeId\n        +decimal amount\n        +string currency\n        +PaymentStatus status\n        +string hmacSignature\n        +DateTime processedAt\n    }\n\n    class PaymentStatus {\n        <<enumeration>>\n        INITIATED\n        SUCCESS\n        FAILED\n        REFUNDED\n    }\n\n    User \"1\" --> \"1\" Role : tiene\n    ShoppingCart \"1\" *-- \"many\" CartItem : contiene\n    CartItem --> \"1\" Product : referencia\n    Order \"1\" --> \"1\" ShoppingCart : genera desde\n    Order \"1\" *-- \"many\" PaymentTransaction : registra\n    Order --> \"1\" OrderStatus : estado\n    PaymentTransaction --> \"1\" PaymentStatus : estado\n```\n\n---\n\n## 2. Diagrama de Secuencia: Checkout & Pago Idempotente con Webhook\n\nIlustra la interacción entre Cliente, API Gateway, CartService, PaymentService, Redis, Stripe y RabbitMQ.\n\n```mermaid\nsequenceDiagram\n    autonumber\n    actor Cliente as 👤 Cliente Comprador\n    participant Gateway as 🛡️ API Gateway\n    participant Cart as 🛒 CartService\n    participant Pay as 💳 PaymentService\n    participant Redis as 🔴 Redis Cache\n    participant Stripe as 💳 Stripe API\n    participant DB as 🐘 PostgreSQL\n    participant Queue as 🐇 RabbitMQ\n\n    Cliente->>Gateway: POST /cart/checkout (Idempotency-Key: idemp_123)\n    Gateway->>Pay: Procesar Intento de Pago\n    Pay->>Redis: SETNX idempotency:idemp_123 (TTL: 120s)\n    \n    alt Llave ya existe (Solicitud duplicada concurrente)\n        Redis-->>Pay: Llave bloqueada\n        Pay-->>Cliente: 409 Conflict / 200 con respuesta cacheada\n    else Llave adquirida con éxito\n        Redis-->>Pay: Bloqueo OK\n        Pay->>Cart: Obtener y validar carrito\n        Cart->>Redis: Verificar stock atómico\n        Redis-->>Cart: Stock bloqueado OK\n        Pay->>Stripe: POST /v1/payment_intents (amount, currency)\n        Stripe-->>Pay: 200 OK (intent_id, client_secret)\n        Pay->>DB: INSERT Order (status: PENDING_PAYMENT)\n        Pay-->>Cliente: Retorna client_secret para confirmación\n    end\n\n    Note over Cliente, Stripe: El cliente confirma el pago en su navegador\n\n    Stripe->>Gateway: POST /webhooks/stripe (Stripe-Signature)\n    Gateway->>Pay: Validar webhook\n    Pay->>Pay: Validar firma HMAC-SHA256 con webhook_secret\n    \n    alt Firma Inválida\n        Pay-->>Stripe: 401 Unauthorized (Rechazo de evento)\n    else Firma Válida\n        Pay->>DB: UPDATE Order SET status='PAID' WHERE id=order_id\n        Pay->>DB: INSERT PaymentTransaction (charge_id, SUCCESS)\n        Pay->>Queue: Publicar evento 'OrderPaid'\n        Pay-->>Stripe: 200 OK (Evento confirmado)\n    end\n```\n\n---\n\n## 3. Diagrama de Secuencia: Autenticación JWT con Desfase UTC\n\nDemuestra la mitigación del bug `INT-003` para servidores con husos horarios dispares mediante tiempo Epoch UTC.\n\n```mermaid\nsequenceDiagram\n    autonumber\n    actor Usuario as 👤 Usuario\n    participant Auth as ⚡ AuthService\n    participant DB as 🐘 PostgreSQL\n    participant Clock as ⏱️ UTC System Clock\n\n    Usuario->>Auth: POST /auth/login (email, password)\n    Auth->>DB: SELECT * FROM users WHERE email = ?\n    DB-->>Auth: Record con passwordHash y roles\n    Auth->>Auth: bcrypt.compare(password, passwordHash)\n    \n    alt Credenciales Incorrectas\n        Auth-->>Usuario: 401 Invalid Credentials\n    else Credenciales Válidas\n        Auth->>Clock: Obtener DateTime.UtcNow.ToUnixTimeSeconds()\n        Clock-->>Auth: epoch_now (ej: 1718000000)\n        Auth->>Auth: Generar Access Token (exp: epoch_now + 3600)\n        Auth->>Auth: Generar Refresh Token (exp: epoch_now + 604800)\n        Auth->>DB: Guardar RefreshToken hash\n        Auth-->>Usuario: 200 OK { access_token, refresh_token, expires_in: 3600 }\n    end\n```\n\n---\n\n## 4. Diagrama de Casos de Uso (Use Case Diagram)\n\n```mermaid\nflowchart LR\n    Customer((👤 Cliente))\n    Admin((👤 Administrador))\n    Worker((⚙️ Background Worker))\n\n    subgraph CasosDeUso [\"Casos de Uso del Sistema\"]\n        UC1([UC-01: Iniciar Sesión / Registro JWT])\n        UC2([UC-02: Consultar Catálogo con Cursor])\n        UC3([UC-03: Gestionar Carrito en Memoria])\n        UC4([UC-04: Realizar Pago con Idempotencia])\n        UC5([UC-05: Gestionar Roles RBAC])\n        UC6([UC-06: Procesar Cola de Despacho con DLQ])\n        UC7([UC-07: Ingestar Stream de Analítica])\n        UC8([UC-08: Enviar Emails Transaccionales])\n    end\n\n    Customer --> UC1\n    Customer --> UC2\n    Customer --> UC3\n    Customer --> UC4\n\n    Admin --> UC1\n    Admin --> UC5\n\n    Worker --> UC6\n    Worker --> UC7\n    Worker --> UC8\n```\n"
  }
}
};
