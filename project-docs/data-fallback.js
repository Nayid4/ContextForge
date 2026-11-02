window.__FALLBACK_DATA__ = {
  "featureList": {
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
  "currentSpec": {
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
  "historyData": {
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
  "projectSpec": {
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
  }
};