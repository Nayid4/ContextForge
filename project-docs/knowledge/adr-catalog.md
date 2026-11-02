# Catálogo de Decisiones de Arquitectura (ADR)

> [!NOTE]
> Este catálogo registra las **Decisiones de Arquitectura (Architecture Decision Records - ADR)** del proyecto en formato estándar (Michael Nygard).
> Documenta el *por qué* de las decisiones tomadas, los trade-offs asumidos y los **anti-patrones legítimos o workarounds intencionales**, evitando que agentes de IA o nuevos desarrolladores intenten "refactorizar" comportamientos que fueron diseñados deliberadamente.

---

## Índice de ADRs

| ID | Título | Estado | Fecha | Bounded Context |
| :--- | :--- | :--- | :--- | :--- |
| **ADR-001** | Adopción de Clean Architecture y Separación por Bounded Contexts | Aceptado | 2026-01-15 | Global |
| **ADR-002** | Idempotencia en Cobros vía Cabecera HTTP y Almacenamiento en Redis | Aceptado | 2026-02-10 | `billing` |
| **ADR-003** | Procesamiento Asíncrono de Órdenes con AMQP y Dead Letter Queue (DLQ) | Aceptado | 2026-02-28 | `orders` |
| **ADR-004** | Aritmética Monetaria con Banker's Rounding (IEEE 754) | Aceptado | 2026-03-12 | `billing`, `cart` |
| **ADR-005** | Anti-Patrón Legítimo: Respuesta HTTP 200 Incondicional en Webhooks de Pago | Aceptado | 2026-03-20 | `billing` |

---

## ADR-001: Adopción de Clean Architecture y Separación por Bounded Contexts

### Contexto
El sistema requiere escalar en múltiples dominios funcionales (autenticación, facturación, carrito, catálogo, órdenes) manteniendo alta testabilidad y evitando el acoplamiento directo entre la lógica de negocio y los frameworks web o drivers de base de datos.

### Decisión
Adoptar los principios de **Clean Architecture (Hexagonal)**:
- El Dominio puro (Entidades, Value Objects, Reglas de Negocio) no tiene ninguna dependencia externa.
- La capa de Aplicación orquesta los casos de uso mediante patrones CQRS / MediatR.
- Los adaptadores de Infraestructura (PostgreSQL con EF Core o Dapper, Redis, RabbitMQ) implementan interfaces declaradas en el dominio.

### Consecuencias
- **Positivas**: Testabilidad unitaria del 100% de la lógica de negocio sin levantar bases de datos ni contenedores; facilidad para reemplazar proveedores de infraestructura.
- **Trade-offs / Costo**: Mayor número de clases, DTOs y mapeos explícitos entre capas.

---

## ADR-002: Idempotencia en Cobros vía Cabecera HTTP y Redis

### Contexto
En conexiones móviles o redes inestables, los clientes pueden reenviar solicitudes de checkout tras un timeout de red, provocando cobros duplicados en la pasarela Stripe si no existe un mecanismo de deduplicación.

### Decisión
Exigir la cabecera obligatoria `Idempotency-Key` (UUIDv4) en todo endpoint transaccional de cobro (`POST /api/v1/checkout`):
1. Al recibir la clave, el servidor ejecuta `SETNX` en Redis con clave `idempotency:{key}` y estado `IN_PROGRESS` (TTL 120s).
2. Si la clave ya existe en estado `IN_PROGRESS`, se responde `HTTP 409 Conflict`.
3. Si la clave existe en estado `COMPLETED`, se retorna la respuesta previamente cacheada sin contactar a Stripe.
4. Tras completar el cobro exitosamente, se guarda el payload de respuesta en Redis con TTL de 24 horas.

### Consecuencias
- **Positivas**: Eliminación total del riesgo de cobros dobles por reintentos de red.
- **Trade-offs**: Dependencia de alta disponibilidad en el cluster de Redis.

---

## ADR-003: Procesamiento Asíncrono de Órdenes con AMQP y Dead Letter Queue (DLQ)

### Contexto
El procesamiento de órdenes confirmadas implica múltiples tareas pesadas (descontar inventario, emitir comprobante, notificar al almacén y enviar correo). Ejecutar esto de forma síncrona en la petición HTTP del checkout eleva la latencia y compromete la resiliencia si un servicio adyacente cae.

### Decisión
Publicar el evento `OrderPlaced` en un Message Broker AMQP (RabbitMQ):
1. Los workers consumen el mensaje de forma asíncrona.
2. Si ocurre un error transitorio de base de datos o red, el mensaje se reintenta hasta 3 veces con retroceso exponencial (*exponential backoff*).
3. Si tras el 3er intento el error persiste, el mensaje se descarta de la cola principal y se desvía automáticamente a `orders.dlq` (Dead Letter Queue) preservando el payload original y las cabeceras de excepción (`x-exception-message`).

### Consecuencias
- **Positivas**: Checkout ultra-rápido ($< 150\text{ ms}$); tolerancia a fallos transitorios; cero pérdida de pedidos.
- **Trade-offs**: Consistencia eventual entre la confirmación del pago y el despacho de la orden.

---

## ADR-004: Aritmética Monetaria con Banker's Rounding (IEEE 754)

### Contexto
El redondeo tradicional aritmético ("hacia arriba" cuando el decimal es 5) genera un sesgo acumulativo positivo que incrementa artificialmente los balances contables en miles de transacciones de micro-pagos.

### Decisión
Adoptar estrictamente el algoritmo **Banker's Rounding (redondeo bancario al número par más cercano, IEEE 754)** a dos decimales exactos (`MidpointRounding.ToEven` o equivalente) en todos los cálculos de impuestos, descuentos y subtotales. Prohibir el uso de números flotantes binarios (`double` o `float`), exigiendo el tipo decimal de precisión fija (`NUMERIC(12,2)` o `decimal`).

### Consecuencias
- **Positivas**: Conciliación contable exacta al céntimo con pasarelas de pago y entidades fiscales.
- **Trade-offs**: Requiere tests de caja blanca específicos para casos de borde (ej. `2.125 -> 2.12` vs `2.135 -> 2.14`).

---

## ADR-005: Anti-Patrón Legítimo: Respuesta HTTP 200 Incondicional en Webhooks de Pago

> [!WARNING]
> **Anti-Patrón Legítimo / Workaround Intencional**:  
> No alterar este comportamiento. Modificar este endpoint para devolver códigos de error (`4xx`/`5xx`) ante payloads no reconocidos provocará que las pasarelas externas saturen el servidor con reintentos innecesarios.

### Contexto
Las pasarelas de pago externas (ej. Stripe, PayPal) reintentan el envío de webhooks con retroceso exponencial durante horas si el servidor responde con cualquier código HTTP distinto de `2xx`. Si un webhook contiene un tipo de evento que nuestro sistema no maneja deliberadamente o si el evento ya fue procesado con anterioridad, responder `400 Bad Request` o `404 Not Found` hace que la pasarela continúe bombardeando el endpoint.

### Decisión
En el controlador receptor de webhooks (`/api/v1/webhooks/stripe`):
1. Se valida obligatoriamente la firma criptográfica HMAC-SHA256 (`BR-BILL-002`). Si la firma es falsa o inválida, se rechaza inmediatamente con `HTTP 401 Unauthorized`.
2. Una vez confirmada la autenticidad de la firma, el endpoint **SIEMPRE responde `HTTP 200 OK`** de forma incondicional, incluso si el evento no es de nuestro interés o si la lógica interna decide descartarlo.
3. El procesamiento del evento se despacha a una cola en segundo plano.

### Consecuencias
- **Positivas**: Evita tormentas de reintentos de la pasarela y desacopla la confirmación HTTP del procesamiento interno.
- **Trade-offs**: Los errores de lógica interna en el manejo del evento deben monitorearse en logs y métricas Prometheus, no en la respuesta HTTP devuelta a Stripe.
