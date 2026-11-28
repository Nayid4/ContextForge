---
title: "Políticas de Reintentos en Facturación Recurrente"
module: "billing"
tags: ["payments", "stripe", "resilience", "retry"]
author: "Arquitectura Pagos"
version: "1.2.0"
last_updated: "2026-10-10"
importance: "core"
---

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

