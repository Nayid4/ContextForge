# Especificación de Requerimientos del Sistema (SRS) — IEEE 830 / ISO 29148

> [!NOTE]
> Este documento contiene la especificación formal de Requerimientos Funcionales (RF) y Requerimientos No Funcionales (RNF) del sistema bajo estándares de ingeniería de software internacional (IEEE 830 y ISO/IEC/IEEE 29148). Sirve como base canónica sin sesgo para desarrolladores y agentes de IA.

---

## 1. Requerimientos Funcionales (RF)

### RF-AUTH-001: Autenticación de Usuarios y Emisión de Tokens JWT
- **Módulo**: `backend` / `auth`
- **Prioridad**: Alta | **Severidad**: Crítica
- **Precondición**: El usuario debe estar previamente registrado y activo en el sistema.
- **Entradas**: Email (RFC 5322) y contraseña en texto plano vía HTTPS POST `/api/v1/auth/login`.
- **Procesamiento**:
  1. Normalizar email a minúsculas y buscar usuario en la base de datos PostgreSQL.
  2. Verificar hash de contraseña mediante algoritmo Argon2id o BCrypt con factor de costo canónico.
  3. Si la verificación es exitosa, generar Access Token (JWT firmado con clave asimétrica RS256 o HMAC-SHA256 y TTL de 15 minutos) y Refresh Token criptográficamente seguro (UUIDv4 almacenado en tabla con hash y TTL de 7 días).
  4. Los timestamps `iat`, `nbf` y `exp` del JWT deben calcularse **exclusivamente en Epoch UTC** (regla `BR-AUTH-001`).
- **Salidas**: Código HTTP 200 con payload JSON conteniendo `accessToken`, `refreshToken`, `tokenType: "Bearer"` y `expiresIn: 900`.
- **Postcondición**: El Refresh Token queda persistido en PostgreSQL y la sesión registrada en auditoría.
- **Criterio de Aceptación (Gherkin)**:
  ```gherkin
  Escenario: Inicio de sesión exitoso con credenciales válidas
    Dado que existe un usuario registrado con email "dev@cloudsaas.io" y contraseña "P@ssw0rd123"
    Cuando el cliente envía POST "/api/v1/auth/login" con dichas credenciales
    Entonces el servidor responde HTTP 200
    Y el payload contiene un accessToken JWT con expiración calculada en UTC a 15 minutos
    Y el payload contiene un refreshToken opaco
  ```

---

### RF-CAT-001: Consulta de Catálogo con Paginación por Cursor
- **Módulo**: `backend` / `catalog`
- **Prioridad**: Media | **Severidad**: Media
- **Precondición**: Existencia de productos en catálogo.
- **Entradas**: Parámetros de query: `limit` (entero entre 1 y 100, por defecto 20), `cursor` (string opaco base64 codificando `created_at` e `id`), `category_id` (opcional).
- **Procesamiento**:
  1. Decodificar cursor si está presente.
  2. Consultar índice compuesto `(created_at DESC, id DESC)` en PostgreSQL.
  3. Comprobar si los datos existen en cache Redis (`catalog:page:{hash}`).
  4. Si existe en cache, retornar respuesta en memoria; si no, consultar BD y almacenar en Redis con TTL de 300 segundos.
- **Salidas**: HTTP 200 con array `items` y objeto `page_info` con `next_cursor` y `has_next_page`.
- **Postcondición**: No se modifican estados del sistema.

---

### RF-CART-001: Operaciones Atómicas de Carrito de Compras
- **Módulo**: `backend` / `cart`
- **Prioridad**: Alta | **Severidad**: Alta
- **Precondición**: Carrito existente o sesión anónima identificada por UUID en cabecera `X-Cart-Id`.
- **Entradas**: `product_id`, `quantity` (entero positivo), `unit_price`.
- **Procesamiento**:
  1. Validar que `quantity > 0` y que el producto exista y esté activo en el catálogo.
  2. Ejecutar script atómico Lua o transacción Redis `MULTI/EXEC` (regla `BR-CART-002`) para evitar condiciones de carrera (*race conditions*).
  3. Incrementar cantidad y recalcular subtotal.
  4. Renovar TTL de la clave Redis `cart:{cart_id}` a 72 horas.
- **Salidas**: HTTP 200 con el estado consolidado del carrito (ítems, cantidades, precios unitarios y subtotal).
- **Postcondición**: Inventario retenido temporalmente por TTL o validado en tiempo real.

---

### RF-BILL-001: Checkout Transaccional con Idempotencia
- **Módulo**: `billing`
- **Prioridad**: Crítica | **Severidad**: Crítica
- **Precondición**: Carrito no vacío y cabecera HTTP obligatoria `Idempotency-Key` (UUIDv4).
- **Entradas**: Cabecera `Idempotency-Key`, payload con `cart_id`, `payment_method_id`, `billing_address`.
- **Procesamiento**:
  1. Verificar presencia de `Idempotency-Key` (regla `BR-BILL-001`). Si falta, rechazar con HTTP 400.
  2. Consultar en Redis la clave `idempotency:{key}`:
     - Si está en estado `IN_PROGRESS`, rechazar con HTTP 409 Conflict.
     - Si está en estado `COMPLETED`, retornar la respuesta previamente cacheada sin re-ejecutar el cobro.
  3. Marcar clave en Redis como `IN_PROGRESS` con TTL de 120 segundos.
  4. Calcular total aplicando **Banker's Rounding (IEEE 754)** a dos decimales exactos (regla `BR-BILL-003`).
  5. Invocar API de Stripe vía PaymentIntent confirmando el pago.
  6. Si Stripe aprueba, guardar resultado en Redis `idempotency:{key}` con TTL de 24 horas y emitir evento `PaymentSucceeded` al Message Broker.
- **Salidas**: HTTP 201 Created con objeto `order_id`, `transaction_id`, `status: "PAID"`, `amount`, `currency`.
- **Postcondición**: Orden creada en estado `Paid`, cobro registrado y evento publicado.

---

### RF-ORDR-001: Procesamiento Asíncrono de Órdenes y Manejo de DLQ
- **Módulo**: `backend` / `orders`
- **Prioridad**: Alta | **Severidad**: Alta
- **Precondición**: Evento `PaymentSucceeded` publicado en la cola `orders.queue`.
- **Entradas**: Mensaje AMQP con payload JSON del pedido.
- **Procesamiento**:
  1. Consumidor Worker toma el mensaje e inicia transacción en PostgreSQL.
  2. Actualizar inventario definitivo y pasar orden a estado `Processing`.
  3. Si ocurre un fallo transitorio de red o bloqueo de BD:
     - Reintentar hasta 3 veces con retroceso exponencial (*exponential backoff*).
     - Si tras el 3er reintento sigue fallando, desviar mensaje a la cola `orders.dlq` (Dead Letter Queue) con cabeceras de auditoría `x-exception-message` y `x-original-queue` (regla `BR-ORDR-001`).
- **Salidas**: Ack manual al broker AMQP.
- **Postcondición**: Pedido en proceso o registrado en DLQ para inspección de soporte.

---

## 2. Requerimientos No Funcionales (RNF) — Clasificación FURPS+

### 2.1 Functionality (Seguridad y Cumplimiento)
- **RNF-SEC-001**: Todos los endpoints que procesen datos financieros o personales deben exigir cifrado TLS 1.3 en tránsito y tokens Bearer JWT válidos.
- **RNF-SEC-002**: Validación criptográfica obligatoria de firmas HMAC-SHA256 en todos los webhooks entrantes (Stripe/pagos) antes de procesar payloads (regla `BR-BILL-002`).

### 2.2 Usability (Experiencia y Consistencia de API)
- **RNF-USE-001**: Toda respuesta de error debe seguir el estándar **RFC 7807 (Problem Details for HTTP APIs)** incluyendo `type`, `title`, `status`, `detail`, `instance` y `trace_id`.

### 2.3 Reliability (Confiabilidad y Disponibilidad)
- **RNF-REL-001**: Disponibilidad mensual del sistema $\ge 99.9\%$ (SLA estándar de microservicios cloud).
- **RNF-REL-002**: Cero pérdida de órdenes confirmadas mediante el patrón de persistencia transaccional y colas con acuse de recibo explícito (*manual ACK*) y DLQ.

### 2.4 Performance (Rendimiento y Escalabilidad)
- **RNF-PERF-001**: Tiempo de respuesta en percentil 95 ($P95 \le 120\text{ ms}$) y percentil 99 ($P99 \le 250\text{ ms}$) para lecturas de catálogo cacheado y carritos en Redis.
- **RNF-PERF-002**: Capacidad de soportar una concurrencia sostenida de 1,200 solicitudes por segundo (RPS) en checkout con degradación elegante.

### 2.5 Supportability & Constraints (+ Restricciones Arquitecturales)
- **RNF-SUPP-001**: Arquitectura desacoplada Clean Core (Hexagonal) donde la lógica de negocio pura no depende de frameworks web ni de drivers de base de datos.
- **RNF-SUPP-002**: Toda métrica de salud del sistema debe exponerse en `/metrics` bajo formato Prometheus y `/health` bajo formato JSON de diagnóstico.
- **RNF-SUPP-003**: Nombres de ramas Git obligatorios bajo el formato `{type}/INT-{numero}/{nombre_rama}` con longitud máxima estricta de 80 caracteres.
