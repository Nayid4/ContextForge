# Catálogo de Servicios Externos — CloudSaaS Platform

Este documento especifica los servicios externos, APIs de terceros e integraciones de infraestructura que consume el proyecto, detallando protocolos, autenticación, manejo de fallos y contratos.

---

## Matriz de Integraciones Externas

| Servicio | Tipo | Protocolo | Autenticación | Variable de Entorno | Manejo de Fallos |
|---|---|---|---|---|---|
| **Stripe API** | Pasarela de Pagos | HTTPS REST | Bearer API Key | `STRIPE_SECRET_KEY` | Circuit Breaker + Idempotencia |
| **Stripe Webhooks** | Callbacks de Cobro | HTTPS Webhook | Firma HMAC-SHA256 | `STRIPE_WEBHOOK_SECRET` | Reintentos idempotentes 200 OK |
| **PostgreSQL 16** | Base de Datos Principal | TCP / PostgreSQL | Password / Pool | `DATABASE_URL` | Healthchecks + Pool Retry |
| **Redis 7.2** | Cache & Lock Distribuido | TCP / RESP | Password opcional | `REDIS_URL` | Fallback a BD si Redis no responde |
| **RabbitMQ 3.13** | Broker de Mensajería | AMQP (5672) | User/Password | `RABBITMQ_URL` | Dead Letter Queue (DLQ) |
| **AWS SES / SMTP** | Email Transaccional | SMTP / TLS (587) | SMTP Credentials | `SMTP_HOST`, `SMTP_PASS` | Cola diferida de reintento |
| **Prometheus** | Métricas del Sistema | HTTP GET /metrics | Ninguna / Intranet | `METRICS_PORT` | Buffer aislado en memoria |

---

## Detalle Técnico por Servicio

### 1. Pasarela de Pagos Stripe
* **Host:** `https://api.stripe.com/v1/`
* **Endpoints consumidos:**
  * `POST /v1/payment_intents`: Creación de intención de cobro.
  * `POST /v1/refunds`: Devolución total o parcial.
* **Cabeceras obligatorias:**
  * `Authorization: Bearer sk_test_...`
  * `Idempotency-Key: uuid-v4` (Vital para evitar doble cobro ante timeouts).
* **Manejo de Errores:** En caso de HTTP 5xx o timeout de red, aplicar Circuit Breaker y no marcar la orden como fallida hasta que expire la ventana de gracia.

### 2. Webhooks Entrantes de Pagos
* **Ruta de escucha:** `/webhooks/stripe`
* **Verificación de Firma:**
  ```javascript
  const signature = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  ```
* **Eventos Soportados:**
  * `payment_intent.succeeded` $\to$ Marca orden como `PAID` y emite evento a RabbitMQ.
  * `payment_intent.payment_failed` $\to$ Registra transacción fallida y libera stock atómico.

### 3. Cluster PostgreSQL
* **Driver:** `pg` / `Npgsql` con connection pooling (mínimo 5, máximo 25 conexiones por instancia).
* **Políticas:** Todas las operaciones sobre órdenes y transacciones deben ejecutarse dentro de un bloque transaccional (`BEGIN ... COMMIT`).

### 4. Cluster Redis
* **Uso:**
  * Cache con prefijo `cat:prod:{id}` (TTL: 600 segundos).
  * Carrito anónimo `cart:anon:{sessionId}` (TTL: 86400 segundos).
  * Cerrojo de stock `lock:stock:{productId}` (TTL: 5 segundos para Redlock).

### 5. Broker de Mensajería RabbitMQ
* **Exchange principal:** `saas.events` (Topic Exchange).
* **Colas:**
  * `orders.process` $\to$ Routing key: `order.paid`
  * `orders.dlq` $\to$ Enrutamiento automático por encabezado `x-dead-letter-exchange` tras 3 fallos.
