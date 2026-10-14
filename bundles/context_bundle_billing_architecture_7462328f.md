# Context Bundle: billing_architecture (7462328f)
> Generado por ContextForge el 2026-10-14 06:08:52 UTC
> Módulos incluidos: billing, architecture

## Directrices Operativas para el Asistente de IA (Cursor / Windsurf / Copilot)
1. Eres un asistente de desarrollo asistido consciente de las reglas de negocio de este repositorio.
2. NO inventes ni alteres reglas de negocio o contratos documentados en este paquete de contexto.
3. Respeta estrictamente los Architecture Decision Records (ADRs) aquí contenidos.

## Tabla de Contenidos
- [ADR 001: Adopción de Arquitectura Dirigida por Eventos en Pagos (001_event_driven_payments.md)](#architecture-adrs-001_event_driven_payments-md)
- [Políticas de Reintentos en Facturación Recurrente (retry_policy.md)](#modules-billing-retry_policy-md)

---
## Documento: ADR 001: Adopción de Arquitectura Dirigida por Eventos en Pagos <a id='architecture-adrs-001_event_driven_payments-md'></a>
**Ruta:** `architecture/adrs/001_event_driven_payments.md` | **Módulo:** `architecture` | **Autor:** Equipo Técnico

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

> 📎 **Anexo:** [Informe_Judicial_08001315301220180029200_2026-10-12.pdf](assets/adr_001_adopci_n_de_arquitectura_dirigida_por_eventos_en_pagos/Informe_Judicial_08001315301220180029200_2026-10-12.pdf)

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
