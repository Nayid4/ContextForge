# Catálogo de Reglas de Negocio — CloudSaaS Platform

Las siguientes reglas de negocio son **invariantes de dominio de cumplimiento obligatorio**. Todo agente de IA o desarrollador debe asegurarse de que cualquier código, migración o prueba escrita respete estas reglas sin excepción.

---

## Índice de Reglas por Dominio

| ID | Módulo | Título | Severidad |
|---|---|---|---|
| `BR-AUTH-001` | `backend` | Validez de expiración de tokens exclusivamente en Epoch UTC | Crítica |
| `BR-AUTH-002` | `backend` | Aislamiento y precedencia de roles RBAC | Alta |
| `BR-CART-001` | `backend` | Expiración de carritos anónimos a las 24 horas | Media |
| `BR-CART-002` | `backend` | Reserva atómica y prevención de sobreventa | Crítica |
| `BR-BILL-001` | `billing` | Obligatoriedad de llave de idempotencia en transacciones | Crítica |
| `BR-BILL-002` | `billing` | Verificación de firma criptográfica HMAC en webhooks | Crítica |
| `BR-BILL-003` | `billing` | Algoritmo contable Banker's Rounding (IEEE 754) | Alta |
| `BR-ORDR-001` | `infra` | Aislamiento de mensajes fallidos en Dead Letter Queue tras 3 reintentos | Alta |
| `BR-ANLT-001` | `analytics` | Ingesta no bloqueante de analítica sin afectar latencia transaccional | Media |
| `BR-NOTF-001` | `notifications` | Sanitización estricta contra XSS/inyección en plantillas de email | Alta |

---

## Detalle de Reglas de Negocio

### `BR-AUTH-001`: Validez de Expiración JWT en Epoch UTC
* **Contexto:** Mitigación del bug `INT-003`.
* **Regla:** El cálculo de las marcas de tiempo `iat` (issued at) y `exp` (expires at) debe realizarse exclusivamente a partir de marcas Epoch Unix en UTC (`DateTime.UtcNow.ToUnixTimeSeconds()` o `Math.floor(Date.now() / 1000)`).
* **Prohibición:** Está terminantemente prohibido utilizar `DateTime.Now` o husos horarios locales del servidor.

### `BR-AUTH-002`: Aislamiento de Roles RBAC
* **Regla:** Un usuario solo puede acceder a recursos que coincidan con sus permisos asignados. Los roles `ADMIN` tienen acceso global; los roles `OPERATOR` tienen acceso limitado a catálogo y órdenes; los usuarios `CUSTOMER` solo pueden leer su propio carrito y órdenes.

### `BR-CART-001`: Ciclo de Vida de Carritos Anónimos
* **Regla:** Los carritos de compras no asociados a un usuario autenticado deben almacenarse en Redis con un Time-To-Live (TTL) estricto de 24 horas (86,400 segundos). Si el usuario inicia sesión, el carrito anónimo se fusiona automáticamente con el carrito persistente del usuario en PostgreSQL.

### `BR-CART-002`: Atomicidad en Control de Inventario
* **Regla:** La adición de un producto al carrito o el inicio de checkout debe ejecutar una operación atómica (`DECRBY` en Redis o `SELECT FOR UPDATE` en SQL). Si el stock disponible es menor a la cantidad solicitada, la operación debe ser rechazada inmediatamente retornando `INSUFFICIENT_STOCK`.

### `BR-BILL-001`: Idempotencia Obligatoria en Pagos
* **Regla:** Todo endpoint de cobro (`POST /cart/checkout`, `POST /payments`) exige la cabecera `Idempotency-Key`. La primera solicitud procesa el cobro y guarda el resultado en Redis por 120 segundos. Solicitudes duplicadas concurrentes son rechazadas con `409 Conflict` o devuelven el resultado previamente cacheado sin generar doble cargo.

### `BR-BILL-002`: Validación Criptográfica de Webhooks
* **Regla:** Ningún evento de pasarela externa (ej. `payment_intent.succeeded` de Stripe) puede marcar una orden como `PAID` sin antes validar la firma criptográfica enviada en la cabecera `Stripe-Signature` utilizando HMAC-SHA256 y la clave secreta `STRIPE_WEBHOOK_SECRET`.

### `BR-BILL-003`: Redondeo Financiero Banker's Rounding (IEEE 754)
* **Regla:** El cálculo de impuestos e IVA debe aplicar redondeo al entero par más cercano (*Banker's Rounding* o redondeo bancario) a dos decimales exactos. Queda prohibido el truncamiento directo o `Math.round()` tradicional que genera discrepancias acumulativas de centavos en facturación masiva.

### `BR-ORDR-001`: Resiliencia en Colas de Órdenes (DLQ)
* **Regla:** Los consumidores de mensajería (RabbitMQ/Kafka) disponen de un máximo de 3 reintentos con retroceso exponencial (1s, 2s, 4s). Si tras 3 intentos el procesamiento falla, el mensaje debe ser enrutado automáticamente a la Dead Letter Queue (`orders.dlq`) y generar una alerta operativa sin detener el hilo principal de procesamiento.

### `BR-ANLT-001`: Aislamiento de Ingesta de Analítica
* **Regla:** La captura de eventos de navegación o telemetría debe realizarse en un buffer en memoria en segundo plano. Bajo ninguna circunstancia un fallo o demora en la ingesta de analítica debe aumentar la latencia o interrumpir las peticiones HTTP del usuario.

### `BR-NOTF-001`: Sanitización de Plantillas de Notificación
* **Regla:** Los valores inyectados en las plantillas HTML de correo transaccional (nombre de usuario, productos, direcciones) deben ser sanitizados y escapados para prevenir ataques de inyección HTML o enlaces maliciosos.
