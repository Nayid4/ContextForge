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
      "mermaid": "flowchart TD\n    Customer[\"👤 Cliente Comprador<br>[Web / Mobile]\"]\n    Admin[\"👤 Administrador<br>[Backoffice]\"]\n    SaaS[\"🚀 CloudSaaS Platform<br>[Core SaaS System]\"]\n    Stripe[\"💳 Stripe / PSE API<br>[Pagos & Webhooks]\"]\n    SES[\"✉️ Proveedor SMTP / SES<br>[Emails Transaccionales]\"]\n    Prom[\"📊 Prometheus Server<br>[Scraping /metrics]\"]\n\n    Customer -->|\"Navegación & Compras\"| SaaS\n    Admin -->|\"Gestión & Operaciones\"| SaaS\n    SaaS -->|\"Cobros & Reversiones\"| Stripe\n    Stripe -->|\"Webhooks Firmados HMAC\"| SaaS\n    SaaS -->|\"Despacho de Correos\"| SES\n    Prom -->|\"Consulta de Métricas\"| SaaS"
    },
    {
      "id": "c4-containers",
      "type": "C4 Model",
      "level": "C2 - Containers",
      "title": "Diagrama de Contenedores (C2)",
      "description": "Aplicaciones ejecutables, APIs backend, PostgreSQL 16, Redis 7 y RabbitMQ 3.13.",
      "mermaid": "flowchart TD\n    SPA[\"🌐 Tablero SPA<br>[Vanilla JS + Tailwind v4]\"]\n    Gateway[\"🛡️ API Gateway<br>[Reverse Proxy & Auth]\"]\n    API[\"⚡ Core Services API<br>[Node.js / Express / TypeScript]\"]\n    Worker[\"🔷 Order Fulfillment Worker<br>[.NET 10 Background Worker]\"]\n    PG[(\"🐘 PostgreSQL 16<br>[ACID Relacional :5432]\")]\n    Redis[(\"🔴 Redis 7.2<br>[Cache & Locks :6379]\")]\n    Rabbit[\"🐇 RabbitMQ 3.13<br>[Event Broker :5672]\"]\n\n    SPA -->|\"HTTPS\"| Gateway\n    Gateway -->|\"Routing & Auth\"| API\n    API -->|\"Persistencia\"| PG\n    API -->|\"Cache & Sessions\"| Redis\n    API -->|\"Publica Eventos\"| Rabbit\n    Rabbit -->|\"Consume Eventos\"| Worker\n    Worker -->|\"Actualiza Estado\"| PG"
    },
    {
      "id": "c4-components",
      "type": "C4 Model",
      "level": "C3 - Components",
      "title": "Diagrama de Componentes Clean Architecture (C3)",
      "description": "Desglose por capas de Controllers, Application Services, Domain Entities e Infrastructure Adapters.",
      "mermaid": "flowchart TD\n    subgraph Entry [\"Capa 1: Controllers & Gateways\"]\n        AC[\"AuthController\"]\n        CC[\"CatalogController\"]\n        CartC[\"CartController\"]\n        PW[\"PaymentWebhookHandler\"]\n    end\n    subgraph App [\"Capa 2: Application Services\"]\n        AS[\"AuthService\"]\n        CS[\"CatalogService\"]\n        CartS[\"CartService\"]\n        PS[\"PaymentService\"]\n    end\n    subgraph Domain [\"Capa 3: Domain Core\"]\n        UserE[\"User & Role\"]\n        ProdE[\"Product Entity\"]\n        OrderE[\"Order & TaxCalculator\"]\n    end\n    subgraph Infra [\"Capa 4: Infrastructure\"]\n        PGRepo[\"PostgresRepository\"]\n        RedisA[\"RedisCacheAdapter\"]\n        StripeC[\"StripeApiClient\"]\n        EvtPub[\"RabbitMQEventPublisher\"]\n    end\n    AC --> AS\n    CC --> CS\n    CartC --> CartS\n    PW --> PS\n    AS --> UserE\n    CS --> ProdE\n    CartS --> ProdE\n    PS --> OrderE\n    AS --> PGRepo\n    CS --> RedisA\n    CS --> PGRepo\n    CartS --> RedisA\n    PS --> StripeC\n    PS --> PGRepo\n    PS --> EvtPub"
    },
    {
      "id": "uml-classes",
      "type": "UML",
      "level": "Domain Class Diagram",
      "title": "Diagrama UML de Clases de Dominio",
      "description": "Entidades User, Role, Product, ShoppingCart, Order, PaymentTransaction y sus invariantes.",
      "mermaid": "classDiagram\n    class User {\n        +UUID id\n        +string email\n        +string role\n        +validatePassword(string pass) bool\n    }\n    class Product {\n        +UUID id\n        +string name\n        +decimal price\n        +int stock\n        +reserveStock(int qty) bool\n    }\n    class ShoppingCart {\n        +UUID id\n        +UUID userId\n        +DateTime expiresAt\n        +addItem(Product prod, int qty) void\n    }\n    class Order {\n        +UUID id\n        +string status\n        +decimal total\n        +string idempotencyKey\n        +markAsPaid() void\n    }\n    class PaymentTransaction {\n        +UUID id\n        +string chargeId\n        +decimal amount\n        +string hmacSignature\n    }\n    User \"1\" --> \"1\" Role : has\n    ShoppingCart \"1\" *-- \"1..*\" Product : contains\n    Order \"1\" --> \"1\" ShoppingCart : created_from\n    Order \"1\" *-- \"1..*\" PaymentTransaction : has"
    },
    {
      "id": "uml-sequence-checkout",
      "type": "UML",
      "level": "Sequence Diagram",
      "title": "Diagrama UML de Secuencia: Checkout & Pago Idempotente",
      "description": "Flujo transaccional con llave de idempotencia, verificación Redis, cobro Stripe y confirmación por webhook HMAC.",
      "mermaid": "sequenceDiagram\n    actor Cliente as \"👤 Cliente\"\n    participant API as \"⚡ API Gateway\"\n    participant Pay as \"💳 PaymentService\"\n    participant Redis as \"🔴 Redis Cache\"\n    participant Stripe as \"💳 Stripe API\"\n    participant DB as \"🐘 PostgreSQL\"\n    participant Queue as \"🐇 RabbitMQ\"\n\n    Cliente->>API: POST /cart/checkout (Idempotency-Key)\n    API->>Pay: Procesar Pago\n    Pay->>Redis: SETNX idempotency key (TTL 120s)\n    Pay->>Stripe: POST /v1/payment_intents\n    Stripe-->>Pay: 200 OK (client_secret)\n    Pay->>DB: INSERT Order (PENDING_PAYMENT)\n    Pay-->>Cliente: client_secret para confirmación\n    Stripe->>API: POST /webhooks/stripe (HMAC-SHA256)\n    API->>Pay: Validar firma criptográfica\n    Pay->>DB: UPDATE Order SET status='PAID'\n    Pay->>Queue: Publicar evento OrderPaid\n    Pay-->>Stripe: 200 OK"
    },
    {
      "id": "uml-usecases",
      "type": "UML",
      "level": "Use Case Diagram",
      "title": "Diagrama UML de Casos de Uso del Sistema",
      "description": "Interacciones de Cliente, Administrador y Background Worker con los casos de uso principales.",
      "mermaid": "flowchart LR\n    Customer((\"👤 Cliente\"))\n    Admin((\"👤 Administrador\"))\n    Worker((\"⚙️ Worker\"))\n    UC1([\"UC-01: Autenticación JWT\"])\n    UC2([\"UC-02: Catálogo con Cursor\"])\n    UC3([\"UC-03: Carrito Atómico en Redis\"])\n    UC4([\"UC-04: Checkout con Idempotencia\"])\n    UC5([\"UC-05: Administración de Roles\"])\n    UC6([\"UC-06: Procesamiento con DLQ\"])\n    Customer --> UC1\n    Customer --> UC2\n    Customer --> UC3\n    Customer --> UC4\n    Admin --> UC1\n    Admin --> UC5\n    Worker --> UC6"
    },
    {
      "id": "erd-database",
      "type": "Database ERD",
      "level": "Entity-Relationship",
      "title": "Diagrama Entidad-Relación de la Base de Datos (PostgreSQL)",
      "description": "Esquema relacional de Users, Roles, Products, Carts, Orders, Invoices y Payments con llaves foráneas y tipos nativos.",
      "mermaid": "erDiagram\n    USERS ||--o{ REFRESH_TOKENS : \"emits\"\n    USERS }o--o{ USER_ROLES : \"assigned\"\n    ROLES ||--o{ USER_ROLES : \"defines\"\n    USERS ||--o{ ORDERS : \"places\"\n    ORDERS ||--|{ ORDER_ITEMS : \"contains\"\n    PRODUCTS ||--o{ ORDER_ITEMS : \"referenced_in\"\n    ORDERS ||--|| INVOICES : \"billed_by\"\n    INVOICES ||--|{ PAYMENTS : \"settled_by\"\n    CARTS ||--o{ CART_ITEMS : \"holds\"\n    PRODUCTS ||--o{ CART_ITEMS : \"selected_in\""
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
      "description": "El rol ADMIN posee precedencia universal; los roles regulares tienen acceso denegado por defecto a endpoints /admin/*."
    },
    {
      "id": "BR-CATL-001",
      "module": "backend",
      "title": "Paginación determinista basada en Cursor",
      "severity": "Alta",
      "description": "Para evitar páginas fantasma en catálogos de alta concurrencia, la paginación usa punteros creados a partir del ID y timestamp."
    },
    {
      "id": "BR-CART-001",
      "module": "billing",
      "title": "Expiración automática de carritos anónimos",
      "severity": "Media",
      "description": "Los carritos sin usuario autenticado tienen un TTL estricto de 24 horas en Redis; tras este plazo se descartan."
    },
    {
      "id": "BR-CART-002",
      "module": "billing",
      "title": "Reserva de inventario atómica",
      "severity": "Crítica",
      "description": "La adición de stock al carrito valida y descuenta atómicamente la cantidad usando primitivas Redis para evitar sobreventas."
    },
    {
      "id": "BR-BILL-001",
      "module": "billing",
      "title": "Idempotencia estricta en checkout (Header Idempotency-Key)",
      "severity": "Crítica",
      "description": "Toda petición de pago debe contener una llave de idempotencia única. Reintentos dentro de 120 segundos devuelven la misma respuesta sin doble cobro."
    },
    {
      "id": "BR-BILL-002",
      "module": "billing",
      "title": "Validación de firma HMAC-SHA256 en webhooks de pasarela",
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
    "adr-catalog.md": "# Catálogo de Decisiones de Arquitectura (ADR)\n\n> [!NOTE]\n> Este catálogo registra las **Decisiones de Arquitectura (Architecture Decision Records - ADR)** del proyecto en formato estándar (Michael Nygard).\n> Documenta el *por qué* de las decisiones tomadas, los trade-offs asumidos y los **anti-patrones legítimos o workarounds intencionales**, evitando que agentes de IA o nuevos desarrolladores intenten \"refactorizar\" comportamientos que fueron diseñados deliberadamente.\n\n---\n\n## Índice de ADRs\n\n| ID | Título | Estado | Fecha | Bounded Context |\n| :--- | :--- | :--- | :--- | :--- |\n| **ADR-001** | Adopción de Clean Architecture y Separación por Bounded Contexts | Aceptado | 2026-01-15 | Global |\n| **ADR-002** | Idempotencia en Cobros vía Cabecera HTTP y Almacenamiento en Redis | Aceptado | 2026-02-10 | `billing` |\n| **ADR-003** | Procesamiento Asíncrono de Órdenes con AMQP y Dead Letter Queue (DLQ) | Aceptado | 2026-02-28 | `orders` |\n| **ADR-004** | Aritmética Monetaria con Banker's Rounding (IEEE 754) | Aceptado | 2026-03-12 | `billing`, `cart` |\n| **ADR-005** | Anti-Patrón Legítimo: Respuesta HTTP 200 Incondicional en Webhooks de Pago | Aceptado | 2026-03-20 | `billing` |\n\n---\n\n## ADR-001: Adopción de Clean Architecture y Separación por Bounded Contexts\n\n### Contexto\nEl sistema requiere escalar en múltiples dominios funcionales (autenticación, facturación, carrito, catálogo, órdenes) manteniendo alta testabilidad y evitando el acoplamiento directo entre la lógica de negocio y los frameworks web o drivers de base de datos.\n\n### Decisión\nAdoptar los principios de **Clean Architecture (Hexagonal)**:\n- El Dominio puro (Entidades, Value Objects, Reglas de Negocio) no tiene ninguna dependencia externa.\n- La capa de Aplicación orquesta los casos de uso mediante patrones CQRS / MediatR.\n- Los adaptadores de Infraestructura (PostgreSQL con EF Core o Dapper, Redis, RabbitMQ) implementan interfaces declaradas en el dominio.\n\n### Consecuencias\n- **Positivas**: Testabilidad unitaria del 100% de la lógica de negocio sin levantar bases de datos ni contenedores; facilidad para reemplazar proveedores de infraestructura.\n- **Trade-offs / Costo**: Mayor número de clases, DTOs y mapeos explícitos entre capas.\n\n---\n\n## ADR-002: Idempotencia en Cobros vía Cabecera HTTP y Redis\n\n### Contexto\nEn conexiones móviles o redes inestables, los clientes pueden reenviar solicitudes de checkout tras un timeout de red, provocando cobros duplicados en la pasarela Stripe si no existe un mecanismo de deduplicación.\n\n### Decisión\nExigir la cabecera obligatoria `Idempotency-Key` (UUIDv4) en todo endpoint transaccional de cobro (`POST /api/v1/checkout`):\n1. Al recibir la clave, el servidor ejecuta `SETNX` en Redis con clave `idempotency:{key}` y estado `IN_PROGRESS` (TTL 120s).\n2. Si la clave ya existe en estado `IN_PROGRESS`, se responde `HTTP 409 Conflict`.\n3. Si la clave existe en estado `COMPLETED`, se retorna la respuesta previamente cacheada sin contactar a Stripe.\n4. Tras completar el cobro exitosamente, se guarda el payload de respuesta en Redis con TTL de 24 horas.\n\n### Consecuencias\n- **Positivas**: Eliminación total del riesgo de cobros dobles por reintentos de red.\n- **Trade-offs**: Dependencia de alta disponibilidad en el cluster de Redis.\n\n---\n\n## ADR-003: Procesamiento Asíncrono de Órdenes con AMQP y Dead Letter Queue (DLQ)\n\n### Contexto\nEl procesamiento de órdenes confirmadas implica múltiples tareas pesadas (descontar inventario, emitir comprobante, notificar al almacén y enviar correo). Ejecutar esto de forma síncrona en la petición HTTP del checkout eleva la latencia y compromete la resiliencia si un servicio adyacente cae.\n\n### Decisión\nPublicar el evento `OrderPlaced` en un Message Broker AMQP (RabbitMQ):\n1. Los workers consumen el mensaje de forma asíncrona.\n2. Si ocurre un error transitorio de base de datos o red, el mensaje se reintenta hasta 3 veces con retroceso exponencial (*exponential backoff*).\n3. Si tras el 3er intento el error persiste, el mensaje se descarta de la cola principal y se desvía automáticamente a `orders.dlq` (Dead Letter Queue) preservando el payload original y las cabeceras de excepción (`x-exception-message`).\n\n### Consecuencias\n- **Positivas**: Checkout ultra-rápido ($< 150\\text{ ms}$); tolerancia a fallos transitorios; cero pérdida de pedidos.\n- **Trade-offs**: Consistencia eventual entre la confirmación del pago y el despacho de la orden.\n\n---\n\n## ADR-004: Aritmética Monetaria con Banker's Rounding (IEEE 754)\n\n### Contexto\nEl redondeo tradicional aritmético (\"hacia arriba\" cuando el decimal es 5) genera un sesgo acumulativo positivo que incrementa artificialmente los balances contables en miles de transacciones de micro-pagos.\n\n### Decisión\nAdoptar estrictamente el algoritmo **Banker's Rounding (redondeo bancario al número par más cercano, IEEE 754)** a dos decimales exactos (`MidpointRounding.ToEven` o equivalente) en todos los cálculos de impuestos, descuentos y subtotales. Prohibir el uso de números flotantes binarios (`double` o `float`), exigiendo el tipo decimal de precisión fija (`NUMERIC(12,2)` o `decimal`).\n\n### Consecuencias\n- **Positivas**: Conciliación contable exacta al céntimo con pasarelas de pago y entidades fiscales.\n- **Trade-offs**: Requiere tests de caja blanca específicos para casos de borde (ej. `2.125 -> 2.12` vs `2.135 -> 2.14`).\n\n---\n\n## ADR-005: Anti-Patrón Legítimo: Respuesta HTTP 200 Incondicional en Webhooks de Pago\n\n> [!WARNING]\n> **Anti-Patrón Legítimo / Workaround Intencional**:  \n> No alterar este comportamiento. Modificar este endpoint para devolver códigos de error (`4xx`/`5xx`) ante payloads no reconocidos provocará que las pasarelas externas saturen el servidor con reintentos innecesarios.\n\n### Contexto\nLas pasarelas de pago externas (ej. Stripe, PayPal) reintentan el envío de webhooks con retroceso exponencial durante horas si el servidor responde con cualquier código HTTP distinto de `2xx`. Si un webhook contiene un tipo de evento que nuestro sistema no maneja deliberadamente o si el evento ya fue procesado con anterioridad, responder `400 Bad Request` o `404 Not Found` hace que la pasarela continúe bombardeando el endpoint.\n\n### Decisión\nEn el controlador receptor de webhooks (`/api/v1/webhooks/stripe`):\n1. Se valida obligatoriamente la firma criptográfica HMAC-SHA256 (`BR-BILL-002`). Si la firma es falsa o inválida, se rechaza inmediatamente con `HTTP 401 Unauthorized`.\n2. Una vez confirmada la autenticidad de la firma, el endpoint **SIEMPRE responde `HTTP 200 OK`** de forma incondicional, incluso si el evento no es de nuestro interés o si la lógica interna decide descartarlo.\n3. El procesamiento del evento se despacha a una cola en segundo plano.\n\n### Consecuencias\n- **Positivas**: Evita tormentas de reintentos de la pasarela y desacopla la confirmación HTTP del procesamiento interno.\n- **Trade-offs**: Los errores de lógica interna en el manejo del evento deben monitorearse en logs y métricas Prometheus, no en la respuesta HTTP devuelta a Stripe.\n",
    "business-rules.md": "# Catálogo de Reglas de Negocio — CloudSaaS Platform\n\nLas siguientes reglas de negocio son **invariantes de dominio de cumplimiento obligatorio**. Todo agente de IA o desarrollador debe asegurarse de que cualquier código, migración o prueba escrita respete estas reglas sin excepción.\n\n---\n\n## Índice de Reglas por Dominio\n\n| ID | Módulo | Título | Severidad |\n|---|---|---|---|\n| `BR-AUTH-001` | `backend` | Validez de expiración de tokens exclusivamente en Epoch UTC | Crítica |\n| `BR-AUTH-002` | `backend` | Aislamiento y precedencia de roles RBAC | Alta |\n| `BR-CART-001` | `backend` | Expiración de carritos anónimos a las 24 horas | Media |\n| `BR-CART-002` | `backend` | Reserva atómica y prevención de sobreventa | Crítica |\n| `BR-BILL-001` | `billing` | Obligatoriedad de llave de idempotencia en transacciones | Crítica |\n| `BR-BILL-002` | `billing` | Verificación de firma criptográfica HMAC en webhooks | Crítica |\n| `BR-BILL-003` | `billing` | Algoritmo contable Banker's Rounding (IEEE 754) | Alta |\n| `BR-ORDR-001` | `infra` | Aislamiento de mensajes fallidos en Dead Letter Queue tras 3 reintentos | Alta |\n| `BR-ANLT-001` | `analytics` | Ingesta no bloqueante de analítica sin afectar latencia transaccional | Media |\n| `BR-NOTF-001` | `notifications` | Sanitización estricta contra XSS/inyección en plantillas de email | Alta |\n\n---\n\n## Detalle de Reglas de Negocio\n\n### `BR-AUTH-001`: Validez de Expiración JWT en Epoch UTC\n* **Contexto:** Mitigación del bug `INT-003`.\n* **Regla:** El cálculo de las marcas de tiempo `iat` (issued at) y `exp` (expires at) debe realizarse exclusivamente a partir de marcas Epoch Unix en UTC (`DateTime.UtcNow.ToUnixTimeSeconds()` o `Math.floor(Date.now() / 1000)`).\n* **Prohibición:** Está terminantemente prohibido utilizar `DateTime.Now` o husos horarios locales del servidor.\n\n### `BR-AUTH-002`: Aislamiento de Roles RBAC\n* **Regla:** Un usuario solo puede acceder a recursos que coincidan con sus permisos asignados. Los roles `ADMIN` tienen acceso global; los roles `OPERATOR` tienen acceso limitado a catálogo y órdenes; los usuarios `CUSTOMER` solo pueden leer su propio carrito y órdenes.\n\n### `BR-CART-001`: Ciclo de Vida de Carritos Anónimos\n* **Regla:** Los carritos de compras no asociados a un usuario autenticado deben almacenarse en Redis con un Time-To-Live (TTL) estricto de 24 horas (86,400 segundos). Si el usuario inicia sesión, el carrito anónimo se fusiona automáticamente con el carrito persistente del usuario en PostgreSQL.\n\n### `BR-CART-002`: Atomicidad en Control de Inventario\n* **Regla:** La adición de un producto al carrito o el inicio de checkout debe ejecutar una operación atómica (`DECRBY` en Redis o `SELECT FOR UPDATE` en SQL). Si el stock disponible es menor a la cantidad solicitada, la operación debe ser rechazada inmediatamente retornando `INSUFFICIENT_STOCK`.\n\n### `BR-BILL-001`: Idempotencia Obligatoria en Pagos\n* **Regla:** Todo endpoint de cobro (`POST /cart/checkout`, `POST /payments`) exige la cabecera `Idempotency-Key`. La primera solicitud procesa el cobro y guarda el resultado en Redis por 120 segundos. Solicitudes duplicadas concurrentes son rechazadas con `409 Conflict` o devuelven el resultado previamente cacheado sin generar doble cargo.\n\n### `BR-BILL-002`: Validación Criptográfica de Webhooks\n* **Regla:** Ningún evento de pasarela externa (ej. `payment_intent.succeeded` de Stripe) puede marcar una orden como `PAID` sin antes validar la firma criptográfica enviada en la cabecera `Stripe-Signature` utilizando HMAC-SHA256 y la clave secreta `STRIPE_WEBHOOK_SECRET`.\n\n### `BR-BILL-003`: Redondeo Financiero Banker's Rounding (IEEE 754)\n* **Regla:** El cálculo de impuestos e IVA debe aplicar redondeo al entero par más cercano (*Banker's Rounding* o redondeo bancario) a dos decimales exactos. Queda prohibido el truncamiento directo o `Math.round()` tradicional que genera discrepancias acumulativas de centavos en facturación masiva.\n\n### `BR-ORDR-001`: Resiliencia en Colas de Órdenes (DLQ)\n* **Regla:** Los consumidores de mensajería (RabbitMQ/Kafka) disponen de un máximo de 3 reintentos con retroceso exponencial (1s, 2s, 4s). Si tras 3 intentos el procesamiento falla, el mensaje debe ser enrutado automáticamente a la Dead Letter Queue (`orders.dlq`) y generar una alerta operativa sin detener el hilo principal de procesamiento.\n\n### `BR-ANLT-001`: Aislamiento de Ingesta de Analítica\n* **Regla:** La captura de eventos de navegación o telemetría debe realizarse en un buffer en memoria en segundo plano. Bajo ninguna circunstancia un fallo o demora en la ingesta de analítica debe aumentar la latencia o interrumpir las peticiones HTTP del usuario.\n\n### `BR-NOTF-001`: Sanitización de Plantillas de Notificación\n* **Regla:** Los valores inyectados en las plantillas HTML de correo transaccional (nombre de usuario, productos, direcciones) deben ser sanitizados y escapados para prevenir ataques de inyección HTML o enlaces maliciosos.\n",
    "c4-model.md": "# Modelo C4 de Arquitectura — CloudSaaS Platform\n\nEste documento define la arquitectura del sistema en tres niveles del modelo C4 (Contexto, Contenedores y Componentes), permitiendo a los desarrolladores y agentes de IA comprender las fronteras, responsabilidades y protocolos de comunicación sin ambigüedad.\n\n---\n\n## Nivel 1: Diagrama de Contexto del Sistema (System Context - C1)\n\nMuestra cómo el sistema `CloudSaaS Platform` interactúa con los usuarios y los sistemas externos.\n\n```mermaid\nflowchart TD\n    subgraph Users [\"Actores & Usuarios\"]\n        Customer[\"👤 Cliente Comprador<br>[Web / Mobile]\"]\n        Admin[\"👤 Administrador de Operaciones<br>[Backoffice]\"]\n        AIAgent[\"🤖 Agente de IA SDD<br>[Google Antigravity / Copilot / OpenCode]\"]\n    end\n\n    subgraph System [\"Límite del Sistema\"]\n        SaaS[\"🚀 CloudSaaS Platform<br>[E-Commerce & Microservicios Cloud]<br>Catálogo, carrito, órdenes, facturación y analítica\"]\n    end\n\n    subgraph External [\"Sistemas Externos\"]\n        Stripe[\"💳 Pasarela de Pagos<br>[Stripe / PSE API]<br>Cobros y Webhooks\"]\n        EmailService[\"✉️ Proveedor SMTP / SES<br>[AWS SES / SendGrid]<br>Emails transaccionales\"]\n        Prometheus[\"📊 Sistema de Monitoreo<br>[Prometheus Server]<br>Scraping de métricas /metrics\"]\n    end\n\n    Customer -->|\"Navega productos, gestiona carrito y realiza compras (HTTPS)\"| SaaS\n    Admin -->|\"Gestiona inventario, órdenes y roles RBAC (HTTPS)\"| SaaS\n    AIAgent -->|\"Ejecuta specs, implementa código y audita verify.sh\"| SaaS\n\n    SaaS -->|\"Autoriza pagos y procesa devoluciones (HTTPS REST)\"| Stripe\n    Stripe -->|\"Envía confirmación de cobro por webhook firmado HMAC\"| SaaS\n    SaaS -->|\"Despacha emails de bienvenida y facturas (SMTP/TLS)\"| EmailService\n    Prometheus -->|\"Consulta métricas operativas y latencias /metrics\"| SaaS\n```\n\n---\n\n## Nivel 2: Diagrama de Contenedores (Container Diagram - C2)\n\nMuestra las aplicaciones ejecutables, APIs, almacenes de datos y brokers de mensajería que componen la solución.\n\n```mermaid\nflowchart TD\n    subgraph Clients [\"Clientes\"]\n        SPA[\"🌐 Single Page Application<br>[Vanilla JS + Tailwind v4]<br>Tablero de Seguimiento & UI\"]\n        Mobile[\"📱 Mobile App<br>[iOS / Android]<br>Catálogo & Checkout\"]\n    end\n\n    subgraph GatewayBoundary [\"Perímetro\"]\n        Gateway[\"🛡️ API Gateway & Reverse Proxy<br>[Node.js / Reverse Proxy]<br>Rate Limiting, TLS 1.3, Auth Middleware\"]\n    end\n\n    subgraph BackendBoundary [\"Contenedores de Backend & Workers\"]\n        CoreAPI[\"⚡ Core Services API<br>[Node.js v20 / Express / TypeScript]<br>Auth JWT, Catálogo, Carrito y Pagos\"]\n        OrderWorker[\"🔷 Order Fulfillment Worker<br>[.NET 10 / C# Background Worker]<br>Procesamiento asíncrono de órdenes y reservas\"]\n        AnalyticsWorker[\"📊 Analytics Stream Collector<br>[Node.js Buffer Worker]<br>Agregación de eventos y métricas Prometheus\"]\n    end\n\n    subgraph StorageBoundary [\"Almacenamiento & Mensajería\"]\n        Postgres[(\"🐘 PostgreSQL 16 Database<br>[ACID Relacional · Puerto 5432]<br>Usuarios, roles, órdenes, transacciones y catálogo\")]\n        Redis[(\"🔴 Redis 7.2 Distributed Cache<br>[In-Memory · Puerto 6379]<br>Cache de catálogo, sesiones volátiles y Redlock\")]\n        RabbitMQ[\"🐇 RabbitMQ 3.13 Event Broker<br>[AMQP · Puerto 5672]<br>Colas OrderFulfilled, Dead Letter Queue (DLQ)\"]\n    end\n\n    SPA -->|\"HTTPS / JSON\"| Gateway\n    Mobile -->|\"HTTPS / JSON\"| Gateway\n\n    Gateway -->|\"Enruta tráfico autenticado\"| CoreAPI\n\n    CoreAPI -->|\"Lecturas rápidas y locks de carrito\"| Redis\n    CoreAPI -->|\"Persistencia transaccional de usuarios y pagos\"| Postgres\n    CoreAPI -->|\"Emite eventos OrderPlaced / PaymentReceived\"| RabbitMQ\n\n    RabbitMQ -->|\"Consume eventos de órdenes\"| OrderWorker\n    OrderWorker -->|\"Actualiza estado de orden y reserva inventario\"| Postgres\n\n    RabbitMQ -->|\"Consume eventos de navegación y compra\"| AnalyticsWorker\n    AnalyticsWorker -->|\"Métricas en memoria expuestas para Prometheus\"| StorageBoundary\n```\n\n---\n\n## Nivel 3: Diagrama de Componentes del Core API (Component Diagram - C3)\n\nDetalla la arquitectura limpia (Clean Architecture) dentro del contenedor principal `Core Services API`.\n\n```mermaid\nflowchart TD\n    subgraph Controllers [\"Capa 1: Controllers & Webhooks (HTTP Entry)\"]\n        AuthController[\"AuthController<br>[Endpoints /auth/login, /auth/refresh]\"]\n        CatalogController[\"CatalogController<br>[Endpoints /products, búsqueda cursor]\"]\n        CartController[\"CartController<br>[Endpoints /cart, checkout]\"]\n        PaymentWebhook[\"PaymentWebhookHandler<br>[Endpoint /webhooks/stripe, HMAC check]\"]\n    end\n\n    subgraph Application [\"Capa 2: Application Services (Use Cases)\"]\n        AuthService[\"AuthService<br>Emisión JWT, RBAC, hash bcrypt\"]\n        CatalogService[\"CatalogService<br>Filtros, cache invalidation\"]\n        CartService[\"CartService<br>Operaciones atómicas, cálculo total\"]\n        PaymentService[\"PaymentService<br>Idempotency control, cobro Stripe\"]\n    end\n\n    subgraph Domain [\"Capa 3: Domain Core (Invariantes & Reglas)\"]\n        UserAggregate[\"User & Role Entities<br>Validación invariante\"]\n        ProductEntity[\"Product Entity<br>Precios, stock mínimo\"]\n        OrderAggregate[\"Order & Tax Calculator<br>Banker's rounding rules\"]\n    end\n\n    subgraph Infrastructure [\"Capa 4: Infrastructure Adapters\"]\n        PostgresRepo[\"PostgresRepository<br>Pool transaccional SQL\"]\n        RedisAdapter[\"RedisCacheAdapter<br>TTL, Redlock distribuido\"]\n        StripeClient[\"StripeApiClient<br>Circuit breaker, reintentos\"]\n        EventPublisher[\"RabbitMQEventPublisher<br>Publicador de eventos AMQP\"]\n    end\n\n    AuthController --> AuthService\n    CatalogController --> CatalogService\n    CartController --> CartService\n    PaymentWebhook --> PaymentService\n\n    AuthService --> UserAggregate\n    CatalogService --> ProductEntity\n    CartService --> ProductEntity\n    PaymentService --> OrderAggregate\n\n    AuthService --> PostgresRepo\n    CatalogService --> RedisAdapter\n    CatalogService --> PostgresRepo\n    CartService --> RedisAdapter\n    PaymentService --> StripeClient\n    PaymentService --> PostgresRepo\n    PaymentService --> EventPublisher\n```\n",
    "coding-standards.md": "# Estándares de Programación & Directrices Anti-Sesgo — CloudSaaS Platform\n\nEste documento define las convenciones de código observadas y obligatorias en el proyecto. Su objetivo es asegurar que los agentes de IA no introduzcan librerías no deseadas, mantengan el estilo de codificación existente y respeten los patrones arquitecturales establecidos.\n\n---\n\n## 1. Directrices Anti-Sesgo para Agentes de IA (AI Guardrails)\n\nPara evitar que los modelos de lenguaje (LLMs) apliquen patrones genéricos o bibliotecas obsoletas aprendidas en su pre-entrenamiento:\n\n> [!IMPORTANT]\n> 1. **No inventar librerías**: Si una funcionalidad ya está resuelta con dependencias del proyecto (ej. `node:crypto`, `Zod`, `pg`), está prohibido instalar bibliotecas redundantes (como `crypto-js`, `joi`, etc.).\n> 2. **Respetar la arquitectura en capas**: Ningún controlador HTTP puede acceder directamente a consultas SQL o al cliente de Redis; debe pasar por la capa de Casos de Uso (`Application Service`) e interfaces de repositorio.\n> 3. **Manejo de Errores con Result Pattern o Excepciones de Dominio**: No retornar objetos vacíos ni `null` ante errores. Usar tipos explícitos de error o lanzar excepciones tipadas capturadas por el middleware de errores global.\n> 4. **Tests Primero o Acompañados**: Toda lógica nueva debe contar con su correspondiente suite de pruebas unitarias cubriendo casos de éxito y caminos de fallo.\n\n---\n\n## 2. Convenciones de Nomenclatura\n\n| Elemento | Convención | Ejemplo |\n|---|---|---|\n| Archivos de código | `kebab-case` o `PascalCase` según lenguaje | `cart-service.ts`, `OrderWorker.cs` |\n| Clases e Interfaces | `PascalCase` | `PaymentService`, `IOrderRepository` |\n| Funciones y Métodos | `camelCase` | `calculateTaxAmount()`, `reserveStock()` |\n| Variables y Parámetros | `camelCase` | `orderId`, `idempotencyKey` |\n| Constantes | `UPPER_SNAKE_CASE` | `DEFAULT_CACHE_TTL`, `MAX_RETRIES` |\n| Ramas Git | `{type}/INT-{numero}/{nombre_rama}` (≤80c) | `feature/INT-004/product_catalog_api` |\n| Commits | Convencionales (`feat`, `fix`, `docs`, `refactor`) | `feat(billing): implement idempotency check` |\n\n---\n\n## 3. Patrones de Diseño Implementados\n\n### A. Repository & Unit of Work Pattern\n* La interfaz `IRepository<T>` se define en la capa de Dominio o Aplicación.\n* La implementación concreta (`PostgresOrderRepository`) reside en `Infrastructure`.\n* Permite reemplazar o simular (mock) la base de datos en pruebas unitarias con facilidad.\n\n### B. Clean Use Cases (Single Responsibility)\n* Cada caso de uso complejo se implementa en su propia clase u orquestador con un método `execute(command)` o `handle(query)`.\n* Esto evita controladores \"gordos\" (*Fat Controllers*) y facilita la prueba aislada.\n\n### C. DTOs Inmutables y Validación con Zod\n* Toda entrada a un endpoint debe ser validada contra un schema de validación estricto antes de llegar a la lógica de negocio:\n  ```typescript\n  export const CheckoutRequestSchema = z.object({\n    idempotencyKey: z.string().uuid(),\n    currency: z.enum(['USD', 'COP', 'EUR']),\n    paymentMethodId: z.string().min(1)\n  });\n  ```\n\n---\n\n## 4. Estructura Estándar de Carpetas (Clean Architecture)\n\n```\nsrc/\n├── core/                  # Entidades de dominio, tipos base y constantes globales\n├── modules/\n│   ├── {modulo}/\n│   │   ├── controllers/   # Handlers HTTP, rutas OpenAPI y validadores\n│   │   ├── services/      # Lógica de aplicación y casos de uso\n│   │   ├── domain/        # Entidades puras y reglas de negocio\n│   │   ├── dtos/          # Esquemas de entrada/salida y contratos\n│   │   └── repositories/  # Acceso a datos e integraciones externas\n└── shared/                # Middlewares comunes, logging y utilidades\n```\n",
    "data-dictionary.md": "# Diccionario de Datos & Modelo de Persistencia (ERD)\n\n> [!NOTE]\n> Este documento define el modelo relacional, las restricciones de integridad y las políticas de persistencia en PostgreSQL 16 y Redis 7.2. Proporciona a los desarrolladores y agentes de IA un conocimiento exacto de las tablas, columnas, tipos nativos y llaves foráneas para evitar alucinaciones en consultas SQL o migraciones.\n\n---\n\n## 1. Diagrama Entidad-Relación (ERD)\n\n```mermaid\nerDiagram\n    USERS ||--o{ REFRESH_TOKENS : \"emits\"\n    USERS }o--o{ USER_ROLES : \"assigned\"\n    ROLES ||--o{ USER_ROLES : \"defines\"\n    \n    USERS ||--o{ ORDERS : \"places\"\n    ORDERS ||--|{ ORDER_ITEMS : \"contains\"\n    PRODUCTS ||--o{ ORDER_ITEMS : \"referenced_in\"\n    \n    ORDERS ||--|| INVOICES : \"billed_by\"\n    INVOICES ||--|{ PAYMENTS : \"settled_by\"\n    \n    CARTS ||--o{ CART_ITEMS : \"holds\"\n    PRODUCTS ||--o{ CART_ITEMS : \"selected_in\"\n\n    USERS {\n        uuid id PK \"Identificador único UUIDv4\"\n        string email UK \"Correo normalizado en minúsculas\"\n        string password_hash \"Hash Argon2id o BCrypt\"\n        string first_name \"Nombre del usuario\"\n        string last_name \"Apellido del usuario\"\n        boolean is_active \"Estado de la cuenta\"\n        timestamp created_at \"Fecha creación UTC\"\n        timestamp updated_at \"Fecha actualización UTC\"\n        integer version \"Optimistic locking rowversion\"\n    }\n\n    REFRESH_TOKENS {\n        uuid id PK \"Identificador del token\"\n        uuid user_id FK \"Referencia a USERS\"\n        string token_hash \"Hash SHA256 del token opaco\"\n        timestamp expires_at \"Fecha expiración UTC\"\n        boolean is_revoked \"Indicador de revocación\"\n        timestamp created_at \"Fecha creación UTC\"\n    }\n\n    ROLES {\n        string id PK \"Identificador del rol (ADMIN, CUSTOMER)\"\n        string description \"Descripción de privilegios\"\n    }\n\n    USER_ROLES {\n        uuid user_id PK,FK \"Referencia a USERS\"\n        string role_id PK,FK \"Referencia a ROLES\"\n    }\n\n    PRODUCTS {\n        uuid id PK \"Identificador del producto\"\n        string sku UK \"Código de inventario único\"\n        string name \"Nombre comercial\"\n        text description \"Descripción técnica\"\n        decimal price \"Precio unitario (Precision 12, Scale 2)\"\n        integer stock_quantity \"Cantidad disponible\"\n        boolean is_active \"Visible en catálogo\"\n        timestamp created_at \"Fecha creación UTC\"\n        timestamp updated_at \"Fecha actualización UTC\"\n    }\n\n    CARTS {\n        uuid id PK \"ID del carrito o sesión Redis\"\n        uuid user_id FK \"Usuario (opcional si es anónimo)\"\n        timestamp expires_at \"TTL de 72 horas\"\n        timestamp updated_at \"Fecha última modificación\"\n    }\n\n    CART_ITEMS {\n        uuid id PK \"Identificador del ítem\"\n        uuid cart_id FK \"Referencia al carrito\"\n        uuid product_id FK \"Referencia al producto\"\n        integer quantity \"Cantidad solicitada (CHECK > 0)\"\n        decimal unit_price \"Precio retenido al agregar\"\n    }\n\n    ORDERS {\n        uuid id PK \"Identificador de la orden\"\n        uuid user_id FK \"Cliente que emitió la orden\"\n        string status \"Estado: PENDING, PAID, PROCESSING, FULFILLED, CANCELLED\"\n        decimal total_amount \"Total liquidado con Banker's Rounding\"\n        string currency \"Moneda ISO 4217 (ej. USD, EUR)\"\n        timestamp created_at \"Fecha emisión UTC\"\n        timestamp updated_at \"Fecha actualización UTC\"\n    }\n\n    ORDER_ITEMS {\n        uuid id PK \"Identificador del ítem\"\n        uuid order_id FK \"Referencia a ORDERS\"\n        uuid product_id FK \"Referencia a PRODUCTS\"\n        integer quantity \"Cantidad comprada\"\n        decimal unit_price \"Precio de compra histórico\"\n        decimal subtotal \"Subtotal (quantity * unit_price)\"\n    }\n\n    INVOICES {\n        uuid id PK \"Identificador de factura\"\n        uuid order_id FK \"Referencia 1:1 a ORDERS\"\n        string invoice_number UK \"Número fiscal correlativo\"\n        decimal tax_amount \"Impuestos calculados a 2 decimales\"\n        decimal total_amount \"Total final\"\n        string status \"DRAFT, ISSUED, PAID, VOID\"\n        timestamp issued_at \"Fecha emisión fiscal UTC\"\n    }\n\n    PAYMENTS {\n        uuid id PK \"Identificador del pago\"\n        uuid invoice_id FK \"Referencia a INVOICES\"\n        string idempotency_key UK \"Clave única de idempotencia\"\n        string provider_transaction_id \"ID de Stripe PaymentIntent\"\n        decimal amount \"Monto cobrado\"\n        string status \"PENDING, SUCCEEDED, FAILED\"\n        timestamp processed_at \"Fecha confirmación UTC\"\n    }\n```\n\n---\n\n## 2. Catálogo Detallado de Tablas & Restricciones\n\n### 2.1 Tabla: `users`\n- **Propósito**: Gestión de identidades, credenciales seguras y estado de acceso.\n- **Llave Primaria**: `id` (`UUID`, generado por defecto con `gen_random_uuid()`).\n- **Restricciones de Integridad**:\n  - `UNIQUE (email)`: Índice único normalizado.\n  - `CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')`: Validación de sintaxis RFC 5322.\n- **Concurrencia**: Columna `version INTEGER NOT NULL DEFAULT 1` utilizada para **Optimistic Concurrency Control (OCC)**.\n- **Borrado**: **Soft Delete** mediante `deleted_at TIMESTAMP WITH TIME ZONE NULL`. Los índices únicos de email incluyen cláusula parcial `WHERE deleted_at IS NULL`.\n\n---\n\n### 2.2 Tabla: `products`\n- **Propósito**: Catálogo maestro de productos y existencias disponibles para venta.\n- **Llave Primaria**: `id` (`UUID`).\n- **Restricciones de Integridad**:\n  - `UNIQUE (sku)`: SKU comercial único.\n  - `CHECK (price >= 0.00)`: Prohibidos precios negativos.\n  - `CHECK (stock_quantity >= 0)`: Prohibidas existencias negativas a nivel de base de datos.\n- **Índices de Búsqueda**:\n  - Índice B-Tree compuesto: `(created_at DESC, id DESC)` para paginación estable por cursor.\n  - Índice GIN en `to_tsvector('spanish', name || ' ' || description)` para búsqueda full-text.\n\n---\n\n### 2.3 Tablas de Checkout & Facturación: `invoices`, `payments`\n- **Propósito**: Liquidación financiera, emisión de comprobantes y registro de cobros con pasarelas externas (Stripe).\n- **Restricciones Críticas de Negocio**:\n  - `payments.idempotency_key` con restricción `UNIQUE` para evitar cobros dobles en caso de reintentos concurrentes de red.\n  - Precios e impuestos almacenados como `NUMERIC(12, 2)` exacto, prohibiendo el uso de tipos de coma flotante (`FLOAT` o `REAL`) que provoquen errores de redondeo.\n\n---\n\n### 2.4 Almacén en Memoria: Redis 7.2\n- **Esquema de Claves**:\n  - `cart:{cart_id}`: Hash de Redis que contiene los ítems del carrito con TTL de 72 horas.\n  - `idempotency:{key}`: String JSON con TTL de 120s en estado `IN_PROGRESS` y 24h tras éxito (`COMPLETED`).\n  - `catalog:page:{hash}`: String JSON con la página cacheada del catálogo con TTL de 300 segundos.\n  - `stock:lock:{product_id}`: Cerrojo distribuido Redlock para operaciones concurrentes de inventario con TTL de 5 segundos.\n\n---\n\n## 3. Campos de Auditoría Estándar (Invariantes Globales)\n\nToda tabla transaccional del sistema incluye obligatoriamente los siguientes campos:\n\n| Campo | Tipo SQL | Descripción |\n| :--- | :--- | :--- |\n| `created_at` | `TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp()` | Marca temporal inmutable de creación en UTC. |\n| `updated_at` | `TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp()` | Marca temporal de última modificación actualizada por trigger. |\n| `tenant_id` | `UUID NULL` | Identificador de partición multi-inquilino (*multi-tenancy*). |\n",
    "external-services.md": "# Catálogo de Servicios Externos — CloudSaaS Platform\n\nEste documento especifica los servicios externos, APIs de terceros e integraciones de infraestructura que consume el proyecto, detallando protocolos, autenticación, manejo de fallos y contratos.\n\n---\n\n## Matriz de Integraciones Externas\n\n| Servicio | Tipo | Protocolo | Autenticación | Variable de Entorno | Manejo de Fallos |\n|---|---|---|---|---|---|\n| **Stripe API** | Pasarela de Pagos | HTTPS REST | Bearer API Key | `STRIPE_SECRET_KEY` | Circuit Breaker + Idempotencia |\n| **Stripe Webhooks** | Callbacks de Cobro | HTTPS Webhook | Firma HMAC-SHA256 | `STRIPE_WEBHOOK_SECRET` | Reintentos idempotentes 200 OK |\n| **PostgreSQL 16** | Base de Datos Principal | TCP / PostgreSQL | Password / Pool | `DATABASE_URL` | Healthchecks + Pool Retry |\n| **Redis 7.2** | Cache & Lock Distribuido | TCP / RESP | Password opcional | `REDIS_URL` | Fallback a BD si Redis no responde |\n| **RabbitMQ 3.13** | Broker de Mensajería | AMQP (5672) | User/Password | `RABBITMQ_URL` | Dead Letter Queue (DLQ) |\n| **AWS SES / SMTP** | Email Transaccional | SMTP / TLS (587) | SMTP Credentials | `SMTP_HOST`, `SMTP_PASS` | Cola diferida de reintento |\n| **Prometheus** | Métricas del Sistema | HTTP GET /metrics | Ninguna / Intranet | `METRICS_PORT` | Buffer aislado en memoria |\n\n---\n\n## Detalle Técnico por Servicio\n\n### 1. Pasarela de Pagos Stripe\n* **Host:** `https://api.stripe.com/v1/`\n* **Endpoints consumidos:**\n  * `POST /v1/payment_intents`: Creación de intención de cobro.\n  * `POST /v1/refunds`: Devolución total o parcial.\n* **Cabeceras obligatorias:**\n  * `Authorization: Bearer sk_test_...`\n  * `Idempotency-Key: uuid-v4` (Vital para evitar doble cobro ante timeouts).\n* **Manejo de Errores:** En caso de HTTP 5xx o timeout de red, aplicar Circuit Breaker y no marcar la orden como fallida hasta que expire la ventana de gracia.\n\n### 2. Webhooks Entrantes de Pagos\n* **Ruta de escucha:** `/webhooks/stripe`\n* **Verificación de Firma:**\n  ```javascript\n  const signature = req.headers['stripe-signature'];\n  const event = stripe.webhooks.constructEvent(req.rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);\n  ```\n* **Eventos Soportados:**\n  * `payment_intent.succeeded` $\\to$ Marca orden como `PAID` y emite evento a RabbitMQ.\n  * `payment_intent.payment_failed` $\\to$ Registra transacción fallida y libera stock atómico.\n\n### 3. Cluster PostgreSQL\n* **Driver:** `pg` / `Npgsql` con connection pooling (mínimo 5, máximo 25 conexiones por instancia).\n* **Políticas:** Todas las operaciones sobre órdenes y transacciones deben ejecutarse dentro de un bloque transaccional (`BEGIN ... COMMIT`).\n\n### 4. Cluster Redis\n* **Uso:**\n  * Cache con prefijo `cat:prod:{id}` (TTL: 600 segundos).\n  * Carrito anónimo `cart:anon:{sessionId}` (TTL: 86400 segundos).\n  * Cerrojo de stock `lock:stock:{productId}` (TTL: 5 segundos para Redlock).\n\n### 5. Broker de Mensajería RabbitMQ\n* **Exchange principal:** `saas.events` (Topic Exchange).\n* **Colas:**\n  * `orders.process` $\\to$ Routing key: `order.paid`\n  * `orders.dlq` $\\to$ Enrutamiento automático por encabezado `x-dead-letter-exchange` tras 3 fallos.\n",
    "functional-requirements.md": "# Especificación de Requerimientos del Sistema (SRS) — IEEE 830 / ISO 29148\n\n> [!NOTE]\n> Este documento contiene la especificación formal de Requerimientos Funcionales (RF) y Requerimientos No Funcionales (RNF) del sistema bajo estándares de ingeniería de software internacional (IEEE 830 y ISO/IEC/IEEE 29148). Sirve como base canónica sin sesgo para desarrolladores y agentes de IA.\n\n---\n\n## 1. Requerimientos Funcionales (RF)\n\n### RF-AUTH-001: Autenticación de Usuarios y Emisión de Tokens JWT\n- **Módulo**: `backend` / `auth`\n- **Prioridad**: Alta | **Severidad**: Crítica\n- **Precondición**: El usuario debe estar previamente registrado y activo en el sistema.\n- **Entradas**: Email (RFC 5322) y contraseña en texto plano vía HTTPS POST `/api/v1/auth/login`.\n- **Procesamiento**:\n  1. Normalizar email a minúsculas y buscar usuario en la base de datos PostgreSQL.\n  2. Verificar hash de contraseña mediante algoritmo Argon2id o BCrypt con factor de costo canónico.\n  3. Si la verificación es exitosa, generar Access Token (JWT firmado con clave asimétrica RS256 o HMAC-SHA256 y TTL de 15 minutos) y Refresh Token criptográficamente seguro (UUIDv4 almacenado en tabla con hash y TTL de 7 días).\n  4. Los timestamps `iat`, `nbf` y `exp` del JWT deben calcularse **exclusivamente en Epoch UTC** (regla `BR-AUTH-001`).\n- **Salidas**: Código HTTP 200 con payload JSON conteniendo `accessToken`, `refreshToken`, `tokenType: \"Bearer\"` y `expiresIn: 900`.\n- **Postcondición**: El Refresh Token queda persistido en PostgreSQL y la sesión registrada en auditoría.\n- **Criterio de Aceptación (Gherkin)**:\n  ```gherkin\n  Escenario: Inicio de sesión exitoso con credenciales válidas\n    Dado que existe un usuario registrado con email \"dev@cloudsaas.io\" y contraseña \"P@ssw0rd123\"\n    Cuando el cliente envía POST \"/api/v1/auth/login\" con dichas credenciales\n    Entonces el servidor responde HTTP 200\n    Y el payload contiene un accessToken JWT con expiración calculada en UTC a 15 minutos\n    Y el payload contiene un refreshToken opaco\n  ```\n\n---\n\n### RF-CAT-001: Consulta de Catálogo con Paginación por Cursor\n- **Módulo**: `backend` / `catalog`\n- **Prioridad**: Media | **Severidad**: Media\n- **Precondición**: Existencia de productos en catálogo.\n- **Entradas**: Parámetros de query: `limit` (entero entre 1 y 100, por defecto 20), `cursor` (string opaco base64 codificando `created_at` e `id`), `category_id` (opcional).\n- **Procesamiento**:\n  1. Decodificar cursor si está presente.\n  2. Consultar índice compuesto `(created_at DESC, id DESC)` en PostgreSQL.\n  3. Comprobar si los datos existen en cache Redis (`catalog:page:{hash}`).\n  4. Si existe en cache, retornar respuesta en memoria; si no, consultar BD y almacenar en Redis con TTL de 300 segundos.\n- **Salidas**: HTTP 200 con array `items` y objeto `page_info` con `next_cursor` y `has_next_page`.\n- **Postcondición**: No se modifican estados del sistema.\n\n---\n\n### RF-CART-001: Operaciones Atómicas de Carrito de Compras\n- **Módulo**: `backend` / `cart`\n- **Prioridad**: Alta | **Severidad**: Alta\n- **Precondición**: Carrito existente o sesión anónima identificada por UUID en cabecera `X-Cart-Id`.\n- **Entradas**: `product_id`, `quantity` (entero positivo), `unit_price`.\n- **Procesamiento**:\n  1. Validar que `quantity > 0` y que el producto exista y esté activo en el catálogo.\n  2. Ejecutar script atómico Lua o transacción Redis `MULTI/EXEC` (regla `BR-CART-002`) para evitar condiciones de carrera (*race conditions*).\n  3. Incrementar cantidad y recalcular subtotal.\n  4. Renovar TTL de la clave Redis `cart:{cart_id}` a 72 horas.\n- **Salidas**: HTTP 200 con el estado consolidado del carrito (ítems, cantidades, precios unitarios y subtotal).\n- **Postcondición**: Inventario retenido temporalmente por TTL o validado en tiempo real.\n\n---\n\n### RF-BILL-001: Checkout Transaccional con Idempotencia\n- **Módulo**: `billing`\n- **Prioridad**: Crítica | **Severidad**: Crítica\n- **Precondición**: Carrito no vacío y cabecera HTTP obligatoria `Idempotency-Key` (UUIDv4).\n- **Entradas**: Cabecera `Idempotency-Key`, payload con `cart_id`, `payment_method_id`, `billing_address`.\n- **Procesamiento**:\n  1. Verificar presencia de `Idempotency-Key` (regla `BR-BILL-001`). Si falta, rechazar con HTTP 400.\n  2. Consultar en Redis la clave `idempotency:{key}`:\n     - Si está en estado `IN_PROGRESS`, rechazar con HTTP 409 Conflict.\n     - Si está en estado `COMPLETED`, retornar la respuesta previamente cacheada sin re-ejecutar el cobro.\n  3. Marcar clave en Redis como `IN_PROGRESS` con TTL de 120 segundos.\n  4. Calcular total aplicando **Banker's Rounding (IEEE 754)** a dos decimales exactos (regla `BR-BILL-003`).\n  5. Invocar API de Stripe vía PaymentIntent confirmando el pago.\n  6. Si Stripe aprueba, guardar resultado en Redis `idempotency:{key}` con TTL de 24 horas y emitir evento `PaymentSucceeded` al Message Broker.\n- **Salidas**: HTTP 201 Created con objeto `order_id`, `transaction_id`, `status: \"PAID\"`, `amount`, `currency`.\n- **Postcondición**: Orden creada en estado `Paid`, cobro registrado y evento publicado.\n\n---\n\n### RF-ORDR-001: Procesamiento Asíncrono de Órdenes y Manejo de DLQ\n- **Módulo**: `backend` / `orders`\n- **Prioridad**: Alta | **Severidad**: Alta\n- **Precondición**: Evento `PaymentSucceeded` publicado en la cola `orders.queue`.\n- **Entradas**: Mensaje AMQP con payload JSON del pedido.\n- **Procesamiento**:\n  1. Consumidor Worker toma el mensaje e inicia transacción en PostgreSQL.\n  2. Actualizar inventario definitivo y pasar orden a estado `Processing`.\n  3. Si ocurre un fallo transitorio de red o bloqueo de BD:\n     - Reintentar hasta 3 veces con retroceso exponencial (*exponential backoff*).\n     - Si tras el 3er reintento sigue fallando, desviar mensaje a la cola `orders.dlq` (Dead Letter Queue) con cabeceras de auditoría `x-exception-message` y `x-original-queue` (regla `BR-ORDR-001`).\n- **Salidas**: Ack manual al broker AMQP.\n- **Postcondición**: Pedido en proceso o registrado en DLQ para inspección de soporte.\n\n---\n\n## 2. Requerimientos No Funcionales (RNF) — Clasificación FURPS+\n\n### 2.1 Functionality (Seguridad y Cumplimiento)\n- **RNF-SEC-001**: Todos los endpoints que procesen datos financieros o personales deben exigir cifrado TLS 1.3 en tránsito y tokens Bearer JWT válidos.\n- **RNF-SEC-002**: Validación criptográfica obligatoria de firmas HMAC-SHA256 en todos los webhooks entrantes (Stripe/pagos) antes de procesar payloads (regla `BR-BILL-002`).\n\n### 2.2 Usability (Experiencia y Consistencia de API)\n- **RNF-USE-001**: Toda respuesta de error debe seguir el estándar **RFC 7807 (Problem Details for HTTP APIs)** incluyendo `type`, `title`, `status`, `detail`, `instance` y `trace_id`.\n\n### 2.3 Reliability (Confiabilidad y Disponibilidad)\n- **RNF-REL-001**: Disponibilidad mensual del sistema $\\ge 99.9\\%$ (SLA estándar de microservicios cloud).\n- **RNF-REL-002**: Cero pérdida de órdenes confirmadas mediante el patrón de persistencia transaccional y colas con acuse de recibo explícito (*manual ACK*) y DLQ.\n\n### 2.4 Performance (Rendimiento y Escalabilidad)\n- **RNF-PERF-001**: Tiempo de respuesta en percentil 95 ($P95 \\le 120\\text{ ms}$) y percentil 99 ($P99 \\le 250\\text{ ms}$) para lecturas de catálogo cacheado y carritos en Redis.\n- **RNF-PERF-002**: Capacidad de soportar una concurrencia sostenida de 1,200 solicitudes por segundo (RPS) en checkout con degradación elegante.\n\n### 2.5 Supportability & Constraints (+ Restricciones Arquitecturales)\n- **RNF-SUPP-001**: Arquitectura desacoplada Clean Core (Hexagonal) donde la lógica de negocio pura no depende de frameworks web ni de drivers de base de datos.\n- **RNF-SUPP-002**: Toda métrica de salud del sistema debe exponerse en `/metrics` bajo formato Prometheus y `/health` bajo formato JSON de diagnóstico.\n- **RNF-SUPP-003**: Nombres de ramas Git obligatorios bajo el formato `{type}/INT-{numero}/{nombre_rama}` con longitud máxima estricta de 80 caracteres.\n",
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
    "system-capabilities.md": "# Inventario de Capacidades del Sistema & Matriz de Onboarding (Zero-Code Re-read)\n\n> [!IMPORTANT]\n> Este inventario documenta exhaustivamente **lo que el sistema YA hace** y los módulos involucrados.\n> Su propósito es **acelerar el onboarding** de nuevos desarrolladores y permitir que agentes de IA determinen al instante si una funcionalidad ya existe, sin tener que releer recursivamente todos los archivos de código fuente del repositorio.\n\n---\n\n## 1. Matriz Rápida de Capacidades por Bounded Context\n\n| Bounded Context | Capacidades Existentes | Entidades Clave | Eventos Publicados | Tickets Asociados |\n| :--- | :--- | :--- | :--- | :--- |\n| **`auth`** | Login, Emisión JWT (UTC), Refresh Token, RBAC, Rate Limiting de IPs | `User`, `Role`, `RefreshToken` | `UserLoggedIn`, `TokenRefreshed` | `INT-002`, `INT-003` |\n| **`catalog`** | Búsqueda por texto, Filtros por categoría, Paginación por cursor, Cache en Redis (TTL 300s) | `Product`, `Category`, `Price` | `ProductUpdated` | `INT-004` |\n| **`cart`** | Gestión atómica de carrito con Lua en Redis, Retención temporal de stock, Expiración en 72h | `Cart`, `CartItem` | `CartAbandoned` | `INT-005` |\n| **`billing`** | Checkout transaccional con Stripe, Idempotencia por cabecera (Redis 24h), Redondeo contable Banker's | `Invoice`, `PaymentIntent`, `Charge` | `PaymentSucceeded`, `PaymentFailed` | `INT-006`, `INT-007` |\n| **`orders`** | Consumo asíncrono AMQP, Actualización transaccional de inventario, Reintentos con backoff, Dead Letter Queue | `Order`, `OrderItem`, `Shipment` | `OrderProcessing`, `OrderFulfilled` | `INT-008` |\n| **`analytics`** | Métricas Prometheus `/metrics`, Detección de anomalías en checkout, Tracking de eventos | `Metric`, `EventLog` | N/A (Consumidor) | `INT-009` |\n| **`notifications`** | Envío de correos transaccionales (confirmación de pago, bienvenida), Plantillas HTML seguras, Retries SMTP | `NotificationTemplate`, `DeliveryLog` | `NotificationSent` | `INT-010` |\n\n---\n\n## 2. Flujo de Decisión para Nuevas Historias de Usuario\n\nCuando el usuario pida: *\"Quiero agregar [funcionalidad X]\"* o *\"Genera historias para [caso de uso]\"*, la IA o el desarrollador deben seguir este flujo:\n\n```mermaid\nflowchart TD\n    A[\"Petición de Nueva Funcionalidad\"] --> B{\"¿Existe ya en system-capabilities.md?\"}\n    \n    B -- \"SÍ (Ya Existe)\" --> C[\"Informar al usuario que la capacidad existe.<br/>Indicar módulo, tickets INT-* y APIs disponibles.<br/>Evitar duplicidad de código.\"]\n    \n    B -- \"PARCIAL (Extensión)\" --> D[\"Identificar bounded context base.<br/>Formular historia INVEST como extensión.<br/>Revisar reglas BR-* que aplican.\"]\n    \n    B -- \"NO (Completamente Nueva)\" --> E[\"Identificar si requiere nuevo Bounded Context.<br/>Definir RF-* y criterios Given/When/Then.<br/>Asignar ticket INT-* en feature_list.json.<br/>Recomendar técnica (TDD / SDD / FTD).\"]\n```\n\n---\n\n## 3. Guía de Impacto Arquitectural para Modificaciones\n\nSi una nueva funcionalidad o cambio de requerimiento ingresa al sistema:\n\n1. **Si impacta dinero, impuestos o pagos**:\n   - Módulo afectado: `billing`\n   - Reglas obligatorias: `BR-BILL-001` (Idempotencia), `BR-BILL-002` (HMAC Stripe), `BR-BILL-003` (Banker's Rounding).\n   - Técnica obligatoria: **TDD** con pruebas de caja blanca en redondeo y concurrencia.\n2. **Si impacta autenticación o permisos**:\n   - Módulo afectado: `auth`\n   - Reglas obligatorias: `BR-AUTH-001` (Epoch UTC estricto).\n   - Técnica obligatoria: **TDD** con cobertura en expiración de tokens.\n3. **Si impacta concurrencia de inventario**:\n   - Módulo afectado: `cart`\n   - Reglas obligatorias: `BR-CART-002` (Operaciones atómicas Redis / Lua).\n4. **Si impacta colas o workers asíncronos**:\n   - Módulo afectado: `orders`\n   - Reglas obligatorias: `BR-ORDR-001` (Desvío a DLQ tras 3 fallos).\n\n---\n\n## 4. Protocolo de Mantenimiento Incremental (Soberanía Docs-as-Code)\n\n> [!TIP]\n> **Invariante de Actualización Incremental**:  \n> Si una regla de negocio o requerimiento cambia en el futuro (ej. \"el tiempo de expiración del carrito cambia de 72h a 24h\" o \"se agrega un nuevo método de pago\"):  \n> **NO re-analices todo el proyecto ni modifiques todos los archivos.**  \n> Únicamente edita el archivo correspondiente:\n> - Regla de negocio $\\to$ `project-docs/knowledge/business-rules.md` (o `modules/{modulo}/rules.md`).\n> - Requerimiento funcional $\\to$ `project-docs/knowledge/functional-requirements.md`.\n> - Historia de usuario $\\to$ `project-docs/knowledge/user-stories-catalog.md`.\n> \n> Una vez editado, ejecuta:\n> ```bash\n> node project-docs/sync-data.js\n> ```\n> De este modo, tanto el tablero visual como las IAs y subagentes consumirán la regla actualizada de forma inmediata.\n",
    "traceability-matrix.md": "# Matriz de Trazabilidad Cruzada de Requerimientos (RTM)\n\n> [!NOTE]\n> La **Matriz de Trazabilidad de Requerimientos (Requirements Traceability Matrix - RTM)** proporciona una vinculación bidireccional estricta entre los Requerimientos Funcionales (`RF-*`), las Reglas de Negocio (`BR-*`), las Historias de Usuario (`US-*`), los componentes de código y las suites de pruebas automatizadas.\n> Garantiza que ningún requerimiento quede sin cobertura de pruebas y que ningún componente exista sin justificación funcional.\n\n---\n\n## 1. Matriz Bidireccional Completa\n\n| ID Requerimiento | Regla de Negocio (`BR-*`) | Historia de Usuario | Bounded Context | Componente de Código / Handler | Suite de Pruebas Automatizadas | Estado |\n| :--- | :--- | :--- | :--- | :--- | :--- | :---: |\n| **`RF-AUTH-001`** | `BR-AUTH-001` | `US-001` | `auth` | `AuthController`, `LoginUserCommandHandler`, `JwtTokenService` | `AuthServiceTests.cs`, `JwtEpochUtcTests.cs` | 🟢 Verificado |\n| **`RF-CAT-001`** | N/A (Lectura) | `US-002` | `catalog` | `CatalogController`, `GetProductsByCursorQueryHandler`, `RedisCatalogCacheAdapter` | `CatalogPaginationTests.cs`, `CatalogCacheIntegrationTests.cs` | 🟢 Verificado |\n| **`RF-CART-001`** | `BR-CART-002` | `US-003` | `cart` | `CartController`, `AddToCartCommandHandler`, `RedisLuaCartRepository` | `CartConcurrencyTests.cs`, `RedisLuaScriptTests.cs` | 🟢 Verificado |\n| **`RF-BILL-001`** | `BR-BILL-001`, `BR-BILL-002`, `BR-BILL-003` | `US-004` | `billing` | `CheckoutController`, `ProcessPaymentCommandHandler`, `StripeGatewayAdapter`, `StripeWebhookController` | `CheckoutIdempotencyTests.cs`, `BankersRoundingUnitTests.cs`, `StripeHmacValidationTests.cs` | 🟢 Verificado |\n| **`RF-ORDR-001`** | `BR-ORDR-001` | `US-005` | `orders` | `OrderQueueConsumerWorker`, `ProcessOrderCommandHandler`, `RabbitMqDlqPublisher` | `OrderWorkerConsumerTests.cs`, `DeadLetterQueueRetryTests.cs` | 🟢 Verificado |\n| **`RNF-SEC-001`** | `BR-AUTH-001` | `US-001` | `infra` / `auth` | `JwtAuthenticationMiddleware`, `TlsEnforcementPolicy` | `SecurityHeadersMiddlewareTests.cs` | 🟢 Verificado |\n| **`RNF-SEC-002`** | `BR-BILL-002` | `US-004` | `billing` | `HmacSignatureVerificationFilter` | `StripeHmacValidationTests.cs` | 🟢 Verificado |\n| **`RNF-PERF-001`** | N/A | `US-002` | `catalog` / `cart` | `RedisConnectionPoolProvider`, `CatalogCachePolicy` | `LoadTestK6_CatalogP95.js` | 🟢 Verificado |\n| **`RNF-REL-002`** | `BR-ORDR-001` | `US-005` | `orders` | `OutboxPatternDispatcher`, `RabbitMqTopologyConfig` | `TransactionalOutboxIntegrationTests.cs` | 🟢 Verificado |\n\n---\n\n## 2. Cobertura de Requerimientos vs Tests\n\n```mermaid\npie title Cobertura de Requerimientos Funcionales por Tests\n    \"Cubierto con Pruebas Unitarias & Integración\" : 100\n    \"Sin Cobertura\" : 0\n```\n\n---\n\n## 3. Protocolo de Verificación de Trazabilidad para Nuevos Cambios\n\nCada vez que se redacta un spec técnico con `/generate-spec` o se implementa con `/implement-tdd` o `/implement-sdd`:\n1. El spec debe declarar explícitamente en su tabla de trazabilidad qué `RF-*` y qué `BR-*` satisface.\n2. Cada prueba automatizada debe llevar en su docstring o anotación el tag `@trace(RF-XXX, BR-YYY)`.\n3. La skill `/verify-spec` consulta esta matriz para asegurar que no se cierren tickets sin trazabilidad completa.\n",
    "uml-diagrams.md": "# Diagramas UML del Sistema — CloudSaaS Platform\n\nEste documento recopila los diagramas UML formales para modelar entidades, transacciones críticas y casos de uso del sistema.\n\n---\n\n## 1. Diagrama de Clases de Dominio (Domain Class Diagram)\n\nModela las entidades de negocio, sus relaciones y contratos de dominio aislados de frameworks.\n\n```mermaid\nclassDiagram\n    class User {\n        +UUID id\n        +string email\n        +string passwordHash\n        +Role role\n        +DateTime createdAt\n        +validatePassword(plainText) bool\n        +hasPermission(permission) bool\n    }\n\n    class Role {\n        <<enumeration>>\n        ADMIN\n        OPERATOR\n        CUSTOMER\n    }\n\n    class Product {\n        +UUID id\n        +string sku\n        +string name\n        +decimal price\n        +int stock\n        +bool isActive\n        +reserveStock(quantity) bool\n        +releaseStock(quantity) void\n    }\n\n    class ShoppingCart {\n        +UUID id\n        +UUID userId\n        +string sessionId\n        +DateTime expiresAt\n        +List~CartItem~ items\n        +addItem(product, qty) void\n        +removeItem(productId) void\n        +calculateSubtotal() decimal\n    }\n\n    class CartItem {\n        +UUID productId\n        +string name\n        +decimal unitPrice\n        +int quantity\n        +decimal getTotal()\n    }\n\n    class Order {\n        +UUID id\n        +UUID customerId\n        +OrderStatus status\n        +decimal subtotal\n        +decimal taxAmount\n        +decimal total\n        +string idempotencyKey\n        +DateTime createdAt\n        +applyTaxCalculation(taxResult) void\n        +markAsPaid() void\n    }\n\n    class OrderStatus {\n        <<enumeration>>\n        PENDING_PAYMENT\n        PAID\n        FULFILLING\n        FULFILLED\n        CANCELLED\n    }\n\n    class PaymentTransaction {\n        +UUID id\n        +UUID orderId\n        +string gatewayProvider\n        +string chargeId\n        +decimal amount\n        +string currency\n        +PaymentStatus status\n        +string hmacSignature\n        +DateTime processedAt\n    }\n\n    class PaymentStatus {\n        <<enumeration>>\n        INITIATED\n        SUCCESS\n        FAILED\n        REFUNDED\n    }\n\n    User \"1\" --> \"1\" Role : tiene\n    ShoppingCart \"1\" *-- \"many\" CartItem : contiene\n    CartItem --> \"1\" Product : referencia\n    Order \"1\" --> \"1\" ShoppingCart : genera desde\n    Order \"1\" *-- \"many\" PaymentTransaction : registra\n    Order --> \"1\" OrderStatus : estado\n    PaymentTransaction --> \"1\" PaymentStatus : estado\n```\n\n---\n\n## 2. Diagrama de Secuencia: Checkout & Pago Idempotente con Webhook\n\nIlustra la interacción entre Cliente, API Gateway, CartService, PaymentService, Redis, Stripe y RabbitMQ.\n\n```mermaid\nsequenceDiagram\n    autonumber\n    actor Cliente as 👤 Cliente Comprador\n    participant Gateway as 🛡️ API Gateway\n    participant Cart as 🛒 CartService\n    participant Pay as 💳 PaymentService\n    participant Redis as 🔴 Redis Cache\n    participant Stripe as 💳 Stripe API\n    participant DB as 🐘 PostgreSQL\n    participant Queue as 🐇 RabbitMQ\n\n    Cliente->>Gateway: POST /cart/checkout (Idempotency-Key: idemp_123)\n    Gateway->>Pay: Procesar Intento de Pago\n    Pay->>Redis: SETNX idempotency:idemp_123 (TTL: 120s)\n    \n    alt Llave ya existe (Solicitud duplicada concurrente)\n        Redis-->>Pay: Llave bloqueada\n        Pay-->>Cliente: 409 Conflict / 200 con respuesta cacheada\n    else Llave adquirida con éxito\n        Redis-->>Pay: Bloqueo OK\n        Pay->>Cart: Obtener y validar carrito\n        Cart->>Redis: Verificar stock atómico\n        Redis-->>Cart: Stock bloqueado OK\n        Pay->>Stripe: POST /v1/payment_intents (amount, currency)\n        Stripe-->>Pay: 200 OK (intent_id, client_secret)\n        Pay->>DB: INSERT Order (status: PENDING_PAYMENT)\n        Pay-->>Cliente: Retorna client_secret para confirmación\n    end\n\n    Note over Cliente, Stripe: El cliente confirma el pago en su navegador\n\n    Stripe->>Gateway: POST /webhooks/stripe (Stripe-Signature)\n    Gateway->>Pay: Validar webhook\n    Pay->>Pay: Validar firma HMAC-SHA256 con webhook_secret\n    \n    alt Firma Inválida\n        Pay-->>Stripe: 401 Unauthorized (Rechazo de evento)\n    else Firma Válida\n        Pay->>DB: UPDATE Order SET status='PAID' WHERE id=order_id\n        Pay->>DB: INSERT PaymentTransaction (charge_id, SUCCESS)\n        Pay->>Queue: Publicar evento 'OrderPaid'\n        Pay-->>Stripe: 200 OK (Evento confirmado)\n    end\n```\n\n---\n\n## 3. Diagrama de Secuencia: Autenticación JWT con Desfase UTC\n\nDemuestra la mitigación del bug `INT-003` para servidores con husos horarios dispares mediante tiempo Epoch UTC.\n\n```mermaid\nsequenceDiagram\n    autonumber\n    actor Usuario as 👤 Usuario\n    participant Auth as ⚡ AuthService\n    participant DB as 🐘 PostgreSQL\n    participant Clock as ⏱️ UTC System Clock\n\n    Usuario->>Auth: POST /auth/login (email, password)\n    Auth->>DB: SELECT * FROM users WHERE email = ?\n    DB-->>Auth: Record con passwordHash y roles\n    Auth->>Auth: bcrypt.compare(password, passwordHash)\n    \n    alt Credenciales Incorrectas\n        Auth-->>Usuario: 401 Invalid Credentials\n    else Credenciales Válidas\n        Auth->>Clock: Obtener DateTime.UtcNow.ToUnixTimeSeconds()\n        Clock-->>Auth: epoch_now (ej: 1718000000)\n        Auth->>Auth: Generar Access Token (exp: epoch_now + 3600)\n        Auth->>Auth: Generar Refresh Token (exp: epoch_now + 604800)\n        Auth->>DB: Guardar RefreshToken hash\n        Auth-->>Usuario: 200 OK { access_token, refresh_token, expires_in: 3600 }\n    end\n```\n\n---\n\n## 4. Diagrama de Casos de Uso (Use Case Diagram)\n\n```mermaid\nflowchart LR\n    Customer((👤 Cliente))\n    Admin((👤 Administrador))\n    Worker((⚙️ Background Worker))\n\n    subgraph CasosDeUso [\"Casos de Uso del Sistema\"]\n        UC1([UC-01: Iniciar Sesión / Registro JWT])\n        UC2([UC-02: Consultar Catálogo con Cursor])\n        UC3([UC-03: Gestionar Carrito en Memoria])\n        UC4([UC-04: Realizar Pago con Idempotencia])\n        UC5([UC-05: Gestionar Roles RBAC])\n        UC6([UC-06: Procesar Cola de Despacho con DLQ])\n        UC7([UC-07: Ingestar Stream de Analítica])\n        UC8([UC-08: Enviar Emails Transaccionales])\n    end\n\n    Customer --> UC1\n    Customer --> UC2\n    Customer --> UC3\n    Customer --> UC4\n\n    Admin --> UC1\n    Admin --> UC5\n\n    Worker --> UC6\n    Worker --> UC7\n    Worker --> UC8\n```\n",
    "user-stories-catalog.md": "# Catálogo Canónico de Historias de Usuario & Marco Ágil (INVEST / SCRUM / XP)\n\n> [!NOTE]\n> Este catálogo centraliza las Historias de Usuario (US) del proyecto diseñadas con rigor de ingeniería bajo los principios **INVEST**, el marco ágil **SCRUM** (DoR/DoD) y las prácticas técnicas de **Extreme Programming (XP)**.\n> Cuando solicites a un agente o desarrollador \"generar historias para [funcionalidad]\", este catálogo debe consultarse en primer lugar para detectar si la capacidad ya existe o qué módulos deben extenderse.\n\n---\n\n## 1. Principios INVEST en la Redacción de Historias\n\nToda historia en este arnés cumple con las 6 propiedades INVEST:\n\n| Letra | Principio | Aplicación en el Arnés |\n| :---: | :--- | :--- |\n| **I** | **Independent** (Independiente) | La historia puede planificarse, implementarse y desplegarse sin bloqueos circulares con otras historias. |\n| **N** | **Negotiable** (Negociable) | Los detalles técnicos específicos se afinan en el spec (`tasks.md` / `decisions.md`) sin fijar prematuramente la implementación. |\n| **V** | **Valuable** (Valiosa) | Aporta valor tangible medible al usuario final o a la estabilidad arquitectural del sistema. |\n| **E** | **Estimable** (Estimable) | El alcance y los bounded contexts afectados están acotados para poder estimar el esfuerzo con exactitud. |\n| **S** | **Small** (Pequeña / Acotada) | Dimensionada para implementarse dentro de una sola rama `{type}/INT-{id}/{name}` (≤80 caracteres). |\n| **T** | **Testable** (Comprobable) | Incluye criterios de aceptación en formato Gherkin ejecutables con pruebas unitarias y de integración. |\n\n---\n\n## 2. Acuerdos de Calidad: DoR y DoD (SCRUM)\n\n### Definición de Preparado (Definition of Ready - DoR)\nAntes de que una tarea pase de `pending` a `in_progress`, DEBE cumplir:\n1. **Historia redactada bajo formato canónico**: *Como [rol], quiero [acción] para [beneficio]*.\n2. **Criterios de Aceptación definidos**: Al menos 2 escenarios Given/When/Then verificables.\n3. **Requerimiento Funcional (`RF-*`) y Reglas de Negocio (`BR-*`) identificadas**: Sin ambigüedad sobre invariantes que aplican.\n4. **Rama Git creada**: Siguiendo la convención estricta `{type}/INT-{numero}/{nombre_rama}` (máximo 80 caracteres).\n5. **Aprobación Humana**: Puerta obligatoria `ask_question` aprobada por el líder técnico.\n\n### Definición de Hecho (Definition of Done - DoD)\nUna tarea solo puede marcarse como `completed` si cumple:\n1. **Código implementado**: Siguiendo la técnica recomendada (TDD, SDD o FTD).\n2. **Build Limpio**: Compilación sin advertencias (`dotnet build /warnaserror` o linter equivalente en cero errores).\n3. **Tests Aprobados al 100%**: Suite de pruebas unitarias y de integración pasando en verde.\n4. **Trazabilidad Verificada**: Registro R $\\leftrightarrow$ Tests documentado en `progress/impl_{name}.md`.\n5. **Verificación de dependencias**: Ejecución exitosa de `verify.sh`.\n6. **Commit Semántico**: Mensaje bajo estándar Conventional Commits (`feat(scope): ...` o `fix(scope): ...`).\n\n---\n\n## 3. Prácticas Técnicas de Extreme Programming (XP) Integradas\n\n1. **Test-Driven Development (TDD)**:\n   - Para lógica de negocio, cálculos monetarios o autenticación: escribir primero el test fallando (Rojo), escribir el código mínimo para pasar (Verde), y refactorizar con seguridad.\n2. **Refactorización Continua**:\n   - Mejora del diseño del código sin alterar su comportamiento externo, respaldada por la suite de pruebas automatizadas.\n3. **Pair Programming Agéntico (Human-in-the-Loop)**:\n   - El agente de IA actúa como copiloto de ingeniería y el humano como auditor en las puertas de decisión clave (`ask_question`).\n4. **Metáfora del Sistema**:\n   - Todo el equipo y los agentes comparten el mismo Modelo C4 y Lenguaje Ubicuo (DDD) documentado en `project-docs/knowledge/`.\n5. **Entregas Pequeñas e Incrementales**:\n   - Cada tarea `INT-*` produce un cambio autónomo, atómico y verificable.\n\n---\n\n## 4. Catálogo de Historias de Usuario Existentes\n\n### US-001: Autenticación de Usuarios y Roles Seguros\n- **Ticket**: `INT-002` | **Módulo**: `auth` | **Técnica**: TDD\n- **Historia**:\n  > **Como** usuario registrado de la plataforma CloudSaaS,  \n  > **quiero** iniciar sesión con mis credenciales y recibir un token de acceso seguro,  \n  > **para** acceder a los recursos protegidos según mi rol asignado.\n- **Criterios de Aceptación (INVEST Testable)**:\n  - **Escenario 1**: Credenciales correctas generan JWT con timestamps en Epoch UTC y duración de 15 minutos (`BR-AUTH-001`).\n  - **Escenario 2**: Intento con contraseña errónea bloquea temporalmente tras 5 intentos fallidos y retorna HTTP 401 Problem Details.\n- **Trazabilidad**: Satisface `RF-AUTH-001` y regla `BR-AUTH-001`.\n\n---\n\n### US-002: Consulta de Catálogo Paginado de Alto Desempeño\n- **Ticket**: `INT-004` | **Módulo**: `catalog` | **Técnica**: SDD\n- **Historia**:\n  > **Como** comprador en la tienda virtual,  \n  > **quiero** navegar por el catálogo de productos con paginación fluida y filtros por categoría,  \n  > **para** encontrar rápidamente los productos que deseo sin demoras de carga.\n- **Criterios de Aceptación**:\n  - **Escenario 1**: Consulta inicial retorna los primeros 20 productos y un cursor opaco para la siguiente página.\n  - **Escenario 2**: Respuestas cacheadas en Redis se entregan con latencia menor a 50 ms (`RNF-PERF-001`).\n- **Trazabilidad**: Satisface `RF-CAT-001`.\n\n---\n\n### US-003: Gestión Concurrente del Carrito de Compras\n- **Ticket**: `INT-005` | **Módulo**: `cart` | **Técnica**: TDD\n- **Historia**:\n  > **Como** cliente explorando productos,  \n  > **quiero** agregar, modificar y eliminar artículos de mi carrito en cualquier momento,  \n  > **para** preparar mi compra sin temor a que el inventario se desincronice por concurrencia.\n- **Criterios de Aceptación**:\n  - **Escenario 1**: Múltiples adiciones simultáneas se procesan de forma atómica en Redis sin condiciones de carrera (`BR-CART-002`).\n  - **Escenario 2**: El carrito expira automáticamente a las 72 horas de inactividad liberando la memoria.\n- **Trazabilidad**: Satisface `RF-CART-001` y regla `BR-CART-002`.\n\n---\n\n### US-004: Checkout Idempotente y Procesamiento con Stripe\n- **Ticket**: `INT-006` | **Módulo**: `billing` | **Técnica**: SDD\n- **Historia**:\n  > **Como** cliente listo para pagar,  \n  > **quiero** confirmar mi pedido mediante un checkout seguro con tarjeta,  \n  > **para** adquirir mis productos con la certeza de que nunca se me cobrará dos veces si hay un fallo de red.\n- **Criterios de Aceptación**:\n  - **Escenario 1**: Toda petición debe enviar la cabecera `Idempotency-Key`; si se repite la petición dentro de 24 horas, se devuelve el mismo resultado sin duplicar cargos (`BR-BILL-001`).\n  - **Escenario 2**: Los impuestos y descuentos aplican Banker's Rounding exacto a dos decimales (`BR-BILL-003`).\n- **Trazabilidad**: Satisface `RF-BILL-001`, `BR-BILL-001`, `BR-BILL-002`, `BR-BILL-003`.\n\n---\n\n### US-005: Resiliencia de Órdenes y Cola de Mensajes Muertos (DLQ)\n- **Ticket**: `INT-008` | **Módulo**: `orders` | **Técnica**: SDD\n- **Historia**:\n  > **Como** operador de operaciones y soporte,  \n  > **quiero** que las órdenes fallidas se reintenten automáticamente con backoff y se deriven a una Dead Letter Queue si persisten los errores,  \n  > **para** garantizar que ningún pedido se pierda y poder investigar incidentes rápidamente.\n- **Criterios de Aceptación**:\n  - **Escenario 1**: Hasta 3 reintentos automáticos ante excepciones transitorias.\n  - **Escenario 2**: Desvío a `orders.dlq` tras el 3er fallo con cabecera de auditoría (`BR-ORDR-001`).\n- **Trazabilidad**: Satisface `RF-ORDR-001` y regla `BR-ORDR-001`.\n"
  }
}
};
