# Modelo C4 de Arquitectura — CloudSaaS Platform

Este documento define la arquitectura del sistema en tres niveles del modelo C4 (Contexto, Contenedores y Componentes), permitiendo a los desarrolladores y agentes de IA comprender las fronteras, responsabilidades y protocolos de comunicación sin ambigüedad.

---

## Nivel 1: Diagrama de Contexto del Sistema (System Context - C1)

Muestra cómo el sistema `CloudSaaS Platform` interactúa con los usuarios y los sistemas externos.

```mermaid
flowchart TD
    subgraph Users ["Actores & Usuarios"]
        Customer["👤 Cliente Comprador<br>[Web / Mobile]"]
        Admin["👤 Administrador de Operaciones<br>[Backoffice]"]
        AIAgent["🤖 Agente de IA SDD<br>[Google Antigravity / Copilot / OpenCode]"]
    end

    subgraph System ["Límite del Sistema"]
        SaaS["🚀 CloudSaaS Platform<br>[E-Commerce & Microservicios Cloud]<br>Catálogo, carrito, órdenes, facturación y analítica"]
    end

    subgraph External ["Sistemas Externos"]
        Stripe["💳 Pasarela de Pagos<br>[Stripe / PSE API]<br>Cobros y Webhooks"]
        EmailService["✉️ Proveedor SMTP / SES<br>[AWS SES / SendGrid]<br>Emails transaccionales"]
        Prometheus["📊 Sistema de Monitoreo<br>[Prometheus Server]<br>Scraping de métricas /metrics"]
    end

    Customer -->|"Navega productos, gestiona carrito y realiza compras (HTTPS)"| SaaS
    Admin -->|"Gestiona inventario, órdenes y roles RBAC (HTTPS)"| SaaS
    AIAgent -->|"Ejecuta specs, implementa código y audita verify.sh"| SaaS

    SaaS -->|"Autoriza pagos y procesa devoluciones (HTTPS REST)"| Stripe
    Stripe -->|"Envía confirmación de cobro por webhook firmado HMAC"| SaaS
    SaaS -->|"Despacha emails de bienvenida y facturas (SMTP/TLS)"| EmailService
    Prometheus -->|"Consulta métricas operativas y latencias /metrics"| SaaS
```

---

## Nivel 2: Diagrama de Contenedores (Container Diagram - C2)

Muestra las aplicaciones ejecutables, APIs, almacenes de datos y brokers de mensajería que componen la solución.

```mermaid
flowchart TD
    subgraph Clients ["Clientes"]
        SPA["🌐 Single Page Application<br>[Vanilla JS + Tailwind v4]<br>Tablero de Seguimiento & UI"]
        Mobile["📱 Mobile App<br>[iOS / Android]<br>Catálogo & Checkout"]
    end

    subgraph GatewayBoundary ["Perímetro"]
        Gateway["🛡️ API Gateway & Reverse Proxy<br>[Node.js / Reverse Proxy]<br>Rate Limiting, TLS 1.3, Auth Middleware"]
    end

    subgraph BackendBoundary ["Contenedores de Backend & Workers"]
        CoreAPI["⚡ Core Services API<br>[Node.js v20 / Express / TypeScript]<br>Auth JWT, Catálogo, Carrito y Pagos"]
        OrderWorker["🔷 Order Fulfillment Worker<br>[.NET 10 / C# Background Worker]<br>Procesamiento asíncrono de órdenes y reservas"]
        AnalyticsWorker["📊 Analytics Stream Collector<br>[Node.js Buffer Worker]<br>Agregación de eventos y métricas Prometheus"]
    end

    subgraph StorageBoundary ["Almacenamiento & Mensajería"]
        Postgres[("🐘 PostgreSQL 16 Database<br>[ACID Relacional · Puerto 5432]<br>Usuarios, roles, órdenes, transacciones y catálogo")]
        Redis[("🔴 Redis 7.2 Distributed Cache<br>[In-Memory · Puerto 6379]<br>Cache de catálogo, sesiones volátiles y Redlock")]
        RabbitMQ["🐇 RabbitMQ 3.13 Event Broker<br>[AMQP · Puerto 5672]<br>Colas OrderFulfilled, Dead Letter Queue (DLQ)"]
    end

    SPA -->|"HTTPS / JSON"| Gateway
    Mobile -->|"HTTPS / JSON"| Gateway

    Gateway -->|"Enruta tráfico autenticado"| CoreAPI

    CoreAPI -->|"Lecturas rápidas y locks de carrito"| Redis
    CoreAPI -->|"Persistencia transaccional de usuarios y pagos"| Postgres
    CoreAPI -->|"Emite eventos OrderPlaced / PaymentReceived"| RabbitMQ

    RabbitMQ -->|"Consume eventos de órdenes"| OrderWorker
    OrderWorker -->|"Actualiza estado de orden y reserva inventario"| Postgres

    RabbitMQ -->|"Consume eventos de navegación y compra"| AnalyticsWorker
    AnalyticsWorker -->|"Métricas en memoria expuestas para Prometheus"| StorageBoundary
```

---

## Nivel 3: Diagrama de Componentes del Core API (Component Diagram - C3)

Detalla la arquitectura limpia (Clean Architecture) dentro del contenedor principal `Core Services API`.

```mermaid
flowchart TD
    subgraph Controllers ["Capa 1: Controllers & Webhooks (HTTP Entry)"]
        AuthController["AuthController<br>[Endpoints /auth/login, /auth/refresh]"]
        CatalogController["CatalogController<br>[Endpoints /products, búsqueda cursor]"]
        CartController["CartController<br>[Endpoints /cart, checkout]"]
        PaymentWebhook["PaymentWebhookHandler<br>[Endpoint /webhooks/stripe, HMAC check]"]
    end

    subgraph Application ["Capa 2: Application Services (Use Cases)"]
        AuthService["AuthService<br>Emisión JWT, RBAC, hash bcrypt"]
        CatalogService["CatalogService<br>Filtros, cache invalidation"]
        CartService["CartService<br>Operaciones atómicas, cálculo total"]
        PaymentService["PaymentService<br>Idempotency control, cobro Stripe"]
    end

    subgraph Domain ["Capa 3: Domain Core (Invariantes & Reglas)"]
        UserAggregate["User & Role Entities<br>Validación invariante"]
        ProductEntity["Product Entity<br>Precios, stock mínimo"]
        OrderAggregate["Order & Tax Calculator<br>Banker's rounding rules"]
    end

    subgraph Infrastructure ["Capa 4: Infrastructure Adapters"]
        PostgresRepo["PostgresRepository<br>Pool transaccional SQL"]
        RedisAdapter["RedisCacheAdapter<br>TTL, Redlock distribuido"]
        StripeClient["StripeApiClient<br>Circuit breaker, reintentos"]
        EventPublisher["RabbitMQEventPublisher<br>Publicador de eventos AMQP"]
    end

    AuthController --> AuthService
    CatalogController --> CatalogService
    CartController --> CartService
    PaymentWebhook --> PaymentService

    AuthService --> UserAggregate
    CatalogService --> ProductEntity
    CartService --> ProductEntity
    PaymentService --> OrderAggregate

    AuthService --> PostgresRepo
    CatalogService --> RedisAdapter
    CatalogService --> PostgresRepo
    CartService --> RedisAdapter
    PaymentService --> StripeClient
    PaymentService --> PostgresRepo
    PaymentService --> EventPublisher
```
