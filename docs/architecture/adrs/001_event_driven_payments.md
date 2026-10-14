---
title: "ADR 001: Adopción de Arquitectura Dirigida por Eventos en Pagos"
module: "architecture"
tags: ["adr", "events", "kafka", "billing"]
author: "Chief Architect"
version: "1.0.0"
last_updated: "2026-09-15"
importance: "core"
---

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

