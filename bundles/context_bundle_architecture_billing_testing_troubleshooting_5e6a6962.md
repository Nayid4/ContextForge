# Context Bundle: architecture_billing_testing_troubleshooting (5e6a6962)
> Generado por ContextForge el 2026-10-13 23:46:16 UTC
> Módulos incluidos: architecture, billing, testing, troubleshooting

## Directrices Operativas para el Asistente de IA (Cursor / Windsurf / Copilot)
1. Eres un asistente de desarrollo asistido consciente de las reglas de negocio de este repositorio.
2. NO inventes ni alteres reglas de negocio o contratos documentados en este paquete de contexto.
3. Respeta estrictamente los Architecture Decision Records (ADRs) aquí contenidos.

## Tabla de Contenidos
- [ADR 001: Adopción de Arquitectura Dirigida por Eventos en Pagos (001_event_driven_payments.md)](#architecture-adrs-001_event_driven_payments-md)
- [Doc Creado por API (api_doc.md)](#default-modules-testing-api_doc-md)
- [Documento Creado Web (web_test.md)](#default-modules-testing-web_test-md)
- [Políticas de Reintentos en Facturación Recurrente (retry_policy.md)](#modules-billing-retry_policy-md)
- [Doc Creado por API (api_doc.md)](#modules-testing-api_doc-md)
- [Documento Creado Web (web_test.md)](#modules-testing-web_test-md)
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
## Documento: Documento Creado Web <a id='modules-testing-web_test-md'></a>
**Ruta:** `modules/testing/web_test.md` | **Módulo:** `testing` | **Autor:** Web Tester

# Contenido Web

Prueba de creación.

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
