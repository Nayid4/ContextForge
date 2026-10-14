---
title: 'ADR 001: Adopción de Arquitectura Dirigida por Eventos en Pagos'
module: architecture
library_id: default
tags:
- adr
- events
- kafka
- billing
description: 'ADR 001: Adopción de Arquitectura Dirigida por Eventos en Pagos'
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

> 📎 **Anexo:** [Informe_Judicial_08001315301220180029200_2026-10-12.pdf](assets/adr_001_adopci_n_de_arquitectura_dirigida_por_eventos_en_pagos/Informe_Judicial_08001315301220180029200_2026-10-12.pdf)
